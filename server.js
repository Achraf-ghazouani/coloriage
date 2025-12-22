const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Authentication settings
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';
const UNITY_API_KEY = process.env.UNITY_API_KEY || 'unity-secret-key-123';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware for dashboard
function authenticateDashboard(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (token === DASHBOARD_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Authentication middleware for Unity API
function authenticateUnity(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey === UNITY_API_KEY) {
        next();
    } else {
        res.status(401).json({ error: 'Invalid API key' });
    }
}

app.use(express.static('public'));

// Store the data (in production, you'd use a database)
let dashboardData = [];

// Login endpoint for dashboard
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    
    if (password === DASHBOARD_PASSWORD) {
        res.json({ success: true, token: DASHBOARD_PASSWORD });
    } else {
        res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
    }
});

// Endpoint to receive data from Unity (requires API key)
app.post('/api/data', authenticateUnity, (req, res) => {
    const { name, mostUsedColor, designTime } = req.body;
    
    if (!name || !mostUsedColor || designTime === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields: name, mostUsedColor, designTime' 
        });
    }

    const entry = {
        id: Date.now(),
        name,
        mostUsedColor,
        designTime,
        timestamp: new Date().toISOString()
    };

    dashboardData.push(entry);
    
    // Keep only the last 100 entries
    if (dashboardData.length > 100) {
        dashboardData = dashboardData.slice(-100);
    }

    console.log('New data received:', entry);
    res.json({ success: true, message: 'Data received successfully', data: entry });
});

// Endpoint to get all dashboard data (requires authentication)
app.get('/api/data', authenticateDashboard, (req, res) => {
    res.json(dashboardData);
});

// Endpoint to clear all data (requires authentication)
app.delete('/api/data', authenticateDashboard, (req, res) => {
    dashboardData = [];
    res.json({ success: true, message: 'All data cleared' });
});

// Serve the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Dashboard server running on http://localhost:${PORT}`);
    console.log(`Unity should send data to: http://localhost:${PORT}/api/data`);
    console.log(`\n🔐 Security Settings:`);
    console.log(`   Dashboard Password: ${DASHBOARD_PASSWORD}`);
    console.log(`   Unity API Key: ${UNITY_API_KEY}`);
    console.log(`\n⚠️  Change these in production via environment variables!`);
});
