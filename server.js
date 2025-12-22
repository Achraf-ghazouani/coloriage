const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store the data (in production, you'd use a database)
let dashboardData = [];

// Endpoint to receive data from Unity
app.post('/api/data', (req, res) => {
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

// Endpoint to get all dashboard data
app.get('/api/data', (req, res) => {
    res.json(dashboardData);
});

// Endpoint to clear all data
app.delete('/api/data', (req, res) => {
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
});
