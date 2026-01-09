// Serverless function for Vercel with Google Sheets
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';

// Initialize Google Sheets
function getSheets() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
        throw new Error('Google Sheets not configured');
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST - Receive data from Unity
    if (req.method === 'POST') {
        const { name, mostUsedColor, colorCode, designTime } = req.body;
        
        if (!name || designTime === undefined) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, designTime' 
            });
        }

        if (!SPREADSHEET_ID) {
            return res.status(503).json({ 
                error: 'Google Sheets not configured. Please set GOOGLE_SPREADSHEET_ID.' 
            });
        }

        try {
            const sheets = getSheets();
            const id = Date.now().toString();
            const timestamp = new Date().toISOString();
            const hexColor = colorCode ? `#${colorCode}` : '#808080';
            
            const values = [[
                id,
                name,
                mostUsedColor || 'Unknown',
                hexColor,
                designTime,
                timestamp
            ]];

            // Append to Google Sheet (Excel)
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Feuille 1!A:E',
                valueInputOption: 'RAW',
                resource: { values }
            });

            const entry = { id, name, mostUsedColor, colorCode: hexColor, designTime, timestamp };
            console.log('New data saved to Google Sheet:', entry);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Data saved to Excel sheet successfully', 
                data: entry 
            });
        } catch (error) {
            console.error('Error saving to Google Sheet:', error);
            return res.status(500).json({ error: 'Failed to save data to Excel sheet' });
        }
    }

    // GET - Return all data
    if (req.method === 'GET') {
        if (!SPREADSHEET_ID) {
            return res.status(503).json({ 
                error: 'Google Sheets not configured. Please set GOOGLE_SPREADSHEET_ID.' 
            });
        }

        try {
            const sheets = getSheets();
            
            // Read from Google Sheet (Excel)
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Feuille 1!A2:E',
            });

            const rows = response.data.values || [];
            const data = rows.map((row, index) => ({
                id: row[0] || `row_${index}`,
                name: row[1] || '',
                mostUsedColor: row[2] || '',
                designTime: parseFloat(row[3]) || 0,
                timestamp: row[4] || ''
            }));

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error reading from Google Sheet:', error);
            return res.status(500).json({ error: 'Failed to read data from Excel sheet' });
        }
    }

    // DELETE - Clear all data
    if (req.method === 'DELETE') {
        if (!SPREADSHEET_ID) {
            return res.status(503).json({ 
                error: 'Google Sheets not configured. Please set GOOGLE_SPREADSHEET_ID.' 
            });
        }

        try {
            const sheets = getSheets();
            
            // Clear Google Sheet (Excel) - keep headers
            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Feuille 1!A2:E',
            });
            
            return res.status(200).json({ 
                success: true, 
                message: 'All data cleared from Excel sheet' 
            });
        } catch (error) {
            console.error('Error clearing Google Sheet:', error);
            return res.status(500).json({ error: 'Failed to clear Excel sheet' });
        }
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
}
