#!/bin/bash

###############################################################################
# WhatsApp Shopping Chatbot - 1-Click Fresh Server Deployment
# Version: 1.0.0
# Author: Premium Chatbot Solutions
# 
# This script automatically deploys the chatbot to a fresh VPS/server
# Supports: Ubuntu 20.04+, Debian 11+, CentOS 8+
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script version
VERSION="1.0.0"

###############################################################################
# Configuration Banner
###############################################################################
show_banner() {
    clear
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}   🤖 WhatsApp Shopping Chatbot - Auto Installer${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   Version: ${VERSION}${NC}"
    echo -e "${GREEN}   Deployment Type: Fresh VPS Server${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

###############################################################################
# Check Prerequisites
###############################################################################
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}❌ Please run as root (use sudo)${NC}"
        exit 1
    fi
}

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        echo -e "${RED}❌ Cannot detect OS version${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Detected OS: $OS $VER${NC}"
}

###############################################################################
# User Configuration Input
###############################################################################
get_user_config() {
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📋 Configuration Setup${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # WhatsApp Configuration
    read -p "📱 Enter WhatsApp number for bot (e.g., 6281234567890): " WHATSAPP_NUMBER
    read -p "👤 Enter admin WhatsApp number (e.g., 6281234567890): " ADMIN_NUMBER
    
    # Payment Configuration
    echo ""
    echo -e "${CYAN}💳 Payment Configuration (Xendit)${NC}"
    read -p "🔑 Enter Xendit API Key (or press Enter to skip): " XENDIT_API_KEY
    read -p "🔐 Enter Xendit Callback Token (or press Enter to skip): " XENDIT_CALLBACK_TOKEN
    
    # AI Configuration
    echo ""
    echo -e "${CYAN}🤖 AI Configuration (Optional)${NC}"
    read -p "🔑 Enter Google Gemini API Key (or press Enter to skip): " GOOGLE_API_KEY
    
    # Redis Configuration
    echo ""
    read -p "💾 Install Redis for session persistence? (y/n, default: y): " INSTALL_REDIS
    INSTALL_REDIS=${INSTALL_REDIS:-y}
    
    # Domain Configuration
    echo ""
    read -p "🌐 Enter domain for webhook (optional, e.g., bot.example.com): " DOMAIN_NAME
    
    echo ""
    echo -e "${GREEN}✅ Configuration saved!${NC}"
    echo ""
}

###############################################################################
# System Update & Basic Dependencies
###############################################################################
update_system() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 Step 1/10: Updating system packages...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    apt update -y > /dev/null 2>&1
    apt upgrade -y > /dev/null 2>&1
    
    # Install basic tools
    apt install -y curl wget git unzip software-properties-common > /dev/null 2>&1
    
    echo -e "${GREEN}✅ System updated successfully${NC}"
}

###############################################################################
# Install Node.js 20 LTS
###############################################################################
install_nodejs() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 Step 2/10: Installing Node.js 20 LTS...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y nodejs > /dev/null 2>&1
    
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    
    echo -e "${GREEN}✅ Node.js installed: ${NODE_VERSION}${NC}"
    echo -e "${GREEN}✅ npm installed: v${NPM_VERSION}${NC}"
}

###############################################################################
# Install PM2
###############################################################################
install_pm2() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 Step 3/10: Installing PM2 Process Manager...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    npm install -g pm2 > /dev/null 2>&1
    
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✅ PM2 installed: v${PM2_VERSION}${NC}"
}

###############################################################################
# Install Chromium & Dependencies
###############################################################################
install_chromium() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 Step 4/10: Installing Chromium & Dependencies...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Install Chromium dependencies
    apt install -y \
        chromium \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2 > /dev/null 2>&1
    
    echo -e "${GREEN}✅ Chromium installed successfully${NC}"
}

###############################################################################
# Install Redis (Optional)
###############################################################################
install_redis() {
    if [[ "$INSTALL_REDIS" == "y" || "$INSTALL_REDIS" == "Y" ]]; then
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}📦 Step 5/10: Installing Redis...${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        apt install -y redis-server > /dev/null 2>&1
        systemctl enable redis-server > /dev/null 2>&1
        systemctl start redis-server > /dev/null 2>&1
        
        echo -e "${GREEN}✅ Redis installed and started${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipping Redis installation (using in-memory sessions)${NC}"
    fi
}

###############################################################################
# Create Bot User
###############################################################################
create_bot_user() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}👤 Step 6/10: Creating bot user...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Create chatbot user if not exists
    if ! id "chatbot" &>/dev/null; then
        useradd -m -s /bin/bash chatbot
        echo -e "${GREEN}✅ User 'chatbot' created${NC}"
    else
        echo -e "${YELLOW}⚠️  User 'chatbot' already exists${NC}"
    fi
}

###############################################################################
# Clone/Copy Bot Code
###############################################################################
deploy_bot_code() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📥 Step 7/10: Deploying bot code...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    BOT_DIR="/home/chatbot/whatsapp-bot"
    
    # If running from source directory
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}Copying from current directory...${NC}"
        mkdir -p $BOT_DIR
        cp -r . $BOT_DIR/
        cd $BOT_DIR
    else
        echo -e "${RED}❌ No package.json found. Please run from bot directory${NC}"
        exit 1
    fi
    
    # Set ownership
    chown -R chatbot:chatbot $BOT_DIR
    
    echo -e "${GREEN}✅ Bot code deployed to $BOT_DIR${NC}"
}

###############################################################################
# Configure Environment
###############################################################################
configure_environment() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}⚙️  Step 8/10: Configuring environment...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    BOT_DIR="/home/chatbot/whatsapp-bot"
    
    # Create .env file
    cat > $BOT_DIR/.env << EOF
