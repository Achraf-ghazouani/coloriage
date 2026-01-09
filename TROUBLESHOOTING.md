# Quick Troubleshooting Guide

## ❌ Problem: No Data Being Sent from Unity

### Issue 1: Server Not Running
**The server must be running for Unity to send data!**

### Issue 2: Missing Google Credentials
You need to set up Google Sheets credentials first.

---

## ✅ Quick Fix (2 Options)

### Option A: Use Local Storage First (Easier - Test Now!)

1. **Temporarily disable Google Sheets** to test if Unity is working
2. Server will store data in memory (will be lost on restart, but good for testing)

### Option B: Set Up Google Sheets (Permanent Solution)

Follow the full guide in GOOGLE_SHEETS_SETUP.md

---

## 🚀 IMMEDIATE STEPS TO TEST:

### Step 1: Start the Server

Open PowerShell and run:
```bash
cd f:\coloriage
npm start
```

Keep this window open! You should see:
```
Dashboard server running on http://localhost:3000
```

### Step 2: Test from Unity

In Unity:
1. Press **Play**
2. Press **S** key (this triggers the test in DashboardReporter.cs)
3. Check Unity Console for messages

You should see:
```
Sending data to dashboard: {...}
Data sent successfully to dashboard!
```

### Step 3: View in Dashboard

Open browser: http://localhost:3000
- Login with password: `admin123`
- You should see the data!

---

## 🔧 If Still Not Working:

### Check Unity Settings:
1. Open Unity → Inspector panel
2. Select the GameObject with DashboardReporter script
3. Verify:
   - Dashboard URL: `http://localhost:3000/api/data`
   - API Key: `unity-secret-key-123`

### Check Unity Console:
- Look for error messages (red text)
- Common errors:
  - "Connection refused" = Server not running
  - "401 Unauthorized" = Wrong API key
  - "404 Not Found" = Wrong URL

### Check Server Console:
- Should show: `✅ New data saved to Google Sheet`
- If you see errors about Google Sheets, that's OK for now - see Option A below

---

## 🎯 Two Ways to Proceed:

### Option A: Quick Test (No Google Sheets Setup)
I can modify the server to work WITHOUT Google Sheets temporarily so you can test Unity right away.

### Option B: Full Setup (Permanent Storage)
Follow GOOGLE_SHEETS_SETUP.md to set up Google Sheets for permanent storage.

---

## Which option do you want?
