# 🚀 Heroku Deployment Guide - WhatsApp Shopping Chatbot

**Branch:** feature/heroku-deployment  
**Cost:** $0/month (Heroku Student)  
**Time:** ~30 minutes

---

## 📋 Prerequisites

1. ✅ **Heroku Account** with Student Pack activated

   - Visit: https://www.heroku.com/github-students
   - Sign in with GitHub account
   - Verify student status

2. ✅ **Heroku CLI** installed

   ```bash
   # Ubuntu/Debian
   curl https://cli-assets.heroku.com/install.sh | sh

   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. ✅ **Cloudinary Account** (FREE tier)

   - Sign up: https://cloudinary.com/users/register/free
   - Get API credentials from Dashboard

4. ✅ **Required Environment Variables**
   - PAIRING_PHONE_NUMBER (your WhatsApp number)
   - ADMIN_NUMBER (admin WhatsApp)
   - CLOUDINARY\_\* (from Cloudinary dashboard)

---

## 🚀 Deployment Steps

### Step 1: Install Heroku CLI (if not installed)

```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

Verify installation:

```bash
heroku --version
# Should show: heroku/8.x.x
```

### Step 2: Login to Heroku

```bash
heroku login
```

This will open browser for authentication.

### Step 3: Create Heroku App

```bash
# Navigate to project directory
cd /home/senarokalie/Desktop/chatbot

# Create app (unique name required)
heroku create whatsapp-shop-[your-name]

# Or let Heroku generate name
heroku create

# Example output:
# Creating ⬢ whatsapp-shop-rocky-mountain-12345... done
# https://whatsapp-shop-rocky-mountain-12345.herokuapp.com/
```

**Note your app name!** You'll need it later.

### Step 4: Add Buildpacks

```bash
# Add Puppeteer buildpack (for WhatsApp Web)
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack

# Add Node.js buildpack
heroku buildpacks:add heroku/nodejs
```

Verify:

```bash
heroku buildpacks
# Should show both buildpacks
```

### Step 5: Add Add-ons

```bash
# Add Redis (for sessions)
heroku addons:create heroku-redis:mini

# Add PostgreSQL (for products)
heroku addons:create heroku-postgresql:essential-0

# Verify
heroku addons
```

**Cost Check:**

- Redis Mini: $3/month
- Postgres Essential: FREE
- **Total: $3/month** (covered by $13 student credit!)

### Step 6: Set Environment Variables

**Required variables:**

```bash
# WhatsApp Settings
heroku config:set USE_PAIRING_CODE=true
heroku config:set PAIRING_PHONE_NUMBER=6281234567890  # Your number!
heroku config:set ADMIN_NUMBER=6281234567890          # Admin number

# Bot Settings
heroku config:set BOT_NAME="JARVIS"
heroku config:set SHOP_NAME="Toko Voucher ID"
heroku config:set CONTACT_EMAIL="support@example.com"
heroku config:set CONTACT_WHATSAPP=6281234567890

# Payment Settings
heroku config:set QRIS_MANUAL_ENABLED=true
heroku config:set QRIS_MANUAL_NAME="Toko Voucher ID"

# Cloudinary (get from https://cloudinary.com/console)
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret

# Node Environment
heroku config:set NODE_ENV=production
```

**Optional variables:**

```bash
# AI Features (if using Gemini)
heroku config:set GOOGLE_API_KEY=your_gemini_key
heroku config:set AI_ENABLE=true

# Payment Gateway (if using Xendit)
heroku config:set XENDIT_SECRET_KEY=xnd_production_...
heroku config:set XENDIT_CALLBACK_TOKEN=your_token
```

Verify all variables:

```bash
heroku config
```

### Step 7: Deploy Code

```bash
# Make sure you're on feature/heroku-deployment branch
git branch

# Push to Heroku
git push heroku feature/heroku-deployment:main

# Or if on main branch:
# git push heroku main
```

**What happens:**

1. Code uploaded to Heroku
2. Buildpacks install dependencies
3. npm install runs
4. Postdeploy script runs:
   - Creates database tables (schema.sql)
   - Uploads QRIS to Cloudinary
   - Migrates products to PostgreSQL

**Expected output:**

```
remote: -----> Building on the Heroku-22 stack
remote: -----> Using buildpack: https://github.com/jontewks/puppeteer-heroku-buildpack
remote: -----> Node.js app detected
remote: -----> Installing dependencies
remote: -----> Running postdeploy
remote:        ✅ Database schema created
remote:        ✅ QRIS uploaded to Cloudinary
remote:        ✅ Products migrated to PostgreSQL
remote: -----> Launching...
remote:        Released v1
remote:        https://your-app.herokuapp.com/ deployed to Heroku
```

### Step 8: Scale Dyno

```bash
# Start 1 web dyno (Eco tier - $5/month)
heroku ps:scale web=1

# Verify
heroku ps
```

### Step 9: View Logs

```bash
# Watch logs in real-time
heroku logs --tail

# Expected output:
# ✅ Health check server running on port 12345
# ✅ PostgreSQL database enabled
# ✅ Cloudinary configured
# ✅ WhatsApp client initializing...
# 📱 Pairing code: XXXX-XXXX
```

### Step 10: Link WhatsApp

1. **Get pairing code** from logs:

   ```bash
   heroku logs --tail | grep "Pairing code"
   ```

2. **On your phone:**

   - Open WhatsApp
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Tap "Link with phone number instead"
   - Enter the 8-digit code

3. **Verify connection:**
   ```bash
   heroku logs --tail
   # Should show: ✅ Client is ready!
   ```

