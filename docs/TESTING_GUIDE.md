# Testing Guide - WhatsApp Shopping Chatbot

**Last Updated:** November 5, 2025  
**Coverage:** 73 Unit Tests (100% Passing)  
**Framework:** Jest 29.7.0

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Test Coverage](#test-coverage)
6. [Writing New Tests](#writing-new-tests)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This testing suite provides comprehensive coverage for the WhatsApp Shopping Chatbot, ensuring reliability and maintainability. Tests are organized by component type (handlers, services, core modules) following industry best practices.

### Testing Philosophy

- **100% Pass Rate:** All tests must pass before deployment
- **Isolated Tests:** Each test is independent and can run in any order
- **Real-World Scenarios:** Tests simulate actual user interactions
- **AAA Pattern:** Arrange-Act-Assert for clarity
- **Mock External Dependencies:** No real Redis, file system, or network calls

### Current Status

```
✅ 73/73 Tests Passing (100%)
✅ 6/6 Test Suites Passing
⚡ Avg Runtime: ~3 seconds
📊 Test Distribution:
   - Unit Tests: 73 (100%)
   - Integration Tests: 0 (planned Week 2)
   - E2E Tests: 0 (planned Week 3)
```

---

## Setup

### Prerequisites

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### Installation

```bash
# Install dependencies
npm install

# Install testing dependencies (if not already installed)
npm install --save-dev jest @types/jest
```

### Configuration

Test configuration is in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

Jest configuration in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js", "!src/config/**", "!**/node_modules/**"],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
};
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run with coverage report
npm run test:coverage

# Run in watch mode (auto-rerun on file changes)
npm run test:watch

# Run verbose output
npm run test:verbose

# Run specific test file
npx jest tests/unit/SessionManager.test.js

# Run specific test suite
npx jest --testNamePattern="SessionManager"

# Run tests matching pattern
npx jest --testPathPattern="services"
```

### Advanced Usage

```bash
# Run failed tests only
npx jest --onlyFailures

# Update snapshots
npx jest --updateSnapshot

# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Clear Jest cache
npx jest --clearCache

# Run tests without coverage overhead
npx jest --no-coverage
```

---

## Test Structure

### Directory Layout

```
tests/
├── setup.js                    # Global test setup
├── unit/                       # Unit tests
│   ├── SessionManager.test.js  # 11 tests - Session management
│   ├── handlers/
│   │   └── CustomerHandler.test.js  # 12 tests - Customer interactions
│   └── services/
│       ├── OrderService.test.js     # 12 tests - Order operations
│       ├── WishlistService.test.js  # 14 tests - Wishlist features
│       ├── PromoService.test.js     # 21 tests - Promo codes
│       └── ProductService.test.js   # 3 tests - Product catalog
├── integration/                # Integration tests (planned)
└── e2e/                       # End-to-end tests (planned)
```

### Test File Naming

- Unit tests: `*.test.js` (e.g., `SessionManager.test.js`)
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

---

## Test Coverage

### Coverage by Component

| Component           | Tests | Status | Coverage                             |
| ------------------- | ----- | ------ | ------------------------------------ |
| **SessionManager**  | 11/11 | ✅     | Session CRUD, cleanup, rate limiting |
| **CustomerHandler** | 12/12 | ✅     | Menu, browsing, cart, checkout       |
| **OrderService**    | 12/12 | ✅     | Order tracking, history, filtering   |
| **WishlistService** | 14/14 | ✅     | Add, remove, view, clear wishlist    |
| **PromoService**    | 21/21 | ✅     | Create, validate, apply promos       |
| **ProductService**  | 3/3   | ✅     | Product catalog, retrieval           |

### Detailed Test Breakdown

#### 1. SessionManager (11 tests)

**Purpose:** Validates session lifecycle and state management

```javascript
✅ Session Creation & Retrieval
   - createSession(): Creates new session with default state
   - getSession(): Retrieves existing session or creates new one
   - sessionExists(): Checks if session exists

✅ Session Updates
   - setStep(): Updates customer journey step
   - updateSession(): Modifies session data

✅ Cart Operations
   - addToCart(): Adds products to cart
   - removeFromCart(): Removes products from cart
   - clearCart(): Empties entire cart
   - getCart(): Retrieves cart contents

✅ Cleanup & Maintenance
   - cleanupSessions(): Removes inactive sessions (30min timeout)

✅ Rate Limiting
   - canSendMessage(): Enforces 20 messages/minute limit
```

**Key Features:**

- In-memory session storage (Map-based)
- Automatic timestamp updates
- 30-minute inactivity timeout
- Rate limiting to prevent spam
- Cart state persistence

#### 2. CustomerHandler (12 tests)

**Purpose:** Tests customer interaction flows

```javascript
✅ Menu Navigation
   - handleMenuSelection("1"): Browse products
   - handleMenuSelection("2"): View cart
   - handleMenuSelection("99"): Invalid option handling

✅ Product Selection
   - handleProductSelection("netflix"): Exact match
   - handleProductSelection("netflx"): Fuzzy search
   - handleProductSelection("invalid"): Not found handling

✅ Cart Operations
   - handleCartView(): Display cart with total
   - handleCheckout(): Process checkout
   - handleClearCart(): Empty cart

✅ State Transitions
   - Menu → Browsing → Checkout
   - Step persistence across messages
```

**Key Features:**

- Fuzzy product search (typo-tolerant)
- Real-time cart updates
- Step-based message routing
- Error recovery

#### 3. OrderService (12 tests)

**Purpose:** Order management and tracking

```javascript
✅ Order Retrieval
   - getCustomerOrders(): List all orders
   - getOrdersByStatus("completed"): Filter by status
   - getOrderDetails(orderId): Single order details

✅ Order Analytics
   - getTotalOrders(): Count all orders
   - getCompletedOrdersCount(): Count completed only

✅ Error Handling
   - Database connection errors
   - Invalid order IDs
   - Empty result sets
```

**Key Features:**

- Transaction logger integration
- Order status filtering
- Error-resistant queries
- Formatted order display

#### 4. WishlistService (14 tests)

**Purpose:** Customer wishlist functionality

```javascript
✅ Add to Wishlist
   - addProduct(): Add new product
   - Duplicate prevention
   - Session initialization

✅ Remove from Wishlist
   - removeProduct(): Remove specific product
   - Non-existent product handling

✅ View & Count
   - getWishlist(): List all items
   - getWishlistCount(): Item count
   - Empty wishlist handling

✅ Bulk Operations
   - clearWishlist(): Remove all items
   - moveToCart(): Batch add to cart

✅ Error Scenarios
   - SessionManager errors
   - Redis connection failures
```

**Key Features:**

- Session-based storage
- Redis persistence (optional)
- Move to cart functionality
- Duplicate prevention

#### 5. PromoService (21 tests)

**Purpose:** Promotional code management

```javascript
✅ Promo Creation
   - createPromo(): Create new code
   - Validation (code format, discount %, expiry)
   - Duplicate prevention

✅ Promo Validation
   - validatePromo(): Check validity
   - Expiry checking
   - Usage limit enforcement
   - Per-customer usage tracking

✅ Promo Application
   - applyPromo(): Mark as used
   - Usage counter increment
   - Customer tracking

✅ Promo Management
   - deletePromo(): Remove code
   - getCustomerUsage(): Usage history
   - deactivatePromo(): Soft delete

✅ Error Handling
   - Invalid codes
   - Expired promos
   - Max uses reached
   - Already used by customer
```

**Key Features:**

- File-based storage (JSON)
- Expiry validation
- Usage tracking per customer
- Percentage-based discounts

#### 6. ProductService (3 tests)

**Purpose:** Product catalog operations

```javascript
✅ Product Retrieval
   - getAllProducts(): Combined list with category labels
   - getProductById(): Single product lookup
   - Null handling for non-existent products
```

**Key Features:**

- Mock product config
- Category labeling
- Null-safe operations

---

## Writing New Tests

### Test Template

```javascript
/**
 * [ComponentName] Unit Tests
 *
 * Purpose: [What this component does]
 * Best practices:
 * - [Specific practice 1]
 * - [Specific practice 2]
 */

const ComponentName = require("../../../src/path/to/ComponentName");

// Mock dependencies if needed
jest.mock("dependency-module");

describe("ComponentName", () => {
  let component;
  let mockDependency;

  beforeEach(() => {
    // Arrange: Setup fresh state before each test
    mockDependency = {
      method: jest.fn().mockReturnValue("expected"),
    };
    component = new ComponentName(mockDependency);
  });

  afterEach(() => {
    // Cleanup: Clear all mocks
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    test("When [condition], Then should [expected behavior]", () => {
      // Arrange
      const input = "test data";

      // Act
      const result = component.methodName(input);

      // Assert
      expect(result).toBe("expected output");
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });

    test("When [error condition], Then should handle gracefully", () => {
      // Arrange
      mockDependency.method.mockRejectedValue(new Error("Test error"));

      // Act & Assert
      expect(() => component.methodName()).not.toThrow();
    });
  });
});
```

### Test Naming Convention

Use Given-When-Then format:

```javascript
// ✅ Good
test("When product exists, Then should return product object", () => {});
test("When customer adds duplicate, Then should return error", () => {});

// ❌ Bad
test("test product", () => {});
test("it works", () => {});
```

### Common Patterns

#### 1. Testing Async Operations

```javascript
test("When fetching data, Then should return results", async () => {
  // Arrange
  const mockData = { id: 1, name: "Test" };
  mockService.getData = jest.fn().mockResolvedValue(mockData);

  // Act
  const result = await component.fetchData();

  // Assert
  expect(result).toEqual(mockData);
});
```

#### 2. Testing Error Handling

```javascript
test("When error occurs, Then should return error response", async () => {
  // Arrange
  const error = new Error("Database error");
  mockService.query.mockRejectedValue(error);

  // Act
  const result = await component.getData();

  // Assert
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

#### 3. Mocking File System

```javascript
const fs = require("fs");
jest.mock("fs");

beforeEach(() => {
  fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify({ data: "test" }));
  fs.writeFileSync = jest.fn();
});
```

#### 4. Mocking Time

```javascript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2025-11-05"));
});

afterEach(() => {
  jest.useRealTimers();
});
```

---

## Best Practices

### From nodejs-testing-best-practices (Trust Score 9.6)

#### 1. Mock Definition Location

```javascript
// ✅ Good: Mock in beforeEach for visibility
beforeEach(() => {
  mockService.method = jest.fn().mockReturnValue("result");
});

// ❌ Bad: Hidden mocks in separate file
```

#### 2. Mock Cleanup

```javascript
// ✅ Good: Clean between tests
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
```

#### 3. AAA Pattern

```javascript
test("Clear test structure", () => {
  // Arrange - Setup test data
  const input = "test";

  // Act - Execute the code
  const result = component.process(input);

  // Assert - Verify results
  expect(result).toBe("processed: test");
});
```

#### 4. Test Isolation

```javascript
// ✅ Good: Each test creates own data
test("Test A", () => {
  const session = sessionManager.createSession("user1");
  // Test logic
});

// ❌ Bad: Tests share state
let sharedSession;
beforeAll(() => {
  sharedSession = sessionManager.createSession("user1");
});
```

#### 5. Descriptive Test Names

```javascript
// ✅ Good: Clear, specific names
test("When cart is empty, Then should show empty cart message", () => {});

// ❌ Bad: Vague names
test("cart works", () => {});
```

### Project-Specific Guidelines

#### 1. Session Testing

```javascript
// Always use unique customer IDs
const customerId = `628${Date.now()}@c.us`;

// Clean up sessions after tests
afterEach(() => {
  sessionManager.deleteSession(customerId);
});
```

#### 2. Cart Testing

```javascript
// Use real product IDs from config
const productId = "netflix"; // ✅
const productId = "fake-product"; // ❌

// Verify cart state after operations
expect(session.cart).toHaveLength(1);
expect(session.cart[0].productId).toBe("netflix");
```

#### 3. Mock Data Consistency

```javascript
// Keep mock data realistic
const mockOrder = {
  orderId: "ORD-1730000000000-c.us",
  customerId: "628123456789@c.us",
  status: "completed",
  total: 55000,
  timestamp: Date.now(),
};
```

#### 4. Error Testing

```javascript
// Test both happy path and error cases
describe("getData", () => {
  test("When data exists, Then should return data", async () => {});
  test("When database error, Then should return error response", async () => {});
  test("When connection timeout, Then should handle gracefully", async () => {});
});
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Fail Locally But Pass in CI

**Cause:** Timezone differences, environment variables

**Solution:**

```javascript
// Use explicit timezones
process.env.TZ = "UTC";

// Mock Date consistently
jest.setSystemTime(new Date("2025-11-05T00:00:00Z"));
```

#### 2. Async Tests Timeout

**Cause:** Unresolved promises, missing await

**Solution:**

```javascript
// ✅ Use async/await
test("Async operation", async () => {
  await expect(asyncFunction()).resolves.toBe("result");
});

// ✅ Return promise
test("Promise operation", () => {
  return asyncFunction().then((result) => {
    expect(result).toBe("result");
  });
});
```

#### 3. Mock Not Working

**Cause:** Mock defined after import

**Solution:**

```javascript
// ✅ Mock before import
jest.mock("./module");
const Module = require("./module");

// ❌ Import before mock
const Module = require("./module");
jest.mock("./module");
```

#### 4. Memory Leaks in Tests

**Cause:** Event listeners, timers not cleaned up

**Solution:**

```javascript
afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
  // Remove event listeners
  emitter.removeAllListeners();
});
```

#### 5. Jest Cache Issues

**Cause:** Outdated cached transforms

**Solution:**

```bash
# Clear Jest cache
npx jest --clearCache

# Then re-run tests
npm test
```

### Debug Mode

```bash
# Run single test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/SessionManager.test.js

# Then open Chrome DevTools:
# chrome://inspect
```

### Verbose Output

```bash
# See all console.log outputs
npm test -- --verbose --no-coverage

# See only failing tests details
npm test -- --verbose | grep -A 10 "FAIL"
```

---

## Performance Tips

### 1. Skip Coverage for Faster Tests

```bash
npm test -- --no-coverage  # ~3s vs ~5s with coverage
```

### 2. Run Tests in Parallel

```bash
# Jest runs in parallel by default
# Disable for debugging:
npm test -- --runInBand
```

### 3. Run Only Changed Tests

```bash
# Watch mode (auto-run on file changes)
npm test -- --watch

# Only run tests related to changed files
npm test -- --onlyChanged
```

### 4. Filter Tests

```bash
# Run specific test file
npx jest SessionManager

# Run specific test suite
npx jest -t "SessionManager"

# Run matching pattern
npx jest --testPathPattern="services"
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Future Enhancements

### Week 2: Integration Tests (Nov 6-12)

```
✅ Redis mock integration
✅ Webhook server testing
✅ Complete purchase flow
✅ Payment gateway simulation
Target: 60% coverage
```

### Week 3: E2E Tests (Nov 13-19)

```
✅ Full customer journey
✅ Multi-user scenarios
✅ WhatsApp mock client
✅ GitHub Actions CI/CD
Target: 70% coverage
```

### Week 4: Performance & Final (Nov 20-26)

```
✅ Load testing (100 concurrent users)
✅ Stress testing
✅ Memory leak detection
✅ Final documentation
Target: 80% coverage
```

---

## Contributing

### Before Committing

```bash
# 1. Run all tests
npm test

# 2. Check coverage
npm run test:coverage

# 3. Lint code (if configured)
npm run lint

# 4. Ensure 100% pass rate
# All 73 tests must pass ✅
```

### Adding New Tests

1. **Create test file:** `tests/unit/[component]/ComponentName.test.js`
2. **Follow naming convention:** `When [condition], Then should [result]`
3. **Use AAA pattern:** Arrange-Act-Assert
4. **Mock dependencies:** Isolate component under test
5. **Clean up:** Use `afterEach()` to clear mocks
6. **Run tests:** Verify all pass before committing

---

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodejs-testing-best-practices)
- [WhatsApp Web.js Docs](https://wwebjs.dev/)

### Internal Docs

- [Architecture Overview](./ARCHITECTURE.md)
- [Modularization Guide](./MODULARIZATION.md)
- [Admin Commands](./ADMIN_COMMANDS.md)

### Contact

- **Project Lead:** [GitHub Issues](https://github.com/benihutapea/chatbot/issues)
- **Documentation:** [/docs](../docs/)

---

**Last Updated:** November 5, 2025  
**Next Review:** November 12, 2025 (Week 2 Integration Tests)
