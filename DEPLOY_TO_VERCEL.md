# 🚨 Fix 405 Error - Deploy Correct Folder to Vercel

## The Problem
You're getting **405 Method Not Allowed** because you deployed **next-client** which has NO API routes!

```
❌ next-client/app/api/  → EMPTY (no auth, no routes)
✅ next-app/app/api/     → HAS ALL API ROUTES (auth, jobs, admin, etc.)
```

---

## ✅ Solution: Deploy next-app Instead

### Method 1: Vercel Dashboard (Fastest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/[your-username]/kodion-bidding/settings

2. **Change Root Directory**
   - Click **General** tab
   - Find **Root Directory** setting
   - Change from `next-client` to **`next-app`**
   - Click **Save**

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**
   - ✅ Done!

---

### Method 2: Git Push (Alternative)

The `vercel.json` in root is already configured for `next-app`:

```bash
git add vercel.json
git commit -m "Deploy next-app with API routes"
git push
```

Vercel will auto-redeploy from `next-app`.

---

## 🎯 What's in Each Folder?

| Folder | API Routes | Pages | Status |
|--------|-----------|-------|--------|
| next-client | ❌ NONE | Some | Incomplete |
| next-app | ✅ 60+ routes | 22+ pages | Complete migration |

---

## 🔑 Environment Variables Needed

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```env
# Database (MySQL)
MYSQL_DB_HOST=your-host
MYSQL_DB_PORT=3306
MYSQL_DB_NAME=your-db
MYSQL_DB_USER=your-user
MYSQL_DB_PASSWORD=your-password

# Authentication
SECRET_KEY=your-jwt-secret-key

# Pusher (Real-time)
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Vercel Blob (File Uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=https://kodion-bidding.vercel.app
NODE_ENV=production
```

---

## ✅ Test After Deployment

```bash
# Should return JSON (not HTML)
curl -X POST https://kodion-bidding.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Before fix:** Returns HTML (405 error)
**After fix:** Returns JSON with error or success

---

## 📊 Migration Status

- ✅ **API Routes**: 4 agents completing 60+ endpoints
- ✅ **Pages**: 22+ pages being migrated
- ✅ **Components**: 28+ components being migrated
- ✅ **Pusher**: Real-time notifications configured
- ✅ **Vercel Blob**: File uploads configured

All work is happening in **next-app** folder! 🚀
