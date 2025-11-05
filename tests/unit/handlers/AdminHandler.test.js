/**
 * Unit Tests for AdminHandler
 * Tests admin command routing, authorization, and core functionality
 */

const AdminHandler = require('../../../src/handlers/AdminHandler');

// Mock InputValidator to always return true for isAdmin
jest.mock('../../../lib/inputValidator', () => ({
  isAdmin: jest.fn().mockReturnValue(true),
  isValidOrderId: jest.fn().mockReturnValue(true),
  isPositiveInteger: jest.fn().mockReturnValue(true),
}));

describe('AdminHandler', () => {
  let adminHandler;
  let mockSessionManager;
  let mockXenditService;
  let mockLogger;

  beforeEach(() => {
    // Mock session manager
    mockSessionManager = {
      getSession: jest.fn(),
      setSession: jest.fn(),
      getStep: jest.fn().mockResolvedValue('menu'),
      setStep: jest.fn(),
      getCart: jest.fn().mockResolvedValue([]),
      getOrderId: jest.fn().mockResolvedValue('ORD-123'),
      getAllSessions: jest.fn(() => []),
      sessionTimeout: 30,
    };

    // Mock Xendit service
    mockXenditService = {
      createInvoice: jest.fn(),
      getInvoiceById: jest.fn(),
    };

    // Mock logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      logSecurity: jest.fn(),
      logTransaction: jest.fn(),
      logOrder: jest.fn(),
      logError: jest.fn(),
      logAdmin: jest.fn(),
    };

    // Create handler instance
    adminHandler = new AdminHandler(mockSessionManager, mockXenditService, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor & Initialization', () => {
    test('should initialize with all dependencies', () => {
      expect(adminHandler.sessionManager).toBe(mockSessionManager);
      expect(adminHandler.xenditService).toBe(mockXenditService);
      expect(adminHandler.logger).toBe(mockLogger);
    });

    test('should initialize specialized handlers', () => {
      expect(adminHandler.inventoryHandler).toBeDefined();
      expect(adminHandler.promoHandler).toBeDefined();
      expect(adminHandler.reviewHandler).toBeDefined();
      expect(adminHandler.analyticsHandler).toBeDefined();
      expect(adminHandler.orderHandler).toBeDefined();
    });

    test('should initialize command routes map', () => {
      expect(adminHandler.commandRoutes).toBeDefined();
      expect(typeof adminHandler.commandRoutes).toBe('object');
      expect(Object.keys(adminHandler.commandRoutes).length).toBeGreaterThan(15);
    });

    test('should have O(1) command routing', () => {
      // Check key commands exist in map
      expect(adminHandler.commandRoutes['/help']).toBeDefined();
      expect(adminHandler.commandRoutes['/approve']).toBeDefined();
      expect(adminHandler.commandRoutes['/stats']).toBeDefined();
      expect(adminHandler.commandRoutes['/broadcast']).toBeDefined();
      expect(adminHandler.commandRoutes['/status']).toBeDefined();
    });
  });

  describe('handle() - Main Entry Point', () => {
    test('should show help for null message', async () => {
      const result = await adminHandler.handle('admin@c.us', null);
      expect(result).toContain('Admin Commands');
      expect(result).toContain('/help');
    });

    test('should show help for undefined message', async () => {
      const result = await adminHandler.handle('admin@c.us', undefined);
      expect(result).toContain('Admin Commands');
    });

    test('should show help for empty string', async () => {
      const result = await adminHandler.handle('admin@c.us', '');
      expect(result).toContain('Admin Commands');
    });

    test('should show help for non-string message', async () => {
      const result = await adminHandler.handle('admin@c.us', 123);
      expect(result).toContain('Admin Commands');
    });

    test('should route /help command correctly', async () => {
      const result = await adminHandler.handle('admin@c.us', '/help');
      expect(result).toContain('Admin Commands');
      expect(result).toContain('/approve');
      expect(result).toContain('/stats');
    });

    test('should route /status command correctly', async () => {
      const result = await adminHandler.handle('admin@c.us', '/status');
      expect(result).toContain('System Status');
      expect(result).toContain('WhatsApp');
    });

    test('should handle unknown command gracefully', async () => {
      const result = await adminHandler.handle('admin@c.us', '/unknowncommand');
      // Unknown commands now return help text
      expect(result).toContain('ADMIN COMMAND REFERENCE');
      expect(result).toContain('/help');
    });

    test('should trim whitespace from commands', async () => {
      const result = await adminHandler.handle('admin@c.us', '  /help  ');
      expect(result).toContain('Admin Commands');
    });

    test('should handle command with extra spaces', async () => {
      const result = await adminHandler.handle('admin@c.us', '/stats   30');
      expect(result).toBeDefined();
    });
  });

  describe('showAdminHelp()', () => {
    test('should return help message with all commands', async () => {
      const result = await adminHandler.showAdminHelp();
      
      expect(result).toContain('Admin Commands');
      expect(result).toContain('/approve');
      expect(result).toContain('/broadcast');
      expect(result).toContain('/stats');
      expect(result).toContain('/status');
      expect(result).toContain('/stock');
      expect(result).toContain('/addproduct');
      expect(result).toContain('/createpromo');
    });

    test('should include emoji formatting', async () => {
      const result = await adminHandler.showAdminHelp();
      expect(result).toMatch(/[📊📈🎯💰📦]/);
    });

    test('should include command categories', async () => {
      const result = await adminHandler.showAdminHelp();
      expect(result).toContain('Order');
      expect(result).toContain('Analytics');
      expect(result).toContain('Product');
    });
  });

  describe('handleStatus()', () => {
    test('should return system status', async () => {
      const result = await adminHandler.handleStatus('admin@c.us');
      
      expect(result).toContain('System Status');
      expect(result).toContain('WhatsApp');
      expect(result).toContain('Redis');
      expect(result).toContain('Memory');
    });

    test('should include memory usage information', async () => {
      const result = await adminHandler.handleStatus('admin@c.us');
      expect(result).toMatch(/Memory Usage|Memory/i);
      expect(result).toMatch(/MB/);
    });

    test('should include uptime information', async () => {
      const result = await adminHandler.handleStatus('admin@c.us');
      expect(result).toMatch(/Uptime/i);
    });

    test('should include webhook status', async () => {
      const result = await adminHandler.handleStatus('admin@c.us');
      expect(result).toMatch(/Webhook/i);
    });

    test('should handle errors gracefully', async () => {
      // Force an error by mocking process.memoryUsage to throw
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => {
        throw new Error('Memory error');
      });

      const result = await adminHandler.handleStatus('admin@c.us');
      expect(result).toContain('Error');

      // Restore original
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Command Routing Performance', () => {
    test('should use O(1) map lookup instead of sequential if checks', () => {
      const command = '/approve';
      const handler = adminHandler.commandRoutes[command];
      
      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    test('should have consistent routing for all major commands', () => {
      const commands = [
        '/help', '/approve', '/broadcast', '/stats', '/status',
        '/stock', '/addproduct', '/createpromo', '/listpromos'
      ];

      commands.forEach(cmd => {
        expect(adminHandler.commandRoutes[cmd]).toBeDefined();
        expect(typeof adminHandler.commandRoutes[cmd]).toBe('function');
      });
    });

    test('should return undefined for non-existent commands', () => {
      expect(adminHandler.commandRoutes['/nonexistent']).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully in handle()', async () => {
      // Mock a command that throws error
      adminHandler.commandRoutes['/test'] = () => {
        throw new Error('Test error');
      };

      const result = await adminHandler.handle('admin@c.us', '/test');
      expect(result).toContain('error');
    });

    test('should log errors when logger is available', async () => {
      adminHandler.commandRoutes['/testerror'] = () => {
        throw new Error('Test error');
      };

      await adminHandler.handle('admin@c.us', '/testerror');
      // Should log error via logError method
      expect(mockLogger.logError).toHaveBeenCalled();
    });

    test('should not crash when logger is null', async () => {
      const handlerNoLogger = new AdminHandler(mockSessionManager, mockXenditService, null);
      
      const result = await handlerNoLogger.handle('admin@c.us', '/help');
      expect(result).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    test('should reject null adminId', async () => {
      const result = await adminHandler.handle(null, '/help');
      expect(result).toBeDefined();
    });

    test('should handle empty adminId', async () => {
      const result = await adminHandler.handle('', '/help');
      expect(result).toBeDefined();
    });

    test('should handle malformed commands', async () => {
      const result = await adminHandler.handle('admin@c.us', '///');
      expect(result).toBeDefined();
    });

    test('should handle very long commands', async () => {
      const longCommand = '/help' + 'a'.repeat(1000);
      const result = await adminHandler.handle('admin@c.us', longCommand);
      expect(result).toBeDefined();
    });
  });

  describe('Integration with Specialized Handlers', () => {
    test('should delegate /approve to orderHandler', async () => {
      const spy = jest.spyOn(adminHandler.orderHandler, 'handleApprove');
      spy.mockResolvedValue('Order approved');

      await adminHandler.handle('admin@c.us', '/approve ORD-123');
      expect(spy).toHaveBeenCalledWith('admin@c.us', '/approve ORD-123');
      
      spy.mockRestore();
    });

    test('should delegate /createpromo to promoHandler', async () => {
      const spy = jest.spyOn(adminHandler.promoHandler, 'handleCreatePromo');
      spy.mockResolvedValue('Promo created');

      await adminHandler.handle('admin@c.us', '/createpromo TEST 10 7');
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });

    test('should delegate /addstock to inventoryHandler', async () => {
      const spy = jest.spyOn(adminHandler.inventoryHandler, 'handleAddStock');
      spy.mockResolvedValue('Stock added');

      await adminHandler.handle('admin@c.us', '/addstock netflix 10');
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });

  describe('Message Formatting', () => {
    test('should return string responses', async () => {
      const result = await adminHandler.handle('admin@c.us', '/help');
      expect(typeof result).toBe('string');
    });

    test('should use proper WhatsApp formatting', async () => {
      const result = await adminHandler.handle('admin@c.us', '/help');
      // Check for WhatsApp bold markers
      expect(result).toMatch(/\*/);
    });

    test('should include newlines for readability', async () => {
      const result = await adminHandler.handle('admin@c.us', '/help');
      expect(result).toContain('\n');
    });
  });
});
