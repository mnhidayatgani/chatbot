/**
 * Unit Tests for ErrorMessages
 * Tests all error message utility functions
 */

const ErrorMessages = require('../../../src/utils/ErrorMessages');

describe('ErrorMessages', () => {
  describe('Generic Error Messages', () => {
    test('should return generic error message', () => {
      const msg = ErrorMessages.GENERIC_ERROR;
      expect(msg).toContain('❌');
      expect(msg).toContain('kesalahan');
      expect(typeof msg).toBe('string');
    });

    test('should return try again later message', () => {
      const msg = ErrorMessages.TRY_AGAIN_LATER;
      expect(msg).toContain('coba lagi');
      expect(typeof msg).toBe('string');
    });

    test('should return contact admin message', () => {
      const msg = ErrorMessages.CONTACT_ADMIN;
      expect(msg).toContain('admin');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Order and Payment Errors', () => {
    test('should return order history error', () => {
      const msg = ErrorMessages.orderHistoryError();
      expect(msg).toContain('❌');
      expect(msg).toContain('riwayat pesanan');
      expect(typeof msg).toBe('string');
    });

    test('should return track order error', () => {
      const msg = ErrorMessages.trackOrderError();
      expect(msg).toContain('❌');
      expect(msg).toContain('riwayat pesanan');
      expect(typeof msg).toBe('string');
    });

    test('should return payment proof error', () => {
      const msg = ErrorMessages.paymentProofError();
      expect(msg).toContain('❌');
      expect(msg).toContain('bukti pembayaran');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Wishlist Errors', () => {
    test('should return wishlist save error', () => {
      const msg = ErrorMessages.wishlistSaveError();
      expect(msg).toContain('❌');
      expect(msg).toContain('wishlist');
      expect(typeof msg).toBe('string');
    });

    test('should return wishlist remove error', () => {
      const msg = ErrorMessages.wishlistRemoveError();
      expect(msg).toContain('❌');
      expect(msg).toContain('wishlist');
      expect(typeof msg).toBe('string');
    });

    test('should return wishlist view error', () => {
      const msg = ErrorMessages.wishlistViewError();
      expect(msg).toContain('❌');
      expect(msg).toContain('wishlist');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Review Errors', () => {
    test('should return add review error', () => {
      const msg = ErrorMessages.addReviewError();
      expect(msg).toContain('❌');
      expect(msg).toContain('review');
      expect(typeof msg).toBe('string');
    });

    test('should return view reviews error', () => {
      const msg = ErrorMessages.viewReviewsError();
      expect(msg).toContain('❌');
      expect(msg).toContain('review');
      expect(typeof msg).toBe('string');
    });

    test('should return review stats error', () => {
      const msg = ErrorMessages.reviewStatsError();
      expect(msg).toContain('❌');
      expect(msg).toContain('review');
      expect(typeof msg).toBe('string');
    });

    test('should return delete review error', () => {
      const msg = ErrorMessages.deleteReviewError();
      expect(msg).toContain('❌');
      expect(msg).toContain('review');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Admin Errors', () => {
    test('should return admin command error with message', () => {
      const error = new Error('Test error');
      const msg = ErrorMessages.adminCommandError(error);
      expect(msg).toContain('❌');
      expect(msg).toContain('command admin');
      expect(msg).toContain('Test error');
      expect(typeof msg).toBe('string');
    });

    test('should return unauthorized message', () => {
      const msg = ErrorMessages.unauthorized();
      expect(msg).toContain('❌');
      expect(msg).toContain('AKSES DITOLAK');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Product Errors', () => {
    test('should return product not found message', () => {
      const msg = ErrorMessages.productNotFound();
      expect(msg).toContain('❌');
      expect(msg).toContain('tidak ditemukan');
      expect(typeof msg).toBe('string');
    });

    test('should return out of stock message', () => {
      const msg = ErrorMessages.outOfStock();
      expect(msg).toContain('❌');
      expect(msg).toContain('habis stok');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Validation Errors', () => {
    test('should return invalid input message', () => {
      const msg = ErrorMessages.invalidInput();
      expect(msg).toContain('❌');
      expect(msg).toContain('tidak valid');
      expect(typeof msg).toBe('string');
    });

    test('should return invalid message', () => {
      const msg = ErrorMessages.invalidMessage();
      expect(msg).toContain('❌');
      expect(msg).toContain('tidak valid');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Rate Limiting Errors', () => {
    test('should return rate limit exceeded message', () => {
      const msg = ErrorMessages.rateLimitExceeded(20, 60);
      expect(msg).toContain('⚠️');
      expect(msg).toContain('20');
      expect(msg).toContain('60');
      expect(msg).toContain('pesan');
      expect(typeof msg).toBe('string');
    });

    test('should return order limit exceeded message', () => {
      const msg = ErrorMessages.orderLimitExceeded(5);
      expect(msg).toContain('⚠️');
      expect(msg).toContain('5');
      expect(msg).toContain('order');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Success Messages', () => {
    test('should return success message', () => {
      const msg = ErrorMessages.success('Test berhasil');
      expect(msg).toContain('✅');
      expect(msg).toContain('Test berhasil');
      expect(typeof msg).toBe('string');
    });

    test('should return item added message', () => {
      const msg = ErrorMessages.itemAdded('Netflix');
      expect(msg).toContain('✅');
      expect(msg).toContain('Netflix');
      expect(msg).toContain('keranjang');
      expect(typeof msg).toBe('string');
    });

    test('should return item removed message', () => {
      const msg = ErrorMessages.itemRemoved('Spotify');
      expect(msg).toContain('✅');
      expect(msg).toContain('Spotify');
      expect(msg).toContain('dihapus');
      expect(typeof msg).toBe('string');
    });
  });

  describe('Message Formatting', () => {
    test('all error messages should be strings', () => {
      expect(typeof ErrorMessages.GENERIC_ERROR).toBe('string');
      expect(typeof ErrorMessages.TRY_AGAIN_LATER).toBe('string');
      expect(typeof ErrorMessages.CONTACT_ADMIN).toBe('string');
      expect(typeof ErrorMessages.orderHistoryError()).toBe('string');
      expect(typeof ErrorMessages.wishlistSaveError()).toBe('string');
    });

    test('error messages should contain emoji', () => {
      expect(ErrorMessages.GENERIC_ERROR).toMatch(/[❌⚠️✅]/);
      expect(ErrorMessages.orderHistoryError()).toMatch(/[❌⚠️]/);
      expect(ErrorMessages.rateLimitExceeded(20, 60)).toMatch(/[⚠️]/);
    });

    test('success messages should contain ✅', () => {
      expect(ErrorMessages.success('test')).toContain('✅');
      expect(ErrorMessages.itemAdded('test')).toContain('✅');
      expect(ErrorMessages.itemRemoved('test')).toContain('✅');
    });

    test('function messages should handle parameters correctly', () => {
      const successMsg = ErrorMessages.success('Custom message');
      expect(successMsg).toContain('Custom message');

      const addedMsg = ErrorMessages.itemAdded('Product Name');
      expect(addedMsg).toContain('Product Name');

      const rateLimitMsg = ErrorMessages.rateLimitExceeded(20, 60);
      expect(rateLimitMsg).toContain('20');
      expect(rateLimitMsg).toContain('60');
    });

    test('should handle special characters in parameters', () => {
      const msg = ErrorMessages.success('Test & Special "Chars"');
      expect(msg).toContain('Test');
      expect(typeof msg).toBe('string');
    });

    test('should handle empty string parameters gracefully', () => {
      const msg = ErrorMessages.success('');
      expect(typeof msg).toBe('string');
      expect(msg).toContain('✅');
    });
  });

  describe('Consistency', () => {
    test('error messages should use consistent emoji', () => {
      // Error messages use ❌
      expect(ErrorMessages.GENERIC_ERROR).toContain('❌');
      expect(ErrorMessages.orderHistoryError()).toContain('❌');
      expect(ErrorMessages.productNotFound()).toContain('❌');
      expect(ErrorMessages.unauthorized()).toContain('❌');
    });

    test('warning messages should use ⚠️', () => {
      expect(ErrorMessages.rateLimitExceeded(20, 60)).toContain('⚠️');
      expect(ErrorMessages.orderLimitExceeded(5)).toContain('⚠️');
    });

    test('success messages should use ✅', () => {
      expect(ErrorMessages.success('test')).toContain('✅');
      expect(ErrorMessages.itemAdded('test')).toContain('✅');
      expect(ErrorMessages.itemRemoved('test')).toContain('✅');
    });
  });

  describe('Error Message Content', () => {
    test('messages should be in Bahasa Indonesia', () => {
      expect(ErrorMessages.GENERIC_ERROR).toMatch(/kesalahan|coba lagi/);
      expect(ErrorMessages.orderHistoryError()).toMatch(/riwayat pesanan/);
      expect(ErrorMessages.wishlistSaveError()).toMatch(/wishlist/);
    });

    test('messages should provide actionable guidance', () => {
      expect(ErrorMessages.GENERIC_ERROR).toMatch(/menu|coba lagi/);
      expect(ErrorMessages.productNotFound()).toMatch(/menu/);
    });

    test('messages should be user-friendly', () => {
      // Should not contain technical jargon
      expect(ErrorMessages.GENERIC_ERROR).not.toMatch(/null|undefined|exception/i);
      expect(ErrorMessages.orderHistoryError()).not.toMatch(/500|error code/i);
    });
  });
});

