# WhatsApp Shopping Chatbot - Complete Documentation

**Version:** 3.0 (November 2025)  
**Status:** Production Ready  
**Repository:** angga13142/chatbkt

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Features Overview](#features-overview)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Dynamic Systems](#dynamic-systems)
7. [Admin Commands](#admin-commands)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- Redis (optional, for production)
- WhatsApp account (for bot)
- Xendit account (for payment gateway)
- Google AI API key (for AI features)

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/angga13142/chatbkt.git
cd chatbkt

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
nano .env  # Edit with your credentials

# 4. Start bot
npm start
```

### First Run

1. Scan QR code with WhatsApp
2. Bot connects automatically
3. Send "menu" to test
4. Check admin commands with `/help`

---

## ✨ Features Overview

### Customer Features

✅ **Shopping Experience**

- Browse products by category
- Add to cart
- Apply promo codes
- Multiple payment methods
- Real-time stock checking

✅ **Wishlist/Favorites**

- Save favorite products
- Quick reorder

✅ **Product Reviews**

- Rate products (1-5 stars)
- Write detailed reviews
- View average ratings

✅ **Order Tracking**

- Track order status
- Payment confirmation
- Automatic delivery

✅ **AI Assistance** (Gemini 2.5 Flash)

- Smart product recommendations
- Answer product questions
- Typo correction
- Natural language understanding

### Admin Features

✅ **Order Management**

- Approve payments
- Manual delivery
- Order history

✅ **Inventory Management**

- Stock tracking (file-based)
- Bulk stock add
- Stock sync from files
- Low stock alerts

✅ **Product Management (DYNAMIC)**

- Auto-discover products from folder
- Hot reload (no restart)
- Custom metadata (optional)
- Category auto-detection

✅ **Payment Management (DYNAMIC)**

- Auto-hide disabled methods
- Configure via .env
- Multiple payment gateways
- Manual & automated payments

✅ **Analytics Dashboard**

- Sales statistics
- Revenue tracking
- Customer behavior
- Product performance

✅ **Promo Management**

- Create discount codes
- Usage tracking
- Expiry dates
- Promo statistics

✅ **Review Moderation**

- View all reviews
- Delete inappropriate reviews
- Review statistics

---

## 🏗️ Architecture

### Tech Stack

- **Runtime:** Node.js 20
- **WhatsApp:** whatsapp-web.js
- **Payment:** Xendit API
- **AI:** Google Gemini 2.5 Flash
- **Storage:** Redis (optional) + File-based
- **Testing:** Jest (1100+ tests)
- **CI/CD:** GitHub Actions

### Project Structure

```
chatbot/
├── src/                      # Modular source code
│   ├── config/              # Configuration files
│   │   ├── app.config.js
│   │   ├── payment.config.js (DYNAMIC)
│   │   ├── products.config.js (DYNAMIC)
│   │   └── ai.config.js
│   ├── handlers/            # Message handlers
│   │   ├── CustomerHandler.js
│   │   ├── AdminHandler.js
│   │   ├── AIFallbackHandler.js
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── product/
│   │   ├── payment/
│   │   ├── inventory/
│   │   ├── ai/
│   │   └── ...
│   ├── middleware/          # Request middleware
│   │   └── RelevanceFilter.js
│   └── utils/               # Utilities
│       ├── DynamicProductLoader.js (NEW)
│       ├── FuzzySearch.js
│       └── ...
├── lib/                     # Legacy core (backward compatible)
│   ├── messageRouter.js
│   ├── uiMessages.js
│   ├── paymentHandlers.js
│   ├── paymentMessages.js
│   └── ...
├── tests/                   # Test suites
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── products_data/          # Product inventory
│   ├── *.txt              # Product credentials
│   ├── products.json      # Product metadata (DYNAMIC)
│   └── sold/              # Archive
├── .github/
│   ├── workflows/         # CI/CD pipelines
│   ├── copilot-instructions.md
│   ├── instructions/      # Modular docs
│   └── memory/            # Implementation history
└── index.js               # Entry point
```

### Design Patterns

1. **Handler Pattern** - Delegate requests to specialized handlers
2. **Service Layer** - Separate business logic from handlers
3. **Repository Pattern** - Abstract data access
4. **Factory Pattern** - Dynamic product/payment loading
5. **Observer Pattern** - Event-driven architecture

---

## 📦 Installation

### System Requirements

**Minimum:**

- 1 CPU core
- 512 MB RAM
- 1 GB disk space
- Ubuntu 20.04+ or similar

**Recommended:**

- 2 CPU cores
- 2 GB RAM
- 5 GB disk space
- Redis server

### Development Setup

```bash
# Install Node.js 20 (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install Redis (Ubuntu)
sudo apt update
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Clone repository
git clone https://github.com/angga13142/chatbkt.git
cd chatbkt

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm start
```

### Production Setup

```bash
# Install PM2 (process manager)
npm install -g pm2

# Start with PM2
pm2 start index.js --name whatsapp-shop
pm2 save
pm2 startup

# Monitor
pm2 logs whatsapp-shop
pm2 monit
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# ===========================
# BOT CONFIGURATION
# ===========================
BOT_NAME="JARVIS"
SHOP_NAME="Toko Voucher ID"
CONTACT_EMAIL="support@example.com"
CONTACT_WHATSAPP="628xxx"

# ===========================
# AUTHENTICATION
# ===========================
# Use pairing code instead of QR
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=628xxx

# Admin numbers (format: country code + number)
ADMIN_NUMBER_1=628xxx
ADMIN_NUMBER_2=
ADMIN_NUMBER_3=

# ===========================
# PAYMENT GATEWAY (Xendit)
# ===========================
XENDIT_SECRET_KEY=xnd_development_xxx
XENDIT_WEBHOOK_TOKEN=your_webhook_token
WEBHOOK_URL=http://your-server:3000/webhook

# ===========================
# PAYMENT METHODS (DYNAMIC)
# Set enabled=true AND provide credentials
# ===========================

# QRIS (auto-enabled if Xendit configured)
# No extra config needed

# E-Wallets
DANA_ENABLED=true
DANA_NUMBER=081234567890
DANA_NAME=Shop Name

GOPAY_ENABLED=true
GOPAY_NUMBER=081234567890
GOPAY_NAME=Shop Name

OVO_ENABLED=false
OVO_NUMBER=
OVO_NAME=

SHOPEEPAY_ENABLED=false
SHOPEEPAY_NUMBER=
SHOPEEPAY_NAME=

# Banks
BCA_ENABLED=false
BCA_ACCOUNT=
BCA_NAME=

BNI_ENABLED=false
BNI_ACCOUNT=
BNI_NAME=

# ===========================
# AI FEATURES (Gemini)
# ===========================
AI_ENABLE=true
GOOGLE_API_KEY=AIzaSyXXX
AI_MODEL=gemini-2.5-flash-lite
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=500
AI_RATE_LIMIT_HOURLY=5
AI_RATE_LIMIT_DAILY=20

# ===========================
# REDIS (Optional)
# ===========================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
SESSION_TTL=1800

# ===========================
# SYSTEM SETTINGS
# ===========================
NODE_ENV=production
LOG_LEVEL=info
SESSION_TIMEOUT=30
USD_TO_IDR_RATE=15800
```

### Configuration Files

**`src/config/payment.config.js`** - Dynamic payment methods
**`src/config/products.config.js`** - Dynamic product loading
**`src/config/ai.config.js`** - AI settings
**`src/config/app.config.js`** - App-wide settings

---

## 🔄 Dynamic Systems

### 1. Dynamic Payment Menu

**Problem:** Hardcoded payment methods shown even when disabled

**Solution:** Auto-hide based on .env configuration

**How it works:**

```javascript
// payment.config.js detects enabled methods
enabled: process.env.DANA_ENABLED === "true" && !!process.env.DANA_NUMBER

// Menu shows only available options
1️⃣ QRIS
2️⃣ DANA
3️⃣ GOPAY
// OVO hidden (not configured)
```

**Benefits:**

- No code changes when adding/removing payment methods
- User-friendly (no disabled options)
- Admin-friendly (just edit .env)

**Documentation:** `.github/memory/dynamic-payment-implementation.md`

### 2. Dynamic Product Discovery

**Problem:** Must edit config.js for every new product

**Solution:** Auto-discover from `products_data/` folder

**How it works:**

```bash
# 1. Add product file
echo "account:password" > products_data/new-product.txt

# 2. Refresh (via WhatsApp admin)
/refreshproducts

# 3. Product auto-added!
```

**Features:**

- Auto-categorization (premium, vcc, game, vpn)
- Stock count from file lines
- Optional metadata in `products.json`
- Hot reload (no restart)

**Admin workflow:**

```bash
# Quick method (auto-generate)
echo "credentials" > products_data/canva.txt
/refreshproducts  # WhatsApp

# Custom method (with metadata)
# Edit products_data/products.json:
{
  "canva": {
    "name": "Canva Pro Premium",
    "price": 25000,
    "description": "Design tools unlimited",
    "category": "premium"
  }
}
/refreshproducts
```

**Documentation:** `.github/memory/dynamic-product-implementation.md`

---

## 👨‍💼 Admin Commands

### Essential Commands

```
/help                    # Command reference
/status                  # System status
/stats [days]           # Analytics dashboard
```

### Order Management

```
/approve <order-id>     # Approve payment & deliver
/broadcast <message>    # Message all active customers
```

### Product Management

```
/stock                  # View all stock
/stock <id> <qty>      # Update stock
/addproduct <details>  # Add new product
/editproduct <id> <field> <value>  # Edit product
/removeproduct <id>    # Remove product
/refreshproducts       # Reload from folder (DYNAMIC)
```

### Inventory Management

```
/addstock <id> <credentials>  # Add 1 stock
/addstock-bulk <id>          # Bulk add mode
/syncstock                   # Sync from files
/stockreport                 # Stock report
/salesreport [days]          # Sales report
```

### Promo Management

```
/createpromo <CODE> <discount%> <days>  # Create promo
/listpromos                              # List all promos
/deletepromo <CODE>                      # Delete promo
/promostats [CODE]                       # Promo stats
```

### Review Management

```
/reviews <product-id>       # View reviews
/reviewstats                # Review statistics
/deletereview <id> <index>  # Delete review
```

### Settings

```
/settings                    # View all settings
/settings <key> <value>     # Update setting
```

**Total: 23 admin commands**

---

## 🧪 Testing

### Test Coverage

```
Tests:       1121/1124 passing (99.7%)
Test Suites: 37/37 passing (100%)
Coverage:    45%+ overall
```

### Run Tests

```bash
# All tests
npm test

# Specific suite
npm test -- tests/unit/lib/PaymentHandlers.test.js

# With coverage
npm run coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Structure

```
tests/
├── unit/                    # Unit tests (fast)
│   ├── lib/
│   ├── handlers/
│   ├── services/
│   └── utils/
├── integration/             # Integration tests
│   ├── checkout-flow.test.js
│   ├── payment-flow.test.js
│   └── ...
└── e2e/                     # End-to-end tests
    └── customer-journey.test.js
```

### Writing Tests

```javascript
// Example test
describe("DynamicProductLoader", () => {
  test("should load products from folder", () => {
    const products = DynamicProductLoader.loadProducts();

    expect(products.premiumAccounts).toBeDefined();
    expect(products.virtualCards).toBeDefined();
  });
});
```

---

## 🚀 Deployment

### Production Deployment

**Option 1: PM2 (Recommended)**

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start index.js --name whatsapp-shop

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 logs whatsapp-shop --lines 100
pm2 monit
```

**Option 2: Docker**

```bash
# Build image
docker build -t whatsapp-shop .

# Run container
docker run -d \
  --name whatsapp-shop \
  -v $(pwd)/products_data:/app/products_data \
  -v $(pwd)/.env:/app/.env \
  --restart unless-stopped \
  whatsapp-shop
```

**Option 3: Systemd Service**

```ini
# /etc/systemd/system/whatsapp-shop.service
[Unit]
Description=WhatsApp Shopping Bot
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/chatbot
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable whatsapp-shop
sudo systemctl start whatsapp-shop
sudo systemctl status whatsapp-shop
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Daily backup script

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/whatsapp-shop"

# Create backup
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup-$DATE.tar.gz \
  products_data/ \
  data/ \
  .env \
  logs/

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "✅ Backup completed: backup-$DATE.tar.gz"
```

Add to crontab:

```bash
0 2 * * * /path/to/backup.sh
```

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflows

**1. Lint and Test** (`.github/workflows/lint-and-test.yml`)

- Runs on every push to main
- Validates JavaScript syntax
- Checks for sensitive data
- Runs tests (if self-hosted)
- Verifies documentation

**2. CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

- Runs linting
- Executes all tests
- Generates coverage
- Auto-deploys to production
- Restarts PM2 process

**3. Code Review** (`.github/workflows/code-review.yml`)

- Runs on pull requests
- GitHub Copilot review
- Security audit
- Style checking
- Comments on PR

**4. Daily Health Check** (`.github/workflows/daily-health-check.yml`)

- Runs every 6 hours
- Checks bot status
- Monitors Redis
- Alerts on failures

### CI/CD Requirements

✅ **All tests must pass** (1121+ tests)
✅ **0 lint errors** (ESLint clean)
✅ **No sensitive data** in commits
✅ **File size limits** respected (700 lines max per file in `src/`)
✅ **No hardcoded secrets**

### Preventing CI/CD Failures

**Files to NEVER commit:**

- `coverage/` (test coverage reports)
- `products_data/*.txt` (product credentials)
- `.env` (environment secrets)
- `*.log` (log files)
- `*.bak`, `*.backup` (backup files)
- Large media files (>10MB)

**Already configured in `.gitignore`** ✅

---

## 🔧 Troubleshooting

### Common Issues

**1. Bot won't start**

```bash
# Check Node version
node --version  # Should be 18 or 20

# Check dependencies
npm install

# Check .env file
cat .env  # Verify all required vars

# Check logs
tail -f logs/whatsapp-shop.log
```

**2. QR code not showing**

```bash
# Use pairing code instead
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=628xxx

# Restart
npm start
```

**3. Payment not working**

```bash
# Verify Xendit credentials
echo $XENDIT_SECRET_KEY

# Check webhook URL
curl -X POST http://your-server:3000/webhook/test

# View payment logs
grep "payment" logs/*.log
```

**4. Products not showing**

```bash
# Refresh products
# Send via WhatsApp: /refreshproducts

# Or restart bot
pm2 restart whatsapp-shop

# Check products folder
ls -la products_data/
```

**5. Tests failing**

```bash
# Update dependencies
npm update

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Run specific test
npm test -- tests/unit/lib/PaymentHandlers.test.js
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Or in .env
LOG_LEVEL=debug
```

### Performance Issues

```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart whatsapp-shop

# Check Redis
redis-cli INFO memory
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Write tests** for new features
4. **Ensure tests pass**: `npm test`
5. **Lint code**: `npm run lint`
6. **Commit changes**: `git commit -m "feat: add amazing feature"`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request**

### Commit Message Format

```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
style: formatting changes
chore: maintenance tasks
```

### Code Style

- Use ESLint config
- Max line length: 100 characters
- Max file size: 700 lines (in `src/`)
- Use async/await over callbacks
- Write tests for new features

### PR Guidelines

- Include tests
- Update documentation
- Pass all CI/CD checks
- Request review from maintainers

---

## 📞 Support

### Documentation

- **Architecture**: `.github/instructions/architecture.md`
- **Development Workflow**: `.github/instructions/development-workflow.md`
- **Common Tasks**: `.github/instructions/common-tasks.md`
- **Integration Guide**: `.github/instructions/integration.md`
- **File Reference**: `.github/instructions/file-reference.md`
- **Troubleshooting**: `.github/instructions/gotchas.md`

### Contact

- **Email**: support@mnhidayatgani.me
- **WhatsApp**: +62 853 4590 2520
- **GitHub Issues**: https://github.com/angga13142/chatbkt/issues

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎉 Acknowledgments

- whatsapp-web.js team
- Xendit for payment gateway
- Google Gemini AI
- Open source community

---

**Version**: 3.0  
**Last Updated**: November 6, 2025  
**Maintained by**: Muhammad Nurhidayat Gani
