/**
 * Unit Tests for Constants
 * Tests all application constants and enums
 */

const {
  SessionSteps,
  PaymentMethods,
  PaymentStatus,
  AdminCommands,
  GlobalCommands,
  ProductCategories,
  ErrorMessages,
  SuccessMessages,
  RateLimits,
  SessionConfig,
  ValidationPatterns
} = require('../../../src/utils/Constants');

describe('Constants', () => {
  describe('SessionSteps', () => {
    test('should define all session steps', () => {
      expect(SessionSteps.MENU).toBe('menu');
      expect(SessionSteps.BROWSING).toBe('browsing');
      expect(SessionSteps.CHECKOUT).toBe('checkout');
      expect(SessionSteps.SELECT_PAYMENT).toBe('select_payment');
      expect(SessionSteps.SELECT_BANK).toBe('select_bank');
      expect(SessionSteps.AWAITING_PAYMENT).toBe('awaiting_payment');
      expect(SessionSteps.AWAITING_ADMIN_APPROVAL).toBe('awaiting_admin_approval');
      expect(SessionSteps.UPLOAD_PROOF).toBe('upload_proof');
    });

    test('should have consistent naming', () => {
      Object.values(SessionSteps).forEach(step => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PaymentMethods', () => {
    test('should define QRIS payment', () => {
      expect(PaymentMethods.QRIS).toBe('QRIS');
    });

    test('should define e-wallet payments', () => {
      expect(PaymentMethods.DANA).toBe('DANA');
      expect(PaymentMethods.GOPAY).toBe('GOPAY');
      expect(PaymentMethods.OVO).toBe('OVO');
      expect(PaymentMethods.SHOPEEPAY).toBe('SHOPEEPAY');
    });

    test('should define bank transfers', () => {
      expect(PaymentMethods.BCA).toBe('BCA');
      expect(PaymentMethods.BNI).toBe('BNI');
      expect(PaymentMethods.BRI).toBe('BRI');
      expect(PaymentMethods.MANDIRI).toBe('MANDIRI');
    });

    test('should have uppercase values', () => {
      Object.values(PaymentMethods).forEach(method => {
        expect(method).toBe(method.toUpperCase());
      });
    });
  });

  describe('PaymentStatus', () => {
    test('should define all payment statuses', () => {
      expect(PaymentStatus.PENDING).toBe('pending');
      expect(PaymentStatus.AWAITING_PROOF).toBe('awaiting_proof');
      expect(PaymentStatus.AWAITING_APPROVAL).toBe('awaiting_admin_approval');
      expect(PaymentStatus.PAID).toBe('paid');
      expect(PaymentStatus.EXPIRED).toBe('expired');
      expect(PaymentStatus.FAILED).toBe('failed');
    });

    test('should use lowercase with underscores', () => {
      Object.values(PaymentStatus).forEach(status => {
        expect(status).toBe(status.toLowerCase());
        expect(status).not.toContain(' ');
      });
    });
  });

  describe('AdminCommands', () => {
    test('should define admin commands', () => {
      expect(AdminCommands.APPROVE).toBe('/approve');
      expect(AdminCommands.BROADCAST).toBe('/broadcast');
      expect(AdminCommands.STATS).toBe('/stats');
      expect(AdminCommands.STATUS).toBe('/status');
      expect(AdminCommands.STOCK).toBe('/stock');
      expect(AdminCommands.ADD_PRODUCT).toBe('/addproduct');
      expect(AdminCommands.EDIT_PRODUCT).toBe('/editproduct');
      expect(AdminCommands.REMOVE_PRODUCT).toBe('/removeproduct');
      expect(AdminCommands.SETTINGS).toBe('/settings');
    });

    test('should start with slash', () => {
      Object.values(AdminCommands).forEach(cmd => {
        expect(cmd).toMatch(/^\//);
      });
    });

    test('should be lowercase', () => {
      Object.values(AdminCommands).forEach(cmd => {
        expect(cmd.substring(1)).toBe(cmd.substring(1).toLowerCase());
      });
    });
  });

  describe('GlobalCommands', () => {
    test('should define global commands', () => {
      expect(GlobalCommands.MENU).toBe('menu');
      expect(GlobalCommands.HELP).toBe('help');
      expect(GlobalCommands.CART).toBe('cart');
      expect(GlobalCommands.HISTORY).toBe('history');
    });

    test('should be lowercase', () => {
      Object.values(GlobalCommands).forEach(cmd => {
        expect(cmd).toBe(cmd.toLowerCase());
      });
    });

    test('should not start with slash', () => {
      Object.values(GlobalCommands).forEach(cmd => {
        expect(cmd).not.toMatch(/^\//);
      });
    });
  });

  describe('ProductCategories', () => {
    test('should define categories', () => {
      expect(ProductCategories.PREMIUM_ACCOUNTS).toBe('premium_accounts');
      expect(ProductCategories.VIRTUAL_CARDS).toBe('virtual_cards');
    });

    test('should use snake_case', () => {
      Object.values(ProductCategories).forEach(cat => {
        expect(cat).toMatch(/^[a-z_]+$/);
      });
    });
  });

  describe('ErrorMessages', () => {
    test('should define error messages', () => {
      expect(ErrorMessages.RATE_LIMIT).toBeDefined();
      expect(ErrorMessages.INVALID_INPUT).toBeDefined();
      expect(ErrorMessages.SYSTEM_ERROR).toBeDefined();
      expect(ErrorMessages.PRODUCT_NOT_FOUND).toBeDefined();
      expect(ErrorMessages.EMPTY_CART).toBeDefined();
      expect(ErrorMessages.UNAUTHORIZED).toBeDefined();
    });

    test('should include emoji in error messages', () => {
      expect(ErrorMessages.RATE_LIMIT).toMatch(/⚠️|❌/);
      expect(ErrorMessages.INVALID_INPUT).toMatch(/❌/);
      expect(ErrorMessages.SYSTEM_ERROR).toMatch(/❌/);
      expect(ErrorMessages.PRODUCT_NOT_FOUND).toMatch(/❌/);
      expect(ErrorMessages.UNAUTHORIZED).toMatch(/❌/);
    });

    test('should be non-empty strings', () => {
      Object.values(ErrorMessages).forEach(msg => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SuccessMessages', () => {
    test('should define success messages', () => {
      expect(SuccessMessages.PRODUCT_ADDED).toBeDefined();
      expect(SuccessMessages.CART_CLEARED).toBeDefined();
      expect(SuccessMessages.ORDER_PLACED).toBeDefined();
      expect(SuccessMessages.PAYMENT_RECEIVED).toBeDefined();
    });

    test('should include success emoji', () => {
      expect(SuccessMessages.PRODUCT_ADDED).toMatch(/✅/);
      expect(SuccessMessages.CART_CLEARED).toMatch(/🗑️/);
      expect(SuccessMessages.ORDER_PLACED).toMatch(/✅/);
      expect(SuccessMessages.PAYMENT_RECEIVED).toMatch(/✅/);
    });

    test('should be positive messages', () => {
      Object.values(SuccessMessages).forEach(msg => {
        expect(msg).toMatch(/✅|🗑️/);
      });
    });
  });

  describe('RateLimits', () => {
    test('should define rate limit values', () => {
      expect(RateLimits.MAX_MESSAGES_PER_MINUTE).toBe(20);
      expect(RateLimits.COOLDOWN_DURATION).toBe(60000);
      expect(RateLimits.ERROR_COOLDOWN).toBe(300000);
    });

    test('should be positive numbers', () => {
      Object.values(RateLimits).forEach(val => {
        expect(typeof val).toBe('number');
        expect(val).toBeGreaterThan(0);
      });
    });

    test('should have reasonable values', () => {
      expect(RateLimits.MAX_MESSAGES_PER_MINUTE).toBeLessThan(100);
      expect(RateLimits.COOLDOWN_DURATION).toBeLessThan(600000);
    });
  });

  describe('SessionConfig', () => {
    test('should define session configuration', () => {
      expect(SessionConfig.DEFAULT_TTL).toBe(1800);
      expect(SessionConfig.CLEANUP_INTERVAL).toBe(600000);
      expect(SessionConfig.MAX_CART_ITEMS).toBe(50);
    });

    test('should be positive numbers', () => {
      Object.values(SessionConfig).forEach(val => {
        expect(typeof val).toBe('number');
        expect(val).toBeGreaterThan(0);
      });
    });

    test('should have reasonable TTL', () => {
      expect(SessionConfig.DEFAULT_TTL).toBeGreaterThan(300); // > 5 minutes
      expect(SessionConfig.DEFAULT_TTL).toBeLessThan(7200); // < 2 hours
    });

    test('should have reasonable cleanup interval', () => {
      expect(SessionConfig.CLEANUP_INTERVAL).toBeGreaterThan(60000); // > 1 minute
      expect(SessionConfig.CLEANUP_INTERVAL).toBeLessThan(3600000); // < 1 hour
    });

    test('should have reasonable cart limit', () => {
      expect(SessionConfig.MAX_CART_ITEMS).toBeGreaterThan(0);
      expect(SessionConfig.MAX_CART_ITEMS).toBeLessThan(1000);
    });
  });

  describe('ValidationPatterns', () => {
    test('should define validation regex patterns', () => {
      expect(ValidationPatterns.ORDER_ID).toBeInstanceOf(RegExp);
      expect(ValidationPatterns.PHONE_NUMBER).toBeInstanceOf(RegExp);
      expect(ValidationPatterns.AMOUNT).toBeInstanceOf(RegExp);
    });

    test('ORDER_ID pattern should match valid order IDs', () => {
      expect('ORD-1234567890123').toMatch(ValidationPatterns.ORDER_ID);
      expect('ORD-9999999999999').toMatch(ValidationPatterns.ORDER_ID);
    });

    test('ORDER_ID pattern should reject invalid order IDs', () => {
      expect('ORD-123').not.toMatch(ValidationPatterns.ORDER_ID);
      expect('order-1234567890123').not.toMatch(ValidationPatterns.ORDER_ID);
      expect('ORD-12345678901234').not.toMatch(ValidationPatterns.ORDER_ID);
    });

    test('PHONE_NUMBER pattern should match valid phone numbers', () => {
      expect('1234567890').toMatch(ValidationPatterns.PHONE_NUMBER);
      expect('628123456789').toMatch(ValidationPatterns.PHONE_NUMBER);
      expect('123456789012345').toMatch(ValidationPatterns.PHONE_NUMBER);
    });

    test('PHONE_NUMBER pattern should reject invalid numbers', () => {
      expect('123').not.toMatch(ValidationPatterns.PHONE_NUMBER);
      expect('1234567890123456').not.toMatch(ValidationPatterns.PHONE_NUMBER);
      expect('abc1234567890').not.toMatch(ValidationPatterns.PHONE_NUMBER);
    });

    test('AMOUNT pattern should match valid amounts', () => {
      expect('100').toMatch(ValidationPatterns.AMOUNT);
      expect('50000').toMatch(ValidationPatterns.AMOUNT);
      expect('0').toMatch(ValidationPatterns.AMOUNT);
    });

    test('AMOUNT pattern should reject invalid amounts', () => {
      expect('-100').not.toMatch(ValidationPatterns.AMOUNT);
      expect('100.50').not.toMatch(ValidationPatterns.AMOUNT);
      expect('abc').not.toMatch(ValidationPatterns.AMOUNT);
    });
  });

  describe('Module Exports', () => {
    test('should export all constants', () => {
      const Constants = require('../../../src/utils/Constants');

      expect(Constants).toHaveProperty('SessionSteps');
      expect(Constants).toHaveProperty('PaymentMethods');
      expect(Constants).toHaveProperty('PaymentStatus');
      expect(Constants).toHaveProperty('AdminCommands');
      expect(Constants).toHaveProperty('GlobalCommands');
      expect(Constants).toHaveProperty('ProductCategories');
      expect(Constants).toHaveProperty('ErrorMessages');
      expect(Constants).toHaveProperty('SuccessMessages');
      expect(Constants).toHaveProperty('RateLimits');
      expect(Constants).toHaveProperty('SessionConfig');
      expect(Constants).toHaveProperty('ValidationPatterns');
    });

    test('should not have circular references', () => {
      expect(() => JSON.stringify(SessionSteps)).not.toThrow();
      expect(() => JSON.stringify(PaymentMethods)).not.toThrow();
      expect(() => JSON.stringify(PaymentStatus)).not.toThrow();
    });
  });

  describe('Consistency', () => {
    test('SessionSteps values should be unique', () => {
      const values = Object.values(SessionSteps);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    test('PaymentMethods values should be unique', () => {
      const values = Object.values(PaymentMethods);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    test('PaymentStatus values should be unique', () => {
      const values = Object.values(PaymentStatus);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    test('AdminCommands values should be unique', () => {
      const values = Object.values(AdminCommands);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    test('GlobalCommands values should be unique', () => {
      const values = Object.values(GlobalCommands);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
