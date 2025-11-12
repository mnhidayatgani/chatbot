/**
 * Unit Tests for messages.customer.js
 * 
 * Tests all customer & payment messages after refactor
 */

const CustomerMessages = require('../../../lib/messages.customer');

describe('messages.customer.js', () => {
  // ============================================
  // STRUCTURE TESTS
  // ============================================

  describe('Module Structure', () => {
    test('should export CustomerMessages object', () => {
      expect(CustomerMessages).toBeDefined();
      expect(typeof CustomerMessages).toBe('object');
    });

    test('should have payment property', () => {
      expect(CustomerMessages.payment).toBeDefined();
      expect(typeof CustomerMessages.payment).toBe('object');
    });

    test('should have customer property', () => {
      expect(CustomerMessages.customer).toBeDefined();
      expect(typeof CustomerMessages.customer).toBe('object');
    });

    test('should have format property', () => {
      expect(CustomerMessages.format).toBeDefined();
      expect(typeof CustomerMessages.format).toBe('object');
    });
  });

  // ============================================
  // PAYMENT MESSAGES TESTS
  // ============================================

  describe('Payment Messages', () => {
    describe('QRIS Messages', () => {
      test('qris.auto() should return string', () => {
        const result = CustomerMessages.payment.qris.auto('ORD-123', 15000);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      test('qris.auto() should contain order ID', () => {
        const result = CustomerMessages.payment.qris.auto('ORD-123', 15000);
        expect(result).toContain('ORD-123');
      });

      test('qris.auto() should contain formatted price', () => {
        const result = CustomerMessages.payment.qris.auto('ORD-123', 15000);
        expect(result).toContain('15.000');
      });

      test('qris.manual() should return string', () => {
        const result = CustomerMessages.payment.qris.manual('ORD-123', 15000);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('E-wallet Messages', () => {
      test('ewallet.redirect() should return string', () => {
        const result = CustomerMessages.payment.ewallet.redirect(
          'DANA',
          'ORD-123',
          15000,
          'https://pay.dana.id/123'
        );
        expect(typeof result).toBe('string');
        expect(result).toContain('DANA');
        expect(result).toContain('https://pay.dana.id/123');
      });

      test('ewallet.manual() should return string with account number', () => {
        const result = CustomerMessages.payment.ewallet.manual(
          'DANA',
          '081234567890',
          'Toko Saya',
          15000,
          'ORD-123'
        );
        expect(typeof result).toBe('string');
        expect(result).toContain('081234567890');
        expect(result).toContain('Toko Saya');
      });

      test('ewallet.notAvailable() should return error message', () => {
        const result = CustomerMessages.payment.ewallet.notAvailable('DANA');
        expect(typeof result).toBe('string');
        expect(result).toContain('DANA');
      });
    });

    describe('Bank Transfer Messages', () => {
      test('bank.selection() should handle empty banks', () => {
        const result = CustomerMessages.payment.bank.selection('ORD-123', 15000, []);
        expect(typeof result).toBe('string');
        expect(result).toContain('NOT CONFIGURED');
      });

      test('bank.selection() should list available banks', () => {
        const banks = [
          { code: 'BCA', name: 'Bank BCA' },
          { code: 'BNI', name: 'Bank BNI' },
        ];
        const result = CustomerMessages.payment.bank.selection('ORD-123', 15000, banks);
        expect(result).toContain('BCA');
        expect(result).toContain('BNI');
      });

      test('bank.manual() should return transfer instructions', () => {
        const result = CustomerMessages.payment.bank.manual(
          'BCA',
          '1234567890',
          'Toko Saya',
          15000,
          'ORD-123'
        );
        expect(typeof result).toBe('string');
        expect(result).toContain('BCA');
        expect(result).toContain('1234567890');
        expect(result).toContain('Toko Saya');
      });

      test('bank.invalidChoice() should return error', () => {
        const result = CustomerMessages.payment.bank.invalidChoice(3);
        expect(typeof result).toBe('string');
        expect(result).toContain('1-3');
      });
    });

    describe('Payment Status Messages', () => {
      test('status.pending() should return pending message', () => {
        const result = CustomerMessages.payment.status.pending();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('pending');
      });

      test('status.success() should return success message', () => {
        const result = CustomerMessages.payment.status.success(
          'ORD-123',
          'QRIS',
          'Netflix Premium'
        );
        expect(typeof result).toBe('string');
        expect(result).toContain('ORD-123');
        expect(result).toContain('QRIS');
      });

      test('status.expired() should return expired message', () => {
        const result = CustomerMessages.payment.status.expired();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('expired');
      });
    });

    describe('Payment Proof Messages', () => {
      test('proof.received() should return confirmation', () => {
        const result = CustomerMessages.payment.proof.received('ORD-123');
        expect(typeof result).toBe('string');
        expect(result).toContain('ORD-123');
      });

      test('proof.invalid() should return error', () => {
        const result = CustomerMessages.payment.proof.invalid();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('tidak valid');
      });
    });
  });

  // ============================================
  // CUSTOMER UI MESSAGES TESTS
  // ============================================

  describe('Customer UI Messages', () => {
    describe('Menu Messages', () => {
      test('menu.main() should return main menu', () => {
        const result = CustomerMessages.customer.menu.main('Premium Shop');
        expect(typeof result).toBe('string');
        expect(result.toUpperCase()).toContain('PREMIUM SHOP');
      });

      test('menu.help() should return help message', () => {
        const result = CustomerMessages.customer.menu.help();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('panduan');
      });

      test('menu.about() should return about page', () => {
        const result = CustomerMessages.customer.menu.about('Premium Shop');
        expect(typeof result).toBe('string');
        expect(result).toContain('Premium Shop');
      });

      test('menu.contact() should return contact info', () => {
        const result = CustomerMessages.customer.menu.contact(
          '081234567890',
          '09:00 - 21:00 WIB'
        );
        expect(typeof result).toBe('string');
        expect(result).toContain('081234567890');
      });
    });

    describe('Product Messages', () => {
      test('product.added() should return confirmation', () => {
        const result = CustomerMessages.customer.product.added('Netflix Premium', 15000);
        expect(typeof result).toBe('string');
        expect(result).toContain('Netflix Premium');
        expect(result).toContain('15.000');
      });

      test('product.notFound() should return error', () => {
        const result = CustomerMessages.customer.product.notFound('netflx');
        expect(typeof result).toBe('string');
        expect(result).toContain('netflx');
      });

      test('product.browsingInstructions() should return instructions', () => {
        const result = CustomerMessages.customer.product.browsingInstructions('Product list here');
        expect(typeof result).toBe('string');
        expect(result).toContain('Product list here');
      });
    });

    describe('Cart Messages', () => {
      test('cart.view() should display items', () => {
        const cart = [
          { name: 'Netflix Premium', price: 15000 },
          { name: 'Spotify Premium', price: 12000 },
        ];
        const total = 27000;
        const result = CustomerMessages.customer.cart.view(cart, total);
        expect(typeof result).toBe('string');
        expect(result).toContain('Netflix Premium');
        expect(result).toContain('Spotify Premium');
        expect(result).toContain('27.000');
      });

      test('cart.empty() should return empty message', () => {
        const result = CustomerMessages.customer.cart.empty();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('kosong');
      });

      test('cart.cleared() should return cleared message', () => {
        const result = CustomerMessages.customer.cart.cleared();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('dikosongkan');
      });
    });

    describe('Wishlist Messages', () => {
      test('wishlist.view() should display items', () => {
        const wishlist = [
          { name: 'Netflix Premium', price: 15000 },
        ];
        const result = CustomerMessages.customer.wishlist.view(wishlist);
        expect(typeof result).toBe('string');
        expect(result).toContain('Netflix Premium');
      });

      test('wishlist.empty() should return empty message', () => {
        const result = CustomerMessages.customer.wishlist.empty();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('favorit');
      });
    });

    describe('Order Messages', () => {
      test('order.summary() should display order details', () => {
        const cart = [
          { name: 'Netflix Premium', price: 15000 },
        ];
        const result = CustomerMessages.customer.order.summary('ORD-123', cart, 15000);
        expect(typeof result).toBe('string');
        expect(result).toContain('ORD-123');
        expect(result).toContain('Netflix Premium');
      });

      test('order.summary() should handle promo code', () => {
        const cart = [{ name: 'Netflix Premium', price: 15000 }];
        const result = CustomerMessages.customer.order.summary(
          'ORD-123',
          cart,
          13500,
          'DISC10',
          1500
        );
        expect(result).toContain('DISC10');
        expect(result).toContain('1.500');
      });

      test('order.list() should display orders', () => {
        const orders = [
          {
            status: 'completed',
            orderId: 'ORD-123',
            date: '2025-11-12',
            totalIDR: 15000,
          },
        ];
        const result = CustomerMessages.customer.order.list(orders);
        expect(typeof result).toBe('string');
        expect(result).toContain('ORD-123');
      });

      test('order.empty() should return empty message', () => {
        const result = CustomerMessages.customer.order.empty();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('belum ada');
      });
    });

    describe('Error Messages', () => {
      test('error.invalidOption() should return error', () => {
        const result = CustomerMessages.customer.error.invalidOption();
        expect(typeof result).toBe('string');
      });

      test('error.sessionExpired() should return expired message', () => {
        const result = CustomerMessages.customer.error.sessionExpired();
        expect(typeof result).toBe('string');
        expect(result.toLowerCase()).toContain('expired');
      });

      test('error.rateLimitExceeded() should return rate limit error', () => {
        const result = CustomerMessages.customer.error.rateLimitExceeded();
        expect(typeof result).toBe('string');
        expect(result).toContain('20');
      });
    });
  });

  // ============================================
  // FORMAT HELPERS TESTS
  // ============================================

  describe('Format Helpers', () => {
    test('format.separator should have short, medium, long', () => {
      expect(CustomerMessages.format.separator.short).toBeDefined();
      expect(CustomerMessages.format.separator.medium).toBeDefined();
      expect(CustomerMessages.format.separator.long).toBeDefined();
      expect(typeof CustomerMessages.format.separator.short).toBe('string');
    });

    test('format.box.simple() should return header', () => {
      const result = CustomerMessages.format.box.simple('🛍️', 'MENU');
      expect(typeof result).toBe('string');
      expect(result).toContain('🛍️');
      expect(result).toContain('MENU');
    });

    test('format.currency() should format IDR', () => {
      const result = CustomerMessages.format.currency(15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('Rp');
      expect(result).toContain('15.000');
    });

    test('format.datetime() should format date', () => {
      const result = CustomerMessages.format.datetime(new Date('2025-11-12'));
      expect(typeof result).toBe('string');
    });

    test('format.emoji should have all required emojis', () => {
      expect(CustomerMessages.format.emoji.success).toBe('✅');
      expect(CustomerMessages.format.emoji.error).toBe('❌');
      expect(CustomerMessages.format.emoji.money).toBe('💰');
      expect(CustomerMessages.format.emoji.cart).toBe('🛒');
      expect(CustomerMessages.format.emoji.star).toBe('⭐');
    });
  });
});
