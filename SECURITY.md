# 🔐 Configuration de Sécurité

Le tableau de bord est maintenant protégé par authentification!

## 🔑 Deux Niveaux de Sécurité

### 1. Protection du Dashboard Web (Visualisation des données)
- **Qui:** Les personnes qui veulent voir le tableau de bord
- **Comment:** Page de connexion avec mot de passe
- **Par défaut:** `admin123`

### 2. Protection de l'API Unity (Envoi des données)
- **Qui:** Votre application Unity
- **Comment:** Clé API dans les headers HTTP
- **Par défaut:** `unity-secret-key-123`

## 🚀 Configuration en Développement

### Méthode 1: Variables d'environnement (Recommandé)

Créez un fichier `.env` à la racine du projet:

```bash
DASHBOARD_PASSWORD=VotreMotDePasseSecurise2024!
UNITY_API_KEY=votre-cle-api-super-secrete-xyz
```

### Méthode 2: Modification directe du code

Éditez `server.js`:

```javascript
const DASHBOARD_PASSWORD = 'VotreMotDePasse';
const UNITY_API_KEY = 'VotreCleAPI';
```

## 🌐 Configuration sur Vercel

### Étape 1: Ajouter les variables d'environnement

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez:
   - `DASHBOARD_PASSWORD` = votre mot de passe
   - `UNITY_API_KEY` = votre clé API

### Étape 2: Redéployer

```bash
vercel --prod
```

## 🎮 Configuration dans Unity

Dans l'Inspector du GameObject avec `DashboardReporter`:

1. **Dashboard URL**: `https://votre-app.vercel.app/api/data`
2. **Api Key**: `votre-cle-api-super-secrete-xyz` (même que dans Vercel)

## 📝 Utilisation

### Se connecter au Dashboard

1. Allez sur `http://localhost:3000` ou `https://votre-app.vercel.app`
2. Entrez le mot de passe
3. Vous serez connecté pendant toute la session

### Déconnexion

Cliquez sur le bouton **🚪 Déconnexion** dans le dashboard

## 🔒 Sécurité Renforcée (Production)

Pour une sécurité maximale en production:

### 1. Utilisez des mots de passe forts

```bash
# Générer un mot de passe sécurisé
openssl rand -base64 32
```

### 2. Utilisez HTTPS (automatique avec Vercel)

### 3. Limitez l'accès par IP (optionnel)

Ajoutez dans `server.js`:

```javascript
const allowedIPs = ['123.456.789.0', '98.765.432.1'];

app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (allowedIPs.includes(clientIP)) {
        next();
    } else {
        res.status(403).json({ error: 'Accès interdit' });
    }
});
```

### 4. Rate Limiting (Limitation de tentatives)

Installez et ajoutez:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: 'Trop de tentatives, réessayez dans 15 minutes'
});

app.post('/api/login', loginLimiter, (req, res) => {
    // ... code de login
});
```

## ⚠️ Important

- ❌ **Ne commitez JAMAIS** le fichier `.env` dans Git
- ✅ Le fichier `.gitignore` est déjà configuré pour l'ignorer
- 🔄 Changez les mots de passe par défaut **immédiatement**
- 📧 Ne partagez jamais vos clés API publiquement

## 🐛 Dépannage

### Erreur "Unauthorized" dans Unity

- Vérifiez que `apiKey` dans Unity correspond à `UNITY_API_KEY` du serveur
- Vérifiez que le header `X-API-Key` est bien envoyé

### Impossible de se connecter au dashboard

- Vérifiez le mot de passe dans `.env` ou les variables Vercel
- Videz le cache du navigateur et réessayez
- Vérifiez la console du navigateur (F12) pour les erreurs

### Session expirée

- Reconnectez-vous simplement avec le mot de passe
- Le token est stocké dans `localStorage` du navigateur

## 📞 Support

Pour des questions de sécurité, consultez:
- [OWASP Security Guidelines](https://owasp.org/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
