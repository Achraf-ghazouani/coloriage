# Google Sheets Setup Guide (Excel in the Cloud)

## ✅ Google Sheets Integration Complete!

Your application now saves all data to **Google Sheets** - which works exactly like Excel but is cloud-based! All your data is permanently stored in a spreadsheet that you can view and edit at any time.

---

## 🎯 Why Google Sheets?

- ✅ **Like Excel**: Same spreadsheet format you're familiar with
- ✅ **Permanent Storage**: Data never disappears
- ✅ **View Anytime**: Open your sheet to see all the data
- ✅ **Free**: No cost for basic usage
- ✅ **Edit Directly**: You can manually edit data in the sheet
- ✅ **Export**: Download as Excel (.xlsx) anytime

---

## 🚀 Quick Setup (Step-by-Step)

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it something like "Coloriage Data"
4. Add these column headers in the first row:
   - A1: **ID**
   - B1: **Name**
   - C1: **Most Used Color**
   - D1: **Design Time (seconds)**
   - E1: **Timestamp**

5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_LONG_ID/edit
                                           ^^^^^^^^^^^^^^^^^^
   ```

### Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Click **Enable APIs and Services**
4. Search for "Google Sheets API"
5. Click **Enable**

### Step 3: Create Service Account

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **+ CREATE SERVICE ACCOUNT**
3. Name it: `coloriage-sheets-access`
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**)
6. Click **Done**

### Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will download - **save it securely!**
7. Rename it to `google-credentials.json`
8. Move it to your project folder: `f:\coloriage\`

### Step 5: Share Sheet with Service Account

1. Open your Google Sheet
2. Copy the email from the JSON file (looks like: `coloriage-sheets-access@project-id.iam.gserviceaccount.com`)
3. Click **Share** button in Google Sheets
4. Paste the service account email
5. Give it **Editor** access
6. Uncheck "Notify people"
7. Click **Share**

### Step 6: Configure Environment Variables

Create a `.env` file in `f:\coloriage\`:

```env
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_PATH=./google-credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# Authentication (keep your existing values)
DASHBOARD_PASSWORD=admin123
UNITY_API_KEY=unity-secret-key-123
```

Replace `your_spreadsheet_id_here` with the ID you copied in Step 1.

---

## 🌐 For Vercel Deployment

When deploying to Vercel, you need to set environment variables:

### 1. Prepare the Service Account

Open your `google-credentials.json` file and copy its entire contents.

### 2. Add to Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

```
GOOGLE_SPREADSHEET_ID = your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT = {"type":"service_account","project_id":"...paste entire JSON here..."}
```

⚠️ **Important**: For `GOOGLE_SERVICE_ACCOUNT`, paste the ENTIRE contents of your JSON file as a single line.

---

## 🎮 Running Your Application

### Local Development:
```bash
npm start
```

Visit http://localhost:3000 and start using the dashboard!

### Test Data Entry:
```bash
node test-send-data.js
```

---

## 📊 View Your Data

You can view and edit your data anytime:

1. Open your Google Sheet in your browser
2. See all entries in real-time
3. Manually edit any values if needed
4. Download as Excel file: **File** → **Download** → **Microsoft Excel (.xlsx)**

---

## 🔒 Security Setup

Create/update `.gitignore` to protect credentials:

```
node_modules/
google-credentials.json
.env
*.log
.DS_Store
```

**Never commit** these files to Git!

---

## ✅ Testing Checklist

- [ ] Created Google Sheet with headers
- [ ] Enabled Google Sheets API
- [ ] Created service account and downloaded JSON key
- [ ] Shared Google Sheet with service account email
- [ ] Added `.env` file with GOOGLE_SPREADSHEET_ID
- [ ] Saved `google-credentials.json` in project folder
- [ ] Added credentials to `.gitignore`
- [ ] Started server with `npm start`
- [ ] Sent test data
- [ ] Verified data appears in Google Sheet

---

## 🎯 What Happens Now?

1. **Unity sends data** → Saved to Google Sheet row
2. **Dashboard refreshes** → Reads from Google Sheet
3. **You open the sheet** → See all data in spreadsheet format
4. **Server restarts** → Data is STILL THERE! ✅
5. **Export to Excel** → Download anytime as .xlsx file

---

## ❓ Troubleshooting

### Error: "Google Sheets not configured"
- Check that `.env` file exists and has `GOOGLE_SPREADSHEET_ID`
- Verify the spreadsheet ID is correct

### Error: "The caller does not have permission"
- Make sure you shared the Google Sheet with the service account email
- The email is in the `google-credentials.json` file under `client_email`

### Data not appearing in sheet
- Check that Sheet1 exists (or update the sheet name in code)
- Verify the header row is in row 1 (data starts at row 2)
- Check the browser console and server logs for errors

### Can't find Spreadsheet ID
- Open your Google Sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- The ID is the long string between `/d/` and `/edit`

---

## 📱 Mobile Access

Since your data is in Google Sheets:
- ✅ View on phone using Google Sheets app
- ✅ Edit from anywhere
- ✅ Share with team members
- ✅ Use Google Sheets charts and formulas

---

## 💾 Backup Your Data

Your data is automatically backed up by Google, but you can also:

1. **Download as Excel**: File → Download → Microsoft Excel
2. **Make a Copy**: File → Make a copy
3. **Version History**: File → Version history

---

## 🎉 You're All Set!

Your Unity coloring application now saves all data to a Google Sheet (like Excel) permanently. The data will NEVER be automatically deleted, and you can view/edit it anytime at:

`https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`

---

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets Functions](https://support.google.com/docs/table/25273)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Make sure the Google Sheet is shared with the service account
4. Test the Google Sheet manually (add a row) to ensure it's working
