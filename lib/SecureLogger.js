/**
 * SecureLogger - Secure logging utility with PII masking and log levels
 * Replaces console.log with structured, secure logging
 */

const fs = require('fs');
const path = require('path');

class SecureLogger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.logToFile = options.logToFile !== false; // default true
    this.logDir = options.logDir || path.join(__dirname, '../logs');
    this.maskPII = options.maskPII !== false; // default true
    this.includeTimestamp = options.includeTimestamp !== false;
    this.includeLevel = options.includeLevel !== false;
    
    // Log levels (ascending priority)
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      security: 4
    };

    // Ensure log directory exists
    if (this.logToFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    const currentLevel = this.levels[this.level] || 0;
    const messageLevel = this.levels[level] || 0;
    return messageLevel >= currentLevel;
  }

  /**
   * Mask sensitive data (PII, credentials, etc.)
   */
  maskSensitiveData(data) {
    if (!this.maskPII) return data;
    
    let masked = String(data);

    // Mask WhatsApp IDs first (before email regex)
    masked = masked.replace(/\b(\d{8,})@c\.us\b/g, (match) => {
      const nums = match.match(/\d+/)[0];
      return 'XXX' + nums.slice(-4) + '@c.us';
    });

    // Mask phone numbers (Indonesian format)
    masked = masked.replace(/\b(62|08)\d{8,12}\b/g, '62XXXXXXXX');
    
    // Mask emails (exclude c.us and whatsapp.net domains)
    masked = masked.replace(/\b[A-Za-z0-9._%+-]+@(?!c\.us|s\.whatsapp\.net)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'email@hidden.com');
    
    // Mask credit card numbers
    masked = masked.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX');
    
    // Mask API keys and tokens (long alphanumeric strings)
    masked = masked.replace(/\b[A-Za-z0-9]{32,}\b/g, 'API_KEY_MASKED');
    
    // Mask passwords in URLs or JSON
    masked = masked.replace(/(password|pwd|pass)[\s:="']+([^\s"'&]+)/gi, '$1=MASKED');

    return masked;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, context = {}) {
    const parts = [];

    // Timestamp
    if (this.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Log level
    if (this.includeLevel) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    // Context (e.g., [CustomerHandler])
    if (context.component) {
      parts.push(`[${context.component}]`);
    }

    // Main message
    parts.push(message);

    // Additional context
    if (context.customerId) {
      parts.push(`Customer: ${this.maskSensitiveData(context.customerId)}`);
    }
    if (context.orderId) {
      parts.push(`Order: ${context.orderId}`);
    }
    if (context.error) {
      parts.push(`Error: ${context.error.message || context.error}`);
    }

    return parts.join(' ');
  }

  /**
   * Write to log file
   */
  writeToFile(level, formattedMessage) {
    if (!this.logToFile) return;

    try {
      const filename = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      const logLine = formattedMessage + '\n';
      
      fs.appendFileSync(filename, logLine, 'utf8');
    } catch (error) {
      // Fallback to console if file write fails
      console.error('[SecureLogger] Failed to write log:', error.message);
    }
  }

  /**
   * Log debug message
   */
  debug(message, context = {}) {
    if (!this.shouldLog('debug')) return;
    
    const formatted = this.formatMessage('debug', this.maskSensitiveData(message), context);
    console.log('\x1b[36m%s\x1b[0m', formatted); // Cyan color
    this.writeToFile('debug', formatted);
  }

  /**
   * Log info message
   */
  info(message, context = {}) {
    if (!this.shouldLog('info')) return;
    
    const formatted = this.formatMessage('info', this.maskSensitiveData(message), context);
    console.log(formatted);
    this.writeToFile('info', formatted);
  }

  /**
   * Log warning message
   */
  warn(message, context = {}) {
    if (!this.shouldLog('warn')) return;
    
    const formatted = this.formatMessage('warn', this.maskSensitiveData(message), context);
    console.warn('\x1b[33m%s\x1b[0m', formatted); // Yellow color
    this.writeToFile('warn', formatted);
  }

  /**
   * Log error message
   */
  error(message, context = {}) {
    if (!this.shouldLog('error')) return;
    
    const formatted = this.formatMessage('error', this.maskSensitiveData(message), context);
    console.error('\x1b[31m%s\x1b[0m', formatted); // Red color
    this.writeToFile('error', formatted);
  }

  /**
   * Log security event (always logged, never masked)
   */
  security(message, context = {}) {
    // Security logs are always written and never masked (need full data)
    const originalMaskPII = this.maskPII;
    this.maskPII = false;
    
    const formatted = this.formatMessage('security', message, context);
    console.error('\x1b[35m%s\x1b[0m', formatted); // Magenta color
    this.writeToFile('security', formatted);
    
    this.maskPII = originalMaskPII;
  }

  /**
   * Log HTTP request
   */
  http(method, url, statusCode, duration) {
    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    this.info(message, { component: 'HTTP' });
  }

  /**
   * Log transaction
   */
  transaction(customerId, event, details = {}) {
    const message = `Transaction: ${event}`;
    this.info(message, {
      component: 'Transaction',
      customerId,
      ...details
    });
  }

  /**
   * Log order event
   */
  order(orderId, event, details = {}) {
    const message = `Order ${event}: ${orderId}`;
    this.info(message, {
      component: 'Order',
      orderId,
      ...details
    });
  }

  /**
   * Log admin action
   */
  admin(adminId, action, details = {}) {
    const message = `Admin action: ${action}`;
    this.security(message, {
      component: 'Admin',
      customerId: adminId,
      ...details
    });
  }

  /**
   * Log session event
   */
  session(customerId, event, details = {}) {
    const message = `Session ${event}`;
    this.debug(message, {
      component: 'Session',
      customerId,
      ...details
    });
  }

  /**
   * Log payment event
   */
  payment(orderId, event, amount, method) {
    const message = `Payment ${event}: Rp ${amount} via ${method}`;
    this.info(message, {
      component: 'Payment',
      orderId
    });
  }

  /**
   * Static methods for global usage
   */
  static getInstance(options) {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger(options);
    }
    return SecureLogger.instance;
  }

  static debug(message, context) {
    return SecureLogger.getInstance().debug(message, context);
  }

  static info(message, context) {
    return SecureLogger.getInstance().info(message, context);
  }

  static warn(message, context) {
    return SecureLogger.getInstance().warn(message, context);
  }

  static error(message, context) {
    return SecureLogger.getInstance().error(message, context);
  }

  static security(message, context) {
    return SecureLogger.getInstance().security(message, context);
  }

  static http(method, url, statusCode, duration) {
    return SecureLogger.getInstance().http(method, url, statusCode, duration);
  }

  static transaction(customerId, event, details) {
    return SecureLogger.getInstance().transaction(customerId, event, details);
  }

  static order(orderId, event, details) {
    return SecureLogger.getInstance().order(orderId, event, details);
  }

  static admin(adminId, action, details) {
    return SecureLogger.getInstance().admin(adminId, action, details);
  }

  static session(customerId, event, details) {
    return SecureLogger.getInstance().session(customerId, event, details);
  }

  static payment(orderId, event, amount, method) {
    return SecureLogger.getInstance().payment(orderId, event, amount, method);
  }
}

module.exports = SecureLogger;
