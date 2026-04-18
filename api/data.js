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

function hexToRgb(hexColor) {
    if (!hexColor) return null;

    const normalized = hexColor.replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return null;
    }

    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16)
    };
}

function rgbToHsv(r, g, b) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === rn) {
            h = ((gn - bn) / delta) % 6;
        } else if (max === gn) {
            h = (bn - rn) / delta + 2;
        } else {
            h = (rn - gn) / delta + 4;
        }
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h, s, v };
}

function getApproximateColorName(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) {
        return 'Gris';
    }

    const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);

    if (s < 0.12) {
        if (v <= 0.15) return 'Noir';
        if (v >= 0.92) return 'Blanc';
        return 'Gris';
    }

    if (h < 15 || h >= 345) return 'Rouge';
    if (h < 40) return 'Orange';
    if (h < 70) return 'Jaune';
    if (h < 95) return 'Jaune-Vert';
    if (h < 160) return 'Vert';
    if (h < 195) return 'Cyan';
    if (h < 255) return 'Bleu';
    if (h < 290) return 'Violet';
    if (h < 335) return 'Magenta';
    return 'Rose';
}

function normalizeHexColor(colorCode, fallback = '#808080') {
    const rawValue = typeof colorCode === 'string' ? colorCode.trim() : '';
    const match = rawValue.match(/^#?([0-9a-fA-F]{6})$/);
    return match ? `#${match[1].toUpperCase()}` : fallback;
}

function normalizeColorName(mostUsedColor, colorCode) {
    const rawName = typeof mostUsedColor === 'string' ? mostUsedColor.trim() : '';

    if (rawName) {
        const isCouleurFallback = /^couleur\b/i.test(rawName);
        const extractedHex = rawName.match(/([0-9a-fA-F]{6})/);
        if (isCouleurFallback && extractedHex) {
            return getApproximateColorName(extractedHex[1]);
        }

        if (/^#?[0-9a-fA-F]{6}$/.test(rawName)) {
            return getApproximateColorName(rawName);
        }

        return rawName;
    }

    const normalizedHex = normalizeHexColor(colorCode, '');
    if (normalizedHex) {
        return getApproximateColorName(normalizedHex);
    }

    return 'Inconnue';
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
            const hexColor = normalizeHexColor(colorCode);
            const normalizedColorName = normalizeColorName(mostUsedColor, hexColor);
            
            const values = [[
                id,
                name,
                normalizedColorName,
                hexColor,
                designTime,
                timestamp
            ]];

            // Append to Google Sheet (Excel)
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Feuille 1!A:F',
                valueInputOption: 'RAW',
                resource: { values }
            });

            const entry = { id, name, mostUsedColor: normalizedColorName, colorCode: hexColor, designTime, timestamp };
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
                range: 'Feuille 1!A2:F',
            });

            const rows = response.data.values || [];
            const data = rows.map((row, index) => ({
                id: row[0] || `row_${index}`,
                name: row[1] || '',
                mostUsedColor: normalizeColorName(row[2] || '', row[3] || ''),
                colorCode: normalizeHexColor(row[3] || '', '#808080'),
                designTime: parseFloat(row[4]) || 0,
                timestamp: row[5] || ''
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
                range: 'Feuille 1!A2:F',
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
