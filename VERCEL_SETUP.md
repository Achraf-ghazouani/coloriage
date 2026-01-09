# Vercel Environment Variables Setup

## 🚀 Set Up Google Sheets on Vercel

You need to add these environment variables to your Vercel project:

### Go to Vercel Dashboard:
https://vercel.com/your-account/appcoloriage/settings/environment-variables

---

## 📝 Add These 3 Variables:

### 1. GOOGLE_SPREADSHEET_ID
```
1peahfXuHfc_1N0rIwP8JBg1W4ov_3r7riMC6UqU5xyk
```

### 2. GOOGLE_SERVICE_ACCOUNT
Open your `google-credentials.json` file and copy the ENTIRE content as ONE LINE.

**Format**: Paste your ENTIRE google-credentials.json content as a single line with no line breaks.

Example structure (use YOUR actual file):
```
{"type":"service_account","project_id":"YOUR_PROJECT","private_key_id":"YOUR_KEY_ID",...}
```

⚠️ **IMPORTANT**: 
- Copy the ENTIRE JSON from your `google-credentials.json` file
- Remove ALL line breaks - make it ONE LONG LINE
- Keep the private key with \n characters in it

### 3. UNITY_API_KEY (optional - for security)
```
unity-secret-key-123
```

---

## 📋 Steps in Vercel:

1. Go to: https://vercel.com → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add each variable:
   - Name: `GOOGLE_SPREADSHEET_ID`
   - Value: `1peahfXuHfc_1N0rIwP8JBg1W4ov_3r7riMC6UqU5xyk`
   - Environment: Select **All** (Production, Preview, Development)
   - Click **Save**

4. Add second variable:
   - Name: `GOOGLE_SERVICE_ACCOUNT`
   - Value: (paste entire JSON from google-credentials.json as one line)
   - Environment: Select **All**
   - Click **Save**

5. **IMPORTANT**: After adding variables, you MUST redeploy!
   - Go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Click **Redeploy**
   - OR push a new commit to trigger deployment

---

## ✅ After Redeployment:

Test Unity with: `https://appcoloriage.vercel.app/api/data`

It should work! ✨

---

## 🔍 Check Logs:

If it still doesn't work:
1. Go to Vercel → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **Functions** → Click on `data`
4. Check the logs for errors
