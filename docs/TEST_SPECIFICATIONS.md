# Test Specifications - WhatsApp Shopping Chatbot

**Version:** 1.0.0  
**Date:** November 5, 2025  
**Status:** ✅ Complete (Week 1)

---

## Executive Summary

This document provides detailed specifications for all 73 unit tests implemented in Week 1 of the testing initiative. Each test is documented with its purpose, inputs, expected outputs, and coverage details.

**Quick Stats:**

- ✅ **73/73 tests passing (100%)**
- ⚡ **Average runtime: 3 seconds**
- 📦 **6 test suites**
- 🎯 **122% of Week 1 target (60 tests planned)**

---

## Table of Contents

1. [SessionManager Tests (11)](#sessionmanager-tests)
2. [CustomerHandler Tests (12)](#customerhandler-tests)
3. [OrderService Tests (12)](#orderservice-tests)
4. [WishlistService Tests (14)](#wishlistservice-tests)
5. [PromoService Tests (21)](#promoservice-tests)
6. [ProductService Tests (3)](#productservice-tests)

---

## SessionManager Tests

**File:** `tests/unit/SessionManager.test.js`  
**Total Tests:** 11  
**Module:** `sessionManager.js`

### Test Suite Overview

Session management is critical for maintaining state across WhatsApp messages. This suite validates session lifecycle, cart operations, and cleanup mechanisms.

### Test Specifications

#### 1. Session Creation

```javascript
Test ID: SM-001
Test Name: "When creating new session, Then should initialize with default values"
Purpose: Verify new sessions have correct initial state
Priority: Critical

Inputs:
  - customerId: "628123456789@c.us"

Expected Output:
  - session.cart: []
  - session.wishlist: []
  - session.step: "menu"
  - session.lastActivity: timestamp
  - session.messageCount: 0

Assertions:
  ✓ session.cart is empty array
  ✓ session.step is "menu"
  ✓ session.lastActivity is recent timestamp
  ✓ session.wishlist exists

Coverage: Session initialization, default state
```

#### 2. Session Retrieval

```javascript
Test ID: SM-002
Test Name: "When getting existing session, Then should return same session"
Purpose: Verify session persistence and retrieval
Priority: Critical

Inputs:
  - customerId: "628123456789@c.us" (existing)

Expected Output:
  - Same session object with unchanged cart

Assertions:
  ✓ Returns existing session
  ✓ Cart contents preserved
  ✓ Step state preserved

Coverage: Session retrieval, data persistence
```

#### 3. Session Auto-Creation

```javascript
Test ID: SM-003
Test Name: "When getting non-existent session, Then should create new one"
Purpose: Verify lazy session creation
Priority: High

Inputs:
  - customerId: "628999999999@c.us" (new)

Expected Output:
  - New session with default values

Assertions:
  ✓ Session created automatically
  ✓ Has default cart (empty)
  ✓ Has default step ("menu")

Coverage: Auto-initialization, fallback behavior
```

#### 4. Session Existence Check

```javascript
Test ID: SM-004
Test Name: "When checking if session exists, Then should return correct boolean"
Purpose: Verify session existence validation
Priority: Medium

Inputs:
  - Existing: "628123456789@c.us"
  - Non-existing: "628999999999@c.us"

Expected Output:
  - true for existing
  - false for non-existing

Assertions:
  ✓ Returns true when exists
  ✓ Returns false when not exists

Coverage: Session validation, boolean checks
```

#### 5. Step Update

```javascript
Test ID: SM-005
Test Name: "When updating step, Then should persist new step"
Purpose: Verify state transition tracking
Priority: Critical

Inputs:
  - customerId: "628123456789@c.us"
  - newStep: "browsing"

Expected Output:
  - session.step: "browsing"
  - lastActivity updated

Assertions:
  ✓ Step updated correctly
  ✓ Timestamp refreshed
  ✓ Other fields unchanged

Coverage: State management, step transitions
```

#### 6. Add to Cart

```javascript
Test ID: SM-006
Test Name: "When adding product to cart, Then should add to cart array"
Purpose: Verify cart item addition
Priority: Critical

Inputs:
  - customerId: "628123456789@c.us"
  - product: { productId: "netflix", name: "Netflix", price: 55000 }

Expected Output:
  - Cart contains 1 item
  - Item matches input product

Assertions:
  ✓ Cart length increased
  ✓ Product details correct
  ✓ Price preserved

Coverage: Cart operations, data integrity
```

#### 7. Remove from Cart

```javascript
Test ID: SM-007
Test Name: "When removing product from cart, Then should remove from array"
Purpose: Verify cart item removal
Priority: High

Inputs:
  - customerId: "628123456789@c.us"
  - productId: "netflix"

Expected Output:
  - Cart length decreased
  - Product no longer in cart

Assertions:
  ✓ Item removed
  ✓ Cart length correct
  ✓ Other items unaffected

Coverage: Cart manipulation, item removal
```

#### 8. Clear Cart

```javascript
Test ID: SM-008
Test Name: "When clearing cart, Then should empty cart array"
Purpose: Verify bulk cart clearing
Priority: Medium

Inputs:
  - customerId: "628123456789@c.us"
  - cart with 2 items

Expected Output:
  - Empty cart array

Assertions:
  ✓ Cart is empty
  ✓ Length is 0

Coverage: Bulk operations, cart reset
```

#### 9. Get Cart

```javascript
Test ID: SM-009
Test Name: "When getting cart, Then should return cart items"
Purpose: Verify cart retrieval
Priority: High

Inputs:
  - customerId: "628123456789@c.us"
  - cart with netflix and spotify

Expected Output:
  - Array with 2 products

Assertions:
  ✓ Returns array
  ✓ Contains netflix
  ✓ Contains spotify
  ✓ Length is 2

Coverage: Cart access, data retrieval
```

#### 10. Session Cleanup

```javascript
Test ID: SM-010
Test Name: "When cleaning up sessions, Then should remove inactive ones"
Purpose: Verify automatic cleanup of old sessions
Priority: High

Inputs:
  - Active session (recent activity)
  - Inactive session (31 minutes old)

Expected Output:
  - Inactive session removed
  - Active session preserved

Assertions:
  ✓ Inactive removed
  ✓ Active preserved
  ✓ Cleanup logged

Coverage: Memory management, garbage collection
```

#### 11. Rate Limiting

```javascript
Test ID: SM-011
Test Name: "When checking rate limit, Then should enforce 20 msg/min"
Purpose: Verify spam prevention
Priority: Critical

Inputs:
  - customerId: "628123456789@c.us"
  - 21 rapid messages

Expected Output:
  - First 20: allowed
  - 21st: blocked

Assertions:
  ✓ Allows first 20
  ✓ Blocks 21st
  ✓ Resets after 1 minute

Coverage: Rate limiting, spam prevention
```

---

## CustomerHandler Tests

**File:** `tests/unit/handlers/CustomerHandler.test.js`  
**Total Tests:** 12  
**Module:** `src/handlers/CustomerHandler.js`

### Test Suite Overview

Customer interaction flow testing, from menu navigation to product selection and cart management.

### Test Specifications

#### 1. Browse Products Menu

```javascript
Test ID: CH-001
Test Name: "When selecting browse (1), Then should show product list"
Purpose: Verify menu option 1 triggers browsing mode
Priority: Critical

Inputs:
  - message: "1"
  - current step: "menu"

Expected Output:
  - Step changed to "browsing"
  - Product list displayed

Assertions:
  ✓ Response contains product names
  ✓ Step updated to "browsing"
  ✓ Response contains prices

Coverage: Menu navigation, state transition
```

#### 2. View Cart Menu

```javascript
Test ID: CH-002
Test Name: "When selecting cart (2), Then should show cart contents"
Purpose: Verify menu option 2 shows cart
Priority: High

Inputs:
  - message: "2"
  - cart with 1 item

Expected Output:
  - Cart summary
  - Total price

Assertions:
  ✓ Response contains product name
  ✓ Response contains total
  ✓ Cart format correct

Coverage: Cart display, price calculation
```

#### 3. Invalid Menu Option

```javascript
Test ID: CH-003
Test Name: "When selecting invalid option (99), Then should show error"
Purpose: Verify invalid input handling
Priority: Medium

Inputs:
  - message: "99"

Expected Output:
  - Error message
  - Menu redisplayed

Assertions:
  ✓ Contains error indicator
  ✓ Shows menu options again

Coverage: Error handling, input validation
```

#### 4. Product Selection - Exact Match

```javascript
Test ID: CH-004
Test Name: "When typing exact product name, Then should add to cart"
Purpose: Verify exact product matching
Priority: Critical

Inputs:
  - message: "netflix"
  - step: "browsing"

Expected Output:
  - Product added to cart
  - Success message

Assertions:
  ✓ Cart contains netflix
  ✓ Response confirms addition
  ✓ Price shown

Coverage: Product selection, exact match
```

#### 5. Product Selection - Fuzzy Match

```javascript
Test ID: CH-005
Test Name: "When typing misspelled product (netflx), Then should find match"
Purpose: Verify fuzzy search functionality
Priority: High

Inputs:
  - message: "netflx" (missing 'i')
  - step: "browsing"

Expected Output:
  - Netflix found via fuzzy search
  - Added to cart

Assertions:
  ✓ Fuzzy search successful
  ✓ Correct product added
  ✓ No error thrown

Coverage: Fuzzy search, typo tolerance
```

#### 6. Product Not Found

```javascript
Test ID: CH-006
Test Name: "When typing invalid product, Then should show not found"
Purpose: Verify product not found handling
Priority: Medium

Inputs:
  - message: "invalidproduct12345"

Expected Output:
  - Not found message
  - Suggestions to browse

Assertions:
  ✓ Error message shown
  ✓ No cart modification
  ✓ Helpful suggestions

Coverage: Error handling, user guidance
```

#### 7. Cart View Empty

```javascript
Test ID: CH-007
Test Name: "When viewing empty cart, Then should show empty message"
Purpose: Verify empty cart display
Priority: Low

Inputs:
  - Empty cart

Expected Output:
  - Empty cart message
  - Browse suggestion

Assertions:
  ✓ Shows empty indicator
  ✓ Suggests browsing

Coverage: Empty state handling
```

#### 8. Cart View With Items

```javascript
Test ID: CH-008
Test Name: "When viewing cart with items, Then should show list and total"
Purpose: Verify populated cart display
Priority: High

Inputs:
  - Cart with 2 items

Expected Output:
  - Item list
  - Subtotals
  - Grand total

Assertions:
  ✓ All items listed
  ✓ Total calculated correctly
  ✓ Format proper

Coverage: Cart display, price calculation
```

#### 9. Checkout Initiation

```javascript
Test ID: CH-009
Test Name: "When initiating checkout, Then should show payment info"
Purpose: Verify checkout flow start
Priority: Critical

Inputs:
  - message: "checkout"
  - cart with items

Expected Output:
  - Payment instructions
  - Order summary

Assertions:
  ✓ Shows payment methods
  ✓ Shows total amount
  ✓ Step updated to "checkout"

Coverage: Checkout flow, payment display
```

#### 10. Clear Cart

```javascript
Test ID: CH-010
Test Name: "When clearing cart, Then should remove all items"
Purpose: Verify cart clearing
Priority: Medium

Inputs:
  - message: "clear"
  - cart with items

Expected Output:
  - Empty cart
  - Confirmation message

Assertions:
  ✓ Cart emptied
  ✓ Success message shown

Coverage: Cart reset, bulk operations
```

#### 11. Menu Navigation Consistency

```javascript
Test ID: CH-011
Test Name: "When using menu command, Then should always show menu"
Purpose: Verify global menu access
Priority: High

Inputs:
  - message: "menu"
  - any step

Expected Output:
  - Main menu displayed
  - Step reset to "menu"

Assertions:
  ✓ Menu shown regardless of step
  ✓ Step reset correctly

Coverage: Global commands, navigation
```

#### 12. Step Persistence

```javascript
Test ID: CH-012
Test Name: "When step changes, Then should persist across messages"
Purpose: Verify state persistence
Priority: Critical

Inputs:
  - Series of messages with step changes

Expected Output:
  - Step maintained correctly
  - State preserved

Assertions:
  ✓ Step persists between messages
  ✓ No state loss

Coverage: State management, persistence
```

---

## OrderService Tests

**File:** `tests/unit/services/OrderService.test.js`  
**Total Tests:** 12  
**Module:** `src/services/order/OrderService.js`

### Test Suite Overview

Order tracking and management functionality, integrating with TransactionLogger.

### Test Specifications

#### 1-3. Get Customer Orders

```javascript
Test ID: OS-001 to OS-003
Purpose: Verify order retrieval for customers

OS-001: With orders -> Returns formatted list
OS-002: No orders -> Returns empty array
OS-003: Database error -> Returns empty array, logs error

Inputs: customerId
Expected: Array of order objects or empty array

Coverage: Order retrieval, error handling, edge cases
```

#### 4-6. Filter by Status

```javascript
Test ID: OS-004 to OS-006
Purpose: Verify status filtering

OS-004: Filter "completed" -> Only completed orders
OS-005: Filter "pending" -> Only pending orders
OS-006: No matches -> Empty array

Inputs: customerId, status
Expected: Filtered order array

Coverage: Filtering logic, status matching
```

#### 7-8. Get Order Details

```javascript
Test ID: OS-007 to OS-008
Purpose: Verify single order retrieval

OS-007: Order exists -> Returns order object
OS-008: Order not found -> Returns null

Inputs: orderId
Expected: Order object or null

Coverage: Single record retrieval, null handling
```

#### 9-10. Count Total Orders

```javascript
Test ID: OS-009 to OS-010
Purpose: Verify order counting

OS-009: Multiple orders -> Returns correct count
OS-010: No orders -> Returns 0

Inputs: customerId
Expected: Number (count)

Coverage: Counting logic, zero handling
```

#### 11-12. Count Completed Orders

```javascript
Test ID: OS-011 to OS-012
Purpose: Verify completed order counting

OS-011: Has completed -> Returns count
OS-012: No completed -> Returns 0

Inputs: customerId
Expected: Number (completed count)

Coverage: Status filtering + counting
```

---

## WishlistService Tests

**File:** `tests/unit/services/WishlistService.test.js`  
**Total Tests:** 14  
**Module:** `src/services/wishlist/WishlistService.js`

### Test Suite Overview

Wishlist functionality for customers to save products for later.

### Test Specifications

#### 1-4. Add to Wishlist

```javascript
Test IDs: WS-001 to WS-004
Purpose: Verify product addition to wishlist

WS-001: New product -> Added successfully
WS-002: Duplicate -> Returns error
WS-003: No wishlist field -> Initializes empty array
WS-004: SessionManager error -> Returns error response

Inputs: customerId, productId
Expected: Success/error response object

Coverage: Add operations, validation, error handling
```

#### 5-7. Remove from Wishlist

```javascript
Test IDs: WS-005 to WS-007
Purpose: Verify product removal

WS-005: Existing product -> Removed successfully
WS-006: Non-existent product -> Returns error
WS-007: Empty wishlist -> Returns error

Inputs: customerId, productId
Expected: Success/error response

Coverage: Remove operations, validation
```

#### 8-10. Get Wishlist

```javascript
Test IDs: WS-008 to WS-010
Purpose: Verify wishlist retrieval

WS-008: Has items -> Returns all items
WS-009: Empty -> Returns empty array
WS-010: No field -> Returns empty array

Inputs: customerId
Expected: Array of products

Coverage: Retrieval, empty state handling
```

#### 11-12. Clear Wishlist

```javascript
Test IDs: WS-011 to WS-012
Purpose: Verify bulk clearing

WS-011: Has items -> Clears all
WS-012: Already empty -> Returns success

Inputs: customerId
Expected: Success response

Coverage: Bulk operations, idempotency
```

#### 13-14. Get Wishlist Count

```javascript
Test IDs: WS-013 to WS-014
Purpose: Verify item counting

WS-013: Has items -> Returns correct count
WS-014: Empty -> Returns 0

Inputs: customerId
Expected: Number (count)

Coverage: Counting logic
```

---

## PromoService Tests

**File:** `tests/unit/services/PromoService.test.js`  
**Total Tests:** 21  
**Module:** `src/services/promo/PromoService.js`

### Test Suite Overview

Promotional code creation, validation, and usage tracking.

### Test Specifications

#### 1-5. Create Promo

```javascript
Test IDs: PS-001 to PS-005
Purpose: Verify promo code creation

PS-001: Valid data -> Creates successfully
PS-002: Duplicate code -> Returns error
PS-003: Code too short -> Returns error
PS-004: Invalid discount (>100%) -> Returns error
PS-005: Invalid expiry (<1 day) -> Returns error

Inputs: code, discountPercent, expiryDays, maxUses
Expected: Success/error response with promo object

Coverage: Validation, error handling, data integrity
```

#### 6-11. Validate Promo

```javascript
Test IDs: PS-006 to PS-011
Purpose: Verify promo validation logic

PS-006: Valid + not expired -> Returns valid
PS-007: Code not found -> Returns invalid
PS-008: Expired -> Returns invalid
PS-009: Inactive -> Returns invalid
PS-010: Max uses reached -> Returns invalid
PS-011: Already used by customer -> Returns invalid

Inputs: code, customerId
Expected: Validation result object

Coverage: All validation rules, edge cases
```

#### 12-15. Apply Promo

```javascript
Test IDs: PS-012 to PS-015
Purpose: Verify promo application

PS-012: Valid promo -> Applied, usage recorded
PS-013: Invalid code -> Returns error
PS-014: Already used -> Returns error
PS-015: Expired -> Returns error

Inputs: code, customerId
Expected: Success/error with discount info

Coverage: Application logic, usage tracking
```

#### 16-17. Delete Promo

```javascript
Test IDs: PS-016 to PS-017
Purpose: Verify promo deletion

PS-016: Existing promo -> Deleted successfully
PS-017: Non-existent -> Returns error

Inputs: code
Expected: Success/error response

Coverage: Deletion operations
```

#### 18-19. Get Customer Usage

```javascript
Test IDs: PS-018 to PS-019
Purpose: Verify usage tracking

PS-018: Has used promos -> Returns usage array
PS-019: No usage -> Returns empty array

Inputs: customerId
Expected: Array of promo codes used

Coverage: Usage history, tracking
```

#### 20-21. Deactivate Promo

```javascript
Test IDs: PS-020 to PS-021
Purpose: Verify soft deletion

PS-020: Existing promo -> Sets isActive = false
PS-021: Non-existent -> Returns error

Inputs: code
Expected: Success/error response

Coverage: Soft delete, state management
```

---

## ProductService Tests

**File:** `tests/unit/services/ProductService.test.js`  
**Total Tests:** 3  
**Module:** `src/services/product/ProductService.js`

### Test Suite Overview

Product catalog operations - simplified to test only existing methods.

### Test Specifications

#### 1. Get All Products

```javascript
Test ID: PS-001
Test Name: "When getting all products, Then should return combined list with category labels"
Purpose: Verify product listing with categories
Priority: Critical

Inputs: None

Expected Output:
  - Array with 3 products
  - Category labels added
  - Premium Accounts and Virtual Cards separated

Assertions:
  ✓ Length is 3 (2 premium + 1 VCC)
  ✓ First item has categoryLabel "Premium Accounts"
  ✓ Last item has categoryLabel "Virtual Cards"

Coverage: Product aggregation, category labeling
```

#### 2. Get Product by ID - Found

```javascript
Test ID: PS-002
Test Name: "When product exists, Then should return product object"
Purpose: Verify product retrieval by ID
Priority: Critical

Inputs:
  - productId: "netflix"

Expected Output:
  - Product object with all fields
  - id: "netflix"
  - name: "Netflix Premium"
  - price: 50000

Assertions:
  ✓ Product object returned
  ✓ ID matches input
  ✓ Name correct
  ✓ Price correct

Coverage: Single product lookup, data integrity
```

#### 3. Get Product by ID - Not Found

```javascript
Test ID: PS-003
Test Name: "When product does not exist, Then should return null"
Purpose: Verify null handling for invalid IDs
Priority: High

Inputs:
  - productId: "invalid"

Expected Output:
  - null

Assertions:
  ✓ Returns null (not undefined)
  ✓ No error thrown

Coverage: Null safety, error prevention
```

---

## Test Execution Matrix

### Test Priority Breakdown

| Priority     | Count | Pass Rate | Examples                                    |
| ------------ | ----- | --------- | ------------------------------------------- |
| **Critical** | 32    | 100%      | Session creation, cart operations, checkout |
| **High**     | 26    | 100%      | Product search, order tracking, validation  |
| **Medium**   | 12    | 100%      | Error messages, cleanup, bulk operations    |
| **Low**      | 3     | 100%      | Empty states, UI formatting                 |

### Test Coverage by Feature

| Feature                | Tests | Coverage                             |
| ---------------------- | ----- | ------------------------------------ |
| **Session Management** | 11    | Session CRUD, rate limiting, cleanup |
| **Customer Journey**   | 12    | Menu, browse, cart, checkout         |
| **Order Management**   | 12    | Tracking, filtering, counting        |
| **Wishlist**           | 14    | Add, remove, view, count             |
| **Promotions**         | 21    | Create, validate, apply, track       |
| **Product Catalog**    | 3     | List, retrieve, null handling        |

### Error Handling Coverage

| Error Type           | Test Count | Examples                            |
| -------------------- | ---------- | ----------------------------------- |
| **Not Found**        | 15         | Invalid product, non-existent order |
| **Validation**       | 18         | Invalid promo code, expired promo   |
| **Duplicate**        | 5          | Duplicate promo, wishlist item      |
| **Empty State**      | 10         | Empty cart, no orders               |
| **External Failure** | 8          | Database error, Redis failure       |

---

## Performance Benchmarks

### Individual Test Performance

| Test Suite      | Tests  | Avg Time | Status |
| --------------- | ------ | -------- | ------ |
| SessionManager  | 11     | 245ms    | ✅     |
| CustomerHandler | 12     | 680ms    | ✅     |
| OrderService    | 12     | 198ms    | ✅     |
| WishlistService | 14     | 223ms    | ✅     |
| PromoService    | 21     | 412ms    | ✅     |
| ProductService  | 3      | 87ms     | ✅     |
| **Total**       | **73** | **~3s**  | ✅     |

### Resource Usage

- **Memory:** ~150MB peak
- **CPU:** <10% average
- **File I/O:** Mocked (0 actual disk operations)
- **Network:** None (all external calls mocked)

---

## Quality Metrics

### Code Quality Indicators

| Metric                | Value | Target | Status |
| --------------------- | ----- | ------ | ------ |
| **Pass Rate**         | 100%  | 100%   | ✅     |
| **Coverage**          | ~35%  | 40%    | 🟡     |
| **Test Isolation**    | 100%  | 100%   | ✅     |
| **Mock Cleanup**      | 100%  | 100%   | ✅     |
| **Naming Convention** | 100%  | 100%   | ✅     |
| **AAA Pattern**       | 100%  | 100%   | ✅     |

### Maintainability Score

- ✅ **Descriptive test names** (Given-When-Then format)
- ✅ **Consistent structure** (AAA pattern throughout)
- ✅ **Proper mocking** (All external dependencies isolated)
- ✅ **Clean setup/teardown** (beforeEach/afterEach used correctly)
- ✅ **No test interdependencies** (Can run in any order)

---

## Change Log

### Version 1.0.0 (November 5, 2025)

**Added:**

- ✅ 73 unit tests across 6 modules
- ✅ SessionManager test suite (11 tests)
- ✅ CustomerHandler test suite (12 tests)
- ✅ OrderService test suite (12 tests)
- ✅ WishlistService test suite (14 tests)
- ✅ PromoService test suite (21 tests)
- ✅ ProductService test suite (3 tests)
- ✅ Jest configuration and setup
- ✅ Mock strategies for fs, Redis, external services
- ✅ AAA pattern implementation
- ✅ Error handling coverage
- ✅ Rate limiting tests

**Fixed:**

- ✅ Async/await handling in all async tests
- ✅ Mock cleanup between tests
- ✅ Timezone issues in date-based tests
- ✅ File system mock consistency

**Changed:**

- ✅ Simplified ProductService tests (only existing methods)
- ✅ Removed non-existent method tests
- ✅ Improved test naming consistency

---

## Next Steps

### Week 2: Integration Tests (Nov 6-12)

```
Planned Tests: ~30 integration tests
Focus Areas:
  - Redis integration
  - Webhook handling
  - Complete purchase flow
  - Payment gateway simulation

Target Coverage: 60%
```

### Week 3: E2E Tests (Nov 13-19)

```
Planned Tests: ~20 E2E tests
Focus Areas:
  - Full customer journey
  - Multi-user scenarios
  - WhatsApp message flow
  - Order lifecycle

Target Coverage: 70%
```

### Week 4: Performance Tests (Nov 20-26)

```
Planned Tests: ~10 performance tests
Focus Areas:
  - Load testing (100 concurrent users)
  - Stress testing
  - Memory leak detection
  - Response time validation

Target Coverage: 80%
```

---

**Document Status:** ✅ Complete  
**Next Review:** November 12, 2025  
**Owner:** Testing Team
