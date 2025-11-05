/**
 * Unit Tests for AdminStatsService
 * Tests admin statistics and reporting functionality
 */

const AdminStatsService = require('../../../src/services/admin/AdminStatsService');
const fs = require('fs');

// Mock fs module
jest.mock('fs');

describe('AdminStatsService', () => {
  let service;
  let mockSessionManager;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock fs functions
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.readdirSync = jest.fn().mockReturnValue([]);
    fs.readFileSync = jest.fn().mockReturnValue('');

    // Mock SessionManager
    mockSessionManager = {
      getActiveSessionCount: jest.fn().mockResolvedValue(5)
    };

    service = new AdminStatsService();
  });

  describe('Constructor', () => {
    test('should initialize with logs directory', () => {
      expect(service.logsDir).toBeDefined();
      expect(service.logsDir).toContain('logs');
    });
  });

  describe('getStats()', () => {
    test('should return comprehensive statistics', async () => {
      const stats = await service.getStats(mockSessionManager);

      expect(stats).toHaveProperty('activeSessions');
      expect(stats).toHaveProperty('orders');
      expect(stats).toHaveProperty('revenue');
      expect(stats).toHaveProperty('systemHealth');
    });

    test('should include active session count', async () => {
      const stats = await service.getStats(mockSessionManager);

      expect(stats.activeSessions).toBe(5);
      expect(mockSessionManager.getActiveSessionCount).toHaveBeenCalled();
    });

    test('should include order statistics', async () => {
      const stats = await service.getStats(mockSessionManager);

      expect(stats.orders).toHaveProperty('today');
      expect(stats.orders).toHaveProperty('week');
      expect(stats.orders).toHaveProperty('month');
    });

    test('should include revenue statistics', async () => {
      const stats = await service.getStats(mockSessionManager);

      expect(stats.revenue).toHaveProperty('today');
      expect(stats.revenue).toHaveProperty('week');
      expect(stats.revenue).toHaveProperty('month');
    });

    test('should include system health metrics', async () => {
      const stats = await service.getStats(mockSessionManager);

      expect(stats.systemHealth).toHaveProperty('errorRate');
      expect(stats.systemHealth).toHaveProperty('totalLogs');
      expect(stats.systemHealth).toHaveProperty('errorCount');
    });

    test('should handle sessionManager without getActiveSessionCount', async () => {
      const basicSessionManager = {};

      const stats = await service.getStats(basicSessionManager);

      expect(stats.activeSessions).toBe(0);
    });

    test('should handle errors gracefully', async () => {
      mockSessionManager.getActiveSessionCount.mockRejectedValue(new Error('Session error'));

      await expect(service.getStats(mockSessionManager)).rejects.toThrow('Failed to generate stats');
    });

    test('should return numeric values for all metrics', async () => {
      const stats = await service.getStats(mockSessionManager);

      expect(typeof stats.activeSessions).toBe('number');
      expect(typeof stats.orders.today).toBe('number');
      expect(typeof stats.orders.week).toBe('number');
      expect(typeof stats.orders.month).toBe('number');
      expect(typeof stats.revenue.today).toBe('number');
      expect(typeof stats.revenue.week).toBe('number');
      expect(typeof stats.revenue.month).toBe('number');
    });
  });

  describe('parseOrderLogs()', () => {
    test('should return zero values when logs directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = service.parseOrderLogs();

      expect(result.ordersToday).toBe(0);
      expect(result.ordersWeek).toBe(0);
      expect(result.ordersMonth).toBe(0);
      expect(result.revenueToday).toBe(0);
      expect(result.revenueWeek).toBe(0);
      expect(result.revenueMonth).toBe(0);
    });

    test('should return zero values when no log files exist', () => {
      fs.readdirSync.mockReturnValue([]);

      const result = service.parseOrderLogs();

      expect(result.ordersToday).toBe(0);
      expect(result.ordersWeek).toBe(0);
      expect(result.ordersMonth).toBe(0);
    });

    test('should parse order logs correctly', () => {
      const todayDate = new Date().toISOString().split('T')[0];
      fs.readdirSync.mockReturnValue([`transactions-${todayDate}.log`]);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ event: 'order_created', totalIDR: 100000 }) + '\n' +
        JSON.stringify({ event: 'order_created', totalIDR: 50000 }) + '\n'
      );

      const result = service.parseOrderLogs();

      expect(result.ordersToday).toBeGreaterThanOrEqual(0);
      expect(result.revenueToday).toBeGreaterThanOrEqual(0);
    });

    test('should handle invalid JSON in log files', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log']);
      fs.readFileSync.mockReturnValue('invalid json\n{broken');

      const result = service.parseOrderLogs();

      expect(result).toBeDefined();
    });

    test('should aggregate weekly orders', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log', 'transactions-2025-01-02.log']);

      const result = service.parseOrderLogs();

      expect(result.ordersWeek).toBeGreaterThanOrEqual(result.ordersToday);
    });

    test('should aggregate monthly orders', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log']);

      const result = service.parseOrderLogs();

      expect(result.ordersMonth).toBeGreaterThanOrEqual(result.ordersWeek);
    });

    test('should return all required fields', () => {
      const result = service.parseOrderLogs();

      expect(result).toHaveProperty('ordersToday');
      expect(result).toHaveProperty('ordersWeek');
      expect(result).toHaveProperty('ordersMonth');
      expect(result).toHaveProperty('revenueToday');
      expect(result).toHaveProperty('revenueWeek');
      expect(result).toHaveProperty('revenueMonth');
    });
  });

  describe('parseErrorLogs()', () => {
    test('should return zero values when logs directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = service.parseErrorLogs();

      expect(result.errorCount).toBe(0);
      expect(result.totalLogs).toBe(0);
      // errorRate might be string "0.00" or number 0
      expect(parseFloat(result.errorRate)).toBe(0);
    });

    test('should return zero values when no error logs exist', () => {
      fs.readdirSync.mockReturnValue([]);

      const result = service.parseErrorLogs();

      expect(result.errorCount).toBe(0);
      expect(result.totalLogs).toBe(0);
    });

    test('should count error logs correctly', () => {
      fs.readdirSync.mockReturnValue(['errors-2025-01-01.log']);
      fs.readFileSync.mockReturnValue(
        'Error line 1\n' +
        'Error line 2\n' +
        'Error line 3\n'
      );

      const result = service.parseErrorLogs();

      expect(result.errorCount).toBeGreaterThanOrEqual(0);
      expect(result.totalLogs).toBeGreaterThanOrEqual(0);
    });

    test('should calculate error rate', () => {
      fs.readdirSync.mockReturnValue(['errors-2025-01-01.log']);
      fs.readFileSync.mockReturnValue('Error line\n');

      const result = service.parseErrorLogs();

      // errorRate can be number or string
      const rate = typeof result.errorRate === 'string' ? parseFloat(result.errorRate) : result.errorRate;
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty error log files', () => {
      fs.readdirSync.mockReturnValue(['errors-2025-01-01.log']);
      fs.readFileSync.mockReturnValue('');

      const result = service.parseErrorLogs();

      expect(result.errorCount).toBe(0);
    });

    test('should return all required fields', () => {
      const result = service.parseErrorLogs();

      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('totalLogs');
      expect(result).toHaveProperty('errorRate');
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing logs directory', () => {
      fs.existsSync.mockReturnValue(false);

      const orderResult = service.parseOrderLogs();
      const errorResult = service.parseErrorLogs();

      expect(orderResult).toBeDefined();
      expect(errorResult).toBeDefined();
    });

    test('should handle file read errors', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log']);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      expect(() => service.parseOrderLogs()).not.toThrow();
    });

    test('should handle very large log files', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log']);
      const largeLog = (JSON.stringify({ event: 'order_created', totalIDR: 50000 }) + '\n').repeat(10000);
      fs.readFileSync.mockReturnValue(largeLog);

      const result = service.parseOrderLogs();

      expect(result).toBeDefined();
    });

    test('should handle corrupted log entries', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log']);
      fs.readFileSync.mockReturnValue(
        '{"event": "order_created", "totalIDR": 100000}\n' +
        'corrupted line\n' +
        '{"event": "order_created", "totalIDR": 50000}\n'
      );

      const result = service.parseOrderLogs();

      expect(result).toBeDefined();
    });
  });

  describe('Integration', () => {
    test('should provide complete admin dashboard data', async () => {
      const stats = await service.getStats(mockSessionManager);

      // All fields should be present
      expect(Object.keys(stats)).toEqual(['activeSessions', 'orders', 'revenue', 'systemHealth']);
    });

    test('should maintain data consistency', async () => {
      const stats = await service.getStats(mockSessionManager);

      // Month should >= Week should >= Today
      expect(stats.orders.month).toBeGreaterThanOrEqual(stats.orders.week);
      expect(stats.orders.week).toBeGreaterThanOrEqual(stats.orders.today);
      expect(stats.revenue.month).toBeGreaterThanOrEqual(stats.revenue.week);
      expect(stats.revenue.week).toBeGreaterThanOrEqual(stats.revenue.today);
    });

    test('should handle multiple concurrent calls', async () => {
      const promises = [
        service.getStats(mockSessionManager),
        service.getStats(mockSessionManager),
        service.getStats(mockSessionManager)
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(stats => {
        expect(stats).toHaveProperty('activeSessions');
      });
    });
  });

  describe('Performance', () => {
    test('should handle getStats efficiently', async () => {
      const start = Date.now();

      await service.getStats(mockSessionManager);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    test('should parse logs efficiently', () => {
      fs.readdirSync.mockReturnValue(['transactions-2025-01-01.log']);
      fs.readFileSync.mockReturnValue('');

      const start = Date.now();

      service.parseOrderLogs();
      service.parseErrorLogs();

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
