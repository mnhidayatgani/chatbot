#!/bin/bash
# Pre-commit hook to prevent CI/CD failures
# Install: cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit checks..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check for .env file
echo -e "${YELLOW}1️⃣ Checking for .env file...${NC}"
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo -e "${RED}❌ ERROR: .env file is staged!${NC}"
  echo "   Run: git reset HEAD .env"
  exit 1
fi
echo -e "${GREEN}✅ No .env file staged${NC}"

# 2. Check for sensitive patterns
echo -e "${YELLOW}2️⃣ Scanning for sensitive data...${NC}"
if git diff --cached | grep -qE "(xnd_production|sk_live|password.*=.*['\"][a-zA-Z0-9]{8,})"; then
  echo -e "${RED}❌ ERROR: Possible API key or password detected!${NC}"
  echo "   Use process.env.VAR_NAME instead"
  exit 1
fi
echo -e "${GREEN}✅ No sensitive data found${NC}"

# 3. Check file sizes
echo -e "${YELLOW}3️⃣ Checking file sizes...${NC}"
for file in $(git diff --cached --name-only | grep "^src/.*\.js$"); do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    if [ $lines -gt 700 ]; then
      echo -e "${RED}❌ ERROR: $file exceeds 700 lines ($lines lines)${NC}"
      echo "   Split into smaller files or use delegation pattern"
      exit 1
    fi
  fi
done
echo -e "${GREEN}✅ All files within size limit${NC}"

# 4. Check for large files
echo -e "${YELLOW}4️⃣ Checking for large files...${NC}"
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ $size -gt 1048576 ]; then  # 1MB
      echo -e "${RED}❌ ERROR: $file is too large ($(($size / 1024))KB)${NC}"
      echo "   Files over 1MB should not be committed"
      exit 1
    fi
  fi
done
echo -e "${GREEN}✅ No large files detected${NC}"

# 5. Check for excluded files
echo -e "${YELLOW}5️⃣ Checking for excluded files...${NC}"
EXCLUDED_PATTERNS=("coverage/" "*.log" "products_data/*.txt" "node_modules/" ".wwebjs_auth/")
for pattern in "${EXCLUDED_PATTERNS[@]}"; do
  if git diff --cached --name-only | grep -q "$pattern"; then
    echo -e "${RED}❌ ERROR: Excluded file pattern detected: $pattern${NC}"
    echo "   These files should be in .gitignore"
    exit 1
  fi
done
echo -e "${GREEN}✅ No excluded files staged${NC}"

# 6. Run linting (optional, can be slow)
if [ -z "$SKIP_LINT" ]; then
  echo -e "${YELLOW}6️⃣ Running ESLint...${NC}"
  if ! npm run lint --silent; then
    echo -e "${RED}❌ ERROR: Linting failed${NC}"
    echo "   Fix errors or run: git commit --no-verify (not recommended)"
    exit 1
  fi
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  echo -e "${YELLOW}6️⃣ Linting skipped (SKIP_LINT=1)${NC}"
fi

# 7. Run tests (optional, can be very slow)
if [ -n "$RUN_TESTS" ]; then
  echo -e "${YELLOW}7️⃣ Running tests...${NC}"
  if ! npm test --silent; then
    echo -e "${RED}❌ ERROR: Tests failed${NC}"
    echo "   Fix failing tests before committing"
    exit 1
  fi
  echo -e "${GREEN}✅ Tests passed${NC}"
else
  echo -e "${YELLOW}7️⃣ Tests skipped (set RUN_TESTS=1 to enable)${NC}"
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All pre-commit checks passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit 0