# WhatsApp Configuration
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=${WHATSAPP_NUMBER}

# Admin Configuration
ADMIN_NUMBER=${ADMIN_NUMBER}

# Payment Configuration (Xendit)
XENDIT_API_KEY=${XENDIT_API_KEY:-your_xendit_api_key}
XENDIT_CALLBACK_TOKEN=${XENDIT_CALLBACK_TOKEN:-your_callback_token}

# AI Configuration (Gemini)
GOOGLE_API_KEY=${GOOGLE_API_KEY:-your_google_api_key}
AI_ENABLE=${GOOGLE_API_KEY:+true}

# Stock Configuration
DEFAULT_STOCK=999
VCC_STOCK=50

# Redis Configuration
REDIS_ENABLE=${INSTALL_REDIS}
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Webhook Configuration
WEBHOOK_PORT=3000
WEBHOOK_PATH=/webhook/xendit
${DOMAIN_NAME:+WEBHOOK_URL=https://$DOMAIN_NAME/webhook/xendit}

# System Configuration
NODE_ENV=production
LOG_LEVEL=info
EOF

    chown chatbot:chatbot $BOT_DIR/.env
    chmod 600 $BOT_DIR/.env
    
    echo -e "${GREEN}✅ Environment configured${NC}"
}

###############################################################################
# Install Dependencies
###############################################################################
install_dependencies() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 Step 9/10: Installing bot dependencies...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⏳ This may take 2-3 minutes...${NC}"
    
    BOT_DIR="/home/chatbot/whatsapp-bot"
    cd $BOT_DIR
    
    # Install as chatbot user
    su - chatbot -c "cd $BOT_DIR && npm install --production" > /dev/null 2>&1
    
    # Install puppeteer-core separately (critical fix)
    su - chatbot -c "cd $BOT_DIR && npm install puppeteer-core@18.2.1" > /dev/null 2>&1
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

###############################################################################
# Start Bot with PM2
###############################################################################
start_bot() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🚀 Step 10/10: Starting bot...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    BOT_DIR="/home/chatbot/whatsapp-bot"
    
    # Start with PM2 as chatbot user
    su - chatbot -c "cd $BOT_DIR && pm2 start index.js --name whatsapp-bot"
    su - chatbot -c "pm2 save"
    
    # Setup PM2 startup
    pm2 startup systemd -u chatbot --hp /home/chatbot > /dev/null 2>&1
    
    echo -e "${GREEN}✅ Bot started successfully${NC}"
}

###############################################################################
# Setup Firewall (Optional)
###############################################################################
setup_firewall() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🔒 Configuring firewall...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if command -v ufw &> /dev/null; then
        ufw allow 3000/tcp comment "WhatsApp Bot Webhook" > /dev/null 2>&1
        ufw allow 22/tcp comment "SSH" > /dev/null 2>&1
        echo -e "${GREEN}✅ Firewall configured (UFW)${NC}"
    else
        echo -e "${YELLOW}⚠️  UFW not found, skipping firewall setup${NC}"
    fi
}

###############################################################################
# Display Final Information
###############################################################################
show_completion() {
    clear
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}📊 Installation Summary:${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  Bot Directory:  /home/chatbot/whatsapp-bot"
    echo -e "  Node.js:        $(node -v)"
    echo -e "  PM2:            $(pm2 -v)"
    echo -e "  Redis:          ${INSTALL_REDIS}"
    echo -e "  WhatsApp #:     ${WHATSAPP_NUMBER}"
    echo -e "  Admin #:        ${ADMIN_NUMBER}"
    echo ""
    
    # Get pairing code from logs
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📱 WhatsApp Pairing Instructions:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "To get your pairing code, run:"
    echo -e "${CYAN}  su - chatbot -c 'pm2 logs whatsapp-bot'${NC}"
    echo ""
    echo -e "Then follow these steps:"
    echo -e "  1. Open WhatsApp on your phone"
    echo -e "  2. Tap Settings > Linked Devices"
    echo -e "  3. Tap 'Link a Device'"
    echo -e "  4. Tap 'Link with phone number instead'"
    echo -e "  5. Enter the 8-digit code from logs"
    echo ""
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🔧 Useful Commands:${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  View Logs:      ${CYAN}su - chatbot -c 'pm2 logs whatsapp-bot'${NC}"
    echo -e "  Restart Bot:    ${CYAN}su - chatbot -c 'pm2 restart whatsapp-bot'${NC}"
    echo -e "  Stop Bot:       ${CYAN}su - chatbot -c 'pm2 stop whatsapp-bot'${NC}"
    echo -e "  Bot Status:     ${CYAN}su - chatbot -c 'pm2 status'${NC}"
    echo -e "  Monitor:        ${CYAN}su - chatbot -c 'pm2 monit'${NC}"
    echo ""
    
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📚 Documentation:${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  Full Docs:      /home/chatbot/whatsapp-bot/docs/"
    echo -e "  Admin Commands: /home/chatbot/whatsapp-bot/docs/ADMIN_COMMANDS.md"
    echo -e "  Quick Start:    /home/chatbot/whatsapp-bot/QUICKSTART.md"
    echo ""
    
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}🎉 Your WhatsApp Shopping Bot is now running!${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

###############################################################################
# Main Execution Flow
###############################################################################
main() {
    show_banner
    check_root
    detect_os
    get_user_config
    
    update_system
    install_nodejs
    install_pm2
    install_chromium
    install_redis
    create_bot_user
    deploy_bot_code
    configure_environment
    install_dependencies
    start_bot
    setup_firewall
    
    show_completion
}

# Run main function
main "$@"
