# ⚡ Quick Setup Guide - Fix Vercel 405 Error

Your Vercel deployment is showing **405 Method Not Allowed** because Vercel cannot run your Express backend with Socket.io.

## 🎯 Solution: Split Deployment

Deploy your app in 2 places:
- **Frontend** → Vercel (already done ✅)
- **Backend** → Railway (do this now 👇)

---

## 📋 Step-by-Step Instructions

### 1️⃣ Deploy Backend to Railway (5 minutes)

1. **Create Railway account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `bidding-tracking` repository
   - Railway auto-detects Node.js and starts deploying

3. **Add Environment Variables**
   - In Railway dashboard, click on your service
   - Go to **Variables** tab
   - Click **+ New Variable** and add these:

```bash
NODE_ENV=production
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=dev_bidding_db
JWT_SECRET=your-jwt-secret-key
COOKIE_SECRET=your-cookie-secret-key
FRONTEND_URL=https://kodion-bidding.vercel.app
```

**Note:** Railway automatically sets `PORT` - don't add it manually.

4. **Wait for deployment** (2-3 minutes)
   - Railway will build and deploy your backend
   - You'll get a URL like: `https://bidding-tracking-production.up.railway.app`
   - **Copy this URL** - you need it for step 2

---

### 2️⃣ Update Vercel Frontend (2 minutes)

1. **Add Environment Variable to Vercel**
   - Go to https://vercel.com/dashboard
   - Click on `kodion-bidding` project
   - Go to **Settings** → **Environment Variables**
   - Add:
     - **Name**: `VITE_API_BASE_URL`
     - **Value**: `https://your-railway-url.up.railway.app` (from step 1.4)
   - Click **Save**

2. **Redeploy Vercel**
   - Go to **Deployments** tab
   - Click **⋮** (three dots) on latest deployment
   - Click **Redeploy**
   - Wait 1-2 minutes

---

### 3️⃣ Test Your App ✅

1. Open: https://kodion-bidding.vercel.app
2. Try to login
3. Should work now! 🎉

---

## 🔍 How to Verify It's Working

**Before:** (Current state)
```
❌ POST https://kodion-bidding.vercel.app/api/auth/login
   → 405 Method Not Allowed
```

**After:** (After Railway setup)
```
✅ POST https://your-railway-url.up.railway.app/api/auth/login
   → 200 OK
```

---

## 💰 Cost

- **Railway**: $5 free credit/month (enough for testing)
- **Vercel**: Free for frontend
- **Total**: $0 for small-scale usage

---

## ❓ Troubleshooting

### "Cannot connect to database"
- Make sure your MySQL database allows connections from Railway's IP
- Or use Railway's built-in MySQL database (easier)

### "Still getting 405 error"
- Make sure you **redeployed** Vercel after adding `VITE_API_BASE_URL`
- Clear browser cache and try again
- Check Vercel environment variables are saved

### "CORS error"
- Your backend already allows `https://kodion-bidding.vercel.app` ✅
- Make sure `FRONTEND_URL` is set in Railway environment variables

---

## 📞 Need Help?

If you get stuck:
1. Check Railway deployment logs for errors
2. Check Vercel deployment logs
3. Use browser DevTools → Network tab to see which URL is being called

---

## ✨ Your Backend is Already Railway-Ready!

Your code already has everything needed:
- ✅ Uses `process.env.PORT` (Railway sets this automatically)
- ✅ CORS configured for Vercel domain
- ✅ Socket.io CORS configured
- ✅ Express server properly configured

Just deploy and connect! 🚀
