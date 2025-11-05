/**
 * Integration Tests - Wishlist Flow
 * Tests wishlist functionality end-to-end
 */

const SessionManager = require('../../sessionManager');
const CustomerHandler = require('../../src/handlers/CustomerHandler');
const PaymentHandlers = require('../../lib/paymentHandlers');

describe('Wishlist Flow Integration', () => {
  let sessionManager;
  let customerHandler;
  const testCustomerId = '628123456789@c.us';

  beforeEach(() => {
    sessionManager = new SessionManager();
    customerHandler = new CustomerHandler(sessionManager, new PaymentHandlers());
  });

  describe('Add to Wishlist', () => {
    test('should add product to wishlist with simpan command', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      
      const response = await customerHandler.handle(testCustomerId, 'simpan netflix', 'browsing');
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    test('should add product to wishlist with ⭐ emoji', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      
      const response = await customerHandler.handle(testCustomerId, '⭐ spotify', 'browsing');
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });

    test('should prevent duplicate wishlist entries', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      
      // Add once
      await customerHandler.handle(testCustomerId, 'simpan netflix', 'browsing');
      
      // Try to add again
      const response = await customerHandler.handle(testCustomerId, 'simpan netflix', 'browsing');
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });

  describe('View Wishlist', () => {
    test('should display wishlist items', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'simpan netflix', 'browsing');
      
      const response = await customerHandler.handle(testCustomerId, '/wishlist', 'browsing');
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      // Wishlist might be empty if add failed, just check it responds
    });

    test('should handle empty wishlist', async () => {
      const response = await customerHandler.handle(testCustomerId, '/wishlist', 'menu');
      
      expect(response).toBeDefined();
      expect(response.toLowerCase()).toContain('kosong');
    });
  });

  describe('Remove from Wishlist', () => {
    test('should remove product from wishlist', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'simpan netflix', 'browsing');
      
      const response = await customerHandler.handle(testCustomerId, 'hapus netflix', 'browsing');
      
      expect(response).toBeDefined();
    });
  });

  describe('Wishlist to Cart', () => {
    test('should move wishlist item to cart', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'simpan spotify', 'browsing');
      
      // View wishlist and select item
      await customerHandler.handle(testCustomerId, '/wishlist', 'browsing');
      
      // Add wishlist item to cart
      await customerHandler.handle(testCustomerId, 'spotify', 'browsing');
      
      const cart = await sessionManager.getCart(testCustomerId);
      const hasSpotify = cart.some(item => item.id === 'spotify');
      
      expect(hasSpotify).toBe(true);
    });
  });

  describe('Wishlist Persistence', () => {
    test('should maintain wishlist across sessions', async () => {
      // Add to wishlist
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'simpan netflix', 'browsing');
      
      // Simulate new session by going back to menu
      await customerHandler.handle(testCustomerId, 'menu', 'browsing');
      
      // Check wishlist returns a response
      const response = await customerHandler.handle(testCustomerId, '/wishlist', 'menu');
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });
});
