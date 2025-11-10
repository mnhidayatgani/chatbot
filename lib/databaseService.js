/**
 * Database Service - PostgreSQL Operations
 * Handles product stock management via database
 * 
 * Falls back to file-based system if DATABASE_URL not set
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

class DatabaseService {
  constructor() {
    this.pool = null;
    this.enabled = false;

    // Initialize PostgreSQL if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });

      this.enabled = true;
      console.log("✅ PostgreSQL database enabled");
    } else {
      console.log("⚠️  DATABASE_URL not set, using file-based storage");
    }
  }

  /**
   * Check if database is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get available credential for a product
   * @param {string} productId - Product ID
   * @returns {Promise<string|null>} - Credential or null if out of stock
   */
  async getAvailableCredential(productId) {
    if (!this.enabled) {
      // Fallback to file-based
      return this._getCredentialFromFile(productId);
    }

    try {
      const result = await this.pool.query(
        `SELECT id, credential 
         FROM product_credentials 
         WHERE product_id = $1 AND sold = FALSE 
         LIMIT 1`,
        [productId]
      );

      if (result.rows.length === 0) {
        return null; // Out of stock
      }

      return {
        credentialId: result.rows[0].id,
        credential: result.rows[0].credential,
      };
    } catch (error) {
      console.error("❌ Database error (getAvailableCredential):", error.message);
      // Fallback to file
      return this._getCredentialFromFile(productId);
    }
  }

  /**
   * Mark credential as sold
   * @param {number} credentialId - Credential ID
   * @param {string} orderId - Order ID
   * @param {string} customerId - Customer ID
   */
  async markAsSold(credentialId, orderId, customerId) {
    if (!this.enabled) return;

    try {
      await this.pool.query(
        `UPDATE product_credentials 
         SET sold = TRUE, order_id = $1, customer_id = $2, sold_at = NOW()
         WHERE id = $3`,
        [orderId, customerId, credentialId]
      );

      console.log(`✅ Credential ${credentialId} marked as sold`);
    } catch (error) {
      console.error("❌ Database error (markAsSold):", error.message);
    }
  }

  /**
   * Get product stock count
   * @param {string} productId - Product ID
   * @returns {Promise<number>} - Available stock count
   */
  async getStockCount(productId) {
    if (!this.enabled) {
      return this._getStockCountFromFile(productId);
    }

    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as count 
         FROM product_credentials 
         WHERE product_id = $1 AND sold = FALSE`,
        [productId]
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error("❌ Database error (getStockCount):", error.message);
      return 0;
    }
  }

  /**
   * Get all available products with stock
   * @returns {Promise<Array>} - Products with stock counts
   */
  async getAllProducts() {
    if (!this.enabled) {
      return []; // Return empty, let config.js handle it
    }

    try {
      const result = await this.pool.query(`
        SELECT * FROM v_product_stock WHERE available_stock > 0
      `);

      return result.rows;
    } catch (error) {
      console.error("❌ Database error (getAllProducts):", error.message);
      return [];
    }
  }

  /**
   * Add new credentials to database
   * @param {string} productId - Product ID
   * @param {Array<string>} credentials - Array of credentials
   */
  async addCredentials(productId, credentials) {
    if (!this.enabled) {
      console.log("⚠️  Database disabled, credentials not added");
      return;
    }

    try {
      for (const credential of credentials) {
        await this.pool.query(
          `INSERT INTO product_credentials (product_id, credential)
           VALUES ($1, $2)`,
          [productId, credential]
        );
      }

      console.log(`✅ Added ${credentials.length} credentials for ${productId}`);
    } catch (error) {
      console.error("❌ Database error (addCredentials):", error.message);
    }
  }

  /**
   * Fallback: Get credential from file
   */
  _getCredentialFromFile(productId) {
    const filePath = path.join(__dirname, `../products_data/${productId}.txt`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"));

    if (lines.length === 0) {
      return null;
    }

    // Return first available
    return { credential: lines[0], credentialId: null };
  }

  /**
   * Fallback: Get stock count from file
   */
  _getStockCountFromFile(productId) {
    const filePath = path.join(__dirname, `../products_data/${productId}.txt`);

    if (!fs.existsSync(filePath)) {
      return 0;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"));

    return lines.length;
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = DatabaseService;
