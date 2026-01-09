# Quick Google Sheets Setup - GET YOUR DATA TO EXCEL NOW!

## 🚀 5-Minute Setup to Save Data to Excel Sheet

You already have the spreadsheet ID! Just need credentials.

---

## Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Create a new project OR select existing project

---

## Step 2: Enable Google Sheets API

1. Click the menu (☰) → **APIs & Services** → **Library**
2. Search for: **Google Sheets API**
3. Click it → Click **ENABLE**

---

## Step 3: Create Service Account (2 minutes)

1. Go to: **IAM & Admin** → **Service Accounts**
2. Click **+ CREATE SERVICE ACCOUNT**
3. Name: `coloriage-app`
4. Click **CREATE AND CONTINUE**
5. Skip roles (click **CONTINUE**)
6. Click **DONE**

---

## Step 4: Create Key (Download JSON)

1. Click on the service account you just created
2. Go to **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Select **JSON**
5. Click **CREATE**
6. **File downloads automatically** ✅

---

## Step 5: Setup the Downloaded File

1. Find the downloaded JSON file (probably in Downloads folder)
2. **Rename it to:** `google-credentials.json`
3. **Move it to:** `f:\coloriage\`
4. ⚠️ **IMPORTANT**: It should be in the same folder as server.js

---

## Step 6: Share Your Google Sheet

1. Open the downloaded `google-credentials.json` file
2. Copy the email (looks like: `coloriage-app@project-123456.iam.gserviceaccount.com`)
3. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1peahfXuHfc_1N0rIwP8JBg1W4ov_3r7riMC6UqU5xyk/edit
4. Click **Share** button
5. Paste the service account email
6. Give it **Editor** permission
7. **Uncheck** "Notify people"
8. Click **Share**

---

## Step 7: Verify Your Sheet Has Headers

Open your Google Sheet and make sure Row 1 has these headers:

| A | B | C | D | E |
|---|---|---|---|---|
| ID | Name | Most Used Color | Design Time (seconds) | Timestamp |

If not, add them manually.

---

## Step 8: Enable in .env File

The .env file needs these lines UNCOMMENTED:

```env
GOOGLE_SERVICE_ACCOUNT_PATH=./google-credentials.json
GOOGLE_SPREADSHEET_ID=1peahfXuHfc_1N0rIwP8JBg1W4ov_3r7riMC6UqU5xyk
```

---

## Step 9: Restart Server

In PowerShell:
```bash
# Stop current server
Get-Process -Name node | Stop-Process -Force

# Start server
npm start
```

You should see:
```
📊 Google Sheets mode enabled - data will be saved permanently
```

---

## Step 10: Test from Unity!

Send data from Unity → It will be saved to your Google Sheet permanently! ✅

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google Sheets API
- [ ] Created service account
- [ ] Downloaded JSON key file
- [ ] Renamed to `google-credentials.json`
- [ ] Moved to `f:\coloriage\` folder
- [ ] Shared Google Sheet with service account email
- [ ] Added headers to Google Sheet (Row 1)
- [ ] Enabled in .env file
- [ ] Restarted server

---

## 🆘 Need Help?

If you get stuck, I can help! Just let me know which step is unclear.

Once done, all Unity data will be saved permanently to your Google Sheet! 📊✨
