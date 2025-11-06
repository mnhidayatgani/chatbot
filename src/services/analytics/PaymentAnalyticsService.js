/**
 * Payment Analytics Service
 * Provides statistics and insights about payment methods
 */

class PaymentAnalyticsService {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  /**
   * Get all orders from session history
   * @param {number} days - Number of days to look back (default: 30)
   * @returns {Array} Orders with payment info
   */
  getOrders(days = 30) {
    const orders = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all sessions
    const sessions = this.sessionManager.getAllSessions();
    
    sessions.forEach(session => {
      if (session.orderId && session.paymentMethod && session.orderDate) {
        const orderDate = new Date(session.orderDate);
        
        // Only include orders within the time range
        if (orderDate >= cutoffDate) {
          orders.push({
            orderId: session.orderId,
            paymentMethod: session.paymentMethod,
            paymentStatus: session.paymentStatus || 'pending',
            total: session.cart?.reduce((sum, item) => sum + (item.price || 0), 0) || 0,
            date: session.orderDate,
            customerId: session.customerId
          });
        }
      }
    });

    return orders;
  }

  /**
   * Get payment method statistics
   * @param {number} days - Number of days to analyze
   * @returns {object} Payment method stats
   */
  getPaymentMethodStats(days = 30) {
    const orders = this.getOrders(days);
    const stats = {};
    const statusByMethod = {};

    orders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      
      // Count by payment method
      if (!stats[method]) {
        stats[method] = {
          count: 0,
          revenue: 0,
          successCount: 0,
          pendingCount: 0,
          failedCount: 0
        };
      }
      
      stats[method].count++;
      stats[method].revenue += order.total;
      
      // Count by status
      if (order.paymentStatus === 'completed' || order.paymentStatus === 'approved') {
        stats[method].successCount++;
      } else if (order.paymentStatus === 'pending') {
        stats[method].pendingCount++;
      } else {
        stats[method].failedCount++;
      }

      // Track status distribution
      if (!statusByMethod[method]) {
        statusByMethod[method] = {};
      }
      const status = order.paymentStatus || 'unknown';
      statusByMethod[method][status] = (statusByMethod[method][status] || 0) + 1;
    });

    // Calculate percentages and success rates
    const totalOrders = orders.length;
    Object.keys(stats).forEach(method => {
      const methodStats = stats[method];
      methodStats.percentage = totalOrders > 0 
        ? ((methodStats.count / totalOrders) * 100).toFixed(1) 
        : 0;
      methodStats.successRate = methodStats.count > 0 
        ? ((methodStats.successCount / methodStats.count) * 100).toFixed(1) 
        : 0;
      methodStats.avgRevenue = methodStats.count > 0 
        ? (methodStats.revenue / methodStats.count).toFixed(0) 
        : 0;
    });

    return {
      stats,
      totalOrders,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      period: days
    };
  }

  /**
   * Format payment stats for WhatsApp message
   * @param {number} days - Number of days to analyze
   * @returns {string} Formatted message
   */
  formatPaymentStats(days = 30) {
    const data = this.getPaymentMethodStats(days);
    
    let message = `💳 *Payment Statistics*\n\n`;
    message += `📅 Period: ${days} hari terakhir\n`;
    message += `📊 Total Orders: ${data.totalOrders}\n`;
    message += `💰 Total Revenue: Rp${data.totalRevenue.toLocaleString('id-ID')}\n\n`;
    
    if (data.totalOrders === 0) {
      message += `📭 Belum ada transaksi dalam ${days} hari terakhir.\n`;
      return message;
    }
    
    // Sort by count (most used first)
    const sortedMethods = Object.entries(data.stats)
      .sort((a, b) => b[1].count - a[1].count);
    
    message += `📈 *Payment Methods Usage*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    sortedMethods.forEach(([method, stats], index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▪️';
      const methodName = this.formatMethodName(method);
      
      message += `${emoji} *${methodName}*\n`;
      message += `   Orders: ${stats.count} (${stats.percentage}%)\n`;
      message += `   Revenue: Rp${stats.revenue.toLocaleString('id-ID')}\n`;
      message += `   Success Rate: ${stats.successRate}%\n`;
      message += `   Avg/Order: Rp${stats.avgRevenue}\n`;
      
      // Status breakdown
      message += `   Status: ✅${stats.successCount} ⏳${stats.pendingCount} ❌${stats.failedCount}\n\n`;
    });
    
    // Top payment method
    if (sortedMethods.length > 0) {
      const topMethod = sortedMethods[0];
      message += `🏆 *Most Popular*\n`;
      message += `${this.formatMethodName(topMethod[0])} - ${topMethod[1].count} orders (${topMethod[1].percentage}%)\n\n`;
    }
    
    // Recommendations
    message += `💡 *Insights*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    const avgOrderValue = data.totalRevenue / data.totalOrders;
    message += `• Avg Order Value: Rp${avgOrderValue.toFixed(0)}\n`;
    
    // Find best success rate
    const bestMethod = sortedMethods.reduce((best, current) => {
      return parseFloat(current[1].successRate) > parseFloat(best[1].successRate) ? current : best;
    }, sortedMethods[0]);
    
    message += `• Best Success Rate: ${this.formatMethodName(bestMethod[0])} (${bestMethod[1].successRate}%)\n`;
    
    // Payment diversity
    message += `• Payment Methods Used: ${sortedMethods.length}\n\n`;
    
    message += `📱 Commands:\n`;
    message += `• /paymentstats [days] - View stats\n`;
    message += `• /stats - Dashboard overview`;
    
    return message;
  }

  /**
   * Format payment method name for display
   * @param {string} method - Payment method code
   * @returns {string} Formatted name
   */
  formatMethodName(method) {
    const names = {
      'qris': 'QRIS',
      'dana': 'DANA',
      'gopay': 'GoPay',
      'ovo': 'OVO',
      'shopeepay': 'ShopeePay',
      'bca': 'Bank BCA',
      'bni': 'Bank BNI',
      'bri': 'Bank BRI',
      'mandiri': 'Bank Mandiri',
      'manual': 'Manual Transfer'
    };
    
    return names[method.toLowerCase()] || method.toUpperCase();
  }

  /**
   * Get revenue by payment method for a specific period
   * @param {number} days - Number of days
   * @returns {object} Revenue breakdown
   */
  getRevenueBreakdown(days = 30) {
    const data = this.getPaymentMethodStats(days);
    const breakdown = {};
    
    Object.entries(data.stats).forEach(([method, stats]) => {
      breakdown[method] = {
        revenue: stats.revenue,
        percentage: ((stats.revenue / data.totalRevenue) * 100).toFixed(1),
        orders: stats.count
      };
    });
    
    return {
      breakdown,
      totalRevenue: data.totalRevenue,
      period: days
    };
  }

  /**
   * Get payment method trends (compare periods)
   * @param {number} currentDays - Current period (default: 7)
   * @param {number} previousDays - Previous period (default: 7)
   * @returns {object} Trend comparison
   */
  getPaymentTrends(currentDays = 7, previousDays = 7) {
    const currentOrders = this.getOrders(currentDays);
    
    // Get previous period orders
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentDays);
    const endDate = new Date(cutoffDate);
    endDate.setDate(endDate.getDate() - previousDays);
    
    const previousOrders = this.getOrders(currentDays + previousDays)
      .filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= endDate && orderDate < cutoffDate;
      });
    
    const currentStats = this.calculatePeriodStats(currentOrders);
    const previousStats = this.calculatePeriodStats(previousOrders);
    
    return {
      current: currentStats,
      previous: previousStats,
      growth: this.calculateGrowth(currentStats, previousStats)
    };
  }

  /**
   * Calculate stats for a specific period
   * @param {Array} orders - Orders in the period
   * @returns {object} Period statistics
   */
  calculatePeriodStats(orders) {
    const methods = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      if (!methods[method]) {
        methods[method] = { count: 0, revenue: 0 };
      }
      methods[method].count++;
      methods[method].revenue += order.total;
      totalRevenue += order.total;
    });
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      methods
    };
  }

  /**
   * Calculate growth between periods
   * @param {object} current - Current period stats
   * @param {object} previous - Previous period stats
   * @returns {object} Growth metrics
   */
  calculateGrowth(current, previous) {
    const orderGrowth = previous.totalOrders > 0
      ? (((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100).toFixed(1)
      : 0;
    
    const revenueGrowth = previous.totalRevenue > 0
      ? (((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100).toFixed(1)
      : 0;
    
    return {
      orderGrowth: parseFloat(orderGrowth),
      revenueGrowth: parseFloat(revenueGrowth)
    };
  }
}

module.exports = PaymentAnalyticsService;
