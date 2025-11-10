#!/bin/bash

# Heroku Quick Deploy Script
# Automates deployment process

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Heroku Quick Deploy - WhatsApp Shopping Chatbot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found!"
    echo "📥 Install: curl https://cli-assets.heroku.com/install.sh | sh"
    exit 1
fi

echo "✅ Heroku CLI found"
echo ""

# Check if logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku..."
    heroku login
fi

echo "✅ Logged in to Heroku"
echo ""

# Get app name
read -p "📝 Enter app name (leave empty for auto-generate): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "🎲 Creating app with auto-generated name..."
    heroku create
else
    echo "🎲 Creating app: $APP_NAME..."
    heroku create "$APP_NAME"
fi

# Get the actual app name (in case auto-generated)
APP_NAME=$(heroku apps:info --json | grep -o '"name":"[^"]*' | cut -d'"' -f4)
echo "✅ App created: $APP_NAME"
echo ""

# Add buildpacks
echo "📦 Adding buildpacks..."
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack -a "$APP_NAME"
heroku buildpacks:add heroku/nodejs -a "$APP_NAME"
echo "✅ Buildpacks added"
echo ""

# Add add-ons
echo "🔌 Adding add-ons..."
heroku addons:create heroku-redis:mini -a "$APP_NAME"
heroku addons:create heroku-postgresql:essential-0 -a "$APP_NAME"
echo "✅ Add-ons created"
echo ""

# Set environment variables
echo "⚙️  Setting environment variables..."
echo ""

read -p "📱 WhatsApp number (format: 6281234567890): " PHONE_NUMBER
read -p "👤 Admin number (format: 6281234567890): " ADMIN_NUMBER

heroku config:set \
  USE_PAIRING_CODE=true \
  PAIRING_PHONE_NUMBER="$PHONE_NUMBER" \
  ADMIN_NUMBER="$ADMIN_NUMBER" \
  BOT_NAME="JARVIS" \
  SHOP_NAME="Toko Voucher ID" \
  QRIS_MANUAL_ENABLED=true \
  NODE_ENV=production \
  -a "$APP_NAME"

echo "✅ Basic config set"
echo ""

# Cloudinary (optional)
read -p "☁️  Configure Cloudinary now? (y/n): " SETUP_CLOUDINARY

if [ "$SETUP_CLOUDINARY" = "y" ]; then
    echo ""
    echo "Get credentials from: https://cloudinary.com/console"
    echo ""
    read -p "Cloud Name: " CLOUD_NAME
    read -p "API Key: " API_KEY
    read -p "API Secret: " API_SECRET
    
    heroku config:set \
      CLOUDINARY_CLOUD_NAME="$CLOUD_NAME" \
      CLOUDINARY_API_KEY="$API_KEY" \
      CLOUDINARY_API_SECRET="$API_SECRET" \
      -a "$APP_NAME"
    
    echo "✅ Cloudinary configured"
else
    echo "⚠️  Skipping Cloudinary (can configure later)"
fi

echo ""

# Deploy
echo "🚀 Deploying code..."
git push heroku feature/heroku-deployment:main

echo ""
echo "✅ Code deployed"
echo ""

# Scale dyno
echo "📊 Scaling dyno..."
heroku ps:scale web=1 -a "$APP_NAME"
echo "✅ Dyno started"
echo ""

# Show logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 App: https://$APP_NAME.herokuapp.com"
echo "🔍 Health: https://$APP_NAME.herokuapp.com/health"
echo ""
echo "🔑 Get pairing code from logs:"
echo "   heroku logs --tail -a $APP_NAME | grep 'Pairing code'"
echo ""
echo "📊 View logs:"
echo "   heroku logs --tail -a $APP_NAME"
echo ""
echo "🎯 Next steps:"
echo "   1. Get pairing code from logs"
echo "   2. Link WhatsApp (Settings → Linked Devices)"
echo "   3. Test bot: Send 'menu' to bot number"
echo ""
echo "💰 Cost: \$0/month (Heroku Student)"
echo ""

# Ask if user wants to see logs now
read -p "📋 View logs now? (y/n): " VIEW_LOGS

if [ "$VIEW_LOGS" = "y" ]; then
    heroku logs --tail -a "$APP_NAME"
fi
