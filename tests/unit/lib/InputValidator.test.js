/**
 * Unit Tests for InputValidator
 * Tests validation, sanitization, and rate limiting
 */

const InputValidator = require('../../../lib/inputValidator');

// Mock environment variables
process.env.ADMIN_NUMBER_1 = '628111111111';
process.env.ADMIN_NUMBER_2 = '628222222222';
process.env.ADMIN_NUMBER_3 = '628333333333';

describe('InputValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new InputValidator();
    // Clear all maps
    validator.messageCount.clear();
    validator.orderCount.clear();
    validator.errorCooldown.clear();
  });

  afterEach(() => {
    // Clear intervals to prevent memory leaks
    if (validator._cleanupInterval) {
      clearInterval(validator._cleanupInterval);
    }
  });

  describe('Constructor', () => {
    test('should initialize with default rate limits', () => {
      expect(validator.MESSAGE_LIMIT).toBe(20);
      expect(validator.ORDER_LIMIT).toBe(5);
      expect(validator.ERROR_COOLDOWN).toBe(60000);
    });

    test('should initialize empty maps', () => {
      expect(validator.messageCount.size).toBe(0);
      expect(validator.orderCount.size).toBe(0);
      expect(validator.errorCooldown.size).toBe(0);
    });
  });

  describe('canSendMessage()', () => {
    const customerId = '628123456789@c.us';

    test('should allow first message', () => {
      const result = validator.canSendMessage(customerId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19);
    });

    test('should allow messages under limit', () => {
      // Send 10 messages
      for (let i = 0; i < 10; i++) {
        validator.canSendMessage(customerId);
      }

      const result = validator.canSendMessage(customerId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // 20 - 11 = 9
    });

    test('should block messages at limit', () => {
      // Hit limit (20 messages)
      for (let i = 0; i < 20; i++) {
        validator.canSendMessage(customerId);
      }

      const result = validator.canSendMessage(customerId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('rate_limit');
      expect(result.waitTime).toBeGreaterThan(0);
      expect(result.message).toContain('Terlalu banyak pesan');
    });

    test('should reset counter after window expires', () => {
      // Hit limit
      for (let i = 0; i < 20; i++) {
        validator.canSendMessage(customerId);
      }

      // Manually expire the window
      const data = validator.messageCount.get(customerId);
      data.resetTime = Date.now() - 1000; // 1 second ago

      const result = validator.canSendMessage(customerId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19);
    });

    test('should track multiple customers independently', () => {
      const customer1 = '628111111111@c.us';
      const customer2 = '628222222222@c.us';

      // Hit limit for customer1
      for (let i = 0; i < 20; i++) {
        validator.canSendMessage(customer1);
      }

      // Customer1 blocked
      expect(validator.canSendMessage(customer1).allowed).toBe(false);

      // Customer2 still allowed
      expect(validator.canSendMessage(customer2).allowed).toBe(true);
    });

    test('should calculate correct wait time', () => {
      // Hit limit
      for (let i = 0; i < 20; i++) {
        validator.canSendMessage(customerId);
      }

      const result = validator.canSendMessage(customerId);

      expect(result.waitTime).toBeLessThanOrEqual(60); // Max 60 seconds
      expect(result.waitTime).toBeGreaterThan(0);
    });
  });

  describe('canPlaceOrder()', () => {
    const customerId = '628123456789@c.us';

    test('should allow first order', () => {
      const result = validator.canPlaceOrder(customerId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1 = 4
    });

    test('should allow orders under daily limit', () => {
      // Place 3 orders
      for (let i = 0; i < 3; i++) {
        validator.canPlaceOrder(customerId);
      }

      const result = validator.canPlaceOrder(customerId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1); // 5 - 4 = 1
    });

    test('should block orders at daily limit', () => {
      // Hit limit (5 orders)
      for (let i = 0; i < 5; i++) {
        validator.canPlaceOrder(customerId);
      }

      const result = validator.canPlaceOrder(customerId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('order_limit');
      expect(result.message).toContain('Batas Order Harian');
      expect(result.message).toContain('5 order');
    });

    test('should reset counter on new day', () => {
      // Place 5 orders
      for (let i = 0; i < 5; i++) {
        validator.canPlaceOrder(customerId);
      }

      // Simulate new day
      const data = validator.orderCount.get(customerId);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      data.resetDate = yesterday.toDateString();

      const result = validator.canPlaceOrder(customerId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    test('should track multiple customers independently', () => {
      const customer1 = '628111111111@c.us';
      const customer2 = '628222222222@c.us';

      // Hit limit for customer1
      for (let i = 0; i < 5; i++) {
        validator.canPlaceOrder(customer1);
      }

      // Customer1 blocked
      expect(validator.canPlaceOrder(customer1).allowed).toBe(false);

      // Customer2 still allowed
      expect(validator.canPlaceOrder(customer2).allowed).toBe(true);
    });
  });

  describe('Error Cooldown', () => {
    const customerId = '628123456789@c.us';

    test('should not be in cooldown initially', () => {
      const result = validator.isInCooldown(customerId);

      expect(result.inCooldown).toBe(false);
    });

    test('should set cooldown', () => {
      validator.setErrorCooldown(customerId);

      const result = validator.isInCooldown(customerId);

      expect(result.inCooldown).toBe(true);
      expect(result.waitTime).toBeGreaterThan(0);
      expect(result.waitTime).toBeLessThanOrEqual(60);
      expect(result.message).toContain('Cooldown Aktif');
    });

    test('should clear cooldown after expiry', () => {
      validator.setErrorCooldown(customerId);

      // Manually expire cooldown
      validator.errorCooldown.set(customerId, Date.now() - 1000);

      const result = validator.isInCooldown(customerId);

      expect(result.inCooldown).toBe(false);
      expect(validator.errorCooldown.has(customerId)).toBe(false);
    });

    test('should track cooldown for multiple customers', () => {
      const customer1 = '628111111111@c.us';
      const customer2 = '628222222222@c.us';

      validator.setErrorCooldown(customer1);

      expect(validator.isInCooldown(customer1).inCooldown).toBe(true);
      expect(validator.isInCooldown(customer2).inCooldown).toBe(false);
    });
  });

  describe('cleanup()', () => {
    test('should cleanup expired message counts', () => {
      const customerId = '628123456789@c.us';

      validator.canSendMessage(customerId);

      // Manually expire
      const data = validator.messageCount.get(customerId);
      data.resetTime = Date.now() - 120000; // 2 minutes ago

      validator.cleanup();

      expect(validator.messageCount.has(customerId)).toBe(false);
    });

    test('should keep active message counts', () => {
      const customerId = '628123456789@c.us';

      validator.canSendMessage(customerId);
      validator.cleanup();

      expect(validator.messageCount.has(customerId)).toBe(true);
    });

    test('should cleanup old order counts', () => {
      const customerId = '628123456789@c.us';

      validator.canPlaceOrder(customerId);

      // Simulate yesterday's data
      const data = validator.orderCount.get(customerId);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      data.resetDate = yesterday.toDateString();

      validator.cleanup();

      expect(validator.orderCount.has(customerId)).toBe(false);
    });

    test('should keep today order counts', () => {
      const customerId = '628123456789@c.us';

      validator.canPlaceOrder(customerId);
      validator.cleanup();

      expect(validator.orderCount.has(customerId)).toBe(true);
    });

    test('should cleanup expired cooldowns', () => {
      const customerId = '628123456789@c.us';

      validator.setErrorCooldown(customerId);

      // Manually expire
      validator.errorCooldown.set(customerId, Date.now() - 1000);

      validator.cleanup();

      expect(validator.errorCooldown.has(customerId)).toBe(false);
    });

    test('should keep active cooldowns', () => {
      const customerId = '628123456789@c.us';

      validator.setErrorCooldown(customerId);
      validator.cleanup();

      expect(validator.errorCooldown.has(customerId)).toBe(true);
    });
  });

  describe('getStats()', () => {
    const customerId = '628123456789@c.us';

    test('should return zero stats for new customer', () => {
      const stats = validator.getStats(customerId);

      expect(stats.messages).toBe(0);
      expect(stats.orders).toBe(0);
      expect(stats.messageLimit).toBe(20);
      expect(stats.orderLimit).toBe(5);
    });

    test('should return correct message count', () => {
      for (let i = 0; i < 5; i++) {
        validator.canSendMessage(customerId);
      }

      const stats = validator.getStats(customerId);

      expect(stats.messages).toBe(5);
    });

    test('should return correct order count', () => {
      for (let i = 0; i < 3; i++) {
        validator.canPlaceOrder(customerId);
      }

      const stats = validator.getStats(customerId);

      expect(stats.orders).toBe(3);
    });

    test('should return combined stats', () => {
      validator.canSendMessage(customerId);
      validator.canSendMessage(customerId);
      validator.canPlaceOrder(customerId);

      const stats = validator.getStats(customerId);

      expect(stats.messages).toBe(2);
      expect(stats.orders).toBe(1);
    });
  });

  describe('Static Methods', () => {
    describe('sanitizeMessage()', () => {
      test('should remove null bytes', () => {
        const result = InputValidator.sanitizeMessage('test\0message');
        expect(result).toBe('testmessage');
      });

      test('should trim whitespace', () => {
        const result = InputValidator.sanitizeMessage('  hello world  ');
        expect(result).toBe('hello world');
      });

      test('should limit length to 1000 chars', () => {
        const longMessage = 'a'.repeat(1500);
        const result = InputValidator.sanitizeMessage(longMessage);
        expect(result.length).toBe(1000);
      });

      test('should handle non-string input', () => {
        expect(InputValidator.sanitizeMessage(null)).toBe('');
        expect(InputValidator.sanitizeMessage(undefined)).toBe('');
        expect(InputValidator.sanitizeMessage(123)).toBe('');
        expect(InputValidator.sanitizeMessage({})).toBe('');
      });

      test('should preserve emoji and special chars', () => {
        const result = InputValidator.sanitizeMessage('Hello 👋 World! 🎉');
        expect(result).toBe('Hello 👋 World! 🎉');
      });

      test('should handle empty string', () => {
        const result = InputValidator.sanitizeMessage('');
        expect(result).toBe('');
      });

      test('should handle whitespace only', () => {
        const result = InputValidator.sanitizeMessage('   ');
        expect(result).toBe('');
      });
    });

    describe('isValidPhoneNumber()', () => {
      test('should validate correct WhatsApp format', () => {
        expect(InputValidator.isValidPhoneNumber('628123456789@c.us')).toBe(true);
        expect(InputValidator.isValidPhoneNumber('1234567890@c.us')).toBe(true);
        expect(InputValidator.isValidPhoneNumber('62812345678901@c.us')).toBe(true);
      });

      test('should reject invalid formats', () => {
        expect(InputValidator.isValidPhoneNumber('123@c.us')).toBe(false); // Too short
        expect(InputValidator.isValidPhoneNumber('1234567890')).toBe(false); // Missing suffix
        expect(InputValidator.isValidPhoneNumber('abc123@c.us')).toBe(false); // Contains letters
        expect(InputValidator.isValidPhoneNumber('1234567890@s.whatsapp.net')).toBe(false); // Wrong suffix
      });

      test('should reject numbers too short or too long', () => {
        expect(InputValidator.isValidPhoneNumber('123456789@c.us')).toBe(false); // 9 digits
        expect(InputValidator.isValidPhoneNumber('1234567890123456@c.us')).toBe(false); // 16 digits
      });
    });

    describe('isValidOrderId()', () => {
      test('should validate correct order ID format', () => {
        expect(InputValidator.isValidOrderId('ORD-1234567890123-abcd')).toBe(true);
        expect(InputValidator.isValidOrderId('ORD-9876543210987-XyZ1')).toBe(true);
      });

      test('should reject invalid formats', () => {
        expect(InputValidator.isValidOrderId('ORD-123-abcd')).toBe(false); // Timestamp too short
        expect(InputValidator.isValidOrderId('ORD-1234567890123-ab')).toBe(false); // Suffix too short
        expect(InputValidator.isValidOrderId('ORDER-1234567890123-abcd')).toBe(false); // Wrong prefix
        expect(InputValidator.isValidOrderId('ORD-1234567890123')).toBe(false); // Missing suffix
      });
    });

    describe('isAdmin()', () => {
      test('should identify admin numbers', () => {
        expect(InputValidator.isAdmin('628111111111@c.us')).toBe(true);
        expect(InputValidator.isAdmin('628222222222@c.us')).toBe(true);
        expect(InputValidator.isAdmin('628333333333@c.us')).toBe(true);
      });

      test('should reject non-admin numbers', () => {
        expect(InputValidator.isAdmin('628999999999@c.us')).toBe(false);
        expect(InputValidator.isAdmin('628123456789@c.us')).toBe(false);
      });

      test('should handle partial matches', () => {
        // includes() method matches if number is contained
        expect(InputValidator.isAdmin('628111111111')).toBe(true);
      });
    });

    describe('escapeHtml()', () => {
      test('should escape HTML special characters', () => {
        expect(InputValidator.escapeHtml('<script>alert("xss")</script>'))
          .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      });

      test('should escape all dangerous chars', () => {
        expect(InputValidator.escapeHtml('&')).toBe('&amp;');
        expect(InputValidator.escapeHtml('<')).toBe('&lt;');
        expect(InputValidator.escapeHtml('>')).toBe('&gt;');
        expect(InputValidator.escapeHtml('"')).toBe('&quot;');
        expect(InputValidator.escapeHtml("'")).toBe('&#039;');
      });

      test('should handle mixed content', () => {
        const result = InputValidator.escapeHtml('Hello <b>"World"</b> & \'Test\'');
        expect(result).toBe('Hello &lt;b&gt;&quot;World&quot;&lt;/b&gt; &amp; &#039;Test&#039;');
      });

      test('should preserve safe characters', () => {
        expect(InputValidator.escapeHtml('Hello World 123')).toBe('Hello World 123');
      });
    });

    describe('isValidPaymentChoice()', () => {
      test('should validate numeric choices', () => {
        expect(InputValidator.isValidPaymentChoice('1')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('2')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('3')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('4')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('5')).toBe(true);
      });

      test('should validate payment method names', () => {
        expect(InputValidator.isValidPaymentChoice('qris')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('dana')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('gopay')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('shopeepay')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('bank')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('transfer')).toBe(true);
      });

      test('should be case insensitive', () => {
        expect(InputValidator.isValidPaymentChoice('QRIS')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('Dana')).toBe(true);
        expect(InputValidator.isValidPaymentChoice('GOPAY')).toBe(true);
      });

      test('should reject invalid choices', () => {
        expect(InputValidator.isValidPaymentChoice('0')).toBe(false);
        expect(InputValidator.isValidPaymentChoice('6')).toBe(false);
        expect(InputValidator.isValidPaymentChoice('ovo')).toBe(false);
        expect(InputValidator.isValidPaymentChoice('bitcoin')).toBe(false);
      });
    });

    describe('isValidBankChoice()', () => {
      test('should validate numeric choices', () => {
        expect(InputValidator.isValidBankChoice('1')).toBe(true);
        expect(InputValidator.isValidBankChoice('2')).toBe(true);
        expect(InputValidator.isValidBankChoice('3')).toBe(true);
        expect(InputValidator.isValidBankChoice('4')).toBe(true);
        expect(InputValidator.isValidBankChoice('5')).toBe(true);
      });

      test('should validate bank names', () => {
        expect(InputValidator.isValidBankChoice('bca')).toBe(true);
        expect(InputValidator.isValidBankChoice('bni')).toBe(true);
        expect(InputValidator.isValidBankChoice('bri')).toBe(true);
        expect(InputValidator.isValidBankChoice('mandiri')).toBe(true);
        expect(InputValidator.isValidBankChoice('permata')).toBe(true);
      });

      test('should be case insensitive', () => {
        expect(InputValidator.isValidBankChoice('BCA')).toBe(true);
        expect(InputValidator.isValidBankChoice('Mandiri')).toBe(true);
      });

      test('should reject invalid choices', () => {
        expect(InputValidator.isValidBankChoice('0')).toBe(false);
        expect(InputValidator.isValidBankChoice('6')).toBe(false);
        expect(InputValidator.isValidBankChoice('hsbc')).toBe(false);
      });
    });

    describe('isValidMenuChoice()', () => {
      test('should validate numeric choices', () => {
        expect(InputValidator.isValidMenuChoice('1')).toBe(true);
        expect(InputValidator.isValidMenuChoice('2')).toBe(true);
        expect(InputValidator.isValidMenuChoice('3')).toBe(true);
        expect(InputValidator.isValidMenuChoice('4')).toBe(true);
      });

      test('should validate menu keywords', () => {
        expect(InputValidator.isValidMenuChoice('browse')).toBe(true);
        expect(InputValidator.isValidMenuChoice('cart')).toBe(true);
        expect(InputValidator.isValidMenuChoice('about')).toBe(true);
        expect(InputValidator.isValidMenuChoice('support')).toBe(true);
        expect(InputValidator.isValidMenuChoice('contact')).toBe(true);
        expect(InputValidator.isValidMenuChoice('products')).toBe(true);
      });

      test('should be case insensitive', () => {
        expect(InputValidator.isValidMenuChoice('BROWSE')).toBe(true);
        expect(InputValidator.isValidMenuChoice('Cart')).toBe(true);
      });

      test('should reject invalid choices', () => {
        expect(InputValidator.isValidMenuChoice('0')).toBe(false);
        expect(InputValidator.isValidMenuChoice('5')).toBe(false);
        expect(InputValidator.isValidMenuChoice('invalid')).toBe(false);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should handle full rate limiting scenario', () => {
      const customerId = '628123456789@c.us';

      // Send messages until blocked
      let result;
      for (let i = 0; i < 25; i++) {
        result = validator.canSendMessage(customerId);
      }

      // Should be blocked
      expect(result.allowed).toBe(false);

      // Set error cooldown
      validator.setErrorCooldown(customerId);

      // Check cooldown
      const cooldownResult = validator.isInCooldown(customerId);
      expect(cooldownResult.inCooldown).toBe(true);

      // Get stats
      const stats = validator.getStats(customerId);
      expect(stats.messages).toBe(20);
    });

    test('should isolate different customers completely', () => {
      const customer1 = '628111111111@c.us';
      const customer2 = '628222222222@c.us';

      // Max out customer1
      for (let i = 0; i < 20; i++) {
        validator.canSendMessage(customer1);
      }
      for (let i = 0; i < 5; i++) {
        validator.canPlaceOrder(customer1);
      }
      validator.setErrorCooldown(customer1);

      // Customer1 fully restricted
      expect(validator.canSendMessage(customer1).allowed).toBe(false);
      expect(validator.canPlaceOrder(customer1).allowed).toBe(false);
      expect(validator.isInCooldown(customer1).inCooldown).toBe(true);

      // Customer2 completely free
      expect(validator.canSendMessage(customer2).allowed).toBe(true);
      expect(validator.canPlaceOrder(customer2).allowed).toBe(true);
      expect(validator.isInCooldown(customer2).inCooldown).toBe(false);
    });
  });
});
