# 🚀 WhatsApp Shopping Chatbot - Fresh Server Deployment

## One-Click Installation for Fresh VPS

Deploy bot WhatsApp Anda ke server baru dalam **5 menit** dengan **satu perintah**!

---

## 📋 Minimum Requirements

### Server Specifications

- **OS:** Ubuntu 20.04+, Debian 11+, atau CentOS 8+
- **RAM:** Minimal 1GB (Rekomendasi: 2GB)
- **CPU:** 1 vCPU
- **Storage:** 10GB free space
- **Network:** Port 3000 (untuk webhook)

### Prerequisites

- ✅ Fresh VPS/Server (clean install)
- ✅ Root access (SSH)
- ✅ Internet connection

---

## ⚡ Quick Start - 1 Command Installation

### Step 1: Login ke Server

```bash
ssh root@your-server-ip
```

### Step 2: Download & Run Installer

```bash
# Download script
curl -o deploy.sh https://raw.githubusercontent.com/your-repo/chatbot/main/deploy-fresh-server.sh

# Atau jika sudah punya source code:
cd /path/to/chatbot
chmod +x deploy-fresh-server.sh

# Run installer
sudo bash deploy-fresh-server.sh
```

### Step 3: Follow Interactive Setup

Script akan menanyakan:

```
📱 WhatsApp number for bot: 6285800365445
👤 Admin WhatsApp number: 6281234567890
🔑 Xendit API Key: xnd_production_xxxxx (optional)
🔐 Xendit Callback Token: xxxxx (optional)
🤖 Google Gemini API Key: AIzaSyXXXXX (optional)
💾 Install Redis? (y/n): y
🌐 Domain name: bot.yourdomain.com (optional)
```

### Step 4: Wait for Installation (3-5 minutes)

Script akan otomatis:

- ✅ Update system
- ✅ Install Node.js 20 LTS
- ✅ Install PM2
- ✅ Install Chromium & dependencies
- ✅ Install Redis (optional)
- ✅ Deploy bot code
- ✅ Configure environment
- ✅ Start bot

### Step 5: Pair WhatsApp

```bash
# View pairing code
su - chatbot -c 'pm2 logs whatsapp-bot'

# You'll see:
# Enter this code: ABC12XYZ
```

Buka WhatsApp → Settings → Linked Devices → Link a Device → Enter code

---

## 🎯 What Gets Installed?

### System Components

| Component | Version  | Purpose                        |
| --------- | -------- | ------------------------------ |
| Node.js   | 20.x LTS | Runtime environment            |
| npm       | Latest   | Package manager                |
| PM2       | Latest   | Process manager                |
| Chromium  | Latest   | Browser for WhatsApp Web       |
| Redis     | Latest   | Session persistence (optional) |

### Bot Structure

```
/home/chatbot/whatsapp-bot/
├── index.js              # Entry point
├── package.json          # Dependencies
├── .env                  # Configuration (auto-generated)
├── src/                  # Source code
├── lib/                  # Libraries
├── services/             # Services
├── tests/                # Test suite
├── docs/                 # Documentation
└── products_data/        # Product files
```

### Automatic Configuration

The script automatically creates `.env` with:

```bash
# WhatsApp
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=<your-number>

# Admin
ADMIN_NUMBER=<admin-number>

# Payment
XENDIT_API_KEY=<your-key>
XENDIT_CALLBACK_TOKEN=<your-token>

# AI
GOOGLE_API_KEY=<your-key>
AI_ENABLE=true

# Redis
REDIS_ENABLE=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# System
NODE_ENV=production
LOG_LEVEL=info
```

---

## 🔧 Post-Installation Management

### View Bot Status

```bash
su - chatbot -c 'pm2 status'
```

### View Logs

```bash
# Real-time logs
su - chatbot -c 'pm2 logs whatsapp-bot'

# Last 100 lines
su - chatbot -c 'pm2 logs whatsapp-bot --lines 100'
```

### Restart Bot

```bash
su - chatbot -c 'pm2 restart whatsapp-bot'
```

### Stop Bot

```bash
su - chatbot -c 'pm2 stop whatsapp-bot'
```

### Monitor Resources

```bash
su - chatbot -c 'pm2 monit'
```

---

## 🛠️ Troubleshooting

### Bot Not Starting

```bash
# Check logs
su - chatbot -c 'pm2 logs whatsapp-bot --err'

# Restart
su - chatbot -c 'pm2 restart whatsapp-bot'

# Check Node.js version
node -v  # Should be v20.x
```

### Pairing Code Not Showing

```bash
# Wait 30 seconds for initialization
sleep 30

# View logs
su - chatbot -c 'pm2 logs whatsapp-bot'

# Look for "Enter this code:"
```

### Redis Connection Error

```bash
# Check Redis status
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server

# Restart bot
su - chatbot -c 'pm2 restart whatsapp-bot'
```

### Webhook Not Working

```bash
# Check if port 3000 is open
sudo netstat -tulpn | grep 3000

# Check firewall
sudo ufw status

# Allow port 3000
sudo ufw allow 3000/tcp
```

