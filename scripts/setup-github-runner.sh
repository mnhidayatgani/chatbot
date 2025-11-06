#!/bin/bash

###############################################################################
# GitHub Actions Self-Hosted Runner Setup Script
# For: WhatsApp Shopping Chatbot (angga13142/chatbkt)
###############################################################################

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 GitHub Actions Self-Hosted Runner Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
RUNNER_NAME="chatbot-vps-runner"
RUNNER_WORK_DIR="_work"
RUNNER_VERSION="2.311.0"  # Latest as of Nov 2024

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please do NOT run this script as root!"
    log_warn "GitHub Actions runner should run as a regular user"
    exit 1
fi

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

# Check if GitHub token is provided
if [ -z "$1" ]; then
    log_error "GitHub token not provided!"
    echo ""
    echo "Usage: $0 <GITHUB_TOKEN>"
    echo ""
    echo "To get a GitHub token:"
    echo "1. Go to: https://github.com/angga13142/chatbkt/settings/actions/runners/new"
    echo "2. Select 'Linux' as OS"
    echo "3. Copy the token from the configuration command"
    echo ""
    exit 1
fi

GITHUB_TOKEN="$1"

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed!"
    log_warn "Run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
    exit 1
fi
log_info "Node.js $(node -v) installed"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed!"
    exit 1
fi
log_info "npm $(npm -v) installed"

# Check disk space
DISK_SPACE=$(df -h . | awk 'NR==2 {print $4}')
log_info "Available disk space: $DISK_SPACE"

echo ""

# Step 2: Create runner directory
echo "📁 Step 2: Creating runner directory..."

RUNNER_DIR="$HOME/actions-runner"

if [ -d "$RUNNER_DIR" ]; then
    log_warn "Runner directory already exists: $RUNNER_DIR"
    read -p "Do you want to remove it and reinstall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$RUNNER_DIR"
        log_info "Old runner directory removed"
    else
        log_error "Setup cancelled"
        exit 1
    fi
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"
log_info "Runner directory created: $RUNNER_DIR"

echo ""

# Step 3: Download runner
echo "📦 Step 3: Downloading GitHub Actions runner..."

RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

log_info "Downloading from: $RUNNER_URL"
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L "$RUNNER_URL"

log_info "Extracting runner..."
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
rm ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

log_info "Runner downloaded and extracted"

echo ""

# Step 4: Configure runner
echo "⚙️  Step 4: Configuring runner..."

log_info "Configuring with:"
log_info "  - Repository: angga13142/chatbkt"
log_info "  - Runner name: $RUNNER_NAME"
log_info "  - Work directory: $RUNNER_WORK_DIR"

./config.sh \
    --url https://github.com/angga13142/chatbkt \
    --token "$GITHUB_TOKEN" \
    --name "$RUNNER_NAME" \
    --work "$RUNNER_WORK_DIR" \
    --labels "self-hosted,linux,x64,vps,production" \
    --unattended \
    --replace

log_info "Runner configured successfully"

echo ""

# Step 5: Install as service
echo "🔧 Step 5: Installing runner as systemd service..."

sudo ./svc.sh install
log_info "Runner service installed"

sudo ./svc.sh start
log_info "Runner service started"

echo ""

# Step 6: Verify installation
echo "✅ Step 6: Verifying installation..."

sleep 3

sudo ./svc.sh status
log_info "Runner is running!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 GitHub Actions Self-Hosted Runner Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "Runner name: $RUNNER_NAME"
log_info "Runner directory: $RUNNER_DIR"
log_info "Service status: Running"
echo ""
echo "📋 Useful commands:"
echo "  • Check status:  sudo $RUNNER_DIR/svc.sh status"
echo "  • Stop runner:   sudo $RUNNER_DIR/svc.sh stop"
echo "  • Start runner:  sudo $RUNNER_DIR/svc.sh start"
echo "  • Restart:       sudo $RUNNER_DIR/svc.sh restart"
echo "  • View logs:     sudo journalctl -u actions.runner.* -f"
echo ""
echo "🔗 Verify on GitHub:"
echo "  https://github.com/angga13142/chatbkt/settings/actions/runners"
echo ""
echo "✨ Next: Push a commit to trigger the CI/CD pipeline!"
echo ""
