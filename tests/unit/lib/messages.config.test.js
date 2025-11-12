/**
 * Unit Tests for messages.config.js (Main Export)
 * 
 * Tests that the main export correctly combines customer & admin messages
 */

const Messages = require('../../../lib/messages.config');
const CustomerMessages = require('../../../lib/messages.customer');
const AdminMessages = require('../../../lib/messages.admin');

describe('messages.config.js (Main Export)', () => {
  // ============================================
  // STRUCTURE TESTS
  // ============================================

  describe('Module Structure', () => {
    test('should export Messages object', () => {
      expect(Messages).toBeDefined();
      expect(typeof Messages).toBe('object');
    });

    test('should have payment property from customer', () => {
      expect(Messages.payment).toBeDefined();
      expect(Messages.payment).toBe(CustomerMessages.payment);
    });

    test('should have customer property from customer', () => {
      expect(Messages.customer).toBeDefined();
      expect(Messages.customer).toBe(CustomerMessages.customer);
    });

    test('should have format property from customer', () => {
      expect(Messages.format).toBeDefined();
      expect(Messages.format).toBe(CustomerMessages.format);
    });

    test('should have admin property from admin', () => {
      expect(Messages.admin).toBeDefined();
      expect(Messages.admin).toBe(AdminMessages);
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================

  describe('Payment Messages Integration', () => {
    test('Messages.payment.qris.auto() should work', () => {
      const result = Messages.payment.qris.auto('ORD-123', 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });

    test('Messages.payment.ewallet.manual() should work', () => {
      const result = Messages.payment.ewallet.manual(
        'DANA',
        '081234567890',
        'Toko',
        15000,
        'ORD-123'
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('DANA');
    });

    test('Messages.payment.bank.selection() should work', () => {
      const result = Messages.payment.bank.selection('ORD-123', 15000, []);
      expect(typeof result).toBe('string');
    });

    test('Messages.payment.status.success() should work', () => {
      const result = Messages.payment.status.success('ORD-123', 'QRIS', 'Product');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });
  });

  describe('Customer Messages Integration', () => {
    test('Messages.customer.menu.main() should work', () => {
      const result = Messages.customer.menu.main('Shop Name');
      expect(typeof result).toBe('string');
      expect(result.toUpperCase()).toContain('SHOP NAME');
    });

    test('Messages.customer.cart.view() should work', () => {
      const cart = [{ name: 'Product', price: 15000 }];
      const result = Messages.customer.cart.view(cart, 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('Product');
    });

    test('Messages.customer.product.added() should work', () => {
      const result = Messages.customer.product.added('Netflix', 15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('Netflix');
    });
  });

  describe('Admin Messages Integration', () => {
    test('Messages.admin.auth.unauthorized() should work', () => {
      const result = Messages.admin.auth.unauthorized();
      expect(typeof result).toBe('string');
    });

    test('Messages.admin.order.approvalSuccess() should work', () => {
      const result = Messages.admin.order.approvalSuccess('ORD-123');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });

    test('Messages.admin.adminNotification.newOrder() should work', () => {
      const result = Messages.admin.adminNotification.newOrder(
        'ORD-123',
        'customer',
        'product',
        15000
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
    });
  });

  describe('Format Helpers Integration', () => {
    test('Messages.format.currency() should work', () => {
      const result = Messages.format.currency(15000);
      expect(typeof result).toBe('string');
      expect(result).toContain('Rp');
      expect(result).toContain('15.000');
    });

    test('Messages.format.box.simple() should work', () => {
      const result = Messages.format.box.simple('🛍️', 'MENU');
      expect(typeof result).toBe('string');
      expect(result).toContain('MENU');
    });

    test('Messages.format.emoji should have all emojis', () => {
      expect(Messages.format.emoji.success).toBe('✅');
      expect(Messages.format.emoji.error).toBe('❌');
      expect(Messages.format.emoji.money).toBe('💰');
    });
  });

  // ============================================
  // REFERENCE EQUALITY TESTS
  // ============================================

  describe('Reference Equality', () => {
    test('payment should reference same object as CustomerMessages.payment', () => {
      expect(Messages.payment).toBe(CustomerMessages.payment);
    });

    test('customer should reference same object as CustomerMessages.customer', () => {
      expect(Messages.customer).toBe(CustomerMessages.customer);
    });

    test('format should reference same object as CustomerMessages.format', () => {
      expect(Messages.format).toBe(CustomerMessages.format);
    });

    test('admin should reference same object as AdminMessages', () => {
      expect(Messages.admin).toBe(AdminMessages);
    });
  });

  // ============================================
  // NO UNDEFINED TESTS
  // ============================================

  describe('No Undefined Values', () => {
    test('all top-level properties should be defined', () => {
      expect(Messages.payment).toBeDefined();
      expect(Messages.customer).toBeDefined();
      expect(Messages.admin).toBeDefined();
      expect(Messages.format).toBeDefined();
    });

    test('calling message functions should not return undefined', () => {
      expect(Messages.payment.qris.auto('ORD-123', 15000)).toBeDefined();
      expect(Messages.customer.menu.main('Shop')).toBeDefined();
      expect(Messages.admin.auth.unauthorized()).toBeDefined();
      expect(Messages.format.currency(15000)).toBeDefined();
    });
  });
});
