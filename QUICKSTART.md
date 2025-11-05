# 🚀 Quick Start Commands - WhatsApp Shopping Chatbot

## ⚡ Super Fast Setup (3 commands)

```bash
# 1. Clone & Navigate
git clone https://github.com/benihutapea/chatbot.git && cd chatbot

# 2. Setup & Install
npm run setup

# 3. Start Bot
npm start
```

## 📋 All Available Quick Commands

### Development

```bash
# Complete setup (install + show next steps)
npm run setup

# Quick check (lint + test)
npm run quick

# Start development
npm run dev

# Watch mode testing
npm run test:watch
```

### Testing & Quality

```bash
# Run all tests with coverage
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Check code quality
npm run check

# Pre-commit validation
npm run precommit
```

### Linting & Fixing

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix
```

### Deployment

```bash
# Pre-deployment check (lint + test)
npm run deploy:check

# Then push safely
git add . && git commit -m "your message" && git push
```

## 🎯 Common Workflows

### First Time Setup

```bash
git clone https://github.com/benihutapea/chatbot.git
cd chatbot
npm run setup
cp .env.example .env
# Edit .env dengan konfigurasi Anda
npm start
```

### Before Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes...
# Then validate
npm run check
```

### Before Committing

```bash
# Validate everything
npm run precommit

# If passed, commit
git add .
git commit -m "feat: your feature description"
```

### Before Pushing

```bash
# Final check
npm run deploy:check

# Push
git push origin your-branch
```

## 🔧 VPS Deployment Quick Commands

### First Time VPS Setup

```bash
# Copy this script to VPS
curl -o- https://raw.githubusercontent.com/benihutapea/chatbot/main/install-vps.sh | bash

# Or manual:
git clone https://github.com/benihutapea/chatbot.git
cd chatbot
npm install
npm install -g pm2
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup
```

### VPS Management

```bash
# View logs
pm2 logs whatsapp-bot

# Restart
pm2 restart whatsapp-bot

# Status
pm2 status

# Monitor
pm2 monit

# Stop
pm2 stop whatsapp-bot

# Update code
cd chatbot && git pull && npm install && pm2 restart whatsapp-bot
```

## 📦 NPM Scripts Cheatsheet

| Command                    | Description                         |
| -------------------------- | ----------------------------------- |
| `npm start`                | Start the bot                       |
| `npm run dev`              | Start in development mode           |
| `npm test`                 | Run tests with coverage             |
| `npm run test:unit`        | Run unit tests only                 |
| `npm run test:integration` | Run integration tests only          |
| `npm run test:watch`       | Run tests in watch mode             |
| `npm run lint`             | Check code quality                  |
| `npm run lint:fix`         | Auto-fix lint issues                |
| `npm run setup`            | Install dependencies + instructions |
| `npm run quick`            | Install + lint + test               |
| `npm run check`            | Lint + test                         |
| `npm run precommit`        | Pre-commit validation               |
| `npm run deploy:check`     | Pre-push validation                 |

## 🎓 Pro Tips

### 1. Fastest Local Testing

```bash
# Terminal 1: Watch mode
npm run test:watch

# Terminal 2: Your editor
# Make changes and tests auto-run
```

### 2. Clean Git Workflow

```bash
# Always before commit
npm run precommit && git add . && git commit -m "message"
```

### 3. Safe Deployment

```bash
# Triple check before push
npm run deploy:check && git push
```

### 4. Debug Mode

```bash
# Run with verbose logging
DEBUG=* node index.js
```

### 5. Reset Everything

```bash
# Nuclear option (clean restart)
rm -rf node_modules package-lock.json
npm install
pm2 delete whatsapp-bot
pm2 start index.js --name whatsapp-bot
```

## 🐛 Troubleshooting Quick Fixes

### Issue: Tests Failing

```bash
npm run lint:fix
npm test
```

### Issue: Bot Not Starting

```bash
rm -rf .wwebjs_auth
pm2 restart whatsapp-bot
pm2 logs whatsapp-bot
```

### Issue: Out of Memory

```bash
pm2 restart whatsapp-bot
pm2 monit  # Check memory usage
```

### Issue: Lint Errors

```bash
npm run lint:fix
npm run lint
```

## 📱 WhatsApp QR Code Tricks

### Get QR in Terminal

```bash
npm start
# Scan QR yang muncul
```

### Alternative: Pairing Code

```bash
# Edit .env
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=628123456789

npm start
# Enter code di WhatsApp > Linked Devices
```

## 🔗 Useful Links

- **Repository**: https://github.com/benihutapea/chatbot
- **Documentation**: [README.md](README.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Testing Guide**: [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
- **Admin Commands**: [docs/ADMIN_COMMANDS.md](docs/ADMIN_COMMANDS.md)

---

**Need Help?** Check `.github/copilot-instructions.md` untuk panduan lengkap!
