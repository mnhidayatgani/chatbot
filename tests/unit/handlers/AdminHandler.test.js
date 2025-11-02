/**
 * Unit tests for AdminHandler
 */

const { expect } = require("chai");

// Mock dependencies
class MockSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  getSession(customerId) {
    if (!this.sessions.has(customerId)) {
      this.sessions.set(customerId, {
        customerId,
        step: "menu",
        cart: [],
        orders: [],
        lastActivity: Date.now(),
      });
    }
    return this.sessions.get(customerId);
  }

  setStep(customerId, step) {
    const session = this.getSession(customerId);
    session.step = step;
  }
}

describe("AdminHandler", () => {
  let adminHandler;
  let sessionManager;
  let mockPaymentHandlers;

  before(() => {
    // Set admin number for testing
    process.env.ADMIN_NUMBER_1 = "6281234567890";
    mockPaymentHandlers = {};
  });

  beforeEach(() => {
    sessionManager = new MockSessionManager();
    const AdminHandler = require("../../../src/handlers/AdminHandler");
    adminHandler = new AdminHandler(sessionManager, mockPaymentHandlers);
  });

  describe("isAdmin", () => {
    it("should return true for admin number", () => {
      const isAdmin = adminHandler.isAdmin("6281234567890@c.us");
      expect(isAdmin).to.be.true;
    });

    it("should return false for non-admin number", () => {
      const isAdmin = adminHandler.isAdmin("6289999999999@c.us");
      expect(isAdmin).to.be.false;
    });

    it("should handle null input", () => {
      const isAdmin = adminHandler.isAdmin(null);
      expect(isAdmin).to.be.false;
    });

    it("should handle undefined input", () => {
      const isAdmin = adminHandler.isAdmin(undefined);
      expect(isAdmin).to.be.false;
    });
  });

  describe("handle", () => {
    const adminId = "6281234567890@c.us";

    it("should reject non-admin users", async () => {
      const result = await adminHandler.handle(
        "6289999999999@c.us",
        "/stats",
        "menu"
      );
      expect(result).to.be.a("string");
      expect(result).to.include("tidak memiliki akses");
    });

    it("should handle /stats command", async () => {
      const result = await adminHandler.handle(adminId, "/stats", "menu");
      expect(result).to.be.a("string");
      expect(result).to.include("STATISTIK");
    });

    it("should handle /help command", async () => {
      const result = await adminHandler.handle(adminId, "/help", "menu");
      expect(result).to.be.a("string");
      expect(result).to.include("PERINTAH ADMIN");
    });

    it("should handle unknown command", async () => {
      const result = await adminHandler.handle(adminId, "/unknown", "menu");
      expect(result).to.be.a("string");
      expect(result).to.include("tidak dikenali");
    });

    it("should handle command without slash", async () => {
      const result = await adminHandler.handle(adminId, "stats", "menu");
      expect(result).to.be.a("string");
    });
  });

  describe("handleStats", () => {
    it("should return statistics", async () => {
      const adminId = "6281234567890@c.us";
      const result = await adminHandler.handleStats(adminId);
      expect(result).to.be.a("string");
      expect(result).to.include("STATISTIK");
    });

    it("should show active sessions count", async () => {
      const adminId = "6281234567890@c.us";
      // Add some mock sessions
      sessionManager.getSession("user1");
      sessionManager.getSession("user2");
      const result = await adminHandler.handleStats(adminId);
      expect(result).to.include("Sesi Aktif");
    });
  });

  describe("edge cases", () => {
    it("should handle null message", async () => {
      const adminId = "6281234567890@c.us";
      const result = await adminHandler.handle(adminId, null, "menu");
      expect(result).to.be.a("string");
    });

    it("should handle empty message", async () => {
      const adminId = "6281234567890@c.us";
      const result = await adminHandler.handle(adminId, "", "menu");
      expect(result).to.be.a("string");
    });

    it("should handle special characters", async () => {
      const adminId = "6281234567890@c.us";
      const result = await adminHandler.handle(
        adminId,
        "/<script>alert('xss')</script>",
        "menu"
      );
      expect(result).to.be.a("string");
    });

    it("should handle very long command", async () => {
      const adminId = "6281234567890@c.us";
      const longCommand = "/command" + "a".repeat(10000);
      const result = await adminHandler.handle(adminId, longCommand, "menu");
      expect(result).to.be.a("string");
    });
  });

  describe("error handling", () => {
    it("should handle errors gracefully", async () => {
      const adminId = "6281234567890@c.us";
      // Force an error by passing invalid data
      try {
        const result = await adminHandler.handle(adminId, "/stats", null);
        expect(result).to.be.a("string");
      } catch (error) {
        // Should not throw, should return error message
        expect.fail("Should handle errors gracefully");
      }
    });
  });
});
