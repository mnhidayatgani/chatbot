/**
 * Unit Tests for TransactionLogger
 * Tests logging functionality for audit trail
 */

const TransactionLogger = require('../../../lib/transactionLogger');
const fs = require('fs');

// Mock fs module
jest.mock('fs');

describe('TransactionLogger', () => {
  let logger;
  const testLogDir = './test-logs';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock fs functions
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();
    fs.appendFileSync = jest.fn();
    fs.writeFileSync = jest.fn();
    fs.readFileSync = jest.fn().mockReturnValue('');

    // Create logger instance
    logger = new TransactionLogger(testLogDir);
  });

  describe('Constructor', () => {
    test('should create logs directory if not exists', () => {
      fs.existsSync.mockReturnValue(false);

      new TransactionLogger('./new-logs');

      expect(fs.mkdirSync).toHaveBeenCalledWith('./new-logs', { recursive: true });
    });

    test('should not create directory if exists', () => {
      fs.existsSync.mockReturnValue(true);

      new TransactionLogger('./existing-logs');

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    test('should use default log directory', () => {
      const defaultLogger = new TransactionLogger();

      expect(defaultLogger.logDir).toBe('./logs');
    });
  });

  describe('getLogFilePath()', () => {
    test('should generate log file path with date', () => {
      const result = logger.getLogFilePath('transactions');

      expect(result).toContain('transactions-');
      expect(result).toContain('.log');
    });

    test('should use different type', () => {
      const result = logger.getLogFilePath('errors');

      expect(result).toContain('errors-');
    });

    test('should include log directory in path', () => {
      const result = logger.getLogFilePath('test');

      expect(result).toContain('test-logs');
    });
  });

  describe('writeLog()', () => {
    test('should write log entry to file', () => {
      logger.writeLog('transactions', { event: 'test' });

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include timestamp in log', () => {
      logger.writeLog('transactions', { event: 'test' });

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.timestamp).toBeDefined();
      expect(logData.type).toBe('transactions');
      expect(logData.event).toBe('test');
    });

    test('should handle write errors gracefully', () => {
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      // Should not throw
      expect(() => logger.writeLog('test', {})).not.toThrow();
    });
  });

  describe('logOrder()', () => {
    const customerId = '628123456789@c.us';
    const orderId = 'ORD-123456';
    const cart = [
      { id: 'netflix', name: 'Netflix', price: 50 },
      { id: 'spotify', name: 'Spotify', price: 30 }
    ];

    test('should log order creation', () => {
      logger.logOrder(customerId, orderId, cart, 80, 1200000);

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include order details', () => {
      logger.logOrder(customerId, orderId, cart, 80, 1200000);

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.event).toBe('order_created');
      expect(logData.orderId).toBe(orderId);
      expect(logData.totalIDR).toBe(1200000);
    });

    test('should include cart items', () => {
      logger.logOrder(customerId, orderId, cart, 80, 1200000);

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.items).toHaveLength(2);
      expect(logData.items[0].name).toBe('Netflix');
    });

    test('should mask customer ID', () => {
      logger.logOrder(customerId, orderId, cart, 80, 1200000);

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      // Should be masked
      expect(logData.customerId).not.toBe(customerId);
    });
  });

  describe('logPaymentInit()', () => {
    const customerId = '628123456789@c.us';
    const orderId = 'ORD-123456';

    test('should log payment initiation', () => {
      logger.logPaymentInit(customerId, orderId, 'QRIS', 100000, 'INV-123');

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include payment details', () => {
      logger.logPaymentInit(customerId, orderId, 'QRIS', 100000, 'INV-123');

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.event).toBe('payment_initiated');
      expect(logData.paymentMethod).toBe('QRIS');
      expect(logData.amount).toBe(100000);
      expect(logData.invoiceId).toBe('INV-123');
    });
  });

  describe('logPaymentSuccess()', () => {
    const customerId = '628123456789@c.us';
    const orderId = 'ORD-123456';

    test('should log payment success', () => {
      logger.logPaymentSuccess(customerId, orderId, 'QRIS', 100000, 'INV-123');

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include payment details', () => {
      logger.logPaymentSuccess(customerId, orderId, 'DANA', 50000, 'INV-456');

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.event).toBe('payment_success');
      expect(logData.paymentMethod).toBe('DANA');
    });
  });

  describe('logPaymentFailure()', () => {
    const customerId = '628123456789@c.us';
    const orderId = 'ORD-123456';

    test('should log payment failure', () => {
      logger.logPaymentFailure(customerId, orderId, 'QRIS', 'Timeout');

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include failure reason', () => {
      logger.logPaymentFailure(customerId, orderId, 'QRIS', 'API Error');

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.event).toBe('payment_failed');
      expect(logData.reason).toBeDefined();
    });
  });

  describe('logTransaction()', () => {
    const customerId = '628123456789@c.us';

    test('should log generic transaction', () => {
      logger.logTransaction(customerId, 'custom_event', 'ORD-123', { extra: 'data' });

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include custom data', () => {
      logger.logTransaction(customerId, 'custom_event', 'ORD-123', { amount: 50000 });

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.amount).toBe(50000);
    });
  });

  describe('log()', () => {
    const customerId = '628123456789@c.us';

    test('should log generic event', () => {
      logger.log(customerId, 'user_action', { action: 'browse' });

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should include event details', () => {
      logger.log(customerId, 'cart_updated', null, { items: 3 });

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.items).toBe(3);
    });
  });

  describe('maskPhone()', () => {
    test('should mask phone number', () => {
      const masked = logger.maskPhone('628123456789@c.us');

      expect(masked).toBeDefined();
      expect(masked).not.toBe('628123456789@c.us');
    });

    test('should handle different formats', () => {
      const result1 = logger.maskPhone('081234567890');
      const result2 = logger.maskPhone('628123456789@c.us');

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    test('should return empty for empty input', () => {
      const result = logger.maskPhone('');

      expect(result).toBe('');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty cart', () => {
      logger.logOrder('628123456789@c.us', 'ORD-123', [], 0, 0);

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should handle very large amounts', () => {
      logger.logPaymentSuccess('628123456789@c.us', 'ORD-123', 'QRIS', 999999999, 'INV-123');

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should handle special characters in order ID', () => {
      logger.logOrder('628123456789@c.us', 'ORD-2025/01/01-123', [], 100, 1500000);

      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should handle null invoice ID', () => {
      logger.logPaymentInit('628123456789@c.us', 'ORD-123', 'MANUAL', 50000, null);

      const logCall = fs.appendFileSync.mock.calls[0][1];
      const logData = JSON.parse(logCall);

      expect(logData.invoiceId).toBeNull();
    });
  });

  describe('Multiple Logs', () => {
    test('should write multiple logs', () => {
      logger.log('user1@c.us', 'event1', {});
      logger.log('user2@c.us', 'event2', {});
      logger.log('user3@c.us', 'event3', {});

      expect(fs.appendFileSync).toHaveBeenCalledTimes(3);
    });

    test('should maintain separate log types', () => {
      logger.writeLog('transactions', { event: 'order' });
      logger.writeLog('errors', { event: 'error' });
      logger.writeLog('admin', { event: 'approval' });

      expect(fs.appendFileSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors', () => {
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      // Should not crash
      expect(() => logger.logOrder('user@c.us', 'ORD-123', [], 0, 0)).not.toThrow();
    });

    test('should handle permission errors', () => {
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      expect(() => logger.logPaymentInit('user@c.us', 'ORD-123', 'QRIS', 100000, 'INV')).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should log complete order flow', () => {
      const customerId = '628123456789@c.us';
      const orderId = 'ORD-123456';
      const cart = [{ id: 'netflix', name: 'Netflix', price: 50 }];

      // Order created
      logger.logOrder(customerId, orderId, cart, 50, 750000);

      // Payment initiated
      logger.logPaymentInit(customerId, orderId, 'QRIS', 750000, 'INV-123');

      // Payment success
      logger.logPaymentSuccess(customerId, orderId, 'QRIS', 750000, 'INV-123');

      expect(fs.appendFileSync).toHaveBeenCalledTimes(3);
    });

    test('should log failed payment flow', () => {
      const customerId = '628123456789@c.us';
      const orderId = 'ORD-123456';

      logger.logPaymentInit(customerId, orderId, 'QRIS', 100000, 'INV-123');
      logger.logPaymentFailure(customerId, orderId, 'QRIS', 'Expired');

      expect(fs.appendFileSync).toHaveBeenCalledTimes(2);
    });
  });
});
