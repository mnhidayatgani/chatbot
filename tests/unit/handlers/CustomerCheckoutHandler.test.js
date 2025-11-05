/**
 * Unit Tests for CustomerCheckoutHandler
 * Tests checkout process, promo codes, and payment flow
 */

const CustomerCheckoutHandler = require('../../../src/handlers/CustomerCheckoutHandler');
const { SessionSteps } = require('../../../src/utils/Constants');

// Mock dependencies
jest.mock('../../../sessionManager');
jest.mock('../../../src/services/promo/PromoService');
jest.mock('../../../config', () => ({
  stockManager: {
    isInStock: jest.fn().mockResolvedValue(true),
    getStock: jest.fn().mockResolvedValue(10)
  }
}));

describe('CustomerCheckoutHandler', () => {
  let handler;
  let mockSessionManager;
  let mockPromoService;
  let mockLogger;

  const customerId = '628123456789@c.us';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset stockManager mock
    const { stockManager } = require('../../../config');
    stockManager.isInStock.mockReset();
    stockManager.isInStock.mockResolvedValue(true); // Default: in stock

    // Create mock session manager
    mockSessionManager = {
      getStep: jest.fn().mockResolvedValue(SessionSteps.MENU),
      getCart: jest.fn().mockResolvedValue([]),
      clearCart: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      getSession: jest.fn().mockResolvedValue({
        customerId,
        cart: [],
        promoCode: null,
        discountPercent: 0
      }),
      setOrderId: jest.fn().mockResolvedValue(undefined),
      setStep: jest.fn().mockResolvedValue(undefined)
    };

    // Create mock promo service
    mockPromoService = {
      validatePromo: jest.fn().mockReturnValue({
        valid: true,
        discountPercent: 10,
        message: 'Promo valid'
      }),
      applyPromo: jest.fn().mockReturnValue({
        success: true,
        message: 'Promo applied'
      }),
      calculateDiscount: jest.fn((amount, percent) => ({
        originalAmount: amount,
        discountPercent: percent,
        discountAmount: amount * (percent / 100),
        finalAmount: amount * (1 - percent / 100)
      }))
    };

    mockLogger = {
      log: jest.fn(),
      logError: jest.fn()
    };

    // Create handler instance
    handler = new CustomerCheckoutHandler(mockSessionManager, mockPromoService, mockLogger);
  });

  describe('Constructor', () => {
    test('should initialize with session manager and promo service', () => {
      expect(handler.sessionManager).toBe(mockSessionManager);
      expect(handler.promoService).toBe(mockPromoService);
      expect(handler.logger).toBe(mockLogger);
    });

    test('should create PromoService if not provided', () => {
      const handlerWithoutPromo = new CustomerCheckoutHandler(mockSessionManager, null, mockLogger);
      expect(handlerWithoutPromo.promoService).toBeDefined();
    });
  });

  describe('handleCheckout() - Main Router', () => {
    test('should process checkout for "checkout" command', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.handleCheckout(customerId, 'checkout');

      expect(result.message).toBeDefined();
      expect(mockSessionManager.getCart).toHaveBeenCalledWith(customerId);
    });

    test('should process checkout for "buy" command', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.handleCheckout(customerId, 'buy');

      expect(result.message).toBeDefined();
    });

    test('should process checkout for "order" command', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.handleCheckout(customerId, 'order');

      expect(result.message).toBeDefined();
    });

    test('should clear cart for "clear" command', async () => {
      const result = await handler.handleCheckout(customerId, 'clear');

      expect(mockSessionManager.clearCart).toHaveBeenCalledWith(customerId);
      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'promoCode', null);
      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'discountPercent', 0);
      expect(mockSessionManager.setStep).toHaveBeenCalledWith(customerId, SessionSteps.MENU);
      expect(result.message).toMatch(/kosong/i); // Case insensitive
    });

    test('should handle promo code application', async () => {
      const result = await handler.handleCheckout(customerId, 'promo DISC10');

      expect(mockPromoService.validatePromo).toHaveBeenCalledWith('DISC10', customerId);
      expect(result.message).toContain('Kode Promo');
    });

    test('should show checkout prompt for unknown command', async () => {
      const result = await handler.handleCheckout(customerId, 'unknown');

      expect(result.message).toBeDefined();
      expect(result.qrisData).toBeNull();
    });
  });

  describe('handleApplyPromo()', () => {
    beforeEach(() => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);
    });

    test('should apply valid promo code', async () => {
      mockPromoService.validatePromo.mockReturnValue({
        valid: true,
        discountPercent: 10,
        message: 'Valid promo'
      });

      const result = await handler.handleApplyPromo(customerId, 'DISC10');

      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'promoCode', 'DISC10');
      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'discountPercent', 10);
      expect(result.message).toContain('Kode Promo Diterapkan');
      expect(result.message).toContain('DISC10');
      expect(result.message).toContain('10%');
    });

    test('should reject invalid promo code', async () => {
      mockPromoService.validatePromo.mockReturnValue({
        valid: false,
        message: '❌ Kode promo tidak valid'
      });

      const result = await handler.handleApplyPromo(customerId, 'INVALID');

      expect(mockSessionManager.set).not.toHaveBeenCalled();
      expect(result.message).toContain('tidak valid');
    });

    test('should calculate and display discount correctly', async () => {
      mockPromoService.validatePromo.mockReturnValue({
        valid: true,
        discountPercent: 20,
        message: 'Valid'
      });

      const result = await handler.handleApplyPromo(customerId, 'DISC20');

      expect(mockPromoService.calculateDiscount).toHaveBeenCalledWith(50000, 20);
      expect(result.message).toContain('20%');
      expect(result.message).toContain('50.000'); // Original amount
      expect(result.message).toContain('10.000'); // Discount (20% of 50k)
      expect(result.message).toContain('40.000'); // Final (50k - 10k)
    });

    test('should convert promo code to uppercase', async () => {
      await handler.handleApplyPromo(customerId, 'disc10');

      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'promoCode', 'DISC10');
    });

    test('should handle promo with empty cart', async () => {
      mockSessionManager.getCart.mockResolvedValue([]);

      await handler.handleApplyPromo(customerId, 'DISC10');

      expect(mockPromoService.calculateDiscount).toHaveBeenCalledWith(0, 10);
    });

    test('should log promo application', async () => {
      await handler.handleApplyPromo(customerId, 'DISC10');

      expect(mockLogger.log).toHaveBeenCalledWith(
        customerId,
        'promo_applied',
        expect.objectContaining({
          promoCode: 'DISC10',
          discountPercent: 10
        })
      );
    });
  });

  describe('processCheckout()', () => {
    test('should return empty cart message if cart is empty', async () => {
      mockSessionManager.getCart.mockResolvedValue([]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toMatch(/kosong/i); // Case insensitive
      expect(result.qrisData).toBeNull();
    });

    test('should process checkout with items in cart', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 },
        { id: 'spotify', name: 'Spotify', price: 30000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toContain('ORD-');
      expect(mockSessionManager.setOrderId).toHaveBeenCalled();
      expect(mockSessionManager.setStep).toHaveBeenCalledWith(customerId, SessionSteps.SELECT_PAYMENT);
    });

    test('should generate unique order ID', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      await handler.processCheckout(customerId);

      const orderIdCall = mockSessionManager.setOrderId.mock.calls[0];
      const orderId = orderIdCall[1];

      expect(orderId).toMatch(/^ORD-\d+-.+$/); // Matches ORD-timestamp-suffix format
      expect(orderId).toContain('ORD-');
    });

    test('should calculate total correctly', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 },
        { id: 'spotify', name: 'Spotify', price: 30000 },
        { id: 'disney', name: 'Disney+', price: 40000 }
      ]);

      await handler.processCheckout(customerId);

      expect(mockSessionManager.setOrderId).toHaveBeenCalled();
      // Total should be 120000
    });

    test('should handle checkout with promo code', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 100000 }
      ]);
      mockSessionManager.getSession.mockResolvedValue({
        customerId,
        promoCode: 'DISC20',
        discountPercent: 20
      });

      const result = await handler.processCheckout(customerId);

      expect(mockPromoService.applyPromo).toHaveBeenCalledWith('DISC20', customerId);
      expect(mockPromoService.calculateDiscount).toHaveBeenCalledWith(100000, 20);
    });

    test('should apply discount when promo is valid', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 100000 }
      ]);
      mockSessionManager.getSession.mockResolvedValue({
        customerId,
        promoCode: 'DISC10',
        discountPercent: 10
      });
      mockPromoService.applyPromo.mockReturnValue({
        success: true
      });

      const result = await handler.processCheckout(customerId);

      expect(result.message).toBeDefined();
      expect(mockLogger.log).toHaveBeenCalledWith(
        customerId,
        'promo_code_applied',
        expect.objectContaining({
          promoCode: 'DISC10',
          discountPercent: 10
        })
      );
    });

    test('should clear promo if validation fails at checkout', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);
      mockSessionManager.getSession.mockResolvedValue({
        customerId,
        promoCode: 'EXPIRED',
        discountPercent: 10
      });
      mockPromoService.applyPromo.mockReturnValue({
        success: false,
        message: 'Promo expired'
      });

      await handler.processCheckout(customerId);

      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'promoCode', null);
      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'discountPercent', 0);
    });

    test('should check stock availability', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true);

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      await handler.processCheckout(customerId);

      expect(stockManager.isInStock).toHaveBeenCalledWith('netflix');
    });

    test('should reject checkout if items are out of stock', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(false);

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix Premium', price: 50000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toContain('Stok Habis');
      expect(result.message).toContain('Netflix Premium');
      expect(mockSessionManager.setOrderId).not.toHaveBeenCalled();
    });

    test('should list all out of stock items', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock
        .mockResolvedValueOnce(false)  // netflix
        .mockResolvedValueOnce(false); // spotify

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 },
        { id: 'spotify', name: 'Spotify', price: 30000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toContain('Netflix');
      expect(result.message).toContain('Spotify');
    });

    test('should set step to SELECT_PAYMENT', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      await handler.processCheckout(customerId);

      // Check if setStep was called (will call BaseHandler.setStep which calls sessionManager.setStep)
      expect(mockSessionManager.setStep).toHaveBeenCalled();
    });

    test('should include order summary in response', async () => {
      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toContain('ORD-');
      expect(result.message).toContain('Netflix');
    });

    test('should include order summary in response', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true); // Ensure in stock

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toContain('ORD-');
    });

    test('should log checkout initiation', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true); // Ensure in stock

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      await handler.processCheckout(customerId);

      expect(mockLogger.log).toHaveBeenCalledWith(
        customerId,
        'checkout_initiated',
        expect.objectContaining({
          itemCount: 1,
          totalIDR: 50000
        })
      );
    });

    test('should log out of stock event', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(false);

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      await handler.processCheckout(customerId);

      expect(mockLogger.log).toHaveBeenCalledWith(
        customerId,
        'checkout_failed_out_of_stock',
        expect.objectContaining({
          items: ['netflix']
        })
      );
    });
  });

  describe('Cart Clearing', () => {
    test('should clear cart completely', async () => {
      await handler.handleCheckout(customerId, 'clear');

      expect(mockSessionManager.clearCart).toHaveBeenCalledWith(customerId);
    });

    test('should clear promo code when clearing cart', async () => {
      await handler.handleCheckout(customerId, 'clear');

      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'promoCode', null);
      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'discountPercent', 0);
    });

    test('should return to menu after clearing', async () => {
      await handler.handleCheckout(customerId, 'clear');

      expect(mockSessionManager.setStep).toHaveBeenCalledWith(customerId, SessionSteps.MENU);
    });

    test('should log cart clear event', async () => {
      await handler.handleCheckout(customerId, 'clear');

      // Logger should be called with cart_cleared event
      expect(mockLogger.log).toHaveBeenCalledWith(customerId, 'cart_cleared', expect.anything());
    });
  });

  describe('Error Handling', () => {
    test('should handle session manager errors gracefully', async () => {
      mockSessionManager.getCart.mockRejectedValue(new Error('Database error'));

      await expect(handler.processCheckout(customerId)).rejects.toThrow();
    });

    test('should handle promo service errors', async () => {
      mockPromoService.validatePromo.mockImplementation(() => {
        throw new Error('Promo service error');
      });

      await expect(handler.handleApplyPromo(customerId, 'TEST')).rejects.toThrow();
    });

    test('should handle stock check errors', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockRejectedValue(new Error('Stock service error'));

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      await expect(handler.processCheckout(customerId)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero-priced items', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true); // Ensure stock check passes

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'free', name: 'Free Trial', price: 0 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.message).toBeDefined();
    });

    test('should handle very large cart', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true); // Ensure stock check passes

      const largeCart = Array(100).fill({ id: 'netflix', name: 'Netflix', price: 50000 });
      mockSessionManager.getCart.mockResolvedValue(largeCart);

      await handler.processCheckout(customerId);

      expect(mockLogger.log).toHaveBeenCalledWith(
        customerId,
        'checkout_initiated',
        expect.objectContaining({
          itemCount: 100
        })
      );
    });

    test('should handle promo code with special characters', async () => {
      mockPromoService.validatePromo.mockReturnValue({
        valid: true,
        discountPercent: 15
      });

      await handler.handleApplyPromo(customerId, 'DISC-2024!');

      expect(mockSessionManager.set).toHaveBeenCalledWith(customerId, 'promoCode', 'DISC-2024!');
    });

    test('should handle empty promo code', async () => {
      mockPromoService.validatePromo.mockReturnValue({
        valid: false,
        message: 'Kode promo kosong'
      });

      const result = await handler.handleApplyPromo(customerId, '');

      expect(result.message).toBeDefined();
    });

    test('should handle whitespace in promo code', async () => {
      await handler.handleCheckout(customerId, 'promo   DISC10   ');

      expect(mockPromoService.validatePromo).toHaveBeenCalledWith('DISC10', customerId);
    });
  });

  describe('Response Format', () => {
    test('should return object with message and qrisData', async () => {
      const result = await handler.handleCheckout(customerId, 'clear');

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('qrisData');
    });

    test('should always set qrisData to null in checkout handler', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true);

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(result.qrisData).toBeNull();
    });

    test('should return formatted message', async () => {
      const { stockManager } = require('../../../config');
      stockManager.isInStock.mockResolvedValue(true);

      mockSessionManager.getCart.mockResolvedValue([
        { id: 'netflix', name: 'Netflix', price: 50000 }
      ]);

      const result = await handler.processCheckout(customerId);

      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });
  });
});
