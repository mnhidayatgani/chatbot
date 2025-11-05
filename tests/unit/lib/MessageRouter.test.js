/**
 * Unit Tests for MessageRouter
 * Tests message routing, rate limiting, and media handling
 */

const MessageRouter = require('../../../lib/messageRouter');

describe('MessageRouter', () => {
  let messageRouter;
  let mockClient;
  let mockSessionManager;
  let mockChatbotLogic;

  beforeEach(() => {
    // Mock WhatsApp client
    mockClient = {
      sendMessage: jest.fn().mockResolvedValue(true),
    };

    // Mock session manager
    mockSessionManager = {
      getSession: jest.fn(),
      setSession: jest.fn(),
      getStep: jest.fn().mockResolvedValue('menu'),
      setStep: jest.fn(),
      getCart: jest.fn().mockResolvedValue([]),
      getOrderId: jest.fn().mockResolvedValue('ORD-123'),
      set: jest.fn(),
      setPaymentProof: jest.fn(),
      canSendMessage: jest.fn().mockReturnValue(true),
      getRateLimitStatus: jest.fn().mockReturnValue({
        resetIn: 60000,
        count: 0,
      }),
      rateLimitMax: 20,
    };

    // Mock chatbot logic
    mockChatbotLogic = {
      processMessage: jest.fn().mockResolvedValue('Test response'),
      customerHandler: {
        wishlistHandler: {
          handleSaveToWishlist: jest.fn().mockResolvedValue('Added to wishlist'),
          handleRemoveFromWishlist: jest.fn().mockResolvedValue('Removed from wishlist'),
        },
      },
      logger: {
        logError: jest.fn(),
      },
      validator: {
        setErrorCooldown: jest.fn(),
      },
    };

    // Create router instance
    messageRouter = new MessageRouter(mockClient, mockSessionManager, mockChatbotLogic);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor & Initialization', () => {
    test('should initialize with all dependencies', () => {
      expect(messageRouter.client).toBe(mockClient);
      expect(messageRouter.sessionManager).toBe(mockSessionManager);
      expect(messageRouter.chatbotLogic).toBe(mockChatbotLogic);
    });
  });

  describe('shouldIgnore()', () => {
    test('should ignore group messages (@g.us)', () => {
      const message = { from: '123456@g.us' };
      expect(messageRouter.shouldIgnore(message)).toBe(true);
    });

    test('should ignore status broadcasts', () => {
      const message = { from: 'status@broadcast' };
      expect(messageRouter.shouldIgnore(message)).toBe(true);
    });

    test('should not ignore personal messages (@c.us)', () => {
      const message = { from: '123456@c.us' };
      expect(messageRouter.shouldIgnore(message)).toBe(false);
    });

    test('should not ignore admin messages', () => {
      const message = { from: '628123456789@c.us' };
      expect(messageRouter.shouldIgnore(message)).toBe(false);
    });
  });

  describe('isRateLimited()', () => {
    test('should return not limited when under limit', () => {
      mockSessionManager.canSendMessage.mockReturnValue(true);

      const result = messageRouter.isRateLimited('123456@c.us');
      
      expect(result.limited).toBe(false);
    });

    test('should return limited when over limit', () => {
      mockSessionManager.canSendMessage.mockReturnValue(false);
      mockSessionManager.getRateLimitStatus.mockReturnValue({
        resetIn: 120000, // 2 minutes
        count: 20,
      });

      const result = messageRouter.isRateLimited('123456@c.us');
      
      expect(result.limited).toBe(true);
      expect(result.message).toContain('Rate Limit');
      expect(result.message).toContain('2 menit');
    });

    test('should include reset time in message', () => {
      mockSessionManager.canSendMessage.mockReturnValue(false);
      mockSessionManager.getRateLimitStatus.mockReturnValue({
        resetIn: 180000, // 3 minutes
        count: 20,
      });

      const result = messageRouter.isRateLimited('123456@c.us');
      
      expect(result.message).toContain('3 menit');
    });

    test('should call sessionManager.canSendMessage', () => {
      messageRouter.isRateLimited('123456@c.us');
      expect(mockSessionManager.canSendMessage).toHaveBeenCalledWith('123456@c.us');
    });
  });

  describe('sendTextResponse()', () => {
    test('should send text message', async () => {
      const mockMessage = {
        reply: jest.fn().mockResolvedValue(true),
      };

      const response = {
        message: 'Test response',
      };

      await messageRouter.sendTextResponse(mockMessage, response);
      
      expect(mockMessage.reply).toHaveBeenCalledWith('Test response');
    });

    test('should handle delivery to customer when specified', async () => {
      const mockMessage = {
        reply: jest.fn().mockResolvedValue(true),
      };

      const response = {
        message: 'Order approved',
        deliverToCustomer: true,
        customerId: '123456@c.us',
        customerMessage: 'Your order has been approved',
      };

      await messageRouter.sendTextResponse(mockMessage, response);
      
      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        '123456@c.us',
        'Your order has been approved'
      );
    });

    test('should handle delivery errors gracefully', async () => {
      const mockMessage = {
        reply: jest.fn().mockResolvedValue(true),
      };

      mockClient.sendMessage.mockRejectedValue(new Error('Send failed'));

      const response = {
        message: 'Order approved',
        deliverToCustomer: true,
        customerId: '123456@c.us',
        customerMessage: 'Your order has been approved',
      };

      await messageRouter.sendTextResponse(mockMessage, response);
      
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('Gagal mengirim ke customer')
      );
    });
  });

  describe('handleMessage()', () => {
    test('should ignore group messages', async () => {
      const mockMessage = {
        from: '123456@g.us',
        body: 'Test',
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.processMessage).not.toHaveBeenCalled();
    });

    test('should ignore status broadcasts', async () => {
      const mockMessage = {
        from: 'status@broadcast',
        body: 'Test',
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.processMessage).not.toHaveBeenCalled();
    });

    test('should handle rate limited customers', async () => {
      mockSessionManager.canSendMessage.mockReturnValue(false);

      const mockMessage = {
        from: '123456@c.us',
        body: 'Test',
        reply: jest.fn(),
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('Rate Limit')
      );
      expect(mockChatbotLogic.processMessage).not.toHaveBeenCalled();
    });

    test('should process normal text messages', async () => {
      const mockMessage = {
        from: '123456@c.us',
        body: 'menu',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.processMessage).toHaveBeenCalledWith('123456@c.us', 'menu');
      expect(mockMessage.reply).toHaveBeenCalled();
    });

    test('should handle wishlist "simpan" command', async () => {
      const mockMessage = {
        from: '123456@c.us',
        body: 'simpan netflix',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.customerHandler.wishlistHandler.handleSaveToWishlist)
        .toHaveBeenCalledWith('123456@c.us', 'netflix');
      expect(mockChatbotLogic.processMessage).not.toHaveBeenCalled();
    });

    test('should handle wishlist "⭐" command', async () => {
      const mockMessage = {
        from: '123456@c.us',
        body: '⭐ spotify',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.customerHandler.wishlistHandler.handleSaveToWishlist)
        .toHaveBeenCalledWith('123456@c.us', 'spotify');
    });

    test('should handle broadcast response type', async () => {
      mockChatbotLogic.processMessage.mockResolvedValue({
        type: 'broadcast',
        message: 'Promo message',
        confirmMessage: 'Broadcast sent',
        recipients: ['111@c.us', '222@c.us'],
      });

      const mockMessage = {
        from: 'admin@c.us',
        body: '/broadcast Test',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalledWith('Broadcast sent');
      expect(mockClient.sendMessage).toHaveBeenCalledTimes(2);
      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        '111@c.us',
        expect.stringContaining('Promo message')
      );
    });

    test('should handle object responses with message property', async () => {
      mockChatbotLogic.processMessage.mockResolvedValue({
        message: 'Welcome message',
      });

      const mockMessage = {
        from: '123456@c.us',
        body: 'menu',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalledWith('Welcome message');
    });

    test('should handle simple string responses', async () => {
      mockChatbotLogic.processMessage.mockResolvedValue('Simple response');

      const mockMessage = {
        from: '123456@c.us',
        body: 'menu',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalledWith('Simple response');
    });

    test('should handle errors gracefully', async () => {
      mockChatbotLogic.processMessage.mockRejectedValue(new Error('Processing error'));

      const mockMessage = {
        from: '123456@c.us',
        body: 'menu',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('terjadi kesalahan')
      );
      expect(mockChatbotLogic.logger.logError).toHaveBeenCalled();
      expect(mockChatbotLogic.validator.setErrorCooldown).toHaveBeenCalled();
    });
  });

  describe('Message Type Handling', () => {
    test('should handle lowercase commands', async () => {
      const mockMessage = {
        from: '123456@c.us',
        body: 'menu',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.processMessage).toHaveBeenCalledWith('123456@c.us', 'menu');
    });

    test('should handle uppercase commands', async () => {
      const mockMessage = {
        from: '123456@c.us',
        body: 'MENU',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.processMessage).toHaveBeenCalledWith('123456@c.us', 'MENU');
    });

    test('should handle commands with whitespace', async () => {
      const mockMessage = {
        from: '123456@c.us',
        body: '  menu  ',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockChatbotLogic.processMessage).toHaveBeenCalledWith('123456@c.us', '  menu  ');
    });
  });

  describe('Error Handling Edge Cases', () => {
    test('should handle null logger gracefully', async () => {
      mockChatbotLogic.logger = null;
      mockChatbotLogic.processMessage.mockRejectedValue(new Error('Test error'));

      const mockMessage = {
        from: '123456@c.us',
        body: 'test',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalled();
    });

    test('should handle null validator gracefully', async () => {
      mockChatbotLogic.validator = null;
      mockChatbotLogic.processMessage.mockRejectedValue(new Error('Test error'));

      const mockMessage = {
        from: '123456@c.us',
        body: 'test',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockMessage.reply).toHaveBeenCalled();
    });

    test('should handle reply errors', async () => {
      mockChatbotLogic.processMessage.mockRejectedValue(new Error('Processing error'));

      const mockMessage = {
        from: '123456@c.us',
        body: 'test',
        reply: jest.fn().mockRejectedValue(new Error('Reply failed')),
        hasMedia: false,
      };

      // Should not throw
      await expect(messageRouter.handleMessage(mockMessage)).resolves.not.toThrow();
    });
  });

  describe('Broadcast Functionality', () => {
    test('should send broadcast to multiple recipients', async () => {
      mockChatbotLogic.processMessage.mockResolvedValue({
        type: 'broadcast',
        message: 'Broadcast message',
        confirmMessage: 'Sent to 3 customers',
        recipients: ['111@c.us', '222@c.us', '333@c.us'],
      });

      const mockMessage = {
        from: 'admin@c.us',
        body: '/broadcast Test',
        reply: jest.fn(),
        hasMedia: false,
      };

      await messageRouter.handleMessage(mockMessage);
      
      expect(mockClient.sendMessage).toHaveBeenCalledTimes(3);
    });

    test('should handle broadcast send failures', async () => {
      mockClient.sendMessage.mockRejectedValueOnce(new Error('Send failed'));
      
      mockChatbotLogic.processMessage.mockResolvedValue({
        type: 'broadcast',
        message: 'Broadcast message',
        confirmMessage: 'Sent',
        recipients: ['111@c.us', '222@c.us'],
      });

      const mockMessage = {
        from: 'admin@c.us',
        body: '/broadcast Test',
        reply: jest.fn(),
        hasMedia: false,
      };

      // Should not throw, continues to next recipient
      await expect(messageRouter.handleMessage(mockMessage)).resolves.not.toThrow();
    });
  });
});
