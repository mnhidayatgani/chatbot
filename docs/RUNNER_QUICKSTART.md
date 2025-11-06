# 🏃 GitHub Runner - Quick Start

## 1️⃣ Get Token (1 min)

Go to: https://github.com/angga13142/chatbkt/settings/actions/runners/new

Select: **Linux** + **x64**

Copy the **token** (long string after `--token`)

---

## 2️⃣ Run Setup (2 min)

```bash
cd /home/senarokalie/Desktop/chatbot
bash scripts/setup-github-runner.sh <YOUR_TOKEN_HERE>
```

**Example:**
```bash
bash scripts/setup-github-runner.sh AABBCCDDEEFF112233445566
```

---

## 3️⃣ Verify (1 min)

**On GitHub:**
https://github.com/angga13142/chatbkt/settings/actions/runners

Should show:
- 🟢 `chatbot-vps-runner` - **Idle**

**On VPS:**
```bash
sudo systemctl status actions.runner.*
```

Should show:
- 🟢 Active (running)

---

## ✅ Done!

**Test:** Push a commit → Check https://github.com/angga13142/chatbkt/actions

**Manage:**
```bash
sudo ~/actions-runner/svc.sh status   # Check
sudo ~/actions-runner/svc.sh restart  # Restart
sudo journalctl -u actions.runner.* -f # Logs
```

**Full docs:** `docs/GITHUB_RUNNER_SETUP.md`
