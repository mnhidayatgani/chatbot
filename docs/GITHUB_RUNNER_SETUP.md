# 🏃 GitHub Actions Self-Hosted Runner Setup

**Date:** November 6, 2025  
**Status:** Ready to Deploy

---

## 📋 Overview

Self-hosted runner memungkinkan GitHub Actions CI/CD berjalan di server VPS Anda sendiri, memberikan:

✅ **Kecepatan lebih tinggi** - Tidak ada queue  
✅ **Akses langsung** - Bisa akses resource lokal (database, files)  
✅ **Hemat cost** - Gratis unlimited minutes  
✅ **Kontrol penuh** - Custom environment & dependencies

---

## 🎯 Current Workflows Using Self-Hosted

File yang akan menggunakan self-hosted runner:

1. `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
2. `.github/workflows/lint-and-test.yml` - Quick scan (< 5 min)
3. `.github/workflows/code-review.yml` - Deep review
4. `.github/workflows/daily-health-check.yml` - Daily checks

---

## 🚀 Quick Setup (5 Minutes)

### **Prerequisites:**

✅ VPS dengan Ubuntu 20.04+ (1 vCPU, 2GB RAM minimum)  
✅ Node.js 20+ installed  
✅ User dengan sudo privileges (jangan root!)  
✅ Internet connection

---

### **Step 1: Get GitHub Token**

1. Buka: https://github.com/angga13142/chatbkt/settings/actions/runners/new
2. Pilih **Linux** sebagai OS
3. Pilih **x64** sebagai Architecture
4. **Copy token** dari command (yang panjang seperti: `AABBCCDDEE...`)

**Token hanya berlaku 1 jam!** Langsung lanjut ke Step 2.

---

### **Step 2: Run Setup Script**

SSH ke VPS, lalu:

```bash
cd /home/senarokalie/Desktop/chatbot

# Run setup script dengan token dari Step 1
bash scripts/setup-github-runner.sh <GITHUB_TOKEN>
```

**Contoh:**

```bash
bash scripts/setup-github-runner.sh AABBCCDDEEFF112233445566778899
```

**Script akan:**

1. ✅ Check prerequisites (Node.js, npm, disk space)
2. ✅ Download GitHub Actions runner
3. ✅ Configure runner dengan repository
4. ✅ Install sebagai systemd service
5. ✅ Start runner automatically

**Estimasi waktu:** ~2-3 menit

---

### **Step 3: Verify Installation**

**Check di GitHub:**

```
https://github.com/angga13142/chatbkt/settings/actions/runners
```

**Harus muncul:**

- 🟢 Runner name: `chatbot-vps-runner`
- 🟢 Status: **Idle** (ready)
- 🟢 Labels: `self-hosted`, `linux`, `x64`, `vps`, `production`

**Check di VPS:**

```bash
# Check service status
sudo systemctl status actions.runner.*

# View runner logs
sudo journalctl -u actions.runner.* -f

# Manual check
cd ~/actions-runner
sudo ./svc.sh status
```

---

## 🧪 Test Runner

Push commit untuk trigger workflow:

```bash
cd /home/senarokalie/Desktop/chatbot

# Small change
echo "# Test runner" >> README.md

# Commit and push
git add README.md
git commit -m "test: Trigger CI/CD on self-hosted runner"
git push origin main
```

**Check workflow:**

```
https://github.com/angga13142/chatbkt/actions
```

**Harus terlihat:**

- 🟢 Workflow running
- 🟢 Job executed on `chatbot-vps-runner`
- 🟢 Faster execution (~30s vs 2-3 min on GitHub-hosted)

---

## 🔧 Management Commands

### **Service Management:**

```bash
# Check status
sudo ~/actions-runner/svc.sh status

# Start runner
sudo ~/actions-runner/svc.sh start

# Stop runner
sudo ~/actions-runner/svc.sh stop

# Restart runner
sudo ~/actions-runner/svc.sh restart

# Uninstall service (not remove runner)
sudo ~/actions-runner/svc.sh uninstall
```

---

### **Logs:**

```bash
# Live logs (follow)
sudo journalctl -u actions.runner.* -f

# Last 50 lines
sudo journalctl -u actions.runner.* -n 50

# Logs for specific date
sudo journalctl -u actions.runner.* --since "2025-11-06"

