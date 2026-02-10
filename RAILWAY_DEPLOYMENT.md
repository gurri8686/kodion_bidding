# Railway Backend Deployment Guide

## 🚂 Deploy Your Express Backend to Railway

### Step 1: Create Railway Account & Project (2 minutes)

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your `bidding-tracking` repository
6. Railway will auto-detect Node.js and deploy

### Step 2: Add Environment Variables in Railway

In Railway dashboard, go to **Variables** tab and add:

```
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=dev_bidding_db
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
FRONTEND_URL=https://kodion-bidding.vercel.app
```

### Step 3: Configure Start Script

Railway will automatically run `npm start` from your `package.json`.

Your current `server/package.json` already has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

This is perfect! ✅

### Step 4: Get Your Railway Backend URL

After deployment completes:
1. Railway will give you a URL like: `https://your-app-name.up.railway.app`
2. Copy this URL - you'll need it for Step 5

### Step 5: Update Vercel Frontend Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `kodion-bidding` project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

```
VITE_API_BASE_URL=https://your-app-name.up.railway.app
```

5. Click **Save**
6. Go to **Deployments** tab
7. Click **⋮** on the latest deployment → **Redeploy**

### Step 6: Test Your Deployment

1. Open: `https://kodion-bidding.vercel.app`
2. Try logging in
3. It should now work! 🎉

---

## Alternative: Render.com (Same Process)

If you prefer Render.com instead of Railway:

1. Go to [render.com](https://render.com)
2. Create **Web Service** from your GitHub repo
3. Use these settings:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `node server/server.js`
4. Add same environment variables as above
5. Follow Steps 5-6 above

---

## Why This Split Deployment?

- **Vercel**: Best for static frontends (React/Next.js)
- **Railway/Render**: Best for backends with Socket.io and long-running processes
- Your app needs both, so we deploy to 2 platforms

## Cost

- **Railway**: Free tier includes $5 credit/month (enough for small apps)
- **Render**: Free tier available (goes to sleep after inactivity)
- **Vercel**: Free tier for frontend

---

## Troubleshooting

### "EADDRINUSE: address already in use"
- Railway handles port assignment automatically via `process.env.PORT`
- Your server already uses `process.env.PORT || 5000` ✅

### CORS Errors
- Already fixed! Your server allows `https://kodion-bidding.vercel.app` ✅
- Make sure FRONTEND_URL environment variable is set in Railway

### Database Connection Fails
- Make sure your MySQL database is accessible from Railway's IP
- Some MySQL hosts require whitelisting IP addresses
- Consider using Railway's built-in MySQL database instead
