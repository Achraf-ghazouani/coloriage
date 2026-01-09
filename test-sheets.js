require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleSheets() {
    try {
        console.log('Testing Google Sheets connection...');
        console.log('Spreadsheet ID:', process.env.GOOGLE_SPREADSHEET_ID);
        
        const credentials = require('./google-credentials.json');
        console.log('Service account email:', credentials.client_email);
        
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Try to get spreadsheet metadata
        console.log('\nTrying to access spreadsheet...');
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
        });
        
        console.log('✅ SUCCESS! Can access spreadsheet');
        console.log('Title:', spreadsheet.data.properties.title);
        console.log('Sheets:', spreadsheet.data.sheets.map(s => s.properties.title).join(', '));
        
        // Try to read data
        console.log('\nTrying to read data...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: 'Sheet1!A1:E2',
        });
        
        console.log('✅ SUCCESS! Can read data');
        console.log('Data:', response.data.values);
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.code === 403) {
            console.error('\n⚠️  Permission denied! Make sure you:');
            console.error('1. Shared the sheet with:', credentials.client_email);
            console.error('2. Gave it Editor permission');
        } else if (error.code === 404) {
            console.error('\n⚠️  Spreadsheet not found! Check your GOOGLE_SPREADSHEET_ID');
        }
    }
}

testGoogleSheets();
