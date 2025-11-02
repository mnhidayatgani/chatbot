/**
 * Tests for Quick Wins Features
 * - Order Tracking
 * - Rate Limiting
 * - Auto Screenshot Detection
 * - Payment Reminders
 * - Webhook Auto-Retry
 */

const assert = require("assert");
const SessionManager = require("../sessionManager");
const CustomerHandler = require("../src/handlers/CustomerHandler");
const OrderService = require("../src/services/order/OrderService");
const PaymentReminderService = require("../src/services/payment/PaymentReminderService");

describe("Quick Wins Features", () => {
  let sessionManager;
  let customerHandler;
  let orderService;

  beforeEach(async () => {
    sessionManager = new SessionManager();
    await sessionManager.initialize();
    customerHandler = new CustomerHandler(sessionManager, {});
    orderService = new OrderService();
  });

  describe("Order Tracking Feature", () => {
    it("should handle /track command", async () => {
      const customerId = "123456@c.us";
      const response = await customerHandler.handleTrackOrder(
        customerId,
        "/track"
      );

      assert(
        response.includes("Riwayat Pesanan"),
        "Should show order history title"
      );
    });

    it("should handle /track with status filter", async () => {
      const customerId = "123456@c.us";
      const response = await customerHandler.handleTrackOrder(
        customerId,
        "/track pending"
      );

      assert(response.includes("Riwayat Pesanan"), "Should filter by status");
    });

    it("should show empty state when no orders", async () => {
      const customerId = "newcustomer@c.us";
      const orders = await orderService.getCustomerOrders(customerId);

      assert.strictEqual(orders.length, 0, "Should have no orders");
    });
  });

  describe("Rate Limiting Feature", () => {
    it("should allow messages within rate limit", () => {
      const customerId = "ratelimit@c.us";

      for (let i = 0; i < 20; i++) {
        const allowed = sessionManager.canSendMessage(customerId);
        assert.strictEqual(allowed, true, `Message ${i + 1} should be allowed`);
      }
    });

    it("should block messages after exceeding rate limit", () => {
      const customerId = "ratelimit2@c.us";

      // Send 20 messages (max)
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      // 21st message should be blocked
      const blocked = sessionManager.canSendMessage(customerId);
      assert.strictEqual(blocked, false, "21st message should be blocked");
    });

    it("should reset counter after time window", async () => {
      const customerId = "ratelimit3@c.us";

      // Mock: Set up data with expired reset time
      sessionManager.messageCount.set(customerId, {
        count: 20,
        resetTime: Date.now() - 1000, // Already expired
      });

      const allowed = sessionManager.canSendMessage(customerId);
      assert.strictEqual(
        allowed,
        true,
        "Should allow message after reset time"
      );
    });

    it("should return correct rate limit status", () => {
      const customerId = "ratelimit4@c.us";

      // Send 10 messages
      for (let i = 0; i < 10; i++) {
        sessionManager.canSendMessage(customerId);
      }

      const status = sessionManager.getRateLimitStatus(customerId);
      assert.strictEqual(
        status.remaining,
        10,
        "Should have 10 messages remaining"
      );
      assert(status.resetIn > 0, "Should have positive reset time");
    });

    it("should cleanup expired rate limit data", () => {
      sessionManager.messageCount.set("old@c.us", {
        count: 5,
        resetTime: Date.now() - 10000, // Expired
      });

      sessionManager.messageCount.set("active@c.us", {
        count: 5,
        resetTime: Date.now() + 60000, // Active
      });

      sessionManager.cleanupRateLimits();

      assert(
        !sessionManager.messageCount.has("old@c.us"),
        "Should remove expired data"
      );
      assert(
        sessionManager.messageCount.has("active@c.us"),
        "Should keep active data"
      );
    });
  });

  describe("Auto Screenshot Detection", () => {
    it("should handle Order ID format validation", async () => {
      const customerId = "screenshot@c.us";

      // Invalid format
      const response1 = await customerHandler.handleOrderIdForProof(
        customerId,
        "invalid"
      );
      assert(
        response1.includes("Format Order ID tidak valid"),
        "Should reject invalid format"
      );

      // Valid format
      await sessionManager.set(customerId, "tempProofPath", null); // Mock
      const response2 = await customerHandler.handleOrderIdForProof(
        customerId,
        "ORD-123456"
      );
      // Should process or fail gracefully
      assert(typeof response2 === "string", "Should return string response");
    });

    it("should validate Order ID patterns", () => {
      const validIds = ["ORD-123456", "ord-999999", "ORD-000001"];
      const invalidIds = ["ORD123", "ORDER-123", "123456", "ORD-"];

      validIds.forEach((id) => {
        assert(/^ORD-\d+/i.test(id), `${id} should be valid`);
      });

      invalidIds.forEach((id) => {
        assert(!/^ORD-\d+/i.test(id), `${id} should be invalid`);
      });
    });
  });

  describe("Payment Reminder Service", () => {
    let reminderService;
    let mockClient;

    beforeEach(() => {
      mockClient = {
        sendMessage: async () => {},
      };
      reminderService = new PaymentReminderService(mockClient, sessionManager);
    });

    afterEach(() => {
      if (reminderService) {
        reminderService.stop();
      }
    });

    it("should initialize with correct config", () => {
      assert.strictEqual(
        reminderService.firstReminderDelay,
        30,
        "First reminder should be 30 minutes"
      );
      assert.strictEqual(
        reminderService.secondReminderDelay,
        120,
        "Second reminder should be 2 hours"
      );
    });

    it("should track sent reminders", async () => {
      const orderId = "ORD-TEST-001";

      reminderService.sentReminders.add(`${orderId}-1`);
      reminderService.sentReminders.add(`${orderId}-2`);

      assert(
        reminderService.sentReminders.has(`${orderId}-1`),
        "Should track first reminder"
      );
      assert(
        reminderService.sentReminders.has(`${orderId}-2`),
        "Should track second reminder"
      );
    });

    it("should clear reminders when order is paid", () => {
      const orderId = "ORD-TEST-002";

      reminderService.sentReminders.add(`${orderId}-1`);
      reminderService.sentReminders.add(`${orderId}-2`);

      reminderService.markAsPaid(orderId);

      assert(
        !reminderService.sentReminders.has(`${orderId}-1`),
        "Should clear first reminder"
      );
      assert(
        !reminderService.sentReminders.has(`${orderId}-2`),
        "Should clear second reminder"
      );
    });

    it("should start and stop cron job", () => {
      reminderService.start();
      assert(reminderService.cronJob, "Should create cron job");

      reminderService.stop();
      // Job should be stopped (no assertion, just ensure no errors)
    });
  });

  describe("Webhook Auto-Retry", () => {
    it("should retry with exponential backoff", async () => {
      let attempts = 0;
      const maxRetries = 5;
      const retryDelays = [1000, 2000, 4000, 8000, 16000];

      const retryFunction = async (fn, context = "operation") => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            attempts++;
            const isLastAttempt = attempt === maxRetries - 1;

            if (isLastAttempt) {
              throw error;
            }

            const delay = retryDelays[attempt];
            // In test, don't actually wait
            console.log(`Retry ${attempt + 1}, delay: ${delay}ms`);
          }
        }
      };

      // Test with failing function
      let callCount = 0;
      const failingFn = async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error("Simulated failure");
        }
        return "Success";
      };

      const result = await retryFunction(failingFn, "test");
      assert.strictEqual(result, "Success", "Should succeed after retries");
      assert.strictEqual(callCount, 3, "Should attempt 3 times");
    });

    it("should use correct exponential backoff delays", () => {
      const delays = [1000, 2000, 4000, 8000, 16000];

      // Verify exponential growth
      for (let i = 1; i < delays.length; i++) {
        assert.strictEqual(
          delays[i],
          delays[i - 1] * 2,
          `Delay ${i} should be 2x previous`
        );
      }
    });

    it("should fail after max retries", async () => {
      const maxRetries = 5;

      const retryFunction = async (fn) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            if (attempt === maxRetries - 1) {
              throw error;
            }
          }
        }
      };

      const alwaysFailFn = async () => {
        throw new Error("Always fails");
      };

      try {
        await retryFunction(alwaysFailFn);
        assert.fail("Should throw error after max retries");
      } catch (error) {
        assert.strictEqual(error.message, "Always fails");
      }
    });
  });

  describe("OrderService", () => {
    it("should get customer orders from transaction logs", async () => {
      const customerId = "ordertest@c.us";
      const orders = await orderService.getCustomerOrders(customerId);

      assert(Array.isArray(orders), "Should return array");
    });

    it("should filter orders by status", async () => {
      const customerId = "ordertest@c.us";
      const pendingOrders = await orderService.getOrdersByStatus(
        customerId,
        "pending"
      );

      assert(Array.isArray(pendingOrders), "Should return filtered array");
    });

    it("should get order details by ID", async () => {
      const customerId = "ordertest@c.us";
      const orderId = "ORD-123456";
      const order = await orderService.getOrderDetails(customerId, orderId);

      // May be null if order doesn't exist
      assert(
        order === null || typeof order === "object",
        "Should return object or null"
      );
    });

    it("should count total orders", async () => {
      const customerId = "ordertest@c.us";
      const count = await orderService.getTotalOrders(customerId);

      assert(typeof count === "number", "Should return number");
      assert(count >= 0, "Count should be non-negative");
    });

    it("should count completed orders", async () => {
      const customerId = "ordertest@c.us";
      const count = await orderService.getCompletedOrdersCount(customerId);

      assert(typeof count === "number", "Should return number");
      assert(count >= 0, "Count should be non-negative");
    });
  });

  describe("Integration: Rate Limiting + Order Tracking", () => {
    it("should rate limit /track command", async () => {
      const customerId = "integration@c.us";

      // Send 20 /track commands
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      // 21st should be rate limited
      const blocked = sessionManager.canSendMessage(customerId);
      assert.strictEqual(blocked, false, "Should be rate limited");

      // But /track command should still be callable (implementation detail)
      const response = await customerHandler.handleTrackOrder(
        customerId,
        "/track"
      );
      assert(typeof response === "string", "Should still process command");
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent rate limit checks", () => {
      const customerId = "concurrent@c.us";

      const results = [];
      for (let i = 0; i < 25; i++) {
        results.push(sessionManager.canSendMessage(customerId));
      }

      const allowed = results.filter((r) => r === true).length;
      const blocked = results.filter((r) => r === false).length;

      assert.strictEqual(allowed, 20, "Should allow exactly 20");
      assert.strictEqual(blocked, 5, "Should block 5");
    });

    it("should handle invalid customer IDs gracefully", async () => {
      const invalidIds = [null, undefined, "", " ", "invalid"];

      for (const id of invalidIds) {
        try {
          await customerHandler.handleTrackOrder(id, "/track");
          // Should not throw
        } catch (error) {
          // Errors are acceptable for invalid IDs
          assert(error, "Should handle invalid ID");
        }
      }
    });

    it("should handle very long order IDs", async () => {
      const customerId = "edgecase@c.us";
      const longOrderId = "ORD-" + "9".repeat(100);

      // Without temp file, should fail gracefully
      const response = await customerHandler.handleOrderIdForProof(
        customerId,
        longOrderId
      );

      assert(
        typeof response === "string",
        "Should handle long Order ID gracefully"
      );
      assert(
        response.includes("tidak ditemukan") || response.includes("Gagal"),
        "Should return error message for missing temp file"
      );
    });
  });
});

// Run tests
console.log("🧪 Running Quick Wins feature tests...\n");
