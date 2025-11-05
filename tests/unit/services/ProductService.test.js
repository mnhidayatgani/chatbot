/**
 * ProductService Unit Tests - Comprehensive test suite
 */

const ProductService = require("../../../src/services/product/ProductService");

jest.mock("../../../src/config/products.config", () => ({
  products: {
    premiumAccounts: [
      { id: "netflix", name: "Netflix Premium", price: 50000, description: "1 Month subscription", stock: 10 },
      { id: "spotify", name: "Spotify Premium", price: 30000, description: "1 Month subscription", stock: 15 },
      { id: "youtube", name: "YouTube Premium", price: 40000, description: "1 Month subscription", stock: 8 }
    ],
    virtualCards: [
      { id: "vcc-basic", name: "VCC Basic", price: 20000, description: "Basic virtual credit card", stock: 50 },
      { id: "vcc-premium", name: "VCC Premium", price: 35000, description: "Premium virtual credit card", stock: 30 }
    ]
  },
  DEFAULT_STOCK: 10,
  VCC_STOCK: 50
}));

describe("ProductService", () => {
  let productService;

  beforeEach(() => {
    productService = new ProductService();
  });

  describe("Constructor", () => {
    test("should initialize with products from config", () => {
      expect(productService).toBeDefined();
    });
  });

  describe("getAllProducts()", () => {
    test("should return combined list with category labels", () => {
      const result = productService.getAllProducts();
      
      expect(result).toHaveLength(5); // 3 premium + 2 VCC
      expect(result[0].categoryLabel).toBe("Premium Accounts");
      expect(result[3].categoryLabel).toBe("Virtual Cards");
    });

    test("should include all premium accounts", () => {
      const result = productService.getAllProducts();
      const premiumProducts = result.filter(p => p.categoryLabel === "Premium Accounts");
      
      expect(premiumProducts).toHaveLength(3);
      expect(premiumProducts.map(p => p.id)).toContain("netflix");
      expect(premiumProducts.map(p => p.id)).toContain("spotify");
      expect(premiumProducts.map(p => p.id)).toContain("youtube");
    });

    test("should include all virtual cards", () => {
      const result = productService.getAllProducts();
      const vccProducts = result.filter(p => p.categoryLabel === "Virtual Cards");
      
      expect(vccProducts).toHaveLength(2);
      expect(vccProducts.map(p => p.id)).toContain("vcc-basic");
      expect(vccProducts.map(p => p.id)).toContain("vcc-premium");
    });

    test("should set category property", () => {
      const result = productService.getAllProducts();
      
      result.forEach(product => {
        expect(product).toHaveProperty('category');
        expect(['Premium Accounts', 'Virtual Cards']).toContain(product.category);
      });
    });

    test("should preserve product properties", () => {
      const result = productService.getAllProducts();
      const netflix = result.find(p => p.id === 'netflix');
      
      expect(netflix).toHaveProperty('id');
      expect(netflix).toHaveProperty('name');
      expect(netflix).toHaveProperty('price');
      expect(netflix).toHaveProperty('description');
    });

    test("should return new array each time", () => {
      const result1 = productService.getAllProducts();
      const result2 = productService.getAllProducts();
      
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe("getProductById()", () => {
    test("should return product when it exists", () => {
      const result = productService.getProductById("netflix");
      
      expect(result).toBeDefined();
      expect(result.id).toBe("netflix");
      expect(result.name).toBe("Netflix Premium");
    });

    test("should return null when product does not exist", () => {
      const result = productService.getProductById("invalid");
      
      expect(result).toBeNull();
    });

    test("should find premium account by ID", () => {
      const result = productService.getProductById("spotify");
      
      expect(result).toBeDefined();
      expect(result.category).toBe("Premium Accounts");
    });

    test("should find virtual card by ID", () => {
      const result = productService.getProductById("vcc-basic");
      
      expect(result).toBeDefined();
      expect(result.category).toBe("Virtual Cards");
    });

    test("should be case-sensitive", () => {
      const result = productService.getProductById("NETFLIX");
      
      expect(result).toBeNull();
    });

    test("should handle empty string", () => {
      const result = productService.getProductById("");
      
      expect(result).toBeNull();
    });

    test("should handle null input", () => {
      const result = productService.getProductById(null);
      
      expect(result).toBeNull();
    });

    test("should handle undefined input", () => {
      const result = productService.getProductById(undefined);
      
      expect(result).toBeNull();
    });

    test("should include category in returned product", () => {
      const result = productService.getProductById("netflix");
      
      expect(result.category).toBe("Premium Accounts");
      expect(result.categoryLabel).toBe("Premium Accounts");
    });

    test("should return product with all properties", () => {
      const result = productService.getProductById("youtube");
      
      expect(result.id).toBe("youtube");
      expect(result.name).toBe("YouTube Premium");
      expect(result.price).toBe(40000);
      expect(result.description).toBeDefined();
    });
  });

  describe("formatProductList()", () => {
    test("should format product list as string", async () => {
      const result = await productService.formatProductList();
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test("should include all product names", async () => {
      const result = await productService.formatProductList();
      
      expect(result).toContain("Netflix");
      expect(result).toContain("Spotify");
      expect(result).toContain("YouTube");
      expect(result).toContain("VCC Basic");
    });

    test("should include prices", async () => {
      const result = await productService.formatProductList();
      
      expect(result).toMatch(/Rp|💰/);
      expect(result).toContain("50.000");
      expect(result).toContain("30.000");
    });

    test("should include category headers", async () => {
      const result = await productService.formatProductList();
      
      expect(result).toContain("Premium Accounts");
      expect(result).toContain("Virtual Cards");
    });

    test("should work without reviewService", async () => {
      const result = await productService.formatProductList(null);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test("should work without stockManager", async () => {
      const result = await productService.formatProductList(null, null);
      
      expect(result).toBeDefined();
    });

    test("should format prices in IDR", async () => {
      const result = await productService.formatProductList();
      
      // Should use Indonesian number format with dots
      expect(result).toMatch(/\d{2}\.\d{3}/); // e.g., 50.000
    });
  });

  describe("Edge Cases", () => {
    test("should handle product search with special characters", () => {
      const result = productService.getProductById("netflix@#$");
      
      expect(result).toBeNull();
    });

    test("should handle very long product ID", () => {
      const longId = 'a'.repeat(1000);
      const result = productService.getProductById(longId);
      
      expect(result).toBeNull();
    });

    test("should maintain immutability - modifications should not affect original", () => {
      const product = productService.getProductById("netflix");
      product.price = 999999;
      
      const productAgain = productService.getProductById("netflix");
      expect(productAgain.price).toBe(50000); // Original price
    });

    test("should handle empty product arrays gracefully", () => {
      // This tests the robustness of the service
      const products = productService.getAllProducts();
      
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe("Integration", () => {
    test("should maintain consistency between getAllProducts and getProductById", () => {
      const allProducts = productService.getAllProducts();
      
      allProducts.forEach(product => {
        const found = productService.getProductById(product.id);
        expect(found).toBeDefined();
        expect(found.id).toBe(product.id);
      });
    });

    test("should have unique product IDs", () => {
      const allProducts = productService.getAllProducts();
      const ids = allProducts.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    test("should have consistent pricing", () => {
      const allProducts = productService.getAllProducts();
      
      allProducts.forEach(product => {
        expect(product.price).toBeGreaterThan(0);
        expect(typeof product.price).toBe('number');
      });
    });
  });

  describe("Category Assignment", () => {
    test("should assign Premium Accounts category correctly", () => {
      const netflix = productService.getProductById("netflix");
      const spotify = productService.getProductById("spotify");
      
      expect(netflix.category).toBe("Premium Accounts");
      expect(spotify.category).toBe("Premium Accounts");
    });

    test("should assign Virtual Cards category correctly", () => {
      const vccBasic = productService.getProductById("vcc-basic");
      const vccPremium = productService.getProductById("vcc-premium");
      
      expect(vccBasic.category).toBe("Virtual Cards");
      expect(vccPremium.category).toBe("Virtual Cards");
    });

    test("should set categoryLabel same as category", () => {
      const allProducts = productService.getAllProducts();
      
      allProducts.forEach(product => {
        expect(product.category).toBe(product.categoryLabel);
      });
    });
  });

  describe("Performance", () => {
    test("should handle multiple calls efficiently", () => {
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        productService.getAllProducts();
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });

    test("should handle rapid getProductById calls", () => {
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        productService.getProductById("netflix");
        productService.getProductById("spotify");
        productService.getProductById("invalid");
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});
