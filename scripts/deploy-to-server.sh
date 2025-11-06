#!/bin/bash

###############################################################################
# Automated Deployment Script for WhatsApp Chatbot
# Target: New VPS Server
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TARGET_HOST="136.110.59.209"
TARGET_USER="senarokalie"
TARGET_PASSWORD="gg123123@"
DEPLOY_PACKAGE="/tmp/chatbot-deploy.tar.gz"
REMOTE_DIR="chatbot-new"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 WhatsApp Chatbot - Automated Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Target Server:${NC} ${TARGET_USER}@${TARGET_HOST}"
echo -e "${GREEN}Deploy Package:${NC} ${DEPLOY_PACKAGE}"
echo -e "${GREEN}Remote Directory:${NC} ~/${REMOTE_DIR}"
echo ""

# Check if deployment package exists
if [ ! -f "$DEPLOY_PACKAGE" ]; then
    echo -e "${RED}❌ Deployment package not found: ${DEPLOY_PACKAGE}${NC}"
    echo -e "${YELLOW}Creating deployment package...${NC}"
    
    cd /home/senarokalie/Desktop/chatbot
    tar -czf "$DEPLOY_PACKAGE" \
      --exclude=node_modules \
      --exclude=.git \
      --exclude=coverage \
      --exclude=.wwebjs_auth \
      --exclude=logs \
      --exclude=payment_proofs \
      --exclude=payment_qris \
      .
    
    echo -e "${GREEN}✅ Deployment package created${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Deployment Steps${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Test SSH Connection
echo -e "${YELLOW}Step 1: Testing SSH connection...${NC}"
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes ${TARGET_USER}@${TARGET_HOST} exit 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful (key-based auth)${NC}"
    USE_PASSWORD=false
else
    echo -e "${YELLOW}⚠️  Key-based auth not available, will use password${NC}"
    USE_PASSWORD=true
    
    # Check if sshpass is available
    if ! command -v sshpass &> /dev/null; then
        echo -e "${YELLOW}Installing sshpass...${NC}"
        sudo apt-get update > /dev/null 2>&1
        sudo apt-get install -y sshpass > /dev/null 2>&1
        echo -e "${GREEN}✅ sshpass installed${NC}"
    fi
fi

echo ""

# Step 2: Copy deployment package
echo -e "${YELLOW}Step 2: Copying deployment package to remote server...${NC}"
echo -e "${BLUE}Package size: $(du -h ${DEPLOY_PACKAGE} | cut -f1)${NC}"

if [ "$USE_PASSWORD" = true ]; then
    sshpass -p "${TARGET_PASSWORD}" scp -o StrictHostKeyChecking=no \
        ${DEPLOY_PACKAGE} ${TARGET_USER}@${TARGET_HOST}:/tmp/
else
    scp ${DEPLOY_PACKAGE} ${TARGET_USER}@${TARGET_HOST}:/tmp/
fi

echo -e "${GREEN}✅ Deployment package copied${NC}"
echo ""

# Step 3: Extract and setup on remote server
echo -e "${YELLOW}Step 3: Extracting and setting up on remote server...${NC}"

REMOTE_COMMANDS=$(cat << 'EOFREMOTE'
set -e

# Colors for remote
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Creating deployment directory...${NC}"
mkdir -p ~/chatbot-new
cd ~/chatbot-new

echo -e "${YELLOW}Extracting deployment package...${NC}"
tar -xzf /tmp/chatbot-deploy.tar.gz
rm /tmp/chatbot-deploy.tar.gz

echo -e "${GREEN}✅ Files extracted${NC}"

echo -e "${YELLOW}Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env created from template${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping${NC}"
fi

echo -e "${GREEN}✅ Setup complete on remote server${NC}"
echo ""
echo "Directory contents:"
ls -lh ~/chatbot-new/ | head -20
EOFREMOTE
)

if [ "$USE_PASSWORD" = true ]; then
    sshpass -p "${TARGET_PASSWORD}" ssh -o StrictHostKeyChecking=no \
        ${TARGET_USER}@${TARGET_HOST} "${REMOTE_COMMANDS}"
else
    ssh ${TARGET_USER}@${TARGET_HOST} "${REMOTE_COMMANDS}"
fi

echo ""

# Step 4: Display next steps
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps (Run on remote server):${NC}"
echo ""
echo "1️⃣  SSH to remote server:"
echo "   ssh ${TARGET_USER}@${TARGET_HOST}"
echo ""
echo "2️⃣  Navigate to deployment directory:"
echo "   cd ~/${REMOTE_DIR}"
echo ""
echo "3️⃣  Run installation script:"
echo "   sudo bash install-vps.sh"
echo ""
echo "4️⃣  Configure environment (.env):"
echo "   nano .env"
echo "   # Set: ADMIN_NUMBER, XENDIT_API_KEY, etc."
echo ""
echo "5️⃣  Install dependencies:"
echo "   PUPPETEER_SKIP_DOWNLOAD=true npm install"
echo ""
echo "6️⃣  Start the bot:"
echo "   pm2 start index.js --name whatsapp-bot"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "7️⃣  View logs and scan QR code:"
echo "   pm2 logs whatsapp-bot"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 To run all installation steps automatically:${NC}"
echo ""
echo "ssh ${TARGET_USER}@${TARGET_HOST} << 'EOF'
cd ~/${REMOTE_DIR}
sudo bash install-vps.sh
EOF"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
