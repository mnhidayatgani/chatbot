const SessionManager = require("../../sessionManager");

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};

describe("SessionManager", () => {
  let sessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  afterEach(() => {
    // Cleanup sessions after each test
    sessionManager.sessions.clear();
    sessionManager.messageCount.clear();
  });

  describe("getSession", () => {
    test("When customer has no session, Then should create new session", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act
      const session = await sessionManager.getSession(customerId);

      // Assert
      expect(session).toBeDefined();
      expect(session.customerId).toBe(customerId);
      expect(session.step).toBe("menu");
      expect(session.cart).toEqual([]);
      expect(session.wishlist).toEqual([]);
    });

    test("When customer has existing session, Then should return same instance", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act
      const session1 = await sessionManager.getSession(customerId);
      const session2 = await sessionManager.getSession(customerId);

      // Assert
      expect(session1).toBe(session2);
    });

    test("When different customers, Then should have isolated sessions", async () => {
      // Arrange
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";

      // Act
      const session1 = await sessionManager.getSession(customer1);
      const session2 = await sessionManager.getSession(customer2);

      // Assert
      expect(session1).not.toBe(session2);
      expect(session1.customerId).toBe(customer1);
      expect(session2.customerId).toBe(customer2);
    });
  });

  describe("setStep", () => {
    test("When setting new step, Then should update session step", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      // Act
      await sessionManager.setStep(customerId, "browsing");

      // Assert
      const session = await sessionManager.getSession(customerId);
      expect(session.step).toBe("browsing");
    });

    test("When setting step, Then should update lastActivity timestamp", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);
      const oldActivity = session.lastActivity;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      await sessionManager.setStep(customerId, "checkout");

      // Assert
      const newSession = await sessionManager.getSession(customerId);
      expect(newSession.lastActivity).toBeGreaterThanOrEqual(oldActivity);
    });
  });

  describe("Rate Limiting", () => {
    test("When under rate limit, Then should allow messages", () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const results = [];

      // Act: Send 25 messages
      for (let i = 0; i < 25; i++) {
        results.push(sessionManager.canSendMessage(customerId));
      }

      // Assert: First 20 allowed, rest blocked
      expect(results.slice(0, 20).every((r) => r === true)).toBe(true);
      expect(results.slice(20).every((r) => r === false)).toBe(true);
    });

    test("When rate limit exceeded, Then should block messages", () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act: Hit rate limit
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      // Try one more (21st)
      const blocked = sessionManager.canSendMessage(customerId);

      // Assert
      expect(blocked).toBe(false);
    });

    test("When rate limit window resets, Then should allow messages again", () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Hit rate limit
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      // Should be blocked
      expect(sessionManager.canSendMessage(customerId)).toBe(false);

      // Act: Manually reset (simulating 60s passing)
      sessionManager.messageCount.delete(customerId);

      // Assert: Should allow again
      const result = sessionManager.canSendMessage(customerId);
      expect(result).toBe(true);
    });
  });

  describe("cleanupSessions", () => {
    test("When session is active, Then should NOT be cleaned up", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      // Act
      sessionManager.cleanupSessions();

      // Assert
      const session = sessionManager.sessions.get(customerId);
      expect(session).toBeDefined();
    });

    test("When session is inactive for 30+ minutes, Then should be cleaned up", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);

      // Set session lastActivity to 31 minutes ago
      session.lastActivity = Date.now() - 31 * 60 * 1000;

      // Act
      sessionManager.cleanupSessions();

      // Assert
      const sessionAfter = sessionManager.sessions.get(customerId);
      expect(sessionAfter).toBeUndefined();
    });

    test("When multiple sessions with mixed activity, Then should cleanup only inactive", async () => {
      // Arrange
      const activeCustomer = "628111111111@c.us";
      const inactiveCustomer = "628222222222@c.us";

      // Create sessions
      const activeSession = await sessionManager.getSession(activeCustomer);
      const inactiveSession = await sessionManager.getSession(inactiveCustomer);

      // Set times
      inactiveSession.lastActivity = Date.now() - 31 * 60 * 1000; // 31 min ago
      activeSession.lastActivity = Date.now() - 5 * 60 * 1000; // 5 min ago

      // Act
      sessionManager.cleanupSessions();

      // Assert
      const activeSessionCheck = sessionManager.sessions.get(activeCustomer);
      const inactiveSessionCheck =
        sessionManager.sessions.get(inactiveCustomer);
      expect(activeSessionCheck).toBeDefined();
      expect(inactiveSessionCheck).toBeUndefined();
    });
  });

  describe("Cart Operations", () => {
    test("should add product to cart", async () => {
      const customerId = "628123456789@c.us";
      const product = { id: "netflix", name: "Netflix Premium", price: 50000 };

      await sessionManager.addToCart(customerId, product);
      const cart = await sessionManager.getCart(customerId);

      expect(cart).toHaveLength(1);
      expect(cart[0]).toEqual(product);
    });

    test("should add multiple products to cart", async () => {
      const customerId = "628123456789@c.us";
      const product1 = { id: "netflix", name: "Netflix", price: 50000 };
      const product2 = { id: "spotify", name: "Spotify", price: 30000 };

      await sessionManager.addToCart(customerId, product1);
      await sessionManager.addToCart(customerId, product2);
      const cart = await sessionManager.getCart(customerId);

      expect(cart).toHaveLength(2);
      expect(cart[0]).toEqual(product1);
      expect(cart[1]).toEqual(product2);
    });

    test("should clear entire cart", async () => {
      const customerId = "628123456789@c.us";
      const product = { id: "netflix", name: "Netflix", price: 50000 };

      await sessionManager.addToCart(customerId, product);
      await sessionManager.clearCart(customerId);
      const cart = await sessionManager.getCart(customerId);

      expect(cart).toEqual([]);
    });

    test("should return empty cart for new customer", async () => {
      const customerId = "628123456789@c.us";
      const cart = await sessionManager.getCart(customerId);

      expect(cart).toEqual([]);
    });
  });

  describe("Order Operations", () => {
    test("should set and get order ID", async () => {
      const customerId = "628123456789@c.us";
      const orderId = "ORD-123456";

      await sessionManager.setOrderId(customerId, orderId);
      const retrievedOrderId = await sessionManager.getOrderId(customerId);

      expect(retrievedOrderId).toBe(orderId);
    });

    test("should find customer by order ID", async () => {
      const customerId = "628123456789@c.us";
      const orderId = "ORD-123456";

      await sessionManager.setOrderId(customerId, orderId);
      const foundCustomerId = await sessionManager.findCustomerByOrderId(orderId);

      expect(foundCustomerId).toBe(customerId);
    });

    test("should return null for non-existent order ID", async () => {
      const foundCustomerId = await sessionManager.findCustomerByOrderId("ORD-NONEXIST");

      expect(foundCustomerId).toBeNull();
    });

    test("should find correct customer when multiple orders exist", async () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";
      const orderId1 = "ORD-111";
      const orderId2 = "ORD-222";

      await sessionManager.setOrderId(customer1, orderId1);
      await sessionManager.setOrderId(customer2, orderId2);

      const found1 = await sessionManager.findCustomerByOrderId(orderId1);
      const found2 = await sessionManager.findCustomerByOrderId(orderId2);

      expect(found1).toBe(customer1);
      expect(found2).toBe(customer2);
    });
  });

  describe("QRIS Invoice Operations", () => {
    test("should set and get QRIS invoice data", async () => {
      const customerId = "628123456789@c.us";
      const invoiceId = "INV-123";
      const amount = 50000;
      const date = "2025-11-05";

      await sessionManager.setQRISInvoice(customerId, invoiceId, amount, date);
      const invoice = await sessionManager.getQRISInvoice(customerId);

      expect(invoice.invoiceId).toBe(invoiceId);
      expect(invoice.amount).toBe(amount);
      expect(invoice.date).toBe(date);
    });

    test("should return null QRIS data for new session", async () => {
      const customerId = "628123456789@c.us";
      const invoice = await sessionManager.getQRISInvoice(customerId);

      expect(invoice.invoiceId).toBeNull();
      expect(invoice.amount).toBe(0);
      expect(invoice.date).toBeNull();
    });
  });

  describe("Payment Operations", () => {
    test("should set and get payment proof path", async () => {
      const customerId = "628123456789@c.us";
      const filePath = "/payment_proofs/proof-123.jpg";

      await sessionManager.setPaymentProof(customerId, filePath);
      const retrievedPath = await sessionManager.getPaymentProof(customerId);

      expect(retrievedPath).toBe(filePath);
    });

    test("should set and get payment method", async () => {
      const customerId = "628123456789@c.us";
      const method = "QRIS";
      const invoiceId = "INV-QRIS-123";

      await sessionManager.setPaymentMethod(customerId, method, invoiceId);
      const payment = await sessionManager.getPaymentMethod(customerId);

      expect(payment.method).toBe(method);
      expect(payment.invoiceId).toBe(invoiceId);
    });

    test("should handle different payment methods", async () => {
      const customerId = "628123456789@c.us";
      const methods = ["QRIS", "OVO", "DANA", "GOPAY", "SHOPEEPAY", "VA"];

      for (const method of methods) {
        await sessionManager.setPaymentMethod(customerId, method, `INV-${method}`);
        const payment = await sessionManager.getPaymentMethod(customerId);
        expect(payment.method).toBe(method);
      }
    });
  });

  describe("Generic Set/Get Operations", () => {
    test("should set and get arbitrary property", async () => {
      const customerId = "628123456789@c.us";

      await sessionManager.set(customerId, "customField", "customValue");
      const value = await sessionManager.get(customerId, "customField");

      expect(value).toBe("customValue");
    });

    test("should handle different data types", async () => {
      const customerId = "628123456789@c.us";

      await sessionManager.set(customerId, "stringField", "hello");
      await sessionManager.set(customerId, "numberField", 42);
      await sessionManager.set(customerId, "boolField", true);
      await sessionManager.set(customerId, "objectField", { key: "value" });
      await sessionManager.set(customerId, "arrayField", [1, 2, 3]);

      expect(await sessionManager.get(customerId, "stringField")).toBe("hello");
      expect(await sessionManager.get(customerId, "numberField")).toBe(42);
      expect(await sessionManager.get(customerId, "boolField")).toBe(true);
      expect(await sessionManager.get(customerId, "objectField")).toEqual({ key: "value" });
      expect(await sessionManager.get(customerId, "arrayField")).toEqual([1, 2, 3]);
    });

    test("should overwrite existing property", async () => {
      const customerId = "628123456789@c.us";

      await sessionManager.set(customerId, "field", "value1");
      await sessionManager.set(customerId, "field", "value2");
      const value = await sessionManager.get(customerId, "field");

      expect(value).toBe("value2");
    });
  });

  describe("Rate Limit Status", () => {
    test("should return correct remaining quota", () => {
      const customerId = "628123456789@c.us";

      // Send 5 messages
      for (let i = 0; i < 5; i++) {
        sessionManager.canSendMessage(customerId);
      }

      const status = sessionManager.getRateLimitStatus(customerId);

      expect(status.remaining).toBe(15); // 20 - 5 = 15
      expect(status.resetIn).toBeGreaterThan(0);
      expect(status.resetIn).toBeLessThanOrEqual(60000); // 60 seconds
    });

    test("should show zero remaining when limit hit", () => {
      const customerId = "628123456789@c.us";

      // Hit limit (20 messages)
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      const status = sessionManager.getRateLimitStatus(customerId);

      expect(status.remaining).toBe(0);
    });

    test("should reset status for new customer", () => {
      const customerId = "628123456789@c.us";
      const status = sessionManager.getRateLimitStatus(customerId);

      expect(status.remaining).toBe(20);
      expect(status.resetIn).toBe(60000);
    });
  });

  describe("Rate Limit Cleanup", () => {
    test("should cleanup expired rate limit data", () => {
      const customerId = "628123456789@c.us";

      // Create rate limit entry
      sessionManager.canSendMessage(customerId);

      // Manually expire it
      const data = sessionManager.messageCount.get(customerId);
      data.resetTime = Date.now() - 1000; // 1 second ago

      // Cleanup
      sessionManager.cleanupRateLimits();

      // Should be removed
      expect(sessionManager.messageCount.has(customerId)).toBe(false);
    });

    test("should keep active rate limit data", () => {
      const customerId = "628123456789@c.us";

      sessionManager.canSendMessage(customerId);
      sessionManager.cleanupRateLimits();

      expect(sessionManager.messageCount.has(customerId)).toBe(true);
    });

    test("should cleanup multiple expired entries", () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";
      const customer3 = "628333333333@c.us";

      // Create entries
      sessionManager.canSendMessage(customer1);
      sessionManager.canSendMessage(customer2);
      sessionManager.canSendMessage(customer3);

      // Expire first two
      const data1 = sessionManager.messageCount.get(customer1);
      const data2 = sessionManager.messageCount.get(customer2);
      data1.resetTime = Date.now() - 1000;
      data2.resetTime = Date.now() - 1000;

      // Cleanup
      sessionManager.cleanupRateLimits();

      expect(sessionManager.messageCount.has(customer1)).toBe(false);
      expect(sessionManager.messageCount.has(customer2)).toBe(false);
      expect(sessionManager.messageCount.has(customer3)).toBe(true);
    });
  });

  describe("Session Isolation", () => {
    test("should isolate cart between customers", async () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";
      const product1 = { id: "netflix", name: "Netflix", price: 50000 };
      const product2 = { id: "spotify", name: "Spotify", price: 30000 };

      await sessionManager.addToCart(customer1, product1);
      await sessionManager.addToCart(customer2, product2);

      const cart1 = await sessionManager.getCart(customer1);
      const cart2 = await sessionManager.getCart(customer2);

      expect(cart1).toHaveLength(1);
      expect(cart1[0]).toEqual(product1);
      expect(cart2).toHaveLength(1);
      expect(cart2[0]).toEqual(product2);
    });

    test("should isolate step between customers", async () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";

      await sessionManager.setStep(customer1, "browsing");
      await sessionManager.setStep(customer2, "checkout");

      const step1 = await sessionManager.getStep(customer1);
      const step2 = await sessionManager.getStep(customer2);

      expect(step1).toBe("browsing");
      expect(step2).toBe("checkout");
    });

    test("should isolate rate limiting between customers", () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";

      // Hit rate limit for customer1
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customer1);
      }

      // Customer1 should be blocked
      expect(sessionManager.canSendMessage(customer1)).toBe(false);

      // Customer2 should still be allowed
      expect(sessionManager.canSendMessage(customer2)).toBe(true);
    });
  });

  describe("getActiveSessionCount", () => {
    test("should return 0 for no sessions", async () => {
      const count = await sessionManager.getActiveSessionCount();
      expect(count).toBe(0);
    });

    test("should return correct count for multiple sessions", async () => {
      await sessionManager.getSession("628111111111@c.us");
      await sessionManager.getSession("628222222222@c.us");
      await sessionManager.getSession("628333333333@c.us");

      const count = await sessionManager.getActiveSessionCount();
      expect(count).toBe(3);
    });

    test("should update count after cleanup", async () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";

      const session1 = await sessionManager.getSession(customer1);
      await sessionManager.getSession(customer2);

      // Expire first session
      session1.lastActivity = Date.now() - 31 * 60 * 1000;
      sessionManager.cleanupSessions();

      const count = await sessionManager.getActiveSessionCount();
      expect(count).toBe(1);
    });
  });

  describe("getAllCustomerIds", () => {
    test("should return empty array when no sessions", async () => {
      const ids = await sessionManager.getAllCustomerIds();
      expect(ids).toEqual([]);
    });

    test("should return all customer IDs", async () => {
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";
      const customer3 = "628333333333@c.us";

      await sessionManager.getSession(customer1);
      await sessionManager.getSession(customer2);
      await sessionManager.getSession(customer3);

      const ids = await sessionManager.getAllCustomerIds();

      expect(ids).toHaveLength(3);
      expect(ids).toContain(customer1);
      expect(ids).toContain(customer2);
      expect(ids).toContain(customer3);
    });

    test("should not return duplicates", async () => {
      const customerId = "628123456789@c.us";

      await sessionManager.getSession(customerId);
      await sessionManager.getSession(customerId); // Get again

      const ids = await sessionManager.getAllCustomerIds();

      expect(ids).toHaveLength(1);
      expect(ids[0]).toBe(customerId);
    });
  });

  describe("Session Key Generation", () => {
    test("should generate correct Redis key format", () => {
      const customerId = "628123456789@c.us";
      const key = sessionManager._getSessionKey(customerId);

      expect(key).toBe("session:628123456789@c.us");
    });

    test("should handle different customer ID formats", () => {
      const ids = [
        "628123456789@c.us",
        "1234567890@c.us",
        "user@s.whatsapp.net"
      ];

      ids.forEach(id => {
        const key = sessionManager._getSessionKey(id);
        expect(key).toBe(`session:${id}`);
      });
    });
  });

  describe("Session Initialization", () => {
    test("should create session with all required fields", async () => {
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);

      expect(session).toHaveProperty("customerId");
      expect(session).toHaveProperty("cart");
      expect(session).toHaveProperty("wishlist");
      expect(session).toHaveProperty("promoCode");
      expect(session).toHaveProperty("discountPercent");
      expect(session).toHaveProperty("step");
      expect(session).toHaveProperty("orderId");
      expect(session).toHaveProperty("qrisInvoiceId");
      expect(session).toHaveProperty("qrisAmount");
      expect(session).toHaveProperty("qrisDate");
      expect(session).toHaveProperty("paymentProofPath");
      expect(session).toHaveProperty("paymentMethod");
      expect(session).toHaveProperty("paymentInvoiceId");
      expect(session).toHaveProperty("lastActivity");
    });

    test("should initialize session with correct default values", async () => {
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);

      expect(session.customerId).toBe(customerId);
      expect(session.cart).toEqual([]);
      expect(session.wishlist).toEqual([]);
      expect(session.promoCode).toBeNull();
      expect(session.discountPercent).toBe(0);
      expect(session.step).toBe("menu");
      expect(session.orderId).toBeNull();
      expect(session.qrisInvoiceId).toBeNull();
      expect(session.qrisAmount).toBe(0);
      expect(session.qrisDate).toBeNull();
      expect(session.paymentProofPath).toBeNull();
      expect(session.paymentMethod).toBeNull();
      expect(session.paymentInvoiceId).toBeNull();
      expect(session.lastActivity).toBeGreaterThan(0);
    });

    test("should set lastActivity to current timestamp", async () => {
      const before = Date.now();
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);
      const after = Date.now();

      expect(session.lastActivity).toBeGreaterThanOrEqual(before);
      expect(session.lastActivity).toBeLessThanOrEqual(after);
    });
  });
});
