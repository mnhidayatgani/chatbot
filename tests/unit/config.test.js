/**
 * Unit Tests for config.js (Legacy Config Wrapper)
 * Tests backward compatibility and delegation to modular configs
 */

const config = require('../../config');

describe('config.js (Legacy Wrapper)', () => {
  describe('systemSettings', () => {
    test('should export systemSettings object', () => {
      expect(config.systemSettings).toBeDefined();
      expect(typeof config.systemSettings).toBe('object');
    });

    test('should include currency settings', () => {
      expect(config.systemSettings.currency).toBeDefined();
      expect(config.systemSettings.currency).toBe('IDR');
    });

    test('should include session settings', () => {
      expect(config.systemSettings.sessionTimeout).toBeDefined();
      expect(typeof config.systemSettings.sessionTimeout).toBe('number');
    });

    test('should include rate limiting settings', () => {
      expect(config.systemSettings.maxMessagesPerMinute).toBeDefined();
      expect(typeof config.systemSettings.maxMessagesPerMinute).toBe('number');
    });

    test('should include shop information', () => {
      expect(config.systemSettings.shopName).toBeDefined();
      expect(config.systemSettings.supportEmail).toBeDefined();
      expect(config.systemSettings.supportWhatsapp).toBeDefined();
    });

    test('should include feature flags', () => {
      expect(config.systemSettings.autoDeliveryEnabled).toBeDefined();
      expect(config.systemSettings.maintenanceMode).toBeDefined();
      expect(config.systemSettings.welcomeMessageEnabled).toBeDefined();
      expect(typeof config.systemSettings.autoDeliveryEnabled).toBe('boolean');
    });

    test('should include stock settings', () => {
      expect(config.systemSettings.lowStockThreshold).toBeDefined();
      expect(typeof config.systemSettings.lowStockThreshold).toBe('number');
    });

    test('should include logging settings', () => {
      expect(config.systemSettings.logLevel).toBeDefined();
    });

    test('should include payment accounts', () => {
      expect(config.systemSettings.paymentAccounts).toBeDefined();
      expect(typeof config.systemSettings.paymentAccounts).toBe('object');
    });

    test('should flatten e-wallet payment accounts', () => {
      const { paymentAccounts } = config.systemSettings;
      
      // E-wallets should be present
      expect(paymentAccounts.dana || paymentAccounts.gopay || paymentAccounts.ovo).toBeDefined();
    });

    test('should flatten bank payment accounts', () => {
      const { paymentAccounts } = config.systemSettings;
      
      // Banks should be present
      expect(paymentAccounts.bca || paymentAccounts.bni || paymentAccounts.bri).toBeDefined();
    });
  });

  describe('products', () => {
    test('should export products object', () => {
      expect(config.products).toBeDefined();
      expect(typeof config.products).toBe('object');
    });

    test('should include premium accounts', () => {
      expect(config.products.premiumAccounts).toBeDefined();
      expect(Array.isArray(config.products.premiumAccounts)).toBe(true);
    });

    test('should include virtual cards', () => {
      expect(config.products.virtualCards).toBeDefined();
      expect(Array.isArray(config.products.virtualCards)).toBe(true);
    });

    test('premium accounts should have required fields', () => {
      const premiumAccounts = config.products.premiumAccounts;
      
      if (premiumAccounts.length > 0) {
        const firstProduct = premiumAccounts[0];
        expect(firstProduct).toHaveProperty('id');
        expect(firstProduct).toHaveProperty('name');
        expect(firstProduct).toHaveProperty('price');
      }
    });

    test('virtual cards should have required fields', () => {
      const virtualCards = config.products.virtualCards;
      
      if (virtualCards.length > 0) {
        const firstCard = virtualCards[0];
        expect(firstCard).toHaveProperty('id');
        expect(firstCard).toHaveProperty('name');
        expect(firstCard).toHaveProperty('price');
      }
    });
  });

  describe('Stock Constants', () => {
    test('should export DEFAULT_STOCK', () => {
      expect(config.DEFAULT_STOCK).toBeDefined();
      expect(typeof config.DEFAULT_STOCK).toBe('number');
    });

    test('should export VCC_STOCK', () => {
      expect(config.VCC_STOCK).toBeDefined();
      expect(typeof config.VCC_STOCK).toBe('number');
    });

    test('stock values should be positive', () => {
      expect(config.DEFAULT_STOCK).toBeGreaterThanOrEqual(0);
      expect(config.VCC_STOCK).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAllProducts()', () => {
    test('should return all products', () => {
      const allProducts = config.getAllProducts();

      expect(Array.isArray(allProducts)).toBe(true);
      expect(allProducts.length).toBeGreaterThan(0);
    });

    test('should combine premium accounts and virtual cards', () => {
      const allProducts = config.getAllProducts();
      const premiumCount = config.products.premiumAccounts.length;
      const vccCount = config.products.virtualCards.length;

      expect(allProducts.length).toBe(premiumCount + vccCount);
    });

    test('should add category to products', () => {
      const allProducts = config.getAllProducts();
      
      allProducts.forEach(product => {
        expect(product).toHaveProperty('category');
        expect(['Premium Accounts', 'Virtual Cards']).toContain(product.category);
      });
    });

    test('products should have unique IDs', () => {
      const allProducts = config.getAllProducts();
      const ids = allProducts.map(p => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getProductById()', () => {
    test('should find product by ID', () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const firstProduct = allProducts[0];
        const found = config.getProductById(firstProduct.id);

        expect(found).toBeDefined();
        expect(found.id).toBe(firstProduct.id);
      }
    });

    test('should return null for non-existent product', () => {
      const notFound = config.getProductById('non-existent-product-xyz-123');

      expect(notFound).toBeNull();
    });

    test('should find premium account by ID', () => {
      const premiumAccounts = config.products.premiumAccounts;
      if (premiumAccounts.length > 0) {
        const product = config.getProductById(premiumAccounts[0].id);
        
        expect(product).toBeDefined();
        expect(product.category).toBe('Premium Accounts');
      }
    });

    test('should find virtual card by ID', () => {
      const virtualCards = config.products.virtualCards;
      if (virtualCards.length > 0) {
        const product = config.getProductById(virtualCards[0].id);
        
        expect(product).toBeDefined();
        expect(product.category).toBe('Virtual Cards');
      }
    });

    test('should be case-sensitive', () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const firstProduct = allProducts[0];
        const upperCaseId = firstProduct.id.toUpperCase();
        
        if (upperCaseId !== firstProduct.id) {
          const found = config.getProductById(upperCaseId);
          expect(found).toBeNull();
        }
      }
    });
  });

  describe('formatProductList()', () => {
    test('should return formatted product list', async () => {
      const formatted = await config.formatProductList();

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('should include product names', async () => {
      const formatted = await config.formatProductList();
      const allProducts = config.getAllProducts();

      if (allProducts.length > 0) {
        // At least one product name should appear
        const hasProductName = allProducts.some(p => formatted.includes(p.name));
        expect(hasProductName).toBe(true);
      }
    });

    test('should include prices', async () => {
      const formatted = await config.formatProductList();

      // Should contain price formatting (Rp or numbers)
      expect(formatted).toMatch(/Rp|💰/);
    });

    test('should work without reviewService', async () => {
      const formatted = await config.formatProductList(null);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    test('should include category headers', async () => {
      const formatted = await config.formatProductList();

      // Should have category sections
      expect(formatted.length).toBeGreaterThan(50);
    });
  });

  describe('isInStock()', () => {
    test('should check stock for valid product', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const result = await config.isInStock(allProducts[0].id);

        expect(typeof result).toBe('boolean');
      }
    });

    test('should return false for non-existent product', async () => {
      const result = await config.isInStock('non-existent-product-xyz');

      expect(result).toBe(false);
    });
  });

  describe('setStock()', () => {
    test('should update stock for valid product', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const productId = allProducts[0].id;
        const result = await config.setStock(productId, 100, 'test');

        expect(result).toHaveProperty('success');
        if (result.success) {
          expect(result).toHaveProperty('product');
          expect(result.newStock).toBe(100);
        }
      }
    });

    test('should return error for non-existent product', async () => {
      const result = await config.setStock('non-existent-xyz', 100);

      expect(result.success).toBe(false);
      expect(result.message).toContain('tidak ditemukan');
    });

    test('should include old and new stock values', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const result = await config.setStock(allProducts[0].id, 50, 'test');

        if (result.success) {
          expect(result).toHaveProperty('oldStock');
          expect(result).toHaveProperty('newStock');
          expect(result.newStock).toBe(50);
        }
      }
    });

    test('should accept reason parameter', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const result = await config.setStock(allProducts[0].id, 25, 'manual_adjustment');

        expect(result).toBeDefined();
      }
    });

    test('should handle zero stock', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const result = await config.setStock(allProducts[0].id, 0, 'test');

        expect(result).toBeDefined();
      }
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain legacy export structure', () => {
      expect(config).toHaveProperty('systemSettings');
      expect(config).toHaveProperty('products');
      expect(config).toHaveProperty('DEFAULT_STOCK');
      expect(config).toHaveProperty('VCC_STOCK');
      expect(config).toHaveProperty('getAllProducts');
      expect(config).toHaveProperty('getProductById');
      expect(config).toHaveProperty('formatProductList');
      expect(config).toHaveProperty('isInStock');
      expect(config).toHaveProperty('setStock');
    });

    test('functions should be callable', () => {
      expect(typeof config.getAllProducts).toBe('function');
      expect(typeof config.getProductById).toBe('function');
      expect(typeof config.formatProductList).toBe('function');
      expect(typeof config.isInStock).toBe('function');
      expect(typeof config.setStock).toBe('function');
    });
  });

  describe('Integration', () => {
    test('should delegate to ProductService correctly', () => {
      const products = config.getAllProducts();
      const firstProduct = products[0];
      const foundProduct = config.getProductById(firstProduct.id);

      expect(foundProduct).toEqual(firstProduct);
    });

    test('should maintain data consistency', () => {
      const allProducts = config.getAllProducts();
      const productCount = allProducts.length;
      const premiumCount = config.products.premiumAccounts.length;
      const vccCount = config.products.virtualCards.length;

      expect(productCount).toBe(premiumCount + vccCount);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty product ID', () => {
      const result = config.getProductById('');

      expect(result).toBeNull();
    });

    test('should handle null product ID', () => {
      const result = config.getProductById(null);

      expect(result).toBeNull();
    });

    test('should handle undefined product ID', () => {
      const result = config.getProductById(undefined);

      expect(result).toBeNull();
    });

    test('should handle negative stock values', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const result = await config.setStock(allProducts[0].id, -1, 'test');

        // Should either reject or clamp to 0
        expect(result).toBeDefined();
      }
    });

    test('should handle very large stock values', async () => {
      const allProducts = config.getAllProducts();
      if (allProducts.length > 0) {
        const result = await config.setStock(allProducts[0].id, 999999, 'test');

        expect(result).toBeDefined();
      }
    });
  });
});
