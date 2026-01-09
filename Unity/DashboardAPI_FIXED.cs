using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using System;

[System.Serializable]
public class ColoringSessionData
{
    public string name;
    public string mostUsedColor;
    public string colorCode;
    public float designTime;
}

public class DashboardAPI : MonoBehaviour
{
    [Header("API Settings")]
    [SerializeField] private string apiEndpoint = "https://appcoloriage.vercel.app/api/data";
    [SerializeField] private string apiKey = "unity-secret-key-123"; // ⭐ ADDED: API Key

    private string userName = "";
    private float sessionStartTime;
    private Dictionary<string, int> colorUsageCount = new Dictionary<string, int>();
    private int totalColorClicks = 0;

    private string GetColorName(string hexColor)
    {
        // Convert hex to color name in French
        switch (hexColor.ToUpper())
        {
            case "FF0000": return "Rouge";
            case "FF8000": return "Orange";
            case "FFFF00": return "Jaune";
            case "80FF00": return "Jaune-Vert";
            case "00FF00": return "Vert";
            case "00FF80": return "Vert-Cyan";
            case "00FFFF": return "Cyan";
            case "0080FF": return "Cyan-Bleu";
            case "0000FF": return "Bleu";
            case "8000FF": return "Violet";
            case "FF00FF": return "Magenta";
            case "FF0080": return "Rose";
            case "FFFFFF": return "Blanc";
            case "000000": return "Noir";
            case "808080": return "Gris";
            default:
                // For any other color, try to give a descriptive name
                if (ColorUtility.TryParseHtmlString("#" + hexColor, out Color col))
                {
                    if (col.r > 0.8f && col.g < 0.2f && col.b < 0.2f) return "Rouge";
                    if (col.r > 0.8f && col.g > 0.5f && col.b < 0.2f) return "Orange";
                    if (col.r > 0.8f && col.g > 0.8f && col.b < 0.2f) return "Jaune";
                    if (col.r < 0.2f && col.g > 0.8f && col.b < 0.2f) return "Vert";
                    if (col.r < 0.2f && col.g > 0.5f && col.b > 0.8f) return "Cyan";
                    if (col.r < 0.2f && col.g < 0.2f && col.b > 0.8f) return "Bleu";
                    if (col.r > 0.5f && col.g < 0.2f && col.b > 0.8f) return "Violet";
                    if (col.r > 0.8f && col.g < 0.2f && col.b > 0.5f) return "Magenta";
                    if (col.r > 0.9f && col.g > 0.9f && col.b > 0.9f) return "Blanc";
                    if (col.r < 0.1f && col.g < 0.1f && col.b < 0.1f) return "Noir";
                }
                return "Couleur-" + hexColor;
        }
    }

    public void StartSession(string name)
    {
        userName = name;
        sessionStartTime = Time.realtimeSinceStartup;
        colorUsageCount.Clear();
        totalColorClicks = 0;
        Debug.Log($"Session started for: {userName} at time: {sessionStartTime}");
    }

    public void TrackColorUsage(Color color)
    {
        string colorHex = ColorUtility.ToHtmlStringRGB(color);
        
        if (colorUsageCount.ContainsKey(colorHex))
        {
            colorUsageCount[colorHex]++;
        }
        else
        {
            colorUsageCount[colorHex] = 1;
        }
        
        totalColorClicks++;
        Debug.Log($"Color tracked: #{colorHex}, Count: {colorUsageCount[colorHex]}, Total clicks: {totalColorClicks}");
    }

    public void EndSessionAndUpload()
    {
        float designTime = Time.realtimeSinceStartup - sessionStartTime;
        string mostUsedColorHex = GetMostUsedColor();
        string mostUsedColorName = GetColorName(mostUsedColorHex);

        Debug.Log($"Session ending - Duration: {designTime}s, Colors tracked: {colorUsageCount.Count}, Most used: {mostUsedColorName} (#{mostUsedColorHex})");

        ColoringSessionData data = new ColoringSessionData
        {
            name = userName,
            mostUsedColor = mostUsedColorName,
            colorCode = mostUsedColorHex,
            designTime = designTime // Keep in seconds
        };

        StartCoroutine(SendDataToDashboard(data));
    }

    private string GetMostUsedColor()
    {
        if (colorUsageCount.Count == 0)
        {
            Debug.LogWarning("No colors tracked!");
            return "CCCCCC"; // Gray if no colors used
        }

        string mostUsed = "";
        int maxCount = 0;

        foreach (var kvp in colorUsageCount)
        {
            Debug.Log($"Color #{kvp.Key}: used {kvp.Value} times");
            if (kvp.Value > maxCount)
            {
                maxCount = kvp.Value;
                mostUsed = kvp.Key;
            }
        }

        Debug.Log($"Most used color: #{mostUsed} with {maxCount} uses");
        return mostUsed;
    }

    private IEnumerator SendDataToDashboard(ColoringSessionData data)
    {
        string jsonData = JsonUtility.ToJson(data);
        Debug.Log($"Sending data to dashboard: {jsonData}");

        using (UnityWebRequest www = new UnityWebRequest(apiEndpoint, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            www.uploadHandler = new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");
            www.SetRequestHeader("X-API-Key", apiKey); // ⭐ ADDED: Authentication header!

            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("✓ Data successfully sent to dashboard!");
                Debug.Log($"Server response: {www.downloadHandler.text}");
            }
            else
            {
                Debug.LogError($"✗ Error sending data: {www.error}");
                Debug.LogError($"Response code: {www.responseCode}");
                if (www.downloadHandler != null)
                {
                    Debug.LogError($"Response: {www.downloadHandler.text}");
                }
            }
        }
    }
}
