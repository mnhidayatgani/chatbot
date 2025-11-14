# 🤖 GitHub Copilot Optimization Guide

## Konfigurasi Terbaik untuk AI Agent yang Powerful

### ✅ Sudah Dikonfigurasi

Berikut adalah konfigurasi optimal yang sudah diterapkan di workspace ini:

#### 1. **VS Code Settings** (`.vscode/settings.json`)

- ✅ Copilot enabled untuk semua file types
- ✅ Auto-completions enabled
- ✅ Locale override ke Bahasa Indonesia
- ✅ Project templates enabled
- ✅ Reference tracking enabled
- ✅ Editor suggestions optimized
- ✅ Format on save enabled
- ✅ ESLint auto-fix on save

#### 2. **Copilot Instructions** (`.github/copilot-instructions.md`)

- ✅ Architecture patterns documented
- ✅ File size limits specified (700 lines)
- ✅ CI/CD requirements listed
- ✅ Common patterns explained
- ✅ Testing strategy documented
- ✅ VPS optimization notes

#### 3. **Copilot Settings** (`.vscode/copilot-settings.json`)

- ✅ Code generation instructions (20 rules)
- ✅ Code review instructions (8 checks)
- ✅ Test generation instructions (7 patterns)
- ✅ Commit message conventions

#### 4. **Recommended Extensions** (`.vscode/extensions.json`)

- ✅ GitHub Copilot + Copilot Chat
- ✅ ESLint integration
- ✅ Jest test runner
- ✅ Code spell checker (EN + ID)
- ✅ TODO highlighter
- ✅ GitLens

## 🎯 Cara Maksimalkan Copilot di Repo Ini

### 1. **Gunakan Chat dengan Context-Aware Commands**

**Command Patterns:**

```
# Architecture questions
@workspace Bagaimana cara menambahkan command customer baru?
@workspace Jelaskan flow dari MessageRouter ke Handler

# Code generation
@workspace Buatkan handler baru untuk fitur promo code di CustomerHandler
@workspace Implementasikan rate limiting untuk admin commands

# Code review
@workspace Review kode ini, pastikan sesuai dengan pattern yang digunakan
@workspace Apakah file ini sudah sesuai dengan limit 700 lines?

# Testing
@workspace Buatkan unit test untuk WishlistService
@workspace Generate integration test untuk payment flow

# Documentation
@workspace Jelaskan cara kerja session state machine
@workspace Dokumentasikan API untuk AdminHandler
```

### 2. **Gunakan Inline Chat untuk Refactoring**

```javascript
// Select code block, then Cmd+I (Mac) or Ctrl+I (Windows)
// Example prompts:

"Refactor ini menggunakan dependency injection pattern";
"Ekstrak logic ini ke service terpisah";
"Tambahkan error handling sesuai pattern yang ada";
"Optimalkan memory usage untuk VPS 2GB RAM";
```

### 3. **Gunakan Slash Commands**

```
/explain - Jelaskan selected code
/fix - Fix bugs atau issues
/tests - Generate test cases
/doc - Generate documentation
/optimize - Optimize performance
```

### 4. **Referensi File Specific**

```
# Reference specific files in chat
#file:config.js Bagaimana cara menambahkan produk baru?
#file:MessageRouter.js Tambahkan route untuk command /promo
#file:CustomerHandler.js Implementasikan wishlist command
```

### 5. **Gunakan Workspace Context**

```
@workspace #file:docs/ARCHITECTURE.md Implementasikan pattern ini untuk fitur baru
@workspace Ikuti struktur yang ada di src/handlers/ untuk handler baru
@workspace Pastikan sesuai dengan test pattern di tests/unit/
```

## 🚀 Best Practices

### Before Implementing New Feature

1. **Check Documentation First**

   ```
   @workspace Cari dokumentasi tentang [feature topic]
   @workspace #file:docs/ARCHITECTURE.md Jelaskan pattern untuk [feature]
   ```

2. **Review Similar Code**

   ```
   @workspace Cari contoh implementasi similar di codebase
   @workspace #file:src/handlers/ Show me example handler implementation
   ```

3. **Plan Architecture**
   ```
   @workspace Suggest architecture untuk [new feature]
   @workspace Dimana file yang harus diubah untuk [feature]?
   ```

### During Implementation

1. **Use Copilot Inline Suggestions**

   - Type code comment describing what you want
   - Let Copilot generate implementation
   - Review and adjust

2. **Validate Against Rules**

   ```
   @workspace Review this code against copilot-instructions.md
   @workspace Check if this follows our architectural patterns
   ```

