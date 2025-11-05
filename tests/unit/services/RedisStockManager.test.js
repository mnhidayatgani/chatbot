/**
 * Unit Tests for RedisStockManager
 * Tests realtime stock management with Redis
 */

const RedisStockManager = require('../../../src/services/inventory/RedisStockManager');
const redisClientManager = require('../../../lib/redisClient');

// Mock Redis client
jest.mock('../../../lib/redisClient');
jest.mock('../../../src/config/products.config', () => ({
  products: {
    premiumAccounts: [
      { id: 'netflix', name: 'Netflix', price: 50000, stock: 10 },
      { id: 'spotify', name: 'Spotify', price: 30000, stock: 15 }
    ],
    virtualCards: [
      { id: 'vcc-basic', name: 'VCC Basic', price: 20000, stock: 50 }
    ]
  },
  DEFAULT_STOCK: 10,
  VCC_STOCK: 50
}));

describe('RedisStockManager', () => {
  let stockManager;
  let mockRedisClient;

  beforeEach(() => {
    // Create mock Redis client
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      decr: jest.fn(),
      decrBy: jest.fn(),
      incrBy: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
      lPush: jest.fn(),
      lRange: jest.fn()
    };

    redisClientManager.getClient = jest.fn().mockReturnValue(mockRedisClient);
    
    stockManager = new RedisStockManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with correct prefixes', () => {
      expect(stockManager.STOCK_PREFIX).toBe('stock:');
      expect(stockManager.STOCK_HISTORY_PREFIX).toBe('stock_history:');
    });

    test('should start as not initialized', () => {
      expect(stockManager.initialized).toBe(false);
      expect(stockManager.redisClient).toBeNull();
    });
  });

  describe('initialize()', () => {
    test('should initialize stock manager', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');

      await stockManager.initialize();

      expect(stockManager.initialized).toBe(true);
      expect(stockManager.redisClient).toBe(mockRedisClient);
    });

    test('should initialize new products with 0 stock', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await stockManager.initialize();

      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should keep existing Redis stock values', async () => {
      mockRedisClient.get.mockResolvedValue('25'); // Existing stock

      await stockManager.initialize();

      // Should not overwrite existing stock
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    test('should handle missing Redis client', async () => {
      redisClientManager.getClient.mockReturnValue(null);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await stockManager.initialize();

      expect(stockManager.initialized).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis client not available')
      );

      consoleSpy.mockRestore();
    });

    test('should not re-initialize if already initialized', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      stockManager.initialized = true;

      await stockManager.initialize();

      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    test('should handle initialization errors', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await stockManager.initialize();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getStock()', () => {
    beforeEach(async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();
    });

    test('should return stock for existing product', async () => {
      mockRedisClient.get.mockResolvedValue('10');

      const stock = await stockManager.getStock('netflix');

      expect(stock).toBe(10);
      expect(mockRedisClient.get).toHaveBeenCalledWith('stock:netflix');
    });

    test('should return 0 for non-existent product', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const stock = await stockManager.getStock('non-existent');

      expect(stock).toBe(0);
    });

    test('should handle Redis errors', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const stock = await stockManager.getStock('netflix');

      expect(stock).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should return 0 when Redis client not initialized', async () => {
      stockManager.redisClient = null;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const stock = await stockManager.getStock('netflix');

      expect(stock).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should parse stock as integer', async () => {
      mockRedisClient.get.mockResolvedValue('25');

      const stock = await stockManager.getStock('netflix');

      expect(typeof stock).toBe('number');
      expect(stock).toBe(25);
    });
  });

  describe('setStock()', () => {
    beforeEach(async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();
    });

    test('should set stock for product', async () => {
      mockRedisClient.get.mockResolvedValue('10'); // Old stock

      const result = await stockManager.setStock('netflix', 25, 'manual_update');

      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith('stock:netflix', '25');
    });

    test('should return false for invalid quantity', async () => {
      const result = await stockManager.setStock('netflix', -5);

      expect(result).toBe(false);
    });

    test('should handle Redis set errors', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('Redis error'));

      const result = await stockManager.setStock('netflix', 25);

      expect(result).toBe(false);
    });

    test('should log stock changes', async () => {
      mockRedisClient.get.mockResolvedValue('10');
      mockRedisClient.lPush.mockResolvedValue(1);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await stockManager.setStock('netflix', 25, 'manual_update');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('isInStock()', () => {
    beforeEach(async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();
    });

    test('should return true when stock > 0', async () => {
      mockRedisClient.get.mockResolvedValue('5');

      const inStock = await stockManager.isInStock('netflix');

      expect(inStock).toBe(true);
    });

    test('should return false when stock = 0', async () => {
      mockRedisClient.get.mockResolvedValue('0');

      const inStock = await stockManager.isInStock('netflix');

      expect(inStock).toBe(false);
    });

    test('should return false when stock < 0', async () => {
      mockRedisClient.get.mockResolvedValue('-1');

      const inStock = await stockManager.isInStock('netflix');

      expect(inStock).toBe(false);
    });

    test('should return false for non-existent product', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const inStock = await stockManager.isInStock('non-existent');

      expect(inStock).toBe(false);
    });
  });

  describe('decrementStock()', () => {
    beforeEach(async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();
    });

    test('should decrement stock successfully', async () => {
      mockRedisClient.get.mockResolvedValue('10');
      mockRedisClient.decrBy.mockResolvedValue(9); // Returns new stock value
      mockRedisClient.lPush.mockResolvedValue(1);

      const result = await stockManager.decrementStock('netflix', 1, 'order_123');

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(9);
    });

    test('should not decrement when out of stock', async () => {
      mockRedisClient.get.mockResolvedValue('0');

      const result = await stockManager.decrementStock('netflix', 1, 'order_123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient');
    });

    test('should handle Redis errors', async () => {
      mockRedisClient.get.mockResolvedValue('10');
      mockRedisClient.decrBy.mockRejectedValue(new Error('Redis error'));

      const result = await stockManager.decrementStock('netflix', 1, 'order_123');

      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large stock values', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();

      mockRedisClient.get.mockResolvedValue('999999');

      const stock = await stockManager.getStock('netflix');

      expect(stock).toBe(999999);
    });

    test('should handle zero stock', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();

      mockRedisClient.get.mockResolvedValue('0');

      const stock = await stockManager.getStock('netflix');

      expect(stock).toBe(0);
    });

    test('should handle malformed stock values', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();

      mockRedisClient.get.mockResolvedValue('invalid');

      const stock = await stockManager.getStock('netflix');

      expect(isNaN(stock)).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should handle multiple concurrent getStock calls', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();

      mockRedisClient.get.mockResolvedValue('10');

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(stockManager.getStock('netflix'));
      }

      const results = await Promise.all(promises);

      expect(results.every(r => r === 10)).toBe(true);
    });

    test('should handle rapid stock updates', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');
      await stockManager.initialize();

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(stockManager.setStock('netflix', i * 10, 'test'));
      }

      await Promise.all(promises);

      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });
});
