/**
 * OrderService Unit Tests
 *
 * Tests order tracking and history management
 * Following best practices from Node.js Testing Best Practices:
 * - Mock external dependencies (TransactionLogger)
 * - Test in isolation with AAA pattern
 * - Clear test descriptions
 * - Proper mock cleanup
 */

const OrderService = require("../../../src/services/order/OrderService");

describe("OrderService", () => {
  let orderService;
  let mockTransactionLogger;

  beforeEach(() => {
    // Arrange: Create mock TransactionLogger
    mockTransactionLogger = {
      getCustomerOrders: jest.fn(),
    };

    orderService = new OrderService(mockTransactionLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCustomerOrders", () => {
    test("When customer has orders, Then should return formatted order list", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          items: [{ name: "Netflix Premium", price: 50000 }],
          totalUSD: 5,
          totalIDR: 50000,
          paymentMethod: "QRIS",
          status: "completed",
        },
        {
          orderId: "ORD-002",
          timestamp: "2025-11-04T15:30:00.000Z",
          items: [{ name: "Spotify Premium", price: 30000 }],
          totalUSD: 3,
          totalIDR: 30000,
          paymentMethod: "Bank Transfer",
          status: "pending",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getCustomerOrders(customerId);

      // Assert
      expect(mockTransactionLogger.getCustomerOrders).toHaveBeenCalledWith(
        customerId
      );
      expect(mockTransactionLogger.getCustomerOrders).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        orderId: "ORD-001",
        totalUSD: 5,
        totalIDR: 50000,
        paymentMethod: "QRIS",
      });
    });

    test("When customer has no orders, Then should return empty array", async () => {
      // Arrange
      const customerId = "628999999999@c.us";
      mockTransactionLogger.getCustomerOrders.mockReturnValue([]);

      // Act
      const result = await orderService.getCustomerOrders(customerId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test("When TransactionLogger throws error, Then should return empty array", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      mockTransactionLogger.getCustomerOrders.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      // Act
      const result = await orderService.getCustomerOrders(customerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getOrdersByStatus", () => {
    test("When filtering by completed status, Then should return only completed orders", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          items: [],
          totalUSD: 5,
          totalIDR: 50000,
          status: "completed",
        },
        {
          orderId: "ORD-002",
          timestamp: "2025-11-04T15:30:00.000Z",
          items: [],
          totalUSD: 3,
          totalIDR: 30000,
          status: "pending",
        },
        {
          orderId: "ORD-003",
          timestamp: "2025-11-03T12:00:00.000Z",
          items: [],
          totalUSD: 7,
          totalIDR: 70000,
          status: "completed",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getOrdersByStatus(
        customerId,
        "completed"
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((order) => order.rawStatus === "completed")).toBe(
        true
      );
      expect(result[0].orderId).toBe("ORD-001");
      expect(result[1].orderId).toBe("ORD-003");
    });

    test("When filtering by pending status, Then should return only pending orders", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          items: [],
          status: "completed",
        },
        {
          orderId: "ORD-002",
          timestamp: "2025-11-04T15:30:00.000Z",
          items: [],
          status: "pending",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getOrdersByStatus(
        customerId,
        "pending"
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe("ORD-002");
    });

    test("When no orders match status, Then should return empty array", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          items: [],
          status: "completed",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getOrdersByStatus(
        customerId,
        "awaiting_payment"
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getOrderDetails", () => {
    test("When order exists, Then should return order details", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const orderId = "ORD-001";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          items: [{ name: "Netflix Premium", price: 50000 }],
          totalUSD: 5,
          totalIDR: 50000,
          status: "completed",
        },
        {
          orderId: "ORD-002",
          timestamp: "2025-11-04T15:30:00.000Z",
          items: [{ name: "Spotify Premium", price: 30000 }],
          totalUSD: 3,
          totalIDR: 30000,
          status: "pending",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getOrderDetails(customerId, orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderId).toBe("ORD-001");
      expect(result.totalUSD).toBe(5);
      expect(result.items).toHaveLength(1);
    });

    test("When order does not exist, Then should return null", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const orderId = "ORD-999";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          items: [],
          status: "completed",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getOrderDetails(customerId, orderId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getTotalOrders", () => {
    test("When customer has multiple orders, Then should return correct count", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        { orderId: "ORD-001", timestamp: "2025-11-05T10:00:00.000Z" },
        { orderId: "ORD-002", timestamp: "2025-11-04T15:30:00.000Z" },
        { orderId: "ORD-003", timestamp: "2025-11-03T12:00:00.000Z" },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getTotalOrders(customerId);

      // Assert
      expect(result).toBe(3);
    });

    test("When customer has no orders, Then should return 0", async () => {
      // Arrange
      const customerId = "628999999999@c.us";
      mockTransactionLogger.getCustomerOrders.mockReturnValue([]);

      // Act
      const result = await orderService.getTotalOrders(customerId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("getCompletedOrdersCount", () => {
    test("When customer has completed orders, Then should return correct count", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          status: "completed",
        },
        {
          orderId: "ORD-002",
          timestamp: "2025-11-04T15:30:00.000Z",
          status: "pending",
        },
        {
          orderId: "ORD-003",
          timestamp: "2025-11-03T12:00:00.000Z",
          status: "completed",
        },
        {
          orderId: "ORD-004",
          timestamp: "2025-11-02T09:00:00.000Z",
          status: "completed",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getCompletedOrdersCount(customerId);

      // Assert
      expect(result).toBe(3);
    });

    test("When customer has no completed orders, Then should return 0", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const mockOrders = [
        {
          orderId: "ORD-001",
          timestamp: "2025-11-05T10:00:00.000Z",
          status: "pending",
        },
        {
          orderId: "ORD-002",
          timestamp: "2025-11-04T15:30:00.000Z",
          status: "awaiting_payment",
        },
      ];

      mockTransactionLogger.getCustomerOrders.mockReturnValue(mockOrders);

      // Act
      const result = await orderService.getCompletedOrdersCount(customerId);

      // Assert
      expect(result).toBe(0);
    });
  });
});
