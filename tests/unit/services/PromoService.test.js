/**
 * PromoService Unit Tests
 *
 * Tests promo code management and validation
 * Best practices from Node.js Testing Best Practices:
 * - Mock file system operations with jest.mock('fs')
 * - Test validation logic in isolation
 * - Verify discount calculations
 * - Test expiry and usage limits
 * - Clean mocks after each test
 */

const PromoService = require("../../../src/services/promo/PromoService");
const fs = require("fs");

// Mock fs module
jest.mock("fs");

describe("PromoService", () => {
  let promoService;
  let mockPromos;
  let mockUsage;

  beforeEach(() => {
    // Setup mock data
    mockPromos = [
      {
        code: "WELCOME10",
        discountPercent: 10,
        expiryDate: Date.now() + 86400000, // 24 hours from now
        maxUses: 100,
        currentUses: 5,
        createdAt: Date.now() - 86400000,
        isActive: true,
      },
      {
        code: "EXPIRED",
        discountPercent: 20,
        expiryDate: Date.now() - 86400000, // Expired yesterday
        maxUses: 50,
        currentUses: 10,
        createdAt: Date.now() - 172800000,
        isActive: true,
      },
      {
        code: "INACTIVE",
        discountPercent: 15,
        expiryDate: Date.now() + 86400000,
        maxUses: 50,
        currentUses: 5,
        createdAt: Date.now() - 172800000,
        isActive: false, // Inactive
      },
    ];

    mockUsage = {
      "628123456789@c.us": ["WELCOME10", "SUMMER20"],
    };

    // Mock fs methods
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();
    fs.writeFileSync = jest.fn();
    fs.readFileSync = jest.fn().mockImplementation((filePath) => {
      if (filePath.includes("promos.json")) {
        return JSON.stringify(mockPromos);
      } else if (filePath.includes("promo_usage.json")) {
        return JSON.stringify(mockUsage);
      }
      return "[]";
    });

    promoService = new PromoService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPromo", () => {
    test("When creating new promo, Then should add to promos list", () => {
      // Arrange
      const code = "NEWYEAR25";
      const discountPercent = 25;
      const expiryDays = 30;
      const maxUses = 200;

      // Act
      const result = promoService.createPromo(
        code,
        discountPercent,
        expiryDays,
        maxUses
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.promo.code).toBe("NEWYEAR25");
      expect(result.promo.discountPercent).toBe(25);
      expect(result.promo.maxUses).toBe(200);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("promos.json"),
        expect.any(String)
      );
    });

    test("When creating duplicate promo code, Then should return error", () => {
      // Arrange
      const code = "WELCOME10"; // Already exists
      const discountPercent = 15;
      const expiryDays = 30;
      const maxUses = 50;

      // Act
      const result = promoService.createPromo(
        code,
        discountPercent,
        expiryDays,
        maxUses
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("sudah ada");
    });

    test("When code is too short, Then should return error", () => {
      // Arrange
      const code = "AB"; // Only 2 characters
      const discountPercent = 10;
      const expiryDays = 30;

      // Act
      const result = promoService.createPromo(code, discountPercent, expiryDays);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("minimal 3 karakter");
    });

    test("When discount is invalid, Then should return error", () => {
      // Arrange
      const code = "INVALID";
      const discountPercent = 150; // > 100
      const expiryDays = 30;

      // Act
      const result = promoService.createPromo(code, discountPercent, expiryDays);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("antara 1-100%");
    });

    test("When expiry days is invalid, Then should return error", () => {
      // Arrange
      const code = "INVALID";
      const discountPercent = 10;
      const expiryDays = 0; // Less than 1

      // Act
      const result = promoService.createPromo(code, discountPercent, expiryDays);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("minimal 1 hari");
    });
  });

  describe("validatePromo", () => {
    test("When promo is valid and not expired, Then should return valid status", () => {
      // Arrange
      const code = "WELCOME10";
      const customerId = "628999999999@c.us"; // New customer

      // Act
      const result = promoService.validatePromo(code, customerId);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.discountPercent).toBe(10);
      expect(result.message).toContain("valid");
    });

    test("When promo code does not exist, Then should return invalid", () => {
      // Arrange
      const code = "INVALID";
      const customerId = "628123456789@c.us";

      // Act
      const result = promoService.validatePromo(code, customerId);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain("tidak ditemukan");
    });

    test("When promo is expired, Then should return invalid", () => {
      // Arrange
      const code = "EXPIRED";
      const customerId = "628999999999@c.us"; // New customer

      // Act
      const result = promoService.validatePromo(code, customerId);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain("kadaluarsa");
    });

    test("When promo is inactive, Then should return invalid", () => {
      // Arrange
      const code = "INACTIVE";
      const customerId = "628999999999@c.us";

      // Act
      const result = promoService.validatePromo(code, customerId);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain("tidak aktif");
    });

    test("When promo max uses reached, Then should return invalid", () => {
      // Arrange
      const code = "WELCOME10";
      const customerId = "628999999999@c.us";

      // Set currentUses to maxUses
      mockPromos[0].currentUses = 100;
      mockPromos[0].maxUses = 100;

      // Act
      const result = promoService.validatePromo(code, customerId);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain("batas maksimum");
    });

    test("When customer already used promo, Then should return invalid", () => {
      // Arrange
      const code = "WELCOME10";
      const customerId = "628123456789@c.us"; // Customer already used WELCOME10

      // Act
      const result = promoService.validatePromo(code, customerId);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain("sudah menggunakan");
    });
  });

  describe("applyPromo", () => {
    test("When applying valid promo, Then should update usage and return success", () => {
      // Arrange
      const code = "WELCOME10";
      const customerId = "628999999999@c.us"; // New customer

      // Act
      const result = promoService.applyPromo(code, customerId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("berhasil diterapkan");
      expect(result.discountPercent).toBe(10);
      expect(fs.writeFileSync).toHaveBeenCalled(); // Usage recorded
    });

    test("When applying invalid promo, Then should return error", () => {
      // Arrange
      const code = "INVALID";
      const customerId = "628123456789@c.us";

      // Act
      const result = promoService.applyPromo(code, customerId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak ditemukan");
    });

    test("When applying already used promo, Then should return error", () => {
      // Arrange
      const code = "WELCOME10";
      const customerId = "628123456789@c.us"; // Already used this promo

      // Act
      const result = promoService.applyPromo(code, customerId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("sudah menggunakan");
    });

    test("When applying expired promo, Then should return error", () => {
      // Arrange
      const code = "EXPIRED";
      const customerId = "628999999999@c.us";

      // Act
      const result = promoService.applyPromo(code, customerId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("kadaluarsa");
    });
  });

  describe("deletePromo", () => {
    test("When deleting existing promo, Then should remove from list", () => {
      // Arrange
      const code = "WELCOME10";

      // Act
      const result = promoService.deletePromo(code);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("dihapus");
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test("When deleting non-existent promo, Then should return error", () => {
      // Arrange
      const code = "NONEXISTENT";

      // Act
      const result = promoService.deletePromo(code);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak ditemukan");
    });
  });



  describe("getCustomerUsage", () => {
    test("When customer has used promos, Then should return usage array", () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act
      const result = promoService.getCustomerUsage(customerId);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain("WELCOME10");
      expect(result).toContain("SUMMER20");
    });

    test("When customer has no promo usage, Then should return empty array", () => {
      // Arrange
      const customerId = "628999999999@c.us"; // New customer

      // Act
      const result = promoService.getCustomerUsage(customerId);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });

  describe("deactivatePromo", () => {
    test("When deactivating existing promo, Then should set isActive to false", () => {
      // Arrange
      const code = "WELCOME10";

      // Act
      const result = promoService.deactivatePromo(code);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("dinonaktifkan");
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test("When deactivating non-existent promo, Then should return error", () => {
      // Arrange
      const code = "INVALID";

      // Act
      const result = promoService.deactivatePromo(code);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak ditemukan");
    });
  });
});