3. **Generate Tests Immediately**
   ```
   @workspace Generate unit tests for this function
   @workspace Create integration test for this flow
   ```

### Before Committing

1. **Pre-commit Validation**

   ```bash
   npm run precommit
   ```

2. **Get Commit Message**

   ```
   @workspace Generate conventional commit message for these changes
   ```

3. **Final Review**
   ```
   @workspace Review all changed files for:
   - File size limits
   - Hardcoded secrets
   - Missing tests
   - ESLint errors
   ```

## 🎓 Advanced Tips

### 1. Multi-File Context

```
@workspace Considering:
#file:src/handlers/CustomerHandler.js
#file:src/services/session/SessionService.js
#file:lib/uiMessages.js
Implement wishlist feature following existing patterns
```

### 2. Error Debugging

```
@workspace Based on error in terminal:
[paste error]
And files:
#file:src/handlers/AdminHandler.js
#file:lib/transactionLogger.js
Fix this issue
```

### 3. Performance Optimization

```
@workspace #file:index.js
Optimize memory usage for VPS with 2GB RAM
Keep Puppeteer args for VPS compatibility
```

### 4. Documentation Generation

```
@workspace Generate comprehensive JSDoc for:
#file:src/services/payment/PaymentService.js
Include examples and parameter descriptions
```

## 📊 Metrics to Track

### Code Quality Metrics

```bash
# Check before push
npm run deploy:check

# Coverage report
npm run test:coverage

# Lint report
npm run lint
```

### Copilot Effectiveness

- **Acceptance Rate**: Aim for >70% inline suggestion acceptance
- **Chat Success**: >80% chat queries resolved without iteration
- **Time Saved**: Track time for repetitive tasks
- **Bug Reduction**: Track bugs caught by Copilot review

## 🔧 Troubleshooting Copilot

### Issue: Copilot Suggestions Not Relevant

**Solution:**

1. Add more context in comments
2. Reference specific files with #file:
3. Use @workspace for broader context
4. Check if .copilot-instructions.md is loaded

### Issue: Copilot Ignores Project Patterns

**Solution:**

1. Explicitly reference: "Follow pattern in #file:src/handlers/BaseHandler.js"
2. Use: "@workspace How do we implement handlers in this project?"
3. Update `.vscode/copilot-settings.json` with new patterns

### Issue: Slow Copilot Responses

**Solution:**

1. Reduce workspace size: close unnecessary folders
2. Clear Copilot cache: Cmd+Shift+P → "Reload Window"
3. Disable in large files: Focus on smaller modules

## 🎯 Quick Reference Card

### Top 10 Commands untuk Repo Ini

1. `@workspace Jelaskan architecture pattern untuk [feature]`
2. `@workspace Buatkan handler baru mengikuti BaseHandler pattern`
3. `@workspace Generate tests untuk [service/handler]`
4. `@workspace Review kode sesuai copilot-instructions.md`
5. `@workspace Dimana file yang perlu diubah untuk [feature]?`
6. `@workspace Implementasikan [feature] sesuai pattern existing`
7. `@workspace Generate commit message untuk changes ini`
8. `@workspace Fix error: [error message]`
9. `@workspace Optimize memory usage untuk VPS 2GB`
10. `@workspace Document API untuk [module]`

### Top 5 Inline Prompts

1. `// TODO: Implement rate limiting following inputValidator pattern`
2. `// TODO: Add error handling like in other handlers`
3. `// TODO: Update session state following state machine pattern`
4. `// TODO: Log transaction using TransactionLogger`
5. `// TODO: Validate input before processing`

## 📚 Learning Path

### Week 1: Get Familiar

- ✅ Read `.github/copilot-instructions.md`
- ✅ Explore `docs/ARCHITECTURE.md`
- ✅ Try basic @workspace commands
- ✅ Generate simple tests

### Week 2: Intermediate

- ✅ Implement small feature with Copilot
- ✅ Use inline chat for refactoring
- ✅ Generate comprehensive tests
- ✅ Use multi-file context

### Week 3: Advanced

- ✅ Customize copilot-settings.json
- ✅ Create custom chat instructions
- ✅ Optimize workspace for faster Copilot
- ✅ Track and improve metrics

### Week 4: Master

- ✅ Contribute back to copilot-instructions.md
- ✅ Teach patterns to team
- ✅ Create custom slash commands
- ✅ Automate repetitive tasks

---

**Pro Tip:** Copilot learns from your patterns. The more you follow the documented patterns, the better Copilot gets at suggesting code that matches your project style! 🚀
