# CI/CD Safe Practices - Checklist

**Date**: November 6, 2025  
**Purpose**: Prevent workflow failures & maintain clean repository

---

## ✅ Pre-Commit Checklist

### Before EVERY commit:

- [ ] Run `npm run lint` → **0 errors required**
- [ ] Run `npm test` → **1121+ tests passing**
- [ ] Check no sensitive data: `git diff`
- [ ] Verify file sizes: `find src/ -name "*.js" -exec wc -l {} \; | sort -n`
- [ ] No `.env` file staged: `git status | grep .env`

### Quick Check Script:

```bash
#!/bin/bash
# pre-commit-check.sh

echo "🔍 Running pre-commit checks..."

# 1. Lint
echo "1️⃣ Linting..."
npm run lint || exit 1

# 2. Test
echo "2️⃣ Testing..."
npm test || exit 1

# 3. Check for .env
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo "❌ ERROR: .env file is staged!"
  exit 1
fi

# 4. Check for large files
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ $size -gt 1048576 ]; then  # 1MB
      echo "❌ ERROR: $file is too large ($(($size / 1024))KB)"
      exit 1
    fi
  fi
done

# 5. Check for sensitive patterns
if git diff --cached | grep -E "(xnd_production|sk_live|api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,})"; then
  echo "❌ ERROR: Possible API key detected!"
  exit 1
fi

echo "✅ All checks passed!"
```

---

## 🚫 Files to NEVER Commit

### Critical (Will break CI/CD):

```gitignore
# NEVER COMMIT THESE:
.env                      # Secrets
coverage/                 # Test reports
products_data/*.txt       # Product credentials
*.log                     # Logs
node_modules/            # Dependencies
.wwebjs_auth/            # WhatsApp session
payment_proofs/          # User uploads
payment_qris/            # QR codes
```

### Already Protected:

✅ Listed in `.gitignore`  
✅ CI/CD checks on every push  
✅ GitHub Actions validates

---

## 📏 File Size Limits

### Enforced by CI/CD:

| Location        | Max Size  | Reason                     |
| --------------- | --------- | -------------------------- |
| `src/**/*.js`   | 700 lines | Handler delegation pattern |
| `lib/*.js`      | 800 lines | Legacy compatibility       |
| `tests/**/*.js` | No limit  | Test files exempt          |
| Any file        | 1 MB      | GitHub performance         |

### Check File Sizes:

```bash
# Find large files in src/
find src/ -name "*.js" -exec wc -l {} \; | awk '$1 > 700 {print}'

# Find files over 1MB
find . -type f -size +1M -not -path "./node_modules/*"
```

---

## 🔐 Sensitive Data Prevention

### What CI/CD Scans For:

1. **API Keys**: `(api[_-]?key|secret[_-]?key).*=.*(sk_|xnd_|pk_)`
2. **Passwords**: `password.*=.*['\"][^'\"]{8,}`
3. **Tokens**: `(access[_-]?token|bearer).*[a-zA-Z0-9]{20,}`
4. **Private Keys**: `-----BEGIN.*PRIVATE KEY-----`

### Safe Practices:

✅ Use `.env` for all secrets  
✅ Use `.env.example` as template  
✅ Reference via `process.env.VAR_NAME`  
❌ Never hardcode: `const key = "xnd_production_xxx"`

### Example (BAD):

```javascript
// ❌ WILL FAIL CI/CD
const xenditKey = "xnd_production_12345";
```

### Example (GOOD):

```javascript
// ✅ PASSES CI/CD
const xenditKey = process.env.XENDIT_SECRET_KEY;
```

---

## 🧪 Test Requirements

### Must Pass Before Push:

```bash
# Full test suite
npm test

# Expected output:
# Tests:       1121+ passed
# Test Suites: 37 passed
# Coverage:    45%+
```

### Test Failure = CI/CD Failure

If tests fail locally, they WILL fail in CI/CD. Fix before pushing.

### Common Test Failures:

1. **Missing mocks**: Update `jest.mock()` paths
2. **Async issues**: Use `await` properly
3. **Redis required**: Mock Redis in tests
4. **File dependencies**: Use temp files in tests

---

## 📦 Coverage Files

### Automatically Excluded:

```gitignore
coverage/
.nyc_output/
*.lcov
```

### Why?

- Generated files (not source code)
- Large size (can be MB)
- Causes unnecessary diff noise
- Rebuilt on every test run

### Regenerate Locally:

```bash
npm run coverage
# View: open coverage/lcov-report/index.html
```

---

## 🔄 GitHub Actions Triggers

### What Triggers CI/CD:

