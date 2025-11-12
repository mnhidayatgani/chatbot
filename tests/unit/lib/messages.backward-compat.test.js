/**
 * Backward Compatibility Tests
 * 
 * Ensures that uiMessages.js and paymentMessages.js proxies still work
 * after message refactor (split to customer & admin files)
 */

const UIMessages = require('../../../lib/uiMessages');
const PaymentMessages = require('../../../lib/paymentMessages');

describe('Backward Compatibility', () => {
  // ============================================
  // UI MESSAGES COMPATIBILITY
  // ============================================

  describe('uiMessages.js Proxy', () => {
    test('should still export UIMessages class', () => {
      expect(UIMessages).toBeDefined();
      expect(typeof UIMessages).toBe('function'); // It's a class
    });

    test('mainMenu() should still work', () => {
      const result = UIMessages.mainMenu();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('helpCommand() should still work', () => {
      const result = UIMessages.helpCommand();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('about() should still work', () => {
      const result = UIMessages.about();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('contact() should still work', () => {
      const result = UIMessages.contact();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('productAdded() should still work', () => {
      const result = UIMessages.productAdded('Netflix', 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('Netflix');
    });

    test('productNotFound() should still work', () => {
      const result = UIMessages.productNotFound('netflx');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('cartView() should still work', () => {
      const cart = [{ name: 'Netflix', price: 15000 }];
      const result = UIMessages.cartView(cart, 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('Netflix');
    });

    test('emptyCart() should still work', () => {
      const result = UIMessages.emptyCart();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('cartCleared() should still work', () => {
      const result = UIMessages.cartCleared();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('wishlistView() should still work', () => {
      const wishlist = [{ name: 'Netflix', price: 15000 }];
      const result = UIMessages.wishlistView(wishlist);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('orderSummary() should still work', () => {
      const cart = [{ name: 'Netflix', price: 15000 }];
      const result = UIMessages.orderSummary('ORD-123', cart, 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });

    test('invalidOption() should still work', () => {
      const result = UIMessages.invalidOption();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // PAYMENT MESSAGES COMPATIBILITY
  // ============================================

  describe('paymentMessages.js Proxy', () => {
    test('should still export PaymentMessages class', () => {
      expect(PaymentMessages).toBeDefined();
      expect(typeof PaymentMessages).toBe('function'); // It's a class
    });

    test('qrisPayment() should still work', () => {
      const result = PaymentMessages.qrisPayment('ORD-123', 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });

    test('qrisManualPayment() should still work', () => {
      const result = PaymentMessages.qrisManualPayment('ORD-123', 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });

    test('ewalletPayment() should still work', () => {
      const result = PaymentMessages.ewalletPayment(
        'DANA',
        'ORD-123',
        15000,
        'https://pay.dana.id/123'
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('DANA');
    });

    test('manualEWalletInstructions() should still work', () => {
      const result = PaymentMessages.manualEWalletInstructions(
        'DANA',
        '081234567890',
        'Toko',
        15000,
        'ORD-123'
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('081234567890');
    });

    test('bankSelection() should still work', () => {
      const result = PaymentMessages.bankSelection('ORD-123', 15000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('manualBankTransferInstructions() should still work', () => {
      const result = PaymentMessages.manualBankTransferInstructions(
        'BCA',
        '1234567890',
        'Toko',
        15000,
        'ORD-123'
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('BCA');
    });

    test('paymentPending() should still work', () => {
      const result = PaymentMessages.paymentPending();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('paymentSuccess() should still work', () => {
      const result = PaymentMessages.paymentSuccess('ORD-123', 'QRIS', 'Product delivered');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });

    test('paymentExpired() should still work', () => {
      const result = PaymentMessages.paymentExpired();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('paymentFailed() should still work', () => {
      const result = PaymentMessages.paymentFailed();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // NO BREAKING CHANGES TEST
  // ============================================

  describe('No Breaking Changes', () => {
    test('all UI message functions should return non-empty strings', () => {
      const messages = [
        UIMessages.mainMenu(),
        UIMessages.helpCommand(),
        UIMessages.productAdded('Product', 15000),
        UIMessages.cartView([{ name: 'Product', price: 15000 }], 15000),
        UIMessages.emptyCart(),
      ];

      messages.forEach((msg) => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });

    test('all payment message functions should return non-empty strings', () => {
      const messages = [
        PaymentMessages.qrisPayment('ORD-123', 15000),
        PaymentMessages.manualEWalletInstructions('DANA', '123', 'Toko', 15000, 'ORD-123'),
        PaymentMessages.manualBankTransferInstructions('BCA', '123', 'Toko', 15000, 'ORD-123'),
        PaymentMessages.paymentSuccess('ORD-123', 'QRIS', 'Product delivered'),
      ];

      messages.forEach((msg) => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });

    test('no functions should return undefined', () => {
      expect(UIMessages.mainMenu()).toBeDefined();
      expect(UIMessages.productAdded('Product', 15000)).toBeDefined();
      expect(PaymentMessages.qrisPayment('ORD-123', 15000)).toBeDefined();
      expect(PaymentMessages.paymentSuccess('ORD-123', 'QRIS', 'Product delivered')).toBeDefined();
    });
  });

  // ============================================
  // FUNCTION SIGNATURE TESTS
  // ============================================

  describe('Function Signatures', () => {
    test('UI functions should accept correct number of parameters', () => {
      expect(() => UIMessages.mainMenu()).not.toThrow();
      expect(() => UIMessages.productAdded('Product', 15000)).not.toThrow();
      expect(() => UIMessages.cartView([], 0)).not.toThrow();
      expect(() => UIMessages.orderSummary('ORD-123', [], 15000)).not.toThrow();
    });

    test('Payment functions should accept correct number of parameters', () => {
      expect(() => PaymentMessages.qrisPayment('ORD-123', 15000)).not.toThrow();
      expect(() => PaymentMessages.manualEWalletInstructions('DANA', '123', 'Toko', 15000, 'ORD-123')).not.toThrow();
      expect(() => PaymentMessages.manualBankTransferInstructions('BCA', '123', 'Toko', 15000, 'ORD-123')).not.toThrow();
      expect(() => PaymentMessages.paymentSuccess('ORD-123', 'QRIS', 'Product delivered')).not.toThrow();
    });
  });
});
