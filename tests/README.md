# Tests Directory

This directory contains all automated tests for the WhatsApp Shopping Chatbot.

## Structure

```
tests/
├── README.md              # This file
├── setup.js               # Global Jest configuration
├── unit/                  # Unit tests (73 tests)
│   ├── SessionManager.test.js
│   ├── handlers/
│   │   └── CustomerHandler.test.js
│   └── services/
│       ├── OrderService.test.js
│       ├── WishlistService.test.js
│       ├── PromoService.test.js
│       └── ProductService.test.js
├── integration/           # Integration tests (Week 2)
└── e2e/                  # End-to-end tests (Week 3)
```

## Quick Start

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode (auto-rerun)
npm test -- --watch
```

## Current Status

✅ **73/73 Unit Tests Passing (100%)**
- SessionManager: 11 tests
- CustomerHandler: 12 tests
- OrderService: 12 tests
- WishlistService: 14 tests
- PromoService: 21 tests
- ProductService: 3 tests

## Documentation

- **Complete Guide:** [docs/TESTING_GUIDE.md](../docs/TESTING_GUIDE.md)
- **Test Specs:** [docs/TEST_SPECIFICATIONS.md](../docs/TEST_SPECIFICATIONS.md)
- **Quick Reference:** [docs/TESTING_QUICK_REFERENCE.md](../docs/TESTING_QUICK_REFERENCE.md)

## Writing Tests

See [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for:
- Test templates
- Best practices
- Common patterns
- Troubleshooting

## Running Specific Tests

```bash
# Run one test file
npx jest SessionManager

# Run tests matching pattern
npx jest -t "cart"

# Run tests in specific directory
npx jest tests/unit/services/
```

## Before Committing

Always run tests to ensure nothing breaks:

```bash
npm test
```

All 73 tests must pass! ✅

---

**Last Updated:** November 5, 2025  
**Next Milestone:** Week 2 Integration Tests
