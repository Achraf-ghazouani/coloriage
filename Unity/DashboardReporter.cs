using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Unity script to send data to the dashboard
/// Attach this script to a GameObject in your scene
/// </summary>
public class DashboardReporter : MonoBehaviour
{
    [Header("Dashboard Settings")]
    [Tooltip("URL of the dashboard server")]
    public string dashboardURL = "http://localhost:3000/api/data";
    
    [Tooltip("API Key for authentication")]
    public string apiKey = "unity-secret-key-123";
    
    [Header("Data to Send")]
    public string userName = "Player1";
    public string mostUsedColor = "#FF5733";
    public float designTime = 0f; // Time in seconds
    
    private float startTime;
    private Dictionary<string, int> colorUsage = new Dictionary<string, int>();

    void Start()
    {
        startTime = Time.time;
    }

    /// <summary>
    /// Call this method when a color is used
    /// </summary>
    public void TrackColorUsage(Color color)
    {
        string hexColor = ColorToHex(color);
        TrackColorUsage(hexColor);
    }

    /// <summary>
    /// Call this method when a color is used (hex string)
    /// IMPORTANT: Always use hex format like #FF0000, not color names
    /// </summary>
    public void TrackColorUsage(string hexColor)
    {
        // Ensure it's a hex color
        if (!hexColor.StartsWith("#"))
        {
            Debug.LogWarning($"Color should be in hex format (e.g., #FF0000), got: {hexColor}");
            return;
        }
        
        if (!colorUsage.ContainsKey(hexColor))
        {
            colorUsage[hexColor] = 0;
        }
        colorUsage[hexColor]++;
    }

    /// <summary>
    /// Get the most used color
    /// </summary>
    public string GetMostUsedColor()
    {
        if (colorUsage.Count == 0)
        {
            return mostUsedColor; // Return default if no colors tracked
        }

        string mostUsed = "";
        int maxCount = 0;

        foreach (var kvp in colorUsage)
        {
            if (kvp.Value > maxCount)
            {
                maxCount = kvp.Value;
                mostUsed = kvp.Key;
            }
        }

        return mostUsed;
    }

    /// <summary>
    /// Send data to the dashboard
    /// Call this when the user finishes their design
    /// </summary>
    public void SendDataToDashboard()
    {
        designTime = Time.time - startTime;
        mostUsedColor = GetMostUsedColor();
        
        StartCoroutine(SendDataCoroutine());
    }

    /// <summary>
    /// Send data with custom parameters
    /// </summary>
    public void SendDataToDashboard(string name, string color, float time)
    {
        userName = name;
        mostUsedColor = color;
        designTime = time;
        
        StartCoroutine(SendDataCoroutine());
    }

    private IEnumerator SendDataCoroutine()
    {
        // Create JSON data
        DashboardData data = new DashboardData
        {
            name = userName,
            mostUsedColor = mostUsedColor,
            designTime = designTime
        };

        string jsonData = JsonUtility.ToJson(data);
        
        Debug.Log($"Sending data to dashboard: {jsonData}");

        // Create web request
        using (UnityWebRequest request = new UnityWebRequest(dashboardURL, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("X-API-Key", apiKey);

            // Send request
            yield return request.SendWebRequest();

            // Check for errors
            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Data sent successfully to dashboard!");
                Debug.Log($"Response: {request.downloadHandler.text}");
            }
            else
            {
                Debug.LogError($"Error sending data: {request.error}");
                Debug.LogError($"Response Code: {request.responseCode}");
            }
        }
    }

    /// <summary>
    /// Convert Unity Color to hex string
    /// </summary>
    private string ColorToHex(Color color)
    {
        int r = Mathf.RoundToInt(color.r * 255);
        int g = Mathf.RoundToInt(color.g * 255);
        int b = Mathf.RoundToInt(color.b * 255);
        return $"#{r:X2}{g:X2}{b:X2}";
    }

    /// <summary>
    /// Example: Call this when user clicks a button to finish and submit
    /// </summary>
    public void OnFinishButtonClicked()
    {
        SendDataToDashboard();
    }

    // Example usage in your game
    void Update()
    {
        // Example: Send data when pressing 'S' key (for testing)
        if (Input.GetKeyDown(KeyCode.S))
        {
            // ✅ CORRECT: Use hex codes or Unity Color objects
            TrackColorUsage(Color.red);        // Converts to #FF0000
            TrackColorUsage(Color.blue);       // Converts to #0000FF
            TrackColorUsage(Color.green);      // Converts to #00FF00
            TrackColorUsage("#FF5733");        // Orange
            TrackColorUsage("#33FF57");        // Green
            
            // ❌ INCORRECT: Don't use color names like "Rouge", "Bleu", etc.
            // TrackColorUsage("Rouge");  // This won't work!
            
            SendDataToDashboard();
        }
    }
}

/// <summary>
/// Data structure for JSON serialization
/// </summary>
[System.Serializable]
public class DashboardData
{
    public string name;
    public string mostUsedColor;
    public float designTime;
}
