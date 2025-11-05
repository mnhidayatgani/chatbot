# Testing Quick Reference Card

**Last Updated:** November 5, 2025  
**Quick Start:** `npm test` → See results in ~3 seconds

---

## 🚀 Quick Commands

```bash
# Basic
npm test                    # Run all tests
npm run test:unit          # Run only unit tests
npm test -- --watch        # Auto-rerun on changes

# Coverage
npm run test:coverage      # Generate coverage report
open coverage/lcov-report/index.html  # View report

# Specific Tests
npx jest SessionManager    # Run one suite
npx jest -t "cart"         # Run tests matching "cart"
npx jest tests/unit/services/  # Run all service tests

# Debugging
npm test -- --verbose      # Detailed output
node --inspect-brk node_modules/.bin/jest --runInBand  # Debug mode
```

---

## 📊 Current Status

```
✅ 73/73 Tests Passing (100%)
✅ 6 Test Suites
⚡ ~3s Runtime
📈 ~35% Coverage
```

---

## 📁 Test Files

```
tests/
├── setup.js                          # Global config
├── unit/
│   ├── SessionManager.test.js        # 11 tests
│   ├── handlers/
│   │   └── CustomerHandler.test.js   # 12 tests
│   └── services/
│       ├── OrderService.test.js      # 12 tests
│       ├── WishlistService.test.js   # 14 tests
│       ├── PromoService.test.js      # 21 tests
│       └── ProductService.test.js    # 3 tests
```

---

## ✍️ Writing New Tests

### Template

```javascript
describe("ComponentName", () => {
  let component;

  beforeEach(() => {
    // Setup
    component = new ComponentName();
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  test("When [condition], Then should [result]", () => {
    // Arrange
    const input = "test";

    // Act
    const result = component.method(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### Common Patterns

```javascript
// Async test
test("Async operation", async () => {
  await expect(asyncFn()).resolves.toBe("result");
});

// Mock function
const mockFn = jest.fn().mockReturnValue("result");

// Mock module
jest.mock("fs");
fs.readFileSync = jest.fn().mockReturnValue("data");

// Check function called
expect(mockFn).toHaveBeenCalledWith("arg");

// Array checks
expect(array).toHaveLength(2);
expect(array).toContain("item");

// Object checks
expect(obj).toHaveProperty("key");
expect(obj).toEqual({ key: "value" });
```

---

## 🔍 Test Examples by Component

### SessionManager

```javascript
// Create session
const session = sessionManager.createSession("628123@c.us");
expect(session.cart).toEqual([]);

// Add to cart
sessionManager.addToCart("628123@c.us", product);
expect(cart).toHaveLength(1);

// Rate limiting
const allowed = sessionManager.canSendMessage("628123@c.us");
expect(allowed).toBe(true);
```

### CustomerHandler

```javascript
// Menu selection
const response = await handler.handleMenuSelection("628123@c.us", "1");
expect(response).toContain("Katalog Produk");

// Product selection
const result = await handler.handleProductSelection("628123@c.us", "netflix");
expect(result).toContain("ditambahkan ke keranjang");
```

### OrderService

```javascript
// Get orders
const orders = await orderService.getCustomerOrders("628123@c.us");
expect(orders).toHaveLength(2);

// Filter by status
const completed = await orderService.getOrdersByStatus(
  "628123@c.us",
  "completed"
);
expect(completed.every((o) => o.status === "completed")).toBe(true);
```

### WishlistService

```javascript
// Add to wishlist
const result = await wishlistService.addProduct("628123@c.us", "netflix");
expect(result.success).toBe(true);

// Get wishlist
const items = await wishlistService.getWishlist("628123@c.us");
expect(items).toContain("netflix");
```

### PromoService

```javascript
// Create promo
const result = promoService.createPromo("SAVE10", 10, 30, 100);
expect(result.success).toBe(true);

// Validate promo
const validation = promoService.validatePromo("SAVE10", "628123@c.us");
expect(validation.valid).toBe(true);
```

### ProductService

```javascript
// Get all products
const products = productService.getAllProducts();
expect(products).toHaveLength(3);

// Get by ID
const product = productService.getProductById("netflix");
expect(product.name).toBe("Netflix Premium");
```

---

## 🐛 Troubleshooting

### Tests Timeout

```javascript
// Increase timeout
jest.setTimeout(30000);

// Or per test
test("slow test", async () => {
  // ...
}, 60000);
```

### Mock Not Working

```javascript
// ❌ Wrong order
const Component = require("./component");
jest.mock("./dependency");

// ✅ Correct order
jest.mock("./dependency");
const Component = require("./component");
```

### Async Not Awaiting

```javascript
// ❌ Missing await
test("async test", () => {
  const result = asyncFn(); // Promise, not value!
});

// ✅ Proper await
test("async test", async () => {
  const result = await asyncFn();
});
```

### Cache Issues

```bash
# Clear Jest cache
npx jest --clearCache

# Then rerun
npm test
```

---

## 🎯 Best Practices

### ✅ DO

- Use AAA pattern (Arrange-Act-Assert)
- Write descriptive test names: "When X, Then Y"
- Mock external dependencies
- Clean up mocks in `afterEach()`
- Test both success and error cases
- Keep tests isolated (no shared state)
- Run tests before committing

### ❌ DON'T

- Share state between tests
- Test implementation details
- Mock everything (only externals)
- Forget to await async operations
- Use real databases/file system
- Write vague test names
- Commit failing tests

---

## 📚 Documentation Links

- **Full Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Test Specs:** [TEST_SPECIFICATIONS.md](./TEST_SPECIFICATIONS.md)
- **Week 1 Summary:** [WEEK1_TESTING_SUMMARY.md](./WEEK1_TESTING_SUMMARY.md)

---

## 🔧 Configuration

### jest.config.js

```javascript
module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/config/**"],
};
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🎓 Testing Philosophy

1. **Test Behavior, Not Implementation**

   - Focus on what the code does, not how
   - Tests should survive refactoring

2. **One Assertion Per Test**

   - Each test validates one thing
   - Makes failures easy to debug

3. **Arrange-Act-Assert**

   - Clear structure in every test
   - Easy to read and maintain

4. **Mock External Dependencies**

   - Tests run fast (no I/O)
   - Tests are reliable (no network)

5. **Descriptive Names**
   - Test name tells you what failed
   - "When X happens, Then Y result"

---

## 📈 Coverage Goals

| Week | Target | Status     | Focus       |
| ---- | ------ | ---------- | ----------- |
| 1    | 40%    | ✅ ~35%    | Unit tests  |
| 2    | 60%    | 🔄 Planned | Integration |
| 3    | 70%    | ⏳ Future  | E2E         |
| 4    | 80%    | ⏳ Future  | Performance |

---

## ⚡ Performance Tips

```bash
# Skip coverage for faster tests
npm test -- --no-coverage

# Run only changed tests
npm test -- --onlyChanged

# Run in band (sequential, for debugging)
npm test -- --runInBand

# Silent mode (no console.log)
npm test -- --silent
```

---

## 🆘 Need Help?

1. **Check docs:** Start with [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. **Look at examples:** See existing test files
3. **Ask team:** Create GitHub issue
4. **Debug:** Use `--verbose` flag

---

**Quick Start Checklist:**

```bash
✅ npm install           # Install dependencies
✅ npm test              # Run all tests
✅ Check output          # All should pass
✅ Read TESTING_GUIDE.md # Learn the system
✅ Write a test          # Practice
✅ Run again             # Verify it works
```

---

**Remember:** Always run tests before committing! 🚀
