/**
 * Unit Tests for ChatbotLogic
 * Tests message processing, routing, and error handling
 */

const ChatbotLogic = require('../../../chatbotLogic');
const InputValidator = require('../../../lib/inputValidator');
const TransactionLogger = require('../../../lib/transactionLogger');

// Mock dependencies
jest.mock('../../../sessionManager');
jest.mock('../../../lib/inputValidator');
jest.mock('../../../lib/transactionLogger');
jest.mock('../../../src/handlers/CustomerHandler');
jest.mock('../../../src/handlers/AdminHandler');
jest.mock('../../../src/handlers/ProductHandler');
jest.mock('../../../src/core/MessageRouter');
jest.mock('../../../lib/paymentHandlers');
jest.mock('../../../services/xenditService');

describe('ChatbotLogic', () => {
  let chatbotLogic;
  let mockSessionManager;
  let mockLogger;
  let mockValidator;
  let mockRouter;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock session manager
    mockSessionManager = {
      getStep: jest.fn().mockResolvedValue('menu'),
      getActiveSessions: jest.fn().mockReturnValue([
        { customerId: '111@c.us' },
        { customerId: '222@c.us' }
      ])
    };

    // Create mock logger
    mockLogger = {
      log: jest.fn(),
      logError: jest.fn(),
      logSecurity: jest.fn(),
      logTransaction: jest.fn(),
      logOrder: jest.fn(),
      logAdmin: jest.fn()
    };

    // Create mock validator
    mockValidator = {
      canSendMessage: jest.fn().mockReturnValue({ 
        allowed: true,
        message: ''
      }),
      isInCooldown: jest.fn().mockReturnValue({
        inCooldown: false,
        message: ''
      }),
      MESSAGE_LIMIT: 20
    };

    // Mock static method
    InputValidator.sanitizeMessage = jest.fn((msg) => msg);

    // Mock TransactionLogger constructor
    TransactionLogger.mockImplementation(() => mockLogger);

    // Mock InputValidator constructor
    InputValidator.mockImplementation(() => mockValidator);

    // Create chatbot logic instance
    chatbotLogic = new ChatbotLogic(mockSessionManager);

    // Mock router with proper route method
    mockRouter = {
      route: jest.fn().mockResolvedValue('Response from router')
    };
    chatbotLogic.router = mockRouter;

    // Override validator with mock
    chatbotLogic.validator = mockValidator;
  });

  describe('Constructor', () => {
    test('should initialize with session manager', () => {
      expect(chatbotLogic.sessionManager).toBe(mockSessionManager);
    });

    test('should create logger instance', () => {
      expect(chatbotLogic.logger).toBeDefined();
    });

    test('should create validator instance', () => {
      expect(chatbotLogic.validator).toBeDefined();
    });

    test('should initialize all handlers', () => {
      expect(chatbotLogic.customerHandler).toBeDefined();
      expect(chatbotLogic.adminHandler).toBeDefined();
      expect(chatbotLogic.productHandler).toBeDefined();
      expect(chatbotLogic.paymentHandlers).toBeDefined();
    });

    test('should initialize router', () => {
      expect(chatbotLogic.router).toBeDefined();
    });
  });

  describe('processMessage()', () => {
    const customerId = '628123456789@c.us';

    test('should process valid message successfully', async () => {
      const message = 'menu';
      const response = await chatbotLogic.processMessage(customerId, message);

      expect(mockValidator.canSendMessage).toHaveBeenCalledWith(customerId);
      expect(mockValidator.isInCooldown).toHaveBeenCalledWith(customerId);
      expect(InputValidator.sanitizeMessage).toHaveBeenCalledWith(message);
      expect(mockSessionManager.getStep).toHaveBeenCalledWith(customerId);
      expect(mockRouter.route).toHaveBeenCalled();
      expect(response).toBe('Response from router');
    });

    test('should normalize message to lowercase for non-admin commands', async () => {
      const message = 'MENU';
      await chatbotLogic.processMessage(customerId, message);

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'menu',
        'menu'
      );
    });

    test('should NOT lowercase admin commands', async () => {
      const message = '/approve ORD-123';
      await chatbotLogic.processMessage(customerId, message);

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        '/approve ORD-123',
        'menu'
      );
    });

    test('should trim whitespace from messages', async () => {
      const message = '  menu  ';
      await chatbotLogic.processMessage(customerId, message);

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'menu',
        'menu'
      );
    });

    test('should handle rate limit exceeded', async () => {
      mockValidator.canSendMessage.mockReturnValue({
        allowed: false,
        message: '⏳ Terlalu banyak pesan',
        reason: 'Exceeded 20 messages per minute'
      });

      const response = await chatbotLogic.processMessage(customerId, 'menu');

      expect(response).toContain('⏳');
      expect(mockLogger.logSecurity).toHaveBeenCalledWith(
        customerId,
        'rate_limit_exceeded',
        'Exceeded 20 messages per minute',
        { limit: 20 }
      );
      expect(mockRouter.route).not.toHaveBeenCalled();
    });

    test('should handle error cooldown', async () => {
      mockValidator.isInCooldown.mockReturnValue({
        inCooldown: true,
        message: '⏳ Silakan tunggu 30 detik'
      });

      const response = await chatbotLogic.processMessage(customerId, 'menu');

      expect(response).toContain('⏳');
      expect(mockRouter.route).not.toHaveBeenCalled();
    });

    test('should handle invalid message', async () => {
      InputValidator.sanitizeMessage.mockReturnValue('');

      const response = await chatbotLogic.processMessage(customerId, '<script>');

      expect(response).toContain('❌');
      expect(response).toContain('tidak valid');
      expect(mockLogger.logError).toHaveBeenCalled();
      expect(mockRouter.route).not.toHaveBeenCalled();
    });

    test('should handle null message', async () => {
      InputValidator.sanitizeMessage.mockReturnValue(null);

      const response = await chatbotLogic.processMessage(customerId, null);

      expect(response).toContain('❌');
      expect(mockRouter.route).not.toHaveBeenCalled();
    });

    test('should handle router error gracefully', async () => {
      mockRouter.route.mockRejectedValue(new Error('Router error'));

      const response = await chatbotLogic.processMessage(customerId, 'menu');

      expect(response).toContain('❌');
      expect(response).toContain('kesalahan');
      expect(response).toContain('menu');
      expect(mockLogger.logError).toHaveBeenCalled();
    });

    test('should log error with context when router fails', async () => {
      const error = new Error('Processing failed');
      mockRouter.route.mockRejectedValue(error);
      mockSessionManager.getStep.mockResolvedValue('browsing');

      await chatbotLogic.processMessage(customerId, 'netflix');

      expect(mockLogger.logError).toHaveBeenCalledWith(
        customerId,
        error,
        expect.objectContaining({
          message: 'netflix',
          step: 'browsing'
        })
      );
    });

    test('should handle different session steps', async () => {
      mockSessionManager.getStep.mockResolvedValue('checkout');

      await chatbotLogic.processMessage(customerId, 'bayar');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'bayar',
        'checkout'
      );
    });

    test('should process special characters correctly', async () => {
      InputValidator.sanitizeMessage.mockReturnValue('⭐ netflix');

      await chatbotLogic.processMessage(customerId, '⭐ netflix');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        '⭐ netflix',
        'menu'
      );
    });

    test('should handle empty string message', async () => {
      InputValidator.sanitizeMessage.mockReturnValue('');

      const response = await chatbotLogic.processMessage(customerId, '   ');

      expect(response).toContain('❌');
      expect(mockRouter.route).not.toHaveBeenCalled();
    });
  });

  describe('getStats()', () => {
    test('should return session statistics', () => {
      const stats = chatbotLogic.getStats();

      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('activeCustomers');
      expect(stats.totalSessions).toBe(2);
      expect(stats.activeCustomers).toEqual(['111@c.us', '222@c.us']);
    });

    test('should return zero sessions when no active sessions', () => {
      mockSessionManager.getActiveSessions.mockReturnValue([]);

      const stats = chatbotLogic.getStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.activeCustomers).toEqual([]);
    });

    test('should call session manager getActiveSessions', () => {
      chatbotLogic.getStats();

      expect(mockSessionManager.getActiveSessions).toHaveBeenCalled();
    });
  });

  describe('broadcast()', () => {
    const mockClient = {
      sendMessage: jest.fn().mockResolvedValue(true)
    };

    test('should delegate to admin handler', async () => {
      const mockAdminHandler = {
        handleBroadcast: jest.fn().mockResolvedValue({
          success: true,
          sent: 2
        })
      };
      chatbotLogic.adminHandler = mockAdminHandler;

      const result = await chatbotLogic.broadcast('Test message', mockClient);

      expect(mockAdminHandler.handleBroadcast).toHaveBeenCalledWith(
        'system',
        '/broadcast Test message',
        mockClient
      );
      expect(result).toEqual({ success: true, sent: 2 });
    });

    test('should handle broadcast with special characters', async () => {
      const mockAdminHandler = {
        handleBroadcast: jest.fn().mockResolvedValue({ success: true })
      };
      chatbotLogic.adminHandler = mockAdminHandler;

      await chatbotLogic.broadcast('🎉 Promo 50%!', mockClient);

      expect(mockAdminHandler.handleBroadcast).toHaveBeenCalledWith(
        'system',
        '/broadcast 🎉 Promo 50%!',
        mockClient
      );
    });

    test('should handle broadcast error', async () => {
      const mockAdminHandler = {
        handleBroadcast: jest.fn().mockRejectedValue(new Error('Broadcast failed'))
      };
      chatbotLogic.adminHandler = mockAdminHandler;

      await expect(
        chatbotLogic.broadcast('Test', mockClient)
      ).rejects.toThrow('Broadcast failed');
    });
  });

  describe('Message Routing Integration', () => {
    const customerId = '628123456789@c.us';

    test('should route menu command correctly', async () => {
      await chatbotLogic.processMessage(customerId, 'menu');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'menu',
        expect.any(String)
      );
    });

    test('should route cart command correctly', async () => {
      await chatbotLogic.processMessage(customerId, 'cart');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'cart',
        expect.any(String)
      );
    });

    test('should route admin commands correctly', async () => {
      await chatbotLogic.processMessage(customerId, '/stats');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        '/stats',
        expect.any(String)
      );
    });

    test('should route wishlist commands correctly', async () => {
      await chatbotLogic.processMessage(customerId, 'simpan netflix');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'simpan netflix',
        expect.any(String)
      );
    });
  });

  describe('Error Handling', () => {
    const customerId = '628123456789@c.us';

    test('should return user-friendly error message', async () => {
      mockRouter.route.mockRejectedValue(new Error('Internal error'));

      const response = await chatbotLogic.processMessage(customerId, 'test');

      expect(response).not.toContain('Internal error');
      expect(response).toContain('❌');
      expect(response).toContain('kesalahan');
    });

    test('should provide menu hint in error message', async () => {
      mockRouter.route.mockRejectedValue(new Error('Test error'));

      const response = await chatbotLogic.processMessage(customerId, 'test');

      expect(response).toContain('menu');
    });

    test('should log all errors', async () => {
      mockRouter.route.mockRejectedValue(new Error('Test error'));

      await chatbotLogic.processMessage(customerId, 'test');

      expect(mockLogger.logError).toHaveBeenCalled();
    });

    test('should include message context in error log', async () => {
      const error = new Error('Test error');
      mockRouter.route.mockRejectedValue(error);
      mockSessionManager.getStep.mockResolvedValue('browsing');

      await chatbotLogic.processMessage(customerId, 'netflix');

      const errorCall = mockLogger.logError.mock.calls[0];
      expect(errorCall[0]).toBe(customerId);
      expect(errorCall[1]).toBe(error);
      expect(errorCall[2]).toHaveProperty('message', 'netflix');
      expect(errorCall[2]).toHaveProperty('step', 'browsing');
    });
  });

  describe('Session Step Handling', () => {
    const customerId = '628123456789@c.us';

    test('should handle menu step', async () => {
      mockSessionManager.getStep.mockResolvedValue('menu');

      await chatbotLogic.processMessage(customerId, '1');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        '1',
        'menu'
      );
    });

    test('should handle browsing step', async () => {
      mockSessionManager.getStep.mockResolvedValue('browsing');

      await chatbotLogic.processMessage(customerId, 'netflix');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'netflix',
        'browsing'
      );
    });

    test('should handle checkout step', async () => {
      mockSessionManager.getStep.mockResolvedValue('checkout');

      await chatbotLogic.processMessage(customerId, 'bayar');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'bayar',
        'checkout'
      );
    });

    test('should handle payment_pending step', async () => {
      mockSessionManager.getStep.mockResolvedValue('payment_pending');

      await chatbotLogic.processMessage(customerId, 'cek');

      expect(mockRouter.route).toHaveBeenCalledWith(
        customerId,
        'cek',
        'payment_pending'
      );
    });
  });

  describe('Security Features', () => {
    const customerId = '628123456789@c.us';

    test('should sanitize all messages', async () => {
      await chatbotLogic.processMessage(customerId, '<script>alert("xss")</script>');

      expect(InputValidator.sanitizeMessage).toHaveBeenCalledWith(
        '<script>alert("xss")</script>'
      );
    });

    test('should enforce rate limiting', async () => {
      mockValidator.canSendMessage.mockReturnValue({
        allowed: false,
        message: 'Rate limited',
        reason: 'Too many requests'
      });

      await chatbotLogic.processMessage(customerId, 'menu');

      expect(mockLogger.logSecurity).toHaveBeenCalledWith(
        customerId,
        'rate_limit_exceeded',
        'Too many requests',
        expect.any(Object)
      );
    });

    test('should enforce error cooldown', async () => {
      mockValidator.isInCooldown.mockReturnValue({
        inCooldown: true,
        message: 'Please wait'
      });

      const response = await chatbotLogic.processMessage(customerId, 'menu');

      expect(response).toBe('Please wait');
    });

    test('should validate message before processing', async () => {
      InputValidator.sanitizeMessage.mockReturnValue('');

      await chatbotLogic.processMessage(customerId, '');

      expect(mockRouter.route).not.toHaveBeenCalled();
    });
  });

  describe('Logging', () => {
    const customerId = '628123456789@c.us';

    test('should log security events for rate limiting', async () => {
      mockValidator.canSendMessage.mockReturnValue({
        allowed: false,
        message: 'Rate limited',
        reason: 'Exceeded limit'
      });

      await chatbotLogic.processMessage(customerId, 'test');

      expect(mockLogger.logSecurity).toHaveBeenCalledWith(
        customerId,
        'rate_limit_exceeded',
        'Exceeded limit',
        { limit: 20 }
      );
    });

    test('should log errors with full context', async () => {
      const error = new Error('Router crash');
      mockRouter.route.mockRejectedValue(error);
      mockSessionManager.getStep.mockResolvedValue('checkout');
      InputValidator.sanitizeMessage.mockReturnValue('test message');

      await chatbotLogic.processMessage(customerId, 'test message');

      expect(mockLogger.logError).toHaveBeenCalledWith(
        customerId,
        error,
        expect.objectContaining({
          message: 'test message',
          step: 'checkout'
        })
      );
    });

    test('should log invalid message attempts', async () => {
      InputValidator.sanitizeMessage.mockReturnValue('');

      await chatbotLogic.processMessage(customerId, '<invalid>');

      expect(mockLogger.logError).toHaveBeenCalledWith(
        customerId,
        expect.any(Error),
        expect.objectContaining({
          original: '<invalid>'
        })
      );
    });
  });
});
