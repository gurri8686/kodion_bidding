# Vercel te Login / Backend theek karne – step by step

Tuhada **next-app** hi Vercel te chalna chahida (is vich Pusher + saare API routes ne). Agar **next-client** ya galat folder deploy ho reha hai, te `/api/auth/login` pe koi route nahi mil da → **Network Error / ERR_CONNECTION_CLOSED**.

---

## Step 1: Vercel te sahi folder set karo (Root Directory)

1. **Vercel Dashboard** kholo: https://vercel.com  
2. Apna project **kodion-bidding** choose karo.  
3. **Settings** → **General**.  
4. Neeche **Root Directory** dhundo.  
5. Value change karo:  
   - Pehle: `next-client` ya khali ya kuch hor  
   - **Ab likho:** `next-app`  
6. **Save** karo.

---

## Step 2: Redeploy karo

1. **Deployments** tab pe jao.  
2. Latest deployment pe **⋯** (three dots) click karo.  
3. **Redeploy** choose karo.  
4. Redeploy complete hone tak wait karo.

---

## Step 3: Environment Variables add karo

Bina env vars ke API route (login) DB connect nahi kar sakda → error ya connection close ho sakda.

1. **Settings** → **Environment Variables**.  
2. Neeche diya har variable add karo (Production, Preview, Development teeno te ya kam se kam **Production** pe):

| Name | Value | Notes |
|------|--------|------|
| `MYSQL_DB_HOST` | (tuhada DB host, e.g. `118.139.180.250`) | .env wala |
| `MYSQL_DB_PORT` | `3306` | |
| `MYSQL_DB_NAME` | (DB name) | .env wala |
| `MYSQL_DB_USER` | (DB user) | .env wala |
| `MYSQL_DB_PASSWORD` | (DB password) | .env wala |
| `SECRET_KEY` | (koi strong secret, JWT layi) | 20+ char |
| `PUSHER_APP_ID` | Pusher app id | Pusher dashboard |
| `PUSHER_SECRET` | Pusher secret | Pusher dashboard |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher key | Pusher dashboard |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | e.g. `us2` | Pusher dashboard |

3. Save karo.  
4. **Phir ek vaar Redeploy** karo (env vars change hone te redeploy zaroori hai).

---

## Step 4: MySQL te “remote access” check karo

Agar DB (e.g. GoDaddy / cPanel) sirf **localhost** ya specific IPs nu allow karda hai, te Vercel (serverless) different IPs ton aauga → connection fail → login nahi chalega.

- Apne hosting / MySQL panel vich dekho: **Remote MySQL** ya **Allow connections from** – Vercel nu allow hona chahida.  
- Ya MySQL **publicly reachable** host te ho (e.g. cloud DB jo sab IPs allow karda ho).

---

## Step 5: Test karo

1. Site kholo: `https://kodion-bidding.vercel.app`  
2. Login page te email/password daalo, Login click karo.  
3. Agar ab bhi error aaye:
   - **Deployments** → latest deployment → **View Function Logs** (ya **Logs**) check karo: DB error ya 503 dikhega.  
   - Browser **Console** (F12) vich exact error message dekh lo.

---

## Short summary

- **Root Directory** = `next-app` (next-client nahi).  
- **Env vars** = MySQL + SECRET_KEY + Pusher (sab set).  
- **Redeploy** env vars change ton baad.  
- **MySQL** = Vercel serverless IPs ton connect allow hon.

Eh kar lene ton login / backend Vercel te theek chalna chahida; agar ab bhi nahi chale te logs + console error bhej dio, phir us hisaab naal exact fix bata denga.