---

## ✅ Post-Deployment Checklist

### 1. Test Health Endpoint

```bash
curl https://your-app.herokuapp.com/health

# Expected response:
{
  "status": "ok",
  "service": "WhatsApp Shopping Chatbot",
  "uptime": 123,
  "timestamp": "2025-11-10T...",
  "memory": {...}
}
```

### 2. Test WhatsApp Bot

Send message to bot number:

- `menu` - Should show product menu
- `help` - Should show help menu
- `about` - Should show shop info

### 3. Check Database

```bash
# Connect to PostgreSQL
heroku pg:psql

# Check products
SELECT * FROM products;

# Check stock
SELECT * FROM v_product_stock;

# Exit
\q
```

### 4. Monitor Logs

```bash
# Continuous logs
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Filter errors only
heroku logs --tail | grep ERROR
```

### 5. Check Cloudinary

```bash
# View uploaded files
heroku run node -e "
  const MediaStorage = require('./lib/mediaStorage');
  const ms = new MediaStorage();
  ms.listFiles('qris').then(console.log);
"
```

---

## 🔧 Troubleshooting

### Issue: Bot not responding

**Check:**

```bash
heroku ps        # Is dyno running?
heroku logs      # Any errors?
```

**Fix:**

```bash
heroku restart   # Restart dyno
```

### Issue: Pairing code not showing

**Check logs:**

```bash
heroku logs --tail | grep -i pairing
```

**Common causes:**

- USE_PAIRING_CODE not set to "true"
- PAIRING_PHONE_NUMBER missing or wrong format

**Fix:**

```bash
heroku config:set USE_PAIRING_CODE=true
heroku config:set PAIRING_PHONE_NUMBER=6281234567890
heroku restart
```

### Issue: Database errors

**Check connection:**

```bash
heroku pg:info
```

**Reset database (⚠️ deletes all data):**

```bash
heroku pg:reset DATABASE
heroku run psql $DATABASE_URL < scripts/schema.sql
heroku run node scripts/migrate-to-postgres.js
```

### Issue: Out of memory

**Check usage:**

```bash
heroku ps
```

**Upgrade dyno (if needed):**

```bash
# Upgrade to Standard-1X (512MB → 1GB)
heroku ps:type web=standard-1x
# Cost: +$25/month (still within student credit!)
```

### Issue: Cloudinary upload fails

**Verify credentials:**

```bash
heroku config:get CLOUDINARY_CLOUD_NAME
heroku config:get CLOUDINARY_API_KEY
heroku config:get CLOUDINARY_API_SECRET
```

**Test upload:**

```bash
heroku run node scripts/setup-heroku.js
```

---

## 📊 Monitoring & Maintenance

### View App Dashboard

```bash
heroku open
# Opens https://your-app.herokuapp.com/health
```

### View Heroku Dashboard

```bash
heroku dashboard
# Opens browser to Heroku dashboard
```

### Check Costs

```bash
heroku ps -a your-app-name
# Shows dyno usage

heroku addons
# Shows add-on costs
```

### Update Code

```bash
# Make changes on feature/heroku-deployment branch
git add .
git commit -m "Update feature"
git push heroku feature/heroku-deployment:main

# Heroku automatically rebuilds and redeploys
```

### View Database Stats

```bash
heroku pg:info

# Sample output:
# Plan:        Essential-0
# Status:      Available
# Rows:        1.2k/10k (12% used)
# Size:        7.5 MB
```

---

## 💰 Cost Summary

**Monthly Costs:**

| Service            | Plan        | Cost      |
| ------------------ | ----------- | --------- |
| Eco Dyno           | 512MB RAM   | $5        |
| Redis              | Mini (25MB) | $3        |
| PostgreSQL         | Essential-0 | FREE      |
| Cloudinary         | Free tier   | FREE      |
| **Subtotal**       |             | **$8**    |
| **Student Credit** |             | **-$13**  |
| **YOUR COST**      |             | **$0** 🎉 |

**Surplus: $5/month** - Can be used for:

- Upgrade to Standard dyno ($25 - pay $12)
- Upgrade Redis to Premium ($15 - pay $7)
- Add monitoring tools

---

## 🎯 Next Steps

After successful deployment:

1. ✅ **Add real products** to database

   ```bash
   heroku pg:psql
   INSERT INTO product_credentials (product_id, credential)
   VALUES ('netflix', 'user@gmail.com:password123');
   ```

2. ✅ **Upload QRIS image** to Cloudinary

   - Go to Cloudinary dashboard
   - Upload to `qris/qris-static.jpg`

3. ✅ **Test complete flow**

   - Browse products
   - Add to cart
   - Checkout
   - Payment
   - Delivery

4. ✅ **Monitor daily**

   ```bash
   heroku logs --tail
   ```

5. ✅ **Setup alerts** (optional)
   - Heroku monitoring
   - UptimeRobot
   - Error tracking (Sentry)

---

## 📞 Support

**Heroku Issues:**

- https://help.heroku.com
- https://status.heroku.com

**Student Pack:**

- https://www.heroku.com/github-students

**This Bot:**

- Check logs: `heroku logs --tail`
- Check docs: `docs/` folder
- Check memory: `.github/memory/heroku-deployment-progress.md`

---

## ✅ Deployment Complete!

Your WhatsApp Shopping Chatbot is now live on Heroku! 🎉

**App URL:** https://your-app.herokuapp.com  
**Cost:** $0/month (Heroku Student)  
**Uptime:** 24/7  
**Features:** Full production setup

**Next:** Start selling! 💰
