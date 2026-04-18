const { google } = require('googleapis');

let sheets = null;
let auth = null;

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

// Initialize Google Sheets API
async function initializeSheets() {
    if (sheets) return sheets;

    try {
        // Authentication using service account
        const credentials = process.env.GOOGLE_SERVICE_ACCOUNT 
            ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
            : require(process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './google-credentials.json');

        auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        sheets = google.sheets({ version: 'v4', auth });
        console.log('✅ Google Sheets initialized successfully');
        return sheets;
    } catch (error) {
        console.error('❌ Google Sheets initialization error:', error.message);
        console.log('Please set up Google Sheets credentials. See GOOGLE_SHEETS_SETUP.md');
        return null;
    }
}

// Get data from Google Sheet
async function getSheetData(spreadsheetId, range = 'Feuille 1!A2:F') {
    try {
        const sheetsApi = await initializeSheets();
        if (!sheetsApi) return [];

        const response = await sheetsApi.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values || [];
        
        // Convert rows to objects
        return rows.map((row, index) => ({
            id: row[0] || `row_${index}`,
            name: row[1] || '',
            mostUsedColor: normalizeColorName(row[2] || '', row[3] || ''),
            colorCode: normalizeHexColor(row[3] || '', '#808080'),
            designTime: parseFloat(row[4]) || 0,
            timestamp: row[5] || new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error reading from Google Sheet:', error.message);
        throw error;
    }
}

// Append data to Google Sheet
async function appendSheetData(spreadsheetId, data) {
    try {
        const sheetsApi = await initializeSheets();
        if (!sheetsApi) throw new Error('Sheets not initialized');

        const id = Date.now().toString();
        const normalizedColorCode = normalizeHexColor(data.colorCode || '#808080');
        const normalizedColorName = normalizeColorName(data.mostUsedColor, normalizedColorCode);
        const values = [[
            id,
            data.name,
            normalizedColorName,
            normalizedColorCode,
            data.designTime,
            data.timestamp || new Date().toISOString()
        ]];

        await sheetsApi.spreadsheets.values.append({
            spreadsheetId,
            range: 'Feuille 1!A:F',
            valueInputOption: 'RAW',
            resource: { values }
        });

        return {
            id,
            ...data,
            mostUsedColor: normalizedColorName,
            colorCode: normalizedColorCode
        };
    } catch (error) {
        console.error('Error writing to Google Sheet:', error.message);
        throw error;
    }
}

// Clear all data from Google Sheet (except header)
async function clearSheetData(spreadsheetId) {
    try {
        const sheetsApi = await initializeSheets();
        if (!sheetsApi) throw new Error('Sheets not initialized');

        await sheetsApi.spreadsheets.values.clear({
            spreadsheetId,
            range: 'Feuille 1!A2:F',
        });

        return true;
    } catch (error) {
        console.error('Error clearing Google Sheet:', error.message);
        throw error;
    }
}

// Create initial sheet with headers
async function setupSheetHeaders(spreadsheetId) {
    try {
        const sheetsApi = await initializeSheets();
        if (!sheetsApi) throw new Error('Sheets not initialized');

        const values = [['ID', 'Name', 'Most Used Color', 'Color Code', 'Design Time (seconds)', 'Timestamp']];

        await sheetsApi.spreadsheets.values.update({
            spreadsheetId,
            range: 'Feuille 1!A1:F1',
            valueInputOption: 'RAW',
            resource: { values }
        });

        console.log('✅ Sheet headers created');
        return true;
    } catch (error) {
        console.error('Error setting up headers:', error.message);
        throw error;
    }
}

module.exports = {
    initializeSheets,
    getSheetData,
    appendSheetData,
    clearSheetData,
    setupSheetHeaders
};
