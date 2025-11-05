/**
 * Unit Tests for InputSanitizer
 * Tests input validation and sanitization security features
 */

const InputSanitizer = require('../../../src/utils/InputSanitizer');

describe('InputSanitizer', () => {
  describe('sanitizeText()', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = InputSanitizer.sanitizeText(input);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('Hello');
    });

    test('should remove dangerous SQL characters', () => {
      const input = "test'; DROP TABLE users;--";
      const result = InputSanitizer.sanitizeText(input);
      
      expect(result).not.toContain("'");
      expect(result).not.toContain(';');
    });

    test('should remove command injection characters', () => {
      const input = 'test && rm -rf /';
      const result = InputSanitizer.sanitizeText(input);
      
      expect(result).not.toContain('&');
      expect(result).not.toContain('|');
    });

    test('should truncate to max length', () => {
      const input = 'a'.repeat(1000);
      const result = InputSanitizer.sanitizeText(input, 100);
      
      expect(result.length).toBe(100);
    });

    test('should handle null/undefined', () => {
      expect(InputSanitizer.sanitizeText(null)).toBe('');
      expect(InputSanitizer.sanitizeText(undefined)).toBe('');
      expect(InputSanitizer.sanitizeText('')).toBe('');
    });

    test('should normalize whitespace', () => {
      const input = 'hello    world\n\ntabs\there';
      const result = InputSanitizer.sanitizeText(input);
      
      expect(result).toBe('hello world tabs here');
    });
  });

  describe('sanitizeProductId()', () => {
    test('should allow alphanumeric and hyphens', () => {
      const input = 'netflix-premium-2024';
      const result = InputSanitizer.sanitizeProductId(input);
      
      expect(result).toBe('netflix-premium-2024');
    });

    test('should remove special characters', () => {
      const input = 'product@#$%123';
      const result = InputSanitizer.sanitizeProductId(input);
      
      expect(result).toBe('product123');
    });

    test('should convert to lowercase', () => {
      const input = 'NETFLIX-PREMIUM';
      const result = InputSanitizer.sanitizeProductId(input);
      
      expect(result).toBe('netflix-premium');
    });

    test('should handle null', () => {
      expect(InputSanitizer.sanitizeProductId(null)).toBe('');
    });
  });

  describe('sanitizePhoneNumber()', () => {
    test('should keep only digits', () => {
      const input = '+62 812-3456-7890';
      const result = InputSanitizer.sanitizePhoneNumber(input);
      
      expect(result).toBe('6281234567890');
    });

    test('should remove all non-numeric characters', () => {
      const input = '(+62) 812-ABC-7890';
      const result = InputSanitizer.sanitizePhoneNumber(input);
      
      expect(result).toBe('628127890');
    });

    test('should handle null', () => {
      expect(InputSanitizer.sanitizePhoneNumber(null)).toBe('');
    });
  });

  describe('sanitizeEmail()', () => {
    test('should accept valid email', () => {
      const input = 'test@example.com';
      const result = InputSanitizer.sanitizeEmail(input);
      
      expect(result).toBe('test@example.com');
    });

    test('should convert to lowercase', () => {
      const input = 'Test@Example.COM';
      const result = InputSanitizer.sanitizeEmail(input);
      
      expect(result).toBe('test@example.com');
    });

    test('should reject invalid email', () => {
      const input = 'not-an-email';
      const result = InputSanitizer.sanitizeEmail(input);
      
      expect(result).toBe('');
    });

    test('should trim whitespace', () => {
      const input = '  test@example.com  ';
      const result = InputSanitizer.sanitizeEmail(input);
      
      expect(result).toBe('test@example.com');
    });
  });

  describe('sanitizeOrderId()', () => {
    test('should allow alphanumeric and safe characters', () => {
      const input = 'ORD-123_456@c.us';
      const result = InputSanitizer.sanitizeOrderId(input);
      
      expect(result).toBe('ORD-123_456@c.us');
    });

    test('should remove unsafe characters', () => {
      const input = 'ORD$%^&*()123';
      const result = InputSanitizer.sanitizeOrderId(input);
      
      expect(result).toBe('ORD123');
    });
  });

  describe('sanitizeAmount()', () => {
    test('should handle valid number', () => {
      expect(InputSanitizer.sanitizeAmount(1000)).toBe(1000);
    });

    test('should parse string to number', () => {
      expect(InputSanitizer.sanitizeAmount('1000')).toBe(1000);
    });

    test('should remove currency symbols', () => {
      expect(InputSanitizer.sanitizeAmount('Rp 1.500.000')).toBe(1500000);
    });

    test('should floor decimals', () => {
      expect(InputSanitizer.sanitizeAmount(1000.99)).toBe(1000);
    });

    test('should reject negative values', () => {
      expect(InputSanitizer.sanitizeAmount(-100)).toBe(0);
    });

    test('should handle null/undefined', () => {
      expect(InputSanitizer.sanitizeAmount(null)).toBe(0);
      expect(InputSanitizer.sanitizeAmount(undefined)).toBe(0);
    });

    test('should handle NaN', () => {
      expect(InputSanitizer.sanitizeAmount('abc')).toBe(0);
    });
  });

  describe('sanitizeCommand()', () => {
    test('should allow alphanumeric and basic chars', () => {
      const input = 'menu-browse-products';
      const result = InputSanitizer.sanitizeCommand(input);
      
      expect(result).toBe('menu-browse-products');
    });

    test('should remove special characters', () => {
      const input = 'menu; rm -rf /';
      const result = InputSanitizer.sanitizeCommand(input);
      
      expect(result).toBe('menu rm -rf');
    });

    test('should convert to lowercase', () => {
      const input = 'MENU';
      const result = InputSanitizer.sanitizeCommand(input);
      
      expect(result).toBe('menu');
    });
  });

  describe('sanitizePromoCode()', () => {
    test('should convert to uppercase', () => {
      const input = 'save20';
      const result = InputSanitizer.sanitizePromoCode(input);
      
      expect(result).toBe('SAVE20');
    });

    test('should remove special characters', () => {
      const input = 'SAVE-20%';
      const result = InputSanitizer.sanitizePromoCode(input);
      
      expect(result).toBe('SAVE20');
    });

    test('should handle null', () => {
      expect(InputSanitizer.sanitizePromoCode(null)).toBe('');
    });
  });

  describe('sanitizeInteger()', () => {
    test('should parse valid integer', () => {
      expect(InputSanitizer.sanitizeInteger('42')).toBe(42);
    });

    test('should enforce minimum', () => {
      expect(InputSanitizer.sanitizeInteger(-10, 0, 100)).toBe(0);
    });

    test('should enforce maximum', () => {
      expect(InputSanitizer.sanitizeInteger(200, 0, 100)).toBe(100);
    });

    test('should handle NaN', () => {
      expect(InputSanitizer.sanitizeInteger('abc', 0, 100)).toBe(0);
    });
  });

  describe('removeNullBytes()', () => {
    test('should remove null bytes', () => {
      const input = 'test\0data';
      const result = InputSanitizer.removeNullBytes(input);
      
      expect(result).toBe('testdata');
      expect(result).not.toContain('\0');
    });

    test('should handle no null bytes', () => {
      const input = 'clean data';
      const result = InputSanitizer.removeNullBytes(input);
      
      expect(result).toBe('clean data');
    });
  });

  describe('sanitizeFilename()', () => {
    test('should remove path separators', () => {
      const input = '../../../etc/passwd';
      const result = InputSanitizer.sanitizeFilename(input);
      
      expect(result).not.toContain('/');
      expect(result).not.toContain('..');
    });

    test('should remove dangerous characters', () => {
      const input = 'file:name?.txt';
      const result = InputSanitizer.sanitizeFilename(input);
      
      expect(result).toBe('filename.txt');
    });

    test('should remove leading dots', () => {
      const input = '...hidden.txt';
      const result = InputSanitizer.sanitizeFilename(input);
      
      expect(result).toBe('hidden.txt');
    });
  });

  describe('isValidCustomerId()', () => {
    test('should accept valid WhatsApp ID', () => {
      expect(InputSanitizer.isValidCustomerId('628123456789@c.us')).toBe(true);
    });

    test('should accept whatsapp.net format', () => {
      expect(InputSanitizer.isValidCustomerId('628123456789@s.whatsapp.net')).toBe(true);
    });

    test('should reject invalid format', () => {
      expect(InputSanitizer.isValidCustomerId('invalid')).toBe(false);
      expect(InputSanitizer.isValidCustomerId('test@gmail.com')).toBe(false);
    });

    test('should reject null', () => {
      expect(InputSanitizer.isValidCustomerId(null)).toBe(false);
    });
  });

  describe('sanitizeJSON()', () => {
    test('should parse valid JSON', () => {
      const input = '{"key": "value"}';
      const result = InputSanitizer.sanitizeJSON(input);
      
      expect(result).toEqual({ key: 'value' });
    });

    test('should prevent prototype pollution', () => {
      const input = '{"__proto__": {"polluted": true}}';
      const result = InputSanitizer.sanitizeJSON(input);
      
      // Should not have polluted property in prototype
      expect(result).toBeDefined();
      expect(result.polluted).toBeUndefined();
    });

    test('should handle invalid JSON', () => {
      const input = '{invalid json}';
      const result = InputSanitizer.sanitizeJSON(input);
      
      expect(result).toBeNull();
    });

    test('should handle null', () => {
      expect(InputSanitizer.sanitizeJSON(null)).toBeNull();
    });
  });

  describe('validate()', () => {
    test('should validate text input', () => {
      const result = InputSanitizer.validate('Hello World', { 
        type: 'text',
        maxLength: 100 
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect length violations', () => {
      const result = InputSanitizer.validate('Hi', { 
        minLength: 5,
        maxLength: 100 
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Input too short (min: 5)');
    });

    test('should detect dangerous patterns', () => {
      const result = InputSanitizer.validate('<script>alert("xss")</script>', {
        allowSpecialChars: false
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate email type', () => {
      const result = InputSanitizer.validate('test@example.com', {
        type: 'email'
      });
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    test('should validate phone type', () => {
      const result = InputSanitizer.validate('+62 812 3456 7890', {
        type: 'phone'
      });
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('6281234567890');
    });
  });

  describe('escapeHtml()', () => {
    test('should escape HTML entities', () => {
      const input = '<div>Test & "quotes"</div>';
      const result = InputSanitizer.escapeHtml(input);
      
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
    });

    test('should handle null', () => {
      expect(InputSanitizer.escapeHtml(null)).toBe('');
    });
  });

  describe('checkRateLimit()', () => {
    beforeEach(() => {
      // Clear rate limit store
      if (InputSanitizer.rateLimitStore) {
        InputSanitizer.rateLimitStore.clear();
      }
    });

    test('should allow requests within limit', () => {
      const key = 'test-user';
      
      for (let i = 0; i < 5; i++) {
        expect(InputSanitizer.checkRateLimit(key, 10, 60000, true)).toBe(true); // force=true
      }
    });

    test('should block requests over limit', () => {
      const key = 'test-user-2';
      
      // Make 10 requests (limit)
      for (let i = 0; i < 10; i++) {
        InputSanitizer.checkRateLimit(key, 10, 60000, true); // force=true
      }
      
      // 11th request should be blocked
      expect(InputSanitizer.checkRateLimit(key, 10, 60000, true)).toBe(false); // force=true
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty strings', () => {
      expect(InputSanitizer.sanitizeText('')).toBe('');
      expect(InputSanitizer.sanitizeProductId('')).toBe('');
      expect(InputSanitizer.sanitizeEmail('')).toBe('');
    });

    test('should handle non-string inputs', () => {
      expect(InputSanitizer.sanitizeText(123)).toBe('');
      expect(InputSanitizer.sanitizeProductId({})).toBe('');
      expect(InputSanitizer.sanitizeEmail([])).toBe('');
    });

    test('should handle very long inputs', () => {
      const longInput = 'a'.repeat(10000);
      const result = InputSanitizer.sanitizeText(longInput, 500);
      
      expect(result.length).toBe(500);
    });

    test('should handle unicode characters', () => {
      const input = 'Hello 你好 مرحبا';
      const result = InputSanitizer.sanitizeText(input);
      
      expect(result).toBeDefined();
    });
  });
});
