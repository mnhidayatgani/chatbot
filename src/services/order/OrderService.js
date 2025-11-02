/**
 * Order Service
 * Manages order tracking and history
 */

const TransactionLogger = require("../../../lib/transactionLogger");

class OrderService {
  constructor(transactionLogger = null) {
    this.transactionLogger = transactionLogger || new TransactionLogger();
  }

  /**
   * Get customer's order history from transaction logs
   * @param {string} customerId - WhatsApp number
   * @returns {Promise<Array>} Array of order objects
   */
  async getCustomerOrders(customerId) {
    try {
      // Use existing TransactionLogger method
      const orders = this.transactionLogger.getCustomerOrders(customerId);

      // Transform to friendly format
      return orders.map((order) => ({
        orderId: order.orderId,
        date: this._formatDate(order.timestamp),
        items: order.items || [],
        totalUSD: order.totalUSD || 0,
        totalIDR: order.totalIDR || 0,
        paymentMethod: order.paymentMethod || "Unknown",
        status: this._getStatusLabel(order.status),
        rawStatus: order.status,
      }));
    } catch (error) {
      console.error(
        `❌ OrderService.getCustomerOrders error: ${error.message}`
      );
      return [];
    }
  }

  /**
   * Get orders by status
   * @param {string} customerId
   * @param {string} status - 'pending', 'awaiting_payment', 'completed'
   * @returns {Promise<Array>}
   */
  async getOrdersByStatus(customerId, status) {
    const orders = await this.getCustomerOrders(customerId);
    return orders.filter((order) => order.rawStatus === status);
  }

  /**
   * Get single order details
   * @param {string} customerId
   * @param {string} orderId
   * @returns {Promise<Object|null>}
   */
  async getOrderDetails(customerId, orderId) {
    const orders = await this.getCustomerOrders(customerId);
    return orders.find((order) => order.orderId === orderId) || null;
  }

  /**
   * Get total orders count for customer
   * @param {string} customerId
   * @returns {Promise<number>}
   */
  async getTotalOrders(customerId) {
    const orders = await this.getCustomerOrders(customerId);
    return orders.length;
  }

  /**
   * Get completed orders count
   * @param {string} customerId
   * @returns {Promise<number>}
   */
  async getCompletedOrdersCount(customerId) {
    const orders = await this.getOrdersByStatus(customerId, "completed");
    return orders.length;
  }

  /**
   * Format timestamp to readable date
   * @private
   */
  _formatDate(timestamp) {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    };

    return date.toLocaleDateString("id-ID", options);
  }

  /**
   * Get human-friendly status label
   * @private
   */
  _getStatusLabel(status) {
    const statusMap = {
      pending: "⏳ Menunggu Pembayaran",
      awaiting_payment: "💳 Menunggu Pembayaran",
      completed: "✅ Selesai",
      delivered: "✅ Selesai",
      failed: "❌ Gagal",
      expired: "⏰ Kadaluarsa",
    };

    return statusMap[status] || "❓ Unknown";
  }
}

module.exports = OrderService;
