using UnityEngine;

/// <summary>
/// EXEMPLE: Comment utiliser le DashboardReporter avec les couleurs
/// </summary>
public class ExempleUtilisationCouleurs : MonoBehaviour
{
    public DashboardReporter reporter;

    void Start()
    {
        // EXEMPLE 1: Utiliser les couleurs Unity natives (recommandé)
        // Elles seront automatiquement converties en hex
        reporter.TrackColorUsage(Color.red);      // Devient #FF0000
        reporter.TrackColorUsage(Color.blue);     // Devient #0000FF
        reporter.TrackColorUsage(Color.green);    // Devient #00FF00
        reporter.TrackColorUsage(Color.yellow);   // Devient #FFFF00
        
        // EXEMPLE 2: Utiliser des couleurs personnalisées
        Color roseCustom = new Color(1f, 0.75f, 0.8f);  // RGB (255, 191, 204)
        reporter.TrackColorUsage(roseCustom);
        
        // EXEMPLE 3: Utiliser directement des codes hex
        reporter.TrackColorUsage("#FF5733");  // Orange
        reporter.TrackColorUsage("#C70039");  // Rouge foncé
        reporter.TrackColorUsage("#900C3F");  // Bordeaux
        reporter.TrackColorUsage("#581845");  // Violet foncé
        
        // ❌ NE PAS FAIRE: Ne pas envoyer des noms de couleurs
        // reporter.TrackColorUsage("Rouge");     // ❌ NE MARCHE PAS
        // reporter.TrackColorUsage("Bleu");      // ❌ NE MARCHE PAS
        // reporter.TrackColorUsage("Vert");      // ❌ NE MARCHE PAS
    }

    // Exemple: Quand l'utilisateur sélectionne une couleur dans votre UI
    public void OnColorSelected(Color selectedColor)
    {
        reporter.TrackColorUsage(selectedColor);
    }

    // Exemple: Quand l'utilisateur termine son dessin
    public void OnUserFinishedDrawing()
    {
        reporter.SendDataToDashboard();
    }
}
