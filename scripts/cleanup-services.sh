#!/bin/bash

###############################################################################
# Service Cleanup Script
# Menghentikan dan disable service yang tidak digunakan
# AMAN: Tidak akan menghentikan service critical (xrdp, ssh, network, dll)
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧹 Service Cleanup Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root: sudo bash $0${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Service yang AKAN TETAP BERJALAN (CRITICAL):${NC}"
echo "  • xrdp.service, xrdp-sesman.service (Remote Desktop)"
echo "  • ssh.service (SSH Access)"
echo "  • NetworkManager.service, systemd-networkd.service"
echo "  • systemd-resolved.service (DNS)"
echo "  • dbus.service, systemd-journald.service"
echo "  • cron.service, rsyslog.service"
echo "  • redis-server.service (Chatbot)"
echo ""

echo -e "${YELLOW}⚠️  Service yang AKAN DIHENTIKAN:${NC}"

# List of services to stop and disable
SERVICES_TO_STOP=(
    # Desktop/GUI services (tidak diperlukan untuk server)
    "sddm.service"
    "power-profiles-daemon.service"
    "switcheroo-control.service"
    "rtkit-daemon.service"
    "udisks2.service"
    "upower.service"
    
    # Google Cloud services (opsional)
    "google-guest-agent-manager.service"
    "google-guest-compat-manager.service"
    "google-osconfig-agent.service"
    
    # Mail service (jika tidak digunakan)
    "exim4.service"
    
    # Update services (bisa manual)
    "unattended-upgrades.service"
    "fwupd.service"
    
    # Other optional services
    "accounts-daemon.service"
    "wpa_supplicant.service"
    "networkd-dispatcher.service"
)

# Show what will be stopped
for service in "${SERVICES_TO_STOP[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo "  • $service"
    fi
done

echo ""
read -p "Lanjutkan? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Processing...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

STOPPED_COUNT=0
DISABLED_COUNT=0
FAILED_COUNT=0

for service in "${SERVICES_TO_STOP[@]}"; do
    # Check if service exists
    if systemctl list-unit-files | grep -q "^${service}"; then
        echo -e "${YELLOW}Processing: ${service}${NC}"
        
        # Stop the service
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            systemctl stop "$service" 2>/dev/null && {
                echo -e "  ${GREEN}✓ Stopped${NC}"
                ((STOPPED_COUNT++))
            } || {
                echo -e "  ${RED}✗ Failed to stop${NC}"
                ((FAILED_COUNT++))
            }
        else
            echo -e "  ${YELLOW}⊘ Already stopped${NC}"
        fi
        
        # Disable the service
        if systemctl is-enabled --quiet "$service" 2>/dev/null; then
            systemctl disable "$service" 2>/dev/null && {
                echo -e "  ${GREEN}✓ Disabled${NC}"
                ((DISABLED_COUNT++))
            } || {
                echo -e "  ${RED}✗ Failed to disable${NC}"
                ((FAILED_COUNT++))
            }
        else
            echo -e "  ${YELLOW}⊘ Already disabled${NC}"
        fi
        
        echo ""
    fi
done

# Stop Plymouth services (boot splash)
echo -e "${YELLOW}Stopping Plymouth services...${NC}"
for plymouth_service in plymouth-quit-wait plymouth-quit plymouth-read-write plymouth-start; do
    if systemctl is-active --quiet "$plymouth_service" 2>/dev/null; then
        systemctl stop "$plymouth_service" 2>/dev/null || true
        echo -e "  ${GREEN}✓ Stopped ${plymouth_service}${NC}"
    fi
done
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Summary:"
echo "  • Services stopped:  $STOPPED_COUNT"
echo "  • Services disabled: $DISABLED_COUNT"
echo "  • Failed operations: $FAILED_COUNT"
echo ""

echo -e "${GREEN}✅ Critical services masih berjalan:${NC}"
systemctl is-active --quiet xrdp.service && echo "  ✓ xrdp.service (Remote Desktop)"
systemctl is-active --quiet ssh.service && echo "  ✓ ssh.service (SSH)"
systemctl is-active --quiet NetworkManager.service && echo "  ✓ NetworkManager.service"
systemctl is-active --quiet redis-server.service && echo "  ✓ redis-server.service"
systemctl is-active --quiet cron.service && echo "  ✓ cron.service"
echo ""

echo -e "${BLUE}💡 Tips:${NC}"
echo "  • Restart VM untuk efek penuh: sudo reboot"
echo "  • Lihat service aktif: systemctl list-units --type=service --state=running"
echo "  • Re-enable service: sudo systemctl enable <service-name>"
echo ""