---

## 🔐 Security Best Practices

### 1. Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow webhook port
sudo ufw allow 3000/tcp

# Check status
sudo ufw status
```

### 2. Update .env Permissions

```bash
chmod 600 /home/chatbot/whatsapp-bot/.env
chown chatbot:chatbot /home/chatbot/whatsapp-bot/.env
```

### 3. Setup SSL (for webhook)

```bash
# Install Nginx
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d bot.yourdomain.com
```

### 4. Regular Updates

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update bot dependencies
cd /home/chatbot/whatsapp-bot
su - chatbot -c 'npm update'
su - chatbot -c 'pm2 restart whatsapp-bot'
```

---

## 📊 Performance Optimization

### For 1GB RAM Servers

Edit `/home/chatbot/whatsapp-bot/.env`:

```bash
# Reduce memory usage
NODE_OPTIONS="--max-old-space-size=512"
```

### For 2GB+ RAM Servers

```bash
# Default is fine
NODE_OPTIONS="--max-old-space-size=1024"
```

### Enable PM2 Cluster Mode (2+ cores)

```bash
su - chatbot -c 'pm2 delete whatsapp-bot'
su - chatbot -c 'pm2 start index.js -i 2 --name whatsapp-bot'
su - chatbot -c 'pm2 save'
```

---

## 🌐 Domain & SSL Setup (Optional)

### Step 1: Point Domain to Server

```
A Record: bot.yourdomain.com → server-ip
```

### Step 2: Install Nginx

```bash
sudo apt install nginx -y
```

### Step 3: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/whatsapp-bot
```

Add:

```nginx
server {
    listen 80;
    server_name bot.yourdomain.com;

    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Get SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d bot.yourdomain.com
```

### Step 5: Update Xendit Webhook URL

```
https://bot.yourdomain.com/webhook/xendit
```

---

## 💾 Backup & Restore

### Automatic Backup Script

Create `/home/chatbot/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/chatbot/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup bot files
tar -czf $BACKUP_DIR/bot_$DATE.tar.gz \
    /home/chatbot/whatsapp-bot \
    --exclude=node_modules \
    --exclude=.wwebjs_auth

# Backup Redis (if installed)
redis-cli SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/bot_$DATE.tar.gz"
```

```bash
chmod +x /home/chatbot/backup.sh
```

### Setup Cron for Daily Backup

```bash
crontab -e
```

Add:

```
0 2 * * * /home/chatbot/backup.sh
```

### Restore from Backup

```bash
# Stop bot
su - chatbot -c 'pm2 stop whatsapp-bot'

# Extract backup
tar -xzf /home/chatbot/backups/bot_YYYYMMDD_HHMMSS.tar.gz -C /

# Restore Redis
sudo systemctl stop redis-server
sudo cp /home/chatbot/backups/redis_YYYYMMDD_HHMMSS.rdb /var/lib/redis/dump.rdb
sudo systemctl start redis-server

# Restart bot
su - chatbot -c 'pm2 restart whatsapp-bot'
```

---

## 📈 Monitoring & Logging

### Setup Log Rotation

Create `/etc/logrotate.d/whatsapp-bot`:

```
/home/chatbot/.pm2/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 chatbot chatbot
}
```

### PM2 Monitoring (Free)

```bash
su - chatbot -c 'pm2 monitor'
```

Follow instructions to setup free monitoring.

---

## 🎓 Video Tutorial

For visual learners, check out our video tutorial:

**[🎬 Watch: 1-Click Deployment Tutorial](#)**

Topics covered:

- Fresh server setup
- Running the installer
- Pairing WhatsApp
- Testing bot functionality
- Basic troubleshooting

---

## 💬 Support

### Documentation

- 📖 Full Documentation: `/home/chatbot/whatsapp-bot/docs/`
- 📋 Admin Commands: `/home/chatbot/whatsapp-bot/docs/ADMIN_COMMANDS.md`
- 🚀 Quick Start: `/home/chatbot/whatsapp-bot/QUICKSTART.md`

### Community

- 💬 Telegram: [Join Our Group](#)
- 📧 Email: support@yourbot.com
- 🐛 Issues: [GitHub Issues](#)

### Premium Support

- 🎯 24/7 Support
- 🚀 Custom Features
- 🎓 Training & Onboarding
- 📞 WhatsApp: +62-xxx-xxxx-xxxx

---

## 📜 License

This deployment script is part of the **WhatsApp Shopping Chatbot Premium Package**.

© 2025 Premium Chatbot Solutions. All rights reserved.

---

## ✅ Checklist After Installation

- [ ] Bot started successfully
- [ ] WhatsApp paired
- [ ] Test message received
- [ ] Admin commands working
- [ ] Payment webhook configured
- [ ] Redis running (if installed)
- [ ] Firewall configured
- [ ] SSL setup (if using domain)
- [ ] Backup script configured
- [ ] Monitoring setup

---

**🎉 Congratulations! Your WhatsApp Shopping Bot is now live!**