# Runner working directory logs
cat ~/actions-runner/_diag/*.log
```

---

### **Update Runner:**

```bash
cd ~/actions-runner

# Stop service
sudo ./svc.sh stop

# Download new version
RUNNER_VERSION="2.312.0"  # Check latest version
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract (will replace binaries)
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Start service
sudo ./svc.sh start

# Verify
sudo ./svc.sh status
```

---

### **Remove Runner:**

**From VPS:**

```bash
cd ~/actions-runner

# Stop and uninstall service
sudo ./svc.sh stop
sudo ./svc.sh uninstall

# Remove runner config
./config.sh remove --token <NEW_REMOVAL_TOKEN>

# Remove directory
cd ~
rm -rf ~/actions-runner
```

**From GitHub:**

1. Go to: https://github.com/angga13142/chatbkt/settings/actions/runners
2. Find `chatbot-vps-runner`
3. Click **Remove** button

---

## 🔒 Security Best Practices

### **✅ DO:**

1. **Run as non-root user**

   ```bash
   # Check current user
   whoami  # Should NOT be 'root'
   ```

2. **Use dedicated user** (optional, recommended for production)

   ```bash
   sudo adduser github-runner
   sudo usermod -aG sudo github-runner
   su - github-runner
   # Run setup script as github-runner
   ```

3. **Firewall rules**

   ```bash
   # Only allow outbound HTTPS (runner → GitHub)
   sudo ufw allow out 443/tcp
   ```

4. **Regular updates**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Update runner (see "Update Runner" section)
   ```

5. **Monitor disk space**

   ```bash
   # Runner uses ~/actions-runner/_work
   du -sh ~/actions-runner/_work

   # Clean old builds
   rm -rf ~/actions-runner/_work/_temp/*
   ```

---

### **❌ DON'T:**

1. ❌ Run as root user
2. ❌ Share runner across multiple repositories (security risk)
3. ❌ Run on public VPS without firewall
4. ❌ Store secrets in runner environment
5. ❌ Use runner for untrusted code (fork PRs)

---

## 🐛 Troubleshooting

### **Runner not starting**

**Check logs:**

```bash
sudo journalctl -u actions.runner.* -n 100
```

**Common fixes:**

```bash
# Reinstall service
cd ~/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
sudo ./svc.sh install
sudo ./svc.sh start
```

---

### **Runner offline on GitHub**

**Possible causes:**

1. Service stopped
2. Network issue
3. GitHub API down

**Fix:**

```bash
# Check service
sudo systemctl status actions.runner.*

# Restart service
sudo ~/actions-runner/svc.sh restart

# Check network
ping github.com
curl -I https://api.github.com
```

---

### **Workflow not using self-hosted runner**

**Check workflow file:**

```yaml
jobs:
  test:
    runs-on: self-hosted # ← Must be 'self-hosted'
```

**Not:**

```yaml
runs-on: ubuntu-latest # ← This uses GitHub-hosted
```

---

### **Out of disk space**

**Check usage:**

```bash
df -h
du -sh ~/actions-runner/_work
```

**Clean up:**

```bash
# Remove old build artifacts
cd ~/actions-runner/_work
rm -rf _temp/*
rm -rf _PipelineMapping/*

# Clean npm cache
npm cache clean --force

# Clean Docker (if used)
docker system prune -af
```

---

## 📊 Monitoring

### **Resource Usage:**

```bash
# CPU & Memory
htop

# Runner processes
ps aux | grep Runner.Listener

# Network usage
iftop
```

---

### **Workflow Statistics:**

**Via GitHub:**

```
https://github.com/angga13142/chatbkt/actions
```

**Filter:**

- By workflow name
- By status (success/failure)
- By runner (self-hosted)

**Metrics:**

- Average execution time
- Success rate
- Queue time (should be ~0s for self-hosted)

---

## 🎯 Performance Comparison

| Metric         | GitHub-Hosted     | Self-Hosted          |
| -------------- | ----------------- | -------------------- |
| **Queue Time** | 10s - 2min        | ~0s (instant)        |
| **Checkout**   | 10-15s            | 3-5s (local cache)   |
| **npm ci**     | 20-30s            | 10-15s (faster disk) |
| **npm test**   | 15-20s            | 10-15s               |
| **Total**      | **~2-3 min**      | **~30-40s**          |
| **Cost**       | Limited free tier | **Free unlimited**   |

**Speed improvement:** ~4x faster! 🚀

---

## 🔄 Auto-Update Script

Save as `~/update-runner.sh`:

```bash
#!/bin/bash
set -e

RUNNER_DIR="$HOME/actions-runner"
RUNNER_VERSION="2.312.0"  # Update this

cd "$RUNNER_DIR"

# Stop
sudo ./svc.sh stop

# Download
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
rm ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Start
sudo ./svc.sh start

echo "✅ Runner updated to v${RUNNER_VERSION}"
```

**Make executable:**

```bash
chmod +x ~/update-runner.sh
```

**Run:**

```bash
~/update-runner.sh
```

---

## 📚 Additional Resources

**GitHub Docs:**

- https://docs.github.com/en/actions/hosting-your-own-runners

**Runner Releases:**

- https://github.com/actions/runner/releases

**Support:**

- GitHub Community: https://github.community/

---

## ✅ Checklist

**Before Setup:**

- [ ] VPS ready (Ubuntu 20.04+, 2GB RAM)
- [ ] Node.js 20+ installed
- [ ] Non-root user with sudo
- [ ] GitHub token obtained

**After Setup:**

- [ ] Runner visible on GitHub (green status)
- [ ] Service running (`sudo systemctl status actions.runner.*`)
- [ ] Test workflow triggered successfully
- [ ] Logs accessible (`sudo journalctl -u actions.runner.*`)

**Maintenance:**

- [ ] Monitor disk space weekly
- [ ] Update runner monthly
- [ ] Review logs for errors
- [ ] Test backup/restore procedure

---

**Ready to setup?** Run:

```bash
cd /home/senarokalie/Desktop/chatbot
bash scripts/setup-github-runner.sh <YOUR_GITHUB_TOKEN>
```

**Questions?** Check FAQ di `docs/FAQ.md` atau GitHub Issues.

---

**Last Updated:** November 6, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
