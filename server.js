require('dotenv').config();

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

// Fallback: In-memory storage when Google Sheets is not configured
let memoryData = [];
const USE_SHEETS = SPREADSHEET_ID !== '';

if (USE_SHEETS) {
    console.log('📊 Google Sheets mode enabled - data will be saved permanently');
} else {
    console.log('⚠️  Memory mode - data will be lost on restart. Configure Google Sheets for permanent storage.');
}

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
    try {
        console.log('📥 Received data from Unity:', JSON.stringify(req.body));
        
        const { name, mostUsedColor, colorCode, designTime } = req.body;
        
        // Accept either mostUsedColor or colorCode
        const color = mostUsedColor || colorCode || '#000000';
        
        if (!name || designTime === undefined) {
            console.error('❌ Validation error - missing fields:', req.body);
            return res.status(400).json({ 
                error: 'Missing required fields: name, designTime' 
            });
        }

        const entry = {
            id: Date.now(),
            name,
            mostUsedColor: color,
            designTime,
            timestamp: new Date().toISOString()
        };

        // Try Google Sheets first, fallback to memory
        if (USE_SHEETS) {
            try {
                const savedEntry = await appendSheetData(SPREADSHEET_ID, entry);
                console.log('✅ Data saved to Google Sheet:', savedEntry);
                return res.json({ success: true, message: 'Data saved to Excel sheet', data: savedEntry });
            } catch (error) {
                console.error('❌ Google Sheets error, falling back to memory:', error.message);
                // Fall through to memory storage
            }
        }

        // Fallback: Save to memory
        memoryData.push(entry);
        if (memoryData.length > 100) {
            memoryData = memoryData.slice(-100);
        }
        console.log('✅ Data saved to memory (temporary):', entry);
        res.json({ success: true, message: 'Data saved (memory - will be lost on restart)', data: entry });
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Endpoint to get all dashboard data (requires authentication)
app.get('/api/data', authenticateDashboard, async (req, res) => {
    // Try Google Sheets first, fallback to memory
    if (USE_SHEETS) {
        try {
            const data = await getSheetData(SPREADSHEET_ID);
            return res.json(data);
        } catch (error) {
            console.error('❌ Google Sheets error, falling back to memory:', error.message);
            // Fall through to memory storage
        }
    }

    // Fallback: Return memory data
    res.json(memoryData);
});

// Endpoint to clear all data (requires authentication)
app.delete('/api/data', authenticateDashboard, async (req, res) => {
    // Try Google Sheets first, fallback to memory
    if (USE_SHEETS) {
        try {
            await clearSheetData(SPREADSHEET_ID);
            return res.json({ success: true, message: 'All data cleared from Excel sheet' });
        } catch (error) {
            console.error('❌ Google Sheets error, falling back to memory:', error.message);
            // Fall through to memory storage
        }
    }

    // Fallback: Clear memory data
    memoryData = [];
    res.json({ success: true, message: 'All data cleared from memory' });
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
