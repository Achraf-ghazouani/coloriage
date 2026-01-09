const { google } = require('googleapis');

let sheets = null;
let auth = null;

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
async function getSheetData(spreadsheetId, range = 'Sheet1!A2:E') {
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
            mostUsedColor: row[2] || '',
            designTime: parseFloat(row[3]) || 0,
            timestamp: row[4] || new Date().toISOString()
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
        const values = [[
            id,
            data.name,
            data.mostUsedColor,
            data.designTime,
            data.timestamp || new Date().toISOString()
        ]];

        await sheetsApi.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:E',
            valueInputOption: 'RAW',
            resource: { values }
        });

        return { id, ...data };
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
            range: 'Sheet1!A2:E',
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

        const values = [['ID', 'Name', 'Most Used Color', 'Design Time (seconds)', 'Timestamp']];

        await sheetsApi.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1:E1',
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
