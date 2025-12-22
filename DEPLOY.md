# Deploying to Vercel 🚀

Quick guide to deploy your Coloriage Dashboard to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)

## Option 1: Deploy with Vercel CLI (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

Navigate to your project folder and run:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Choose your account
- Link to existing project? **No**
- Project name? **coloriage-dashboard** (or your preferred name)
- In which directory is your code? **./**
- Override settings? **No**

### Step 4: Production Deployment

Once you're happy with the preview, deploy to production:

```bash
vercel --prod
```

Your dashboard will be live at: `https://your-project-name.vercel.app`

## Option 2: Deploy via Vercel Dashboard

### Step 1: Push to Git

Make sure your code is pushed to GitHub, GitLab, or Bitbucket:

```bash
git init
git add .
git commit -m "Initial commit - Coloriage Dashboard"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect the settings
5. Click **"Deploy"**

## Update Your Unity Script

After deployment, update your Unity script with the new URL:

```csharp
public class DashboardReporter : MonoBehaviour
{
    [Header("Dashboard Settings")]
    public string dashboardURL = "https://your-project-name.vercel.app/api/data";
    // ... rest of the code
}
```

## Important Notes

### ⚠️ Data Storage Limitation

The current setup uses **in-memory storage**, which means:
- Data will be lost when Vercel's serverless function "sleeps" (cold start)
- Not suitable for production if you need persistent data

### 🗄️ For Production: Use a Database

For persistent data storage, integrate a database:

#### Option A: Vercel KV (Redis)

1. Install Vercel KV:
   ```bash
   npm install @vercel/kv
   ```

2. Add KV storage in Vercel dashboard
3. Update API to use KV

#### Option B: MongoDB Atlas (Free Tier)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Install mongoose:
   ```bash
   npm install mongoose
   ```
3. Add connection string to Vercel environment variables

#### Option C: Supabase (Free Tier)

1. Create project at [Supabase](https://supabase.com)
2. Install client:
   ```bash
   npm install @supabase/supabase-js
   ```
3. Add credentials to Vercel environment variables

### Example: Adding Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add your database credentials
4. Redeploy your project

## Testing Your Deployment

### Test with Curl

```bash
curl -X POST https://your-project-name.vercel.app/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","mostUsedColor":"#FF5733","designTime":120}'
```

### Test with Unity

Press Play in Unity and trigger the `SendDataToDashboard()` method. Check the Unity Console for success/error messages.

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Continuous Deployment

Once connected to Git, every push to your main branch will automatically deploy to Vercel! 🎉

## Troubleshooting

### API Not Working
- Check Vercel deployment logs in the dashboard
- Verify the API endpoint URL in your Unity script
- Check CORS settings in `vercel.json`

### Cold Start Issues
- First request after inactivity may be slow (5-10 seconds)
- Consider upgrading to Vercel Pro for faster cold starts
- Or use a database for persistent storage

### Data Lost After Deployment
- This is expected with in-memory storage
- Implement a database solution for production

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
