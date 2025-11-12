/**
 * Unit Tests for messages.admin.js
 * 
 * Tests all admin messages after refactor
 */

const AdminMessages = require('../../../lib/messages.admin');

describe('messages.admin.js', () => {
  // ============================================
  // STRUCTURE TESTS
  // ============================================

  describe('Module Structure', () => {
    test('should export AdminMessages object', () => {
      expect(AdminMessages).toBeDefined();
      expect(typeof AdminMessages).toBe('object');
    });

    test('should have auth property', () => {
      expect(AdminMessages.auth).toBeDefined();
      expect(typeof AdminMessages.auth).toBe('object');
    });

    test('should have order property', () => {
      expect(AdminMessages.order).toBeDefined();
      expect(typeof AdminMessages.order).toBe('object');
    });

    test('should have adminNotification property', () => {
      expect(AdminMessages.adminNotification).toBeDefined();
      expect(typeof AdminMessages.adminNotification).toBe('object');
    });

    test('should have stats property', () => {
      expect(AdminMessages.stats).toBeDefined();
      expect(typeof AdminMessages.stats).toBe('object');
    });
  });

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================

  describe('Authentication Messages', () => {
    test('auth.unauthorized() should return error message', () => {
      const result = AdminMessages.auth.unauthorized();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result.toLowerCase()).toContain('akses');
    });
  });

  // ============================================
  // ORDER MANAGEMENT TESTS
  // ============================================

  describe('Order Management Messages', () => {
    test('order.approvalFormatInvalid() should return format error', () => {
      const result = AdminMessages.order.approvalFormatInvalid();
      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toContain('format');
      expect(result).toContain('/approve');
    });

    test('order.notFound() should contain order ID', () => {
      const result = AdminMessages.order.notFound('ORD-123');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
      expect(result.toLowerCase()).toContain('tidak ditemukan');
    });

    test('order.notPending() should contain order ID', () => {
      const result = AdminMessages.order.notPending('ORD-123');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
      expect(result.toLowerCase()).toContain('pending');
    });

    test('order.deliveryFailed() should return error message', () => {
      const result = AdminMessages.order.deliveryFailed('ORD-123');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
      expect(result.toLowerCase()).toContain('gagal');
    });

    test('order.approvalSuccess() should contain order ID', () => {
      const result = AdminMessages.order.approvalSuccess('ORD-123');
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
      expect(result.toLowerCase()).toContain('disetujui');
    });
  });

  // ============================================
  // ADMIN NOTIFICATION TESTS
  // ============================================

  describe('Admin Notification Messages', () => {
    test('adminNotification.newOrder() should contain all params', () => {
      const result = AdminMessages.adminNotification.newOrder(
        'ORD-123',
        '081234567890@c.us',
        'Netflix Premium',
        15000
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
      expect(result).toContain('081234567890@c.us');
      expect(result).toContain('Netflix Premium');
      expect(result).toContain('15.000');
    });

    test('adminNotification.proofUploaded() should contain order details', () => {
      const result = AdminMessages.adminNotification.proofUploaded(
        'ORD-123',
        '081234567890@c.us',
        'Netflix Premium',
        15000,
        '/payment_proofs/proof123.jpg'
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('ORD-123');
      expect(result).toContain('/approve');
      expect(result).toContain('/reject');
    });

    test('adminNotification.lowStock() should contain product and stock info', () => {
      const result = AdminMessages.adminNotification.lowStock('netflix', 3, 5);
      expect(typeof result).toBe('string');
      expect(result).toContain('netflix');
      expect(result).toContain('3');
      expect(result).toContain('5');
      expect(result.toLowerCase()).toContain('stock');
    });

    test('adminNotification.stockEmpty() should contain product ID', () => {
      const result = AdminMessages.adminNotification.stockEmpty('netflix');
      expect(typeof result).toBe('string');
      expect(result).toContain('netflix');
      expect(result).toContain('0');
      expect(result.toLowerCase()).toContain('habis');
    });

    test('adminNotification.dailyReport() should contain stats', () => {
      const stats = {
        totalRevenue: 150000,
        avgOrderValue: 15000,
        completedOrders: 10,
        pendingOrders: 2,
        totalOrders: 12,
        topProducts: [
          { name: 'Netflix Premium', count: 5 },
          { name: 'Spotify Premium', count: 3 },
        ],
        paymentMethods: [
          { name: 'QRIS', count: 8 },
          { name: 'DANA', count: 4 },
        ],
      };
      const result = AdminMessages.adminNotification.dailyReport(stats);
      expect(typeof result).toBe('string');
      expect(result).toContain('150.000');
      expect(result).toContain('10');
      expect(result).toContain('Netflix Premium');
      expect(result).toContain('QRIS');
    });
  });

  // ============================================
  // STATS MESSAGES TESTS
  // ============================================

  describe('Stats Messages', () => {
    test('stats.help() should return help message', () => {
      const result = AdminMessages.stats.help();
      expect(typeof result).toBe('string');
      expect(result).toContain('/stats');
      expect(result.toLowerCase()).toContain('days');
    });
  });

  // ============================================
  // MESSAGE QUALITY TESTS
  // ============================================

  describe('Message Quality', () => {
    test('all messages should return non-empty strings', () => {
      const messages = [
        AdminMessages.auth.unauthorized(),
        AdminMessages.order.approvalFormatInvalid(),
        AdminMessages.order.notFound('ORD-123'),
        AdminMessages.order.approvalSuccess('ORD-123'),
        AdminMessages.stats.help(),
      ];

      messages.forEach((msg) => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });

    test('all messages should not return undefined', () => {
      expect(AdminMessages.auth.unauthorized()).toBeDefined();
      expect(AdminMessages.order.approvalSuccess('ORD-123')).toBeDefined();
      expect(AdminMessages.adminNotification.newOrder('ORD-123', 'cust', 'prod', 1000)).toBeDefined();
    });
  });
});
