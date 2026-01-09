const express = require('express');
const cors = require('cors');
const path = require('path');
const { getSheetData, appendSheetData, clearSheetData } = require('./sheets-config');

const app = express();
const PORT = 3000;

// Authentication settings
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';
const UNITY_API_KEY = process.env.UNITY_API_KEY || 'unity-secret-key-123';

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';

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

// Data is now stored in Google Sheets (like Excel in the cloud)
// No need for in-memory storage

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
app.post('/api/data', authenticateUnity, async (req, res) => {
    const { name, mostUsedColor, designTime } = req.body;
    
    if (!name || !mostUsedColor || designTime === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields: name, mostUsedColor, designTime' 
        });
    }

    if (!SPREADSHEET_ID) {
        return res.status(503).json({ 
            error: 'Google Sheets not configured. Please set GOOGLE_SPREADSHEET_ID.' 
        });
    }

    try {
        const entry = {
            name,
            mostUsedColor,
            designTime,
            timestamp: new Date().toISOString()
        };

        // Save to Google Sheet (Excel)
        const savedEntry = await appendSheetData(SPREADSHEET_ID, entry);

        console.log('✅ New data saved to Google Sheet:', savedEntry);
        res.json({ success: true, message: 'Data saved to Excel sheet successfully', data: savedEntry });
    } catch (error) {
        console.error('Error saving to Google Sheet:', error);
        res.status(500).json({ error: 'Failed to save data to Excel sheet' });
    }
});

// Endpoint to get all dashboard data (requires authentication)
app.get('/api/data', authenticateDashboard, async (req, res) => {
    if (!SPREADSHEET_ID) {
        return res.status(503).json({ 
            error: 'Google Sheets not configured. Please set GOOGLE_SPREADSHEET_ID.' 
        });
    }

    try {
        // Read from Google Sheet (Excel)
        const data = await getSheetData(SPREADSHEET_ID);
        res.json(data);
    } catch (error) {
        console.error('Error reading from Google Sheet:', error);
        res.status(500).json({ error: 'Failed to read data from Excel sheet' });
    }
});

// Endpoint to clear all data (requires authentication)
app.delete('/api/data', authenticateDashboard, async (req, res) => {
    if (!SPREADSHEET_ID) {
        return res.status(503).json({ 
            error: 'Google Sheets not configured. Please set GOOGLE_SPREADSHEET_ID.' 
        });
    }

    try {
        // Clear Google Sheet (Excel)
        await clearSheetData(SPREADSHEET_ID);
        res.json({ success: true, message: 'All data cleared from Excel sheet' });
    } catch (error) {
        console.error('Error clearing Google Sheet:', error);
        res.status(500).json({ error: 'Failed to clear Excel sheet' });
    }
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
