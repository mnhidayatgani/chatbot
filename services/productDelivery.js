const fs = require("fs");
const path = require("path");
const DatabaseService = require("../lib/databaseService");

class ProductDelivery {
  constructor() {
    this.productsDataDir = "./products_data";
    this.deliveryLogFile = "./delivery.log";
    this.dbService = new DatabaseService();
  }

  /**
   * Get product credentials from database or file
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Credentials or null if not available
   */
  async getProductCredentials(productId) {
    // Try database first
    if (this.dbService.isEnabled()) {
      try {
        const result = await this.dbService.getAvailableCredential(productId);
        if (result) {
          return result; // {credentialId, credential}
        }
        // If no result from DB, fall through to file-based
      } catch (error) {
        console.error("❌ Database error, falling back to file:", error.message);
      }
    }

    // Fallback to file-based system
    return this._getCredentialsFromFile(productId);
  }

  /**
   * Fallback: Get credentials from file
   */
  _getCredentialsFromFile(productId) {
    try {
      const filepath = path.join(this.productsDataDir, `${productId}.txt`);

      if (!fs.existsSync(filepath)) {
        console.warn(`⚠️ Product data file not found: ${productId}.txt`);
        return null;
      }

      const content = fs.readFileSync(filepath, "utf-8");
      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        console.warn(`⚠️ No credentials available for: ${productId}`);
        return null;
      }

      // Get first available credential and remove it from file
      const credential = lines[0];
      const remainingLines = lines.slice(1);

      // Update file with remaining credentials
      fs.writeFileSync(filepath, remainingLines.join("\n") + "\n", "utf-8");

      // Archive sold credential to sales ledger
      this.archiveSoldCredential(productId, credential);

      return this.parseCredential(credential);
    } catch (error) {
      console.error(`❌ Error reading product credentials: ${error.message}`);
      return null;
    }
  }

  /**
   * Archive sold credential to sales ledger
   * @param {string} productId - Product ID
   * @param {string} credential - Sold credential
   */
  archiveSoldCredential(productId, credential) {
    try {
      // Archive will be done when we know orderId and customerId
      // For now, just mark it in temporary storage
      this.lastSoldCredential = { productId, credential };
    } catch (error) {
      console.error(`❌ Error archiving credential: ${error.message}`);
    }
  }

  /**
   * Parse credential line
   * @param {string} line - Credential line
   * @returns {Object} Parsed credential
   */
  parseCredential(line) {
    // Format: email:password or email|password
    const separator = line.includes("|") ? "|" : ":";
    const parts = line.split(separator);

    if (parts.length >= 2) {
      return {
        email: parts[0].trim(),
        password: parts[1].trim(),
        raw: line,
      };
    }

    // Single line format (for VCC or other data)
    return {
      raw: line,
    };
  }

  /**
   * Deliver products to customer
   * @param {string} customerId - Customer WhatsApp ID
   * @param {string} orderId - Order ID
   * @param {Array} cart - Cart items
   * @returns {Promise<Object>} Delivery result
   */
  async deliverProducts(customerId, orderId, cart) {
    const deliveredProducts = [];
    const failedProducts = [];

    for (const item of cart) {
      const credentials = await this.getProductCredentials(item.id);

      if (credentials) {
        deliveredProducts.push({
          product: item,
          credentials: credentials,
        });

        // Mark as sold in database (if enabled)
        if (this.dbService.isEnabled() && credentials.credentialId) {
          try {
            await this.dbService.markAsSold(
              credentials.credentialId,
              orderId,
              customerId
            );
            console.log(`✅ Credential ${credentials.credentialId} marked as sold in DB`);
          } catch (error) {
            console.error(`❌ Error marking as sold:`, error.message);
          }
        }

        // Archive to sales ledger (file-based backup)
        this.archiveToSalesLedger(
          item.id,
          credentials.raw || credentials.credential,
          orderId,
          customerId
        );
      } else {
        failedProducts.push(item);
      }
    }

    // Log delivery
    this.logDelivery(customerId, orderId, deliveredProducts, failedProducts);

    return {
      success: deliveredProducts.length > 0,
      delivered: deliveredProducts,
      failed: failedProducts,
    };
  }

  /**
   * Archive sold credential to sales ledger
   * @param {string} productId - Product ID
   * @param {string} credential - Sold credential
   * @param {string} orderId - Order ID
   * @param {string} customerId - Customer ID
   */
  archiveToSalesLedger(productId, credential, orderId, customerId) {
    try {
      const InventoryManager = require("../src/services/inventory/InventoryManager");
      const manager = new InventoryManager();

      manager.archiveSoldCredential(productId, credential, orderId, customerId);

      console.log(
        `📦 Archived to sales ledger: ${productId} for order ${orderId}`
      );
    } catch (error) {
      console.error(`❌ Error archiving to sales ledger: ${error.message}`);
    }
  }

  /**
   * Format delivery message for customer
   * @param {Object} deliveryResult - Result from deliverProducts
   * @param {string} orderId - Order ID
   * @returns {string} Formatted message
   */
  formatDeliveryMessage(deliveryResult, orderId) {
    let message = "🎁 *DETAIL AKUN ANDA*\n\n";
    message += `📋 Order ID: ${orderId}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";

    deliveryResult.delivered.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`;

      if (item.credentials.email && item.credentials.password) {
        message += `📧 Email: ${item.credentials.email}\n`;
        message += `🔑 Password: ${item.credentials.password}\n`;
      } else {
        message += `📄 ${item.credentials.raw}\n`;
      }

      message += "\n";
    });

    if (deliveryResult.failed.length > 0) {
      message += "━━━━━━━━━━━━━━━━━━\n\n";
      message += "⚠️ *Produk Belum Tersedia:*\n";
      deliveryResult.failed.forEach((item) => {
        message += `• ${item.name}\n`;
      });
      message += "\nKami akan mengirimkan segera. Mohon tunggu.\n";
    }

    message += "\n━━━━━━━━━━━━━━━━━━\n\n";
    message += "📌 *PENTING:*\n";
    message += "• Simpan data ini dengan aman\n";
    message += "• Jangan bagikan ke orang lain\n";
    message += "• Login segera untuk aktivasi\n\n";
    message += "Terima kasih sudah berbelanja! 🎉";

    return message;
  }

  /**
   * Log delivery to file
   * @param {string} customerId
   * @param {string} orderId
   * @param {Array} delivered
   * @param {Array} failed
   */
  logDelivery(customerId, orderId, delivered, failed) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        customerId,
        orderId,
        delivered: delivered.map((d) => d.product.id),
        failed: failed.map((f) => f.id),
      };

      fs.appendFileSync(
        this.deliveryLogFile,
        JSON.stringify(logEntry) + "\n",
        "utf-8"
      );
    } catch (error) {
      console.error(`❌ Error logging delivery: ${error.message}`);
    }
  }

  /**
   * Check product stock availability
   * @param {string} productId
   * @returns {number} Number of available credentials
   */
  checkStock(productId) {
    try {
      const filepath = path.join(this.productsDataDir, `${productId}.txt`);

      if (!fs.existsSync(filepath)) {
        return 0;
      }

      const content = fs.readFileSync(filepath, "utf-8");
      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      return lines.length;
    } catch (error) {
      console.error(`❌ Error checking stock: ${error.message}`);
      return 0;
    }
  }
}

module.exports = ProductDelivery;