1. **Push to `main`** → Full pipeline
2. **Pull Request** → Tests only
3. **Schedule** → Daily health check
4. **Manual** → Via GitHub UI

### What Each Workflow Does:

**lint-and-test.yml:**

- ✅ Syntax validation
- ✅ Sensitive data scan
- ✅ Documentation check
- ⏭️ Tests (optional, self-hosted only)

**ci-cd.yml:**

- ✅ Lint (must pass)
- ✅ Tests (must pass)
- ✅ Integration tests
- ✅ Coverage generation
- 🚀 Deploy (if main branch)

**code-review.yml:**

- ✅ Syntax check
- ✅ Style check
- ✅ Security audit
- 🤖 Copilot review

**daily-health-check.yml:**

- ✅ PM2 status
- ✅ Redis connection
- ✅ Disk space
- 📧 Alert on failure

---

## 🚨 Common CI/CD Failures

### 1. Lint Errors

**Error**: `ESLint found X errors`

**Fix**:

```bash
npm run lint           # See errors
npm run lint -- --fix  # Auto-fix
```

### 2. Test Failures

**Error**: `Tests failed: X/1121`

**Fix**:

```bash
npm test               # Run locally
npm test -- --verbose  # See details
# Fix failing tests, then commit
```

### 3. File Size Exceeded

**Error**: `File src/handlers/AdminHandler.js exceeds 700 lines`

**Fix**:

- Split into smaller files
- Use delegation pattern
- Extract to service layer

### 4. Sensitive Data Detected

**Error**: `Possible API key exposure detected`

**Fix**:

```bash
git reset HEAD .env    # Unstage .env
# Remove hardcoded keys
# Use process.env.VAR_NAME instead
```

### 5. Coverage Upload Failed

**Error**: `Coverage upload failed`

**Fix**:

- Usually not critical (won't block)
- Check Codecov token in secrets
- Verify coverage files generated

---

## 📊 CI/CD Status Badges

### Add to README.md:

```markdown
![CI/CD](https://github.com/angga13142/chatbkt/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://github.com/angga13142/chatbkt/workflows/Lint%20and%20Test/badge.svg)
![Coverage](https://codecov.io/gh/angga13142/chatbkt/branch/main/graph/badge.svg)
```

---

## 🛠️ Fixing Failed Workflows

### Step-by-Step Recovery:

1. **Check workflow logs** on GitHub Actions tab
2. **Identify failure reason** (lint/test/deploy)
3. **Fix locally**:
   ```bash
   npm run lint
   npm test
   ```
4. **Commit fix**:
   ```bash
   git add .
   git commit -m "fix: resolve CI/CD failure"
   git push
   ```
5. **Verify success** on GitHub

### Emergency: Skip CI/CD

```bash
# Only if absolutely necessary!
git commit -m "fix: urgent hotfix [skip ci]"
```

⚠️ **Warning**: Use sparingly, will skip all checks!

---

## ✅ Best Practices

### DO:

✅ Run `npm run check` before every commit  
✅ Keep files under size limits  
✅ Write tests for new features  
✅ Use .env for configuration  
✅ Update .gitignore for new file types  
✅ Review GitHub Actions logs  
✅ Fix CI/CD failures immediately

### DON'T:

❌ Commit .env file  
❌ Push without running tests  
❌ Ignore lint warnings  
❌ Hardcode API keys  
❌ Commit coverage/ folder  
❌ Push large binary files  
❌ Skip CI/CD without reason

---

## 📋 Quick Reference

### Pre-Commit Commands:

```bash
npm run check          # Lint + Test (recommended)
npm run lint           # Lint only
npm test               # Test only
npm run coverage       # Generate coverage
```

### Check Status:

```bash
git status             # See staged files
git diff               # See changes
git log -1             # Last commit
```

### Verify .gitignore:

```bash
git ls-files --ignored --exclude-standard
# Should NOT include: .env, coverage/, *.txt
```

### Test CI/CD Locally:

```bash
# Use act (GitHub Actions locally)
brew install act       # macOS
sudo snap install act  # Linux

act                    # Run workflows
act -l                 # List workflows
```

---

## 🎯 Summary

**Golden Rules:**

1. ✅ **Never commit secrets** (.env, API keys)
2. ✅ **Always test before push** (`npm test`)
3. ✅ **Keep files small** (<700 lines in src/)
4. ✅ **Exclude generated files** (coverage/, logs/)
5. ✅ **Fix CI/CD failures ASAP** (don't accumulate)

**If in doubt:**

- Check `.gitignore`
- Run `npm run check`
- Review workflow logs
- Ask for help!

---

**Last Updated**: November 6, 2025  
**Maintained by**: DevOps Team
