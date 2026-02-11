# 🚨 IMMEDIATE FIX FOR 405 ERROR

## The Problem
Your Vercel deployment is using `next-client` (which has NO API routes).
All API routes are in `next-app`.

---

## ✅ SOLUTION - Follow These Steps:

### Step 1: Go to Vercel Dashboard
Open: https://vercel.com

### Step 2: Select Your Project
Click on `kodion-bidding` project

### Step 3: Go to Settings
Click **Settings** tab at the top

### Step 4: Change Root Directory
1. Scroll down to **Root Directory**
2. Click **Edit**
3. Enter: `next-app` (exactly like this)
4. Click **Save**

### Step 5: Add Environment Variables
Go to **Settings** → **Environment Variables** and add ALL of these:

```
MYSQL_DB_NAME=kodion_bidding
MYSQL_DB_USER=kodion_bidding
MYSQL_DB_PASSWORD=godaddy.Kodion@2025
MYSQL_DB_HOST=118.139.180.250
MYSQL_DB_PORT=3306
SECRET_KEY=your_jwt_secret_key_change_this_in_production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kodion-bidding.vercel.app
```

### Step 6: Redeploy
1. Go to **Deployments** tab
2. Click the **...** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

### Step 7: Test
Open: https://kodion-bidding.vercel.app/api/health

Should show: `{"status":"healthy","database":"connected"}`

---

## Alternative: Push to GitHub

If you have GitHub connected:

```bash
# From the bidding-tracking folder
git add .
git commit -m "Deploy next-app with all API routes"
git push
```

Vercel will auto-deploy after you change the Root Directory setting.

---

## ✅ After This Fix:
- ✅ Login will work
- ✅ All API routes will work
- ✅ No more 405 errors

---

## Need Help?
If you're still getting errors:
1. Check Vercel build logs: https://vercel.com/kodion-bidding/deployments
2. Make sure Root Directory is set to `next-app`
3. Make sure all environment variables are set
