/**
 * Unit Tests for SecureLogger
 * Tests secure logging with PII masking and log levels
 */

const SecureLogger = require('../../../lib/SecureLogger');
const fs = require('fs');

// Mock fs
jest.mock('fs');

describe('SecureLogger', () => {
  let logger;
  let consoleSpy;

  beforeEach(() => {
    // Clear singleton instance
    SecureLogger.instance = null;

    // Mock filesystem
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();
    fs.appendFileSync = jest.fn();

    // Spy on console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };

    logger = new SecureLogger({
      level: 'debug',
      logToFile: true,
      maskPII: true
    });
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should use default options', () => {
      const defaultLogger = new SecureLogger();
      
      expect(defaultLogger.level).toBe('info');
      expect(defaultLogger.logToFile).toBe(true);
      expect(defaultLogger.maskPII).toBe(true);
    });

    test('should accept custom options', () => {
      const customLogger = new SecureLogger({
        level: 'error',
        logToFile: false,
        maskPII: false
      });
      
      expect(customLogger.level).toBe('error');
      expect(customLogger.logToFile).toBe(false);
      expect(customLogger.maskPII).toBe(false);
    });

    test('should create log directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      new SecureLogger({ logToFile: true });
      
      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('maskSensitiveData()', () => {
    test('should mask phone numbers', () => {
      const input = 'Call 628123456789 for support';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toContain('62XXXXXXXX');
      expect(result).not.toContain('628123456789');
    });

    test('should mask email addresses', () => {
      const input = 'Contact: test@example.com';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toContain('email@hidden.com');
      expect(result).not.toContain('test@example.com');
    });

    test('should mask credit card numbers', () => {
      const input = 'Card: 1234-5678-9012-3456';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toContain('XXXX-XXXX-XXXX-XXXX');
      expect(result).not.toContain('1234-5678-9012-3456');
    });

    test('should mask API keys', () => {
      const input = 'API Key: abcdef1234567890abcdef1234567890';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toContain('API_KEY_MASKED');
    });

    test('should mask passwords', () => {
      const input = 'password=secretpass123';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toContain('password=MASKED');
      expect(result).not.toContain('secretpass123');
    });

    test('should mask WhatsApp IDs partially', () => {
      const input = 'Customer: 628123456789@c.us';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toMatch(/XXX\d{4}@c\.us/);
      expect(result).not.toContain('628123456789@c.us');
    });

    test('should not mask if maskPII is false', () => {
      logger.maskPII = false;
      const input = 'Phone: 628123456789';
      const result = logger.maskSensitiveData(input);
      
      expect(result).toBe(input);
    });
  });

  describe('shouldLog()', () => {
    test('should respect log levels', () => {
      logger.level = 'warn';
      
      expect(logger.shouldLog('debug')).toBe(false);
      expect(logger.shouldLog('info')).toBe(false);
      expect(logger.shouldLog('warn')).toBe(true);
      expect(logger.shouldLog('error')).toBe(true);
    });

    test('should allow all logs for debug level', () => {
      logger.level = 'debug';
      
      expect(logger.shouldLog('debug')).toBe(true);
      expect(logger.shouldLog('info')).toBe(true);
      expect(logger.shouldLog('warn')).toBe(true);
      expect(logger.shouldLog('error')).toBe(true);
    });
  });

  describe('formatMessage()', () => {
    test('should include timestamp', () => {
      const formatted = logger.formatMessage('info', 'Test message');
      
      expect(formatted).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('should include log level', () => {
      const formatted = logger.formatMessage('error', 'Test message');
      
      expect(formatted).toContain('[ERROR]');
    });

    test('should include component', () => {
      const formatted = logger.formatMessage('info', 'Test', { component: 'TestComponent' });
      
      expect(formatted).toContain('[TestComponent]');
    });

    test('should include customer ID', () => {
      const formatted = logger.formatMessage('info', 'Test', { customerId: '628123@c.us' });
      
      expect(formatted).toContain('Customer:');
    });

    test('should include order ID', () => {
      const formatted = logger.formatMessage('info', 'Test', { orderId: 'ORD-123' });
      
      expect(formatted).toContain('Order: ORD-123');
    });
  });

  describe('debug()', () => {
    test('should log debug message when level is debug', () => {
      logger.debug('Debug message');
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    test('should not log debug when level is higher', () => {
      logger.level = 'error';
      logger.debug('Debug message');
      
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    test('should write to file', () => {
      logger.debug('Debug message');
      
      expect(fs.appendFileSync).toHaveBeenCalled();
    });
  });

  describe('info()', () => {
    test('should log info message', () => {
      logger.info('Info message');
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    test('should mask sensitive data', () => {
      logger.info('Phone: 628123456789');
      
      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      expect(loggedMessage).toContain('62XXXXXXXX');
    });
  });

  describe('warn()', () => {
    test('should log warning message', () => {
      logger.warn('Warning message');
      
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('error()', () => {
    test('should log error message', () => {
      logger.error('Error message');
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    test('should include error context', () => {
      const err = new Error('Test error');
      logger.error('Operation failed', { error: err });
      
      const loggedMessage = consoleSpy.error.mock.calls[0][1];
      expect(loggedMessage).toContain('Test error');
    });
  });

  describe('security()', () => {
    test('should always log security events', () => {
      logger.level = 'error'; // Higher level
      logger.security('Security event');
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    test('should not mask security logs', () => {
      logger.security('Admin access: 628123456789');
      
      const loggedMessage = consoleSpy.error.mock.calls[0][1];
      expect(loggedMessage).toContain('628123456789');
    });
  });

  describe('Specialized logging methods', () => {
    test('http() should log HTTP requests', () => {
      logger.http('GET', '/api/products', 200, 150);
      
      expect(consoleSpy.log).toHaveBeenCalled();
      const message = consoleSpy.log.mock.calls[0][0];
      expect(message).toContain('GET');
      expect(message).toContain('200');
    });

    test('transaction() should log transactions', () => {
      logger.transaction('customer@c.us', 'purchase', { amount: 10000 });
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    test('order() should log order events', () => {
      logger.order('ORD-123', 'created', { product: 'netflix' });
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    test('admin() should log admin actions securely', () => {
      logger.admin('admin@c.us', 'approve_order', { orderId: 'ORD-123' });
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    test('payment() should log payment events', () => {
      logger.payment('ORD-123', 'completed', 10000, 'QRIS');
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    test('session() should log session events', () => {
      logger.session('customer@c.us', 'created');
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('Static methods', () => {
    beforeEach(() => {
      // Reset singleton for static tests
      SecureLogger.instance = null;
    });

    test('should create singleton instance', () => {
      const instance1 = SecureLogger.getInstance();
      const instance2 = SecureLogger.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should call instance methods', () => {
      SecureLogger.info('Test message');
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    test('should support all log levels', () => {
      // Reset instance to ensure clean state
      SecureLogger.instance = null;
      
      SecureLogger.debug('Debug');
      SecureLogger.info('Info');
      SecureLogger.warn('Warn');
      SecureLogger.error('Error');
      
      // getInstance creates instance with default level='info'
      // So debug won't log, but info will
      expect(consoleSpy.log).toHaveBeenCalledTimes(1); // info only
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('File writing', () => {
    test('should write to daily log file', () => {
      logger.info('Test message');
      
      expect(fs.appendFileSync).toHaveBeenCalled();
      const filename = fs.appendFileSync.mock.calls[0][0];
      expect(filename).toMatch(/app-\d{4}-\d{2}-\d{2}\.log$/);
    });

    test('should not write if logToFile is false', () => {
      logger.logToFile = false;
      logger.info('Test message');
      
      expect(fs.appendFileSync).not.toHaveBeenCalled();
    });

    test('should handle file write errors gracefully', () => {
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });
      
      expect(() => logger.info('Test')).not.toThrow();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write log'),
        expect.any(String)
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty messages', () => {
      expect(() => logger.info('')).not.toThrow();
    });

    test('should handle null messages', () => {
      expect(() => logger.info(null)).not.toThrow();
    });

    test('should handle undefined messages', () => {
      expect(() => logger.info(undefined)).not.toThrow();
    });

    test('should handle objects as messages', () => {
      expect(() => logger.info({ test: 'value' })).not.toThrow();
    });
  });
});
