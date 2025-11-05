/**
 * WishlistService Unit Tests
 *
 * Tests wishlist/favorites management
 * Best practices applied:
 * - Mock SessionManager dependency
 * - Isolate service logic from storage
 * - Test success and error scenarios
 * - Verify return value structures
 */

const WishlistService = require("../../../src/services/wishlist/WishlistService");

describe("WishlistService", () => {
  let wishlistService;
  let mockSessionManager;
  let mockSession;

  beforeEach(() => {
    // Arrange: Create mock session
    mockSession = {
      customerId: "628123456789@c.us",
      wishlist: [],
      cart: [],
    };

    // Mock SessionManager
    mockSessionManager = {
      getSession: jest.fn().mockResolvedValue(mockSession),
      _updateSession: jest.fn().mockResolvedValue(true),
    };

    wishlistService = new WishlistService(mockSessionManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addProduct", () => {
    test("When adding new product, Then should add to wishlist successfully", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const product = {
        id: "netflix",
        name: "Netflix Premium",
        price: 50000,
        description: "1 Month subscription",
      };

      // Act
      const result = await wishlistService.addProduct(customerId, product);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("ditambahkan ke wishlist");
      expect(result.wishlistCount).toBe(1);
      expect(mockSessionManager.getSession).toHaveBeenCalledWith(customerId);
      expect(mockSessionManager._updateSession).toHaveBeenCalledWith(
        customerId,
        expect.objectContaining({
          wishlist: expect.arrayContaining([
            expect.objectContaining({
              id: "netflix",
              name: "Netflix Premium",
              price: 50000,
            }),
          ]),
        })
      );
    });

    test("When adding duplicate product, Then should return error", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const product = {
        id: "netflix",
        name: "Netflix Premium",
        price: 50000,
      };

      mockSession.wishlist = [
        {
          id: "netflix",
          name: "Netflix Premium",
          price: 50000,
          addedAt: Date.now(),
        },
      ];

      // Act
      const result = await wishlistService.addProduct(customerId, product);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("sudah ada di wishlist");
      expect(result.wishlistCount).toBe(1);
      expect(mockSessionManager._updateSession).not.toHaveBeenCalled();
    });

    test("When session has no wishlist, Then should initialize empty array", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const product = {
        id: "spotify",
        name: "Spotify Premium",
        price: 30000,
      };

      delete mockSession.wishlist; // No wishlist field

      // Act
      const result = await wishlistService.addProduct(customerId, product);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSessionManager._updateSession).toHaveBeenCalledWith(
        customerId,
        expect.objectContaining({
          wishlist: expect.any(Array),
        })
      );
    });

    test("When SessionManager throws error, Then should return error response", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const product = {
        id: "netflix",
        name: "Netflix Premium",
        price: 50000,
      };

      mockSessionManager.getSession.mockRejectedValue(
        new Error("Redis connection failed")
      );

      // Act
      const result = await wishlistService.addProduct(customerId, product);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("Gagal menambahkan");
      expect(result.wishlistCount).toBe(0);
    });
  });

  describe("removeProduct", () => {
    test("When removing existing product, Then should remove successfully", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const productId = "netflix";

      mockSession.wishlist = [
        {
          id: "netflix",
          name: "Netflix Premium",
          price: 50000,
          addedAt: Date.now(),
        },
        {
          id: "spotify",
          name: "Spotify Premium",
          price: 30000,
          addedAt: Date.now(),
        },
      ];

      // Act
      const result = await wishlistService.removeProduct(customerId, productId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("dihapus dari wishlist");
      expect(result.wishlistCount).toBe(1);
      expect(mockSessionManager._updateSession).toHaveBeenCalledWith(
        customerId,
        expect.objectContaining({
          wishlist: expect.arrayContaining([
            expect.objectContaining({ id: "spotify" }),
          ]),
        })
      );
    });

    test("When removing non-existent product, Then should return error", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const productId = "youtube";

      mockSession.wishlist = [
        {
          id: "netflix",
          name: "Netflix Premium",
          price: 50000,
          addedAt: Date.now(),
        },
      ];

      // Act
      const result = await wishlistService.removeProduct(customerId, productId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak ditemukan");
      expect(mockSessionManager._updateSession).not.toHaveBeenCalled();
    });

    test("When wishlist is empty, Then should return error", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const productId = "netflix";

      mockSession.wishlist = [];

      // Act
      const result = await wishlistService.removeProduct(customerId, productId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("kosong");
      expect(result.wishlistCount).toBe(0);
    });
  });

  describe("getWishlist", () => {
    test("When wishlist has items, Then should return all items", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      mockSession.wishlist = [
        {
          id: "netflix",
          name: "Netflix Premium",
          price: 50000,
          addedAt: Date.now() - 3600000, // 1 hour ago
        },
        {
          id: "spotify",
          name: "Spotify Premium",
          price: 30000,
          addedAt: Date.now(),
        },
      ];

      // Act
      const result = await wishlistService.getWishlist(customerId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("netflix");
      expect(result[1].id).toBe("spotify");
      expect(mockSessionManager.getSession).toHaveBeenCalledWith(customerId);
    });

    test("When wishlist is empty, Then should return empty array", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      mockSession.wishlist = [];

      // Act
      const result = await wishlistService.getWishlist(customerId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test("When session has no wishlist field, Then should return empty array", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      delete mockSession.wishlist;

      // Act
      const result = await wishlistService.getWishlist(customerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("clearWishlist", () => {
    test("When clearing wishlist, Then should remove all items", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      mockSession.wishlist = [
        {
          id: "netflix",
          name: "Netflix Premium",
          price: 50000,
          addedAt: Date.now(),
        },
        {
          id: "spotify",
          name: "Spotify Premium",
          price: 30000,
          addedAt: Date.now(),
        },
      ];

      // Act
      const result = await wishlistService.clearWishlist(customerId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("dikosongkan");
      expect(mockSessionManager._updateSession).toHaveBeenCalledWith(
        customerId,
        expect.objectContaining({
          wishlist: [],
        })
      );
    });

    test("When wishlist already empty, Then should return success", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      mockSession.wishlist = [];

      // Act
      const result = await wishlistService.clearWishlist(customerId);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("getWishlistCount", () => {
    test("When wishlist has items, Then should return correct count", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      mockSession.wishlist = [
        { id: "netflix", name: "Netflix Premium", price: 50000 },
        { id: "spotify", name: "Spotify Premium", price: 30000 },
        { id: "youtube", name: "YouTube Premium", price: 40000 },
      ];

      // Act
      const result = await wishlistService.getWishlistCount(customerId);

      // Assert
      expect(result).toBe(3);
    });

    test("When wishlist is empty, Then should return 0", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      mockSession.wishlist = [];

      // Act
      const result = await wishlistService.getWishlistCount(customerId);

      // Assert
      expect(result).toBe(0);
    });
  });
});
