/**
 * Admin Handler
 * Handles all admin commands and system management
 */

const BaseHandler = require("./BaseHandler");
const InputValidator = require("../../lib/inputValidator");
const InputSanitizer = require("../utils/InputSanitizer");
const UIMessages = require("../../lib/uiMessages");
const AIHandler = require("./AIHandler");
const AdminStatsService = require("../services/admin/AdminStatsService");
const AdminInventoryHandler = require("./AdminInventoryHandler");
const AdminPromoHandler = require("./AdminPromoHandler");
const PromoService = require("../services/promo/PromoService");
const ReviewService = require("../services/review/ReviewService");
const DashboardService = require("../services/analytics/DashboardService");
const PaymentAnalyticsService = require("../services/analytics/PaymentAnalyticsService");
const AdminReviewHandler = require("./AdminReviewHandler");
const AdminAnalyticsHandler = require("./AdminAnalyticsHandler");
const AdminOrderHandler = require("./AdminOrderHandler");
const AdminProductHandler = require("./AdminProductHandler");

class AdminHandler extends BaseHandler {
  constructor(sessionManager, xenditService, logger = null) {
    super(sessionManager, logger);
    this.xenditService = xenditService;
    this.aiHandler = new AIHandler(undefined, undefined, logger);
    this.statsService = new AdminStatsService();
    this.inventoryHandler = new AdminInventoryHandler(sessionManager, logger);
    this.promoService = new PromoService();
    this.promoHandler = new AdminPromoHandler(
      sessionManager,
      this.promoService,
      logger
    );
    this.reviewService = new ReviewService();
    this.dashboardService = new DashboardService(logger);
    this.paymentAnalytics = new PaymentAnalyticsService(sessionManager);

    this.productHandler = new AdminProductHandler(sessionManager, logger);
    this.reviewHandler = new AdminReviewHandler(this.reviewService, logger);
    this.analyticsHandler = new AdminAnalyticsHandler(
      this.dashboardService,
      this.statsService,
      sessionManager,
      logger
    );
    this.orderHandler = new AdminOrderHandler(
      sessionManager,
      this.xenditService,
      logger
    );

    this.commandRoutes = this._initializeCommandRoutes();
  }

  /**
   * Initialize command routing map for better performance
   * Uses O(1) map lookup instead of O(n) sequential if checks
   * @private
   */
  _initializeCommandRoutes() {
    return {
      "/help": () => this.showAdminHelp(),

      "/approve": (adminId, msg) =>
        this.orderHandler.handleApprove(adminId, msg),
      "/broadcast": (adminId, msg) =>
        this.orderHandler.handleBroadcast(adminId, msg),

      "/stats": async (adminId, msg) => {
        const parts = msg.split(/\s+/);
        const days = parts.length > 1 ? parseInt(parts[1]) || 30 : 30;
        return await this.analyticsHandler.handleStats(adminId, days);
      },
      "/status": (adminId) => this.handleStatus(adminId),

      "/stock": (adminId, msg) => this.handleStock(adminId, msg),
      "/addproduct": (adminId, msg) => this.handleAddProduct(adminId, msg),
      "/newproduct": (adminId, msg) => this.productHandler.handleNewProduct(adminId, msg),
      "/editproduct": (adminId, msg) => this.handleEditProduct(adminId, msg),
      "/editproduct": (adminId, msg) => this.handleEditProduct(adminId, msg),
      "/removeproduct": (adminId, msg) =>
        this.handleRemoveProduct(adminId, msg),
      "/generate-desc": (adminId, msg) =>
        this.aiHandler.generateProductDescriptionForAdmin(adminId, msg),
      "/refreshproducts": (adminId) => this.productHandler.handleRefreshProducts(adminId),

      "/addstock-bulk": (adminId, msg) =>
        this.inventoryHandler.handleAddStockBulk(adminId, msg),
      "/addstock": (adminId, msg) =>
        this.inventoryHandler.handleAddStock(adminId, msg),
      "/syncstock": (adminId) => this.inventoryHandler.handleSyncStock(adminId),
      "/stockreport": (adminId) =>
        this.inventoryHandler.handleStockReport(adminId),
      "/salesreport": (adminId, msg) =>
        this.inventoryHandler.handleSalesReport(adminId, msg),

      "/createpromo": (adminId, msg) =>
        this.promoHandler.handleCreatePromo(adminId, msg),
      "/listpromos": (adminId) => this.promoHandler.handleListPromos(adminId),
      "/deletepromo": (adminId, msg) =>
        this.promoHandler.handleDeletePromo(adminId, msg),
      "/promostats": (adminId, msg) =>
        this.promoHandler.handlePromoStats(adminId, msg),

      "/reviews": (adminId, msg) =>
        this.reviewHandler.handleViewReviews(adminId, msg),
      "/reviewstats": (adminId) =>
        this.reviewHandler.handleReviewStats(adminId),
      "/deletereview": (adminId, msg) =>
        this.reviewHandler.handleDeleteReview(adminId, msg),

      "/paymentstats": (adminId, msg) => {
        const parts = msg.split(/\s+/);
        const days = parts.length > 1 ? parseInt(parts[1]) || 30 : 30;
        return this.paymentAnalytics.formatPaymentStats(days);
      },

      "/settings": (adminId, msg) => this.handleSettings(adminId, msg),
    };
  }

  /**
   * Main handler - routes admin commands with O(1) map lookup
   */
  async handle(adminId, message) {
    if (!InputSanitizer.isValidCustomerId(adminId)) {
      this.logger.logSecurity(adminId, "invalid_admin_id", "format_error");
      return "❌ Invalid admin ID format";
    }

    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    if (!message || typeof message !== "string") {
      return this.showAdminHelp();
    }

    const originalMessage = message;
    message = InputSanitizer.removeNullBytes(message);
    message = message.trim();
    
    if (!message) {
      console.log(`[AdminHandler] Empty message after sanitization - showing help`);
      return this.showAdminHelp();
    }

    if (originalMessage !== message) {
      this.log(adminId, "admin_command", `Sanitized: "${message}" (was: "${originalMessage}")`);
    }

    try {
      const step = await this.sessionManager.getStep(adminId);
      if (step === "admin_bulk_add") {
        return await this.inventoryHandler.processBulkAdd(adminId, message);
      }

      const command = message.split(/\s+/)[0];

      if (this.commandRoutes[command]) {
        return await this.commandRoutes[command](adminId, message);
      }

      for (const [route, handler] of Object.entries(this.commandRoutes)) {
        if (message.startsWith(route + " ") || message === route) {
          return await handler(adminId, message);
        }
      }

      return this.showAdminHelp();
    } catch (error) {
      this.logError(adminId, error, { command: message });
      return `❌ Terjadi kesalahan saat menjalankan command admin.\n\n${error.message}`;
    }
  }

  /**
   * handleStats - Wrapper for backward compatibility (delegates to analyticsHandler)
   */
  async handleStats(adminId, days = 30) {
    return await this.analyticsHandler.handleStats(adminId, days);
  }

  /**
   * /status - Show system status
   */
  handleStatus(adminId) {
    try {
      const redisClient = require("../../lib/redisClient");
      const logRotationManager = require("../../lib/logRotationManager");

      const whatsappStatus = "✅ Connected";
      const redisStatus = redisClient.isReady()
        ? "✅ Available"
        : "⚠️ Fallback";
      const webhookStatus = "✅ Active";

      const memUsage = process.memoryUsage();
      const memUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      const memTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
      const memPercent = (
        (memUsage.heapUsed / memUsage.heapTotal) *
        100
      ).toFixed(1);

      const uptimeSeconds = process.uptime();
      const uptimeHours = Math.floor(uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

      const logStats = logRotationManager.getStats();

      let response = `🔍 *System Status*\n\n`;
      response += `📱 *WhatsApp:* ${whatsappStatus}\n`;
      response += `💾 *Redis:* ${redisStatus}\n`;
      response += `🌐 *Webhook:* ${webhookStatus}\n\n`;
      response += `🧠 *Memory Usage*\n`;
      response += `• Used: ${memUsedMB} MB / ${memTotalMB} MB\n`;
      response += `• Utilization: ${memPercent}%\n\n`;
      response += `⏱️ *Uptime:* ${uptimeHours}h ${uptimeMinutes}m\n\n`;
      response += `📋 *Log Files*\n`;
      response += `• Total: ${logStats.totalFiles}\n`;
      response += `• Size: ${logStats.totalSize}\n`;
      response += `• Retention: ${logStats.retentionDays} days`;

      this.log(adminId, "status_viewed");
      return response;
    } catch (error) {
      this.logError(adminId, error, { action: "status" });
      return `❌ *Error Generating Status*\n\n${error.message}`;
    }
  }

  /**
   * /stock [productId] [quantity] - Manage product stock
   */
  handleStock(adminId, message) {
    const parts = message.split(/\s+/);

    if (parts.length === 1) {
      return this.showAllStock();
    }

    if (parts.length === 3) {
      const [, productId, quantity] = parts;
      const { setStock } = require("../../config");
      const result = setStock(productId.toLowerCase(), quantity);

      if (result.success) {
        this.log(adminId, "stock_update", {
          productId,
          oldStock: result.oldStock,
          newStock: result.newStock,
        });

        return (
          `✅ *Stok Berhasil Diupdate*\n\n` +
          `📦 *Produk:* ${result.product.name}\n` +
          `🔢 *Stok Lama:* ${result.oldStock}\n` +
          `🔢 *Stok Baru:* ${result.newStock}\n` +
          `⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}`
        );
      } else {
        return result.message;
      }
    }

    return (
      `❌ *Format Salah*\n\n` +
      `Gunakan: /stock <productId> <jumlah>\n\n` +
      `*Contoh:*\n` +
      `/stock netflix 50\n` +
      `/stock spotify 30\n\n` +
      `*Atau ketik /stock untuk melihat semua stok*`
    );
  }

  /**
   * Show all product stock levels
   */
  showAllStock() {
    const { getAllProducts } = require("../../config");
    const products = getAllProducts();

    let message = "📊 *STOCK INVENTORY*\n\n";

    message += "📺 *Akun Premium:*\n";
    products
      .filter((p) => p.category === "Premium Account")
      .forEach((p, idx) => {
        const status = p.stock > 10 ? "✅" : p.stock > 0 ? "⚠️" : "❌";
        message += `${idx + 1}. ${p.name}\n`;
        message += `   ID: ${p.id}\n`;
        message += `   ${status} Stok: ${p.stock}\n\n`;
      });

    message += "💳 *Kartu Kredit Virtual:*\n";
    products
      .filter((p) => p.category === "Virtual Card")
      .forEach((p, idx) => {
        const status = p.stock > 10 ? "✅" : p.stock > 0 ? "⚠️" : "❌";
        message += `${idx + 1}. ${p.name}\n`;
        message += `   ID: ${p.id}\n`;
        message += `   ${status} Stok: ${p.stock}\n\n`;
      });

    message += "\n*Update Stok:*\n/stock <productId> <jumlah>";

    return message;
  }

  /**
   * /newproduct - Quick product template generator (NEW!)
   * Creates product file and metadata template
   * Usage: /newproduct <id> <name> <price> [description]
   */
  handleNewProduct(adminId, message) {
    const fs = require('fs');
    const path = require('path');
    const productsConfig = require('../../src/config/products.config');
    
    const commandText = message.substring('/newproduct '.length).trim();
    
    if (!commandText) {
      return (
        `🆕 *Quick Product Generator*\n\n` +
        `Buat produk baru dengan cepat!\n\n` +
        `*Format:*\n` +
        `/newproduct <id> <nama> <harga> [deskripsi]\n\n` +
        `*Contoh:*\n` +
        `/newproduct canva "Canva Pro" 25000 "Design tools unlimited"\n\n` +
        `*Tips:*\n` +
        `• ID: huruf kecil, tanpa spasi (contoh: canva-pro)\n` +
        `• Nama: gunakan " " jika ada spasi\n` +
        `• Harga: dalam Rupiah\n` +
        `• Deskripsi: opsional, gunakan " " jika ada spasi\n\n` +
        `Setelah dibuat, gunakan /addstock <id> untuk menambah stock!`
      );
    }
    
    const regex = /(?:[^\s"]+|"[^"]*")+/g;
    const parts = commandText.match(regex).map(p => p.replace(/^"(.*)"$/, '$1'));
    
    if (parts.length < 3) {
      return `❌ *Format Salah*\n\nMinimal: /newproduct <id> <nama> <harga>`;
    }
    
    const [id, name, price, ...descParts] = parts;
    const description = descParts.join(' ') || `${name} - Premium account`;
    
    if (!/^[a-z0-9-]+$/.test(id)) {
      return `❌ *ID Invalid*\n\nID harus huruf kecil, angka, atau dash (-)\nContoh: netflix, canva-pro, vcc-basic`;
    }
    
    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return `❌ *Harga Invalid*\n\nHarga harus angka positif (dalam Rupiah)`;
    }
    
    try {
      const productFile = path.join(process.cwd(), 'products_data', `${id}.txt`);
      
      if (fs.existsSync(productFile)) {
        return `❌ *Produk Sudah Ada*\n\nFile ${id}.txt sudah ada.\nGunakan /editproduct atau /addstock untuk mengelola.`;
      }
      
      fs.writeFileSync(productFile, '# Product credentials\n# Add credentials using: /addstock ' + id + ' <email:password>\n');
      
      const metadataFile = path.join(process.cwd(), 'products_data', 'products.json');
      let metadata = {};
      
      if (fs.existsSync(metadataFile)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
        } catch (error) {
          console.warn('Invalid products.json, starting fresh:', error.message);
          metadata = {};
        }
      }
      
      const lowerName = name.toLowerCase();
      let category = 'premium'; // default
      
      if (lowerName.includes('vcc') || lowerName.includes('virtual card')) {
        category = 'vcc';
      } else if (lowerName.includes('game') || lowerName.includes('steam')) {
        category = 'game';
      } else if (lowerName.includes('vpn')) {
        category = 'vpn';
      }
      
      metadata[id] = {
        name: name,
        price: priceNum,
        description: description,
        category: category
      };
      
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
      
      productsConfig.refreshProducts();
      
      this.log(adminId, 'new_product_created', { 
        productId: id, 
        name, 
        price: priceNum, 
        category 
      });
      
      return (
        `✅ *Produk Berhasil Dibuat!*\n\n` +
        `📦 Product ID: ${id}\n` +
        `🏷️ Nama: ${name}\n` +
        `💰 Harga: Rp${priceNum.toLocaleString('id-ID')}\n` +
        `📝 Deskripsi: ${description}\n` +
        `📂 Kategori: ${category}\n` +
        `📁 File: products_data/${id}.txt\n\n` +
        `✨ *Products auto-refreshed!*\n\n` +
        `⏭️ *Langkah Selanjutnya:*\n` +
        `1️⃣ Tambah stock: /addstock ${id} <credentials>\n` +
        `2️⃣ Atau bulk add: /addstock-bulk ${id}\n` +
        `3️⃣ Cek stock: /stock ${id}\n\n` +
        `💡 Produk sudah muncul di catalog customer!`
      );
      
    } catch (error) {
      this.log(adminId, 'new_product_error', { error: error.message });
      return `❌ *Error Membuat Produk*\n\n${error.message}\n\nCoba lagi atau hubungi developer.`;
    }
  }

  /**
   * /addproduct - Add a new product to the catalog (manual)
   */
  handleAddProduct(adminId, message) {
    const commandText = message.substring("/addproduct ".length).trim();

    if (!commandText) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>\n\n` +
        `*Contoh:*\n` +
        `/addproduct hbo | HBO Max Premium (1 Month) | 1 | Full HD streaming | 10 | premium\n\n` +
        `*Kategori:*\n` +
        `• premium - Akun premium\n` +
        `• vcc - Virtual credit card`
      );
    }

    const parts = commandText.split("|").map((p) => p.trim());

    if (parts.length !== 6) {
      return (
        `❌ *Format Salah*\n\n` +
        `Harus ada 6 bagian dipisah dengan |\n\n` +
        `Format: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>`
      );
    }

    const [id, name, price, description, stock, category] = parts;
    const { addProduct } = require("../../config");
    const result = addProduct({
      id,
      name,
      price,
      description,
      stock,
      category,
    });

    if (result.success) {
      this.log(adminId, "product_added", { productId: id, category });
      return result.message;
    } else {
      return result.message;
    }
  }

  /**
   * /editproduct - Edit existing product
   */
  handleEditProduct(adminId, message) {
    const commandText = message.substring("/editproduct ".length).trim();

    if (!commandText) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /editproduct <id> | <field> | <value>\n\n` +
        `*Fields:*\n` +
        `• name - Nama produk\n` +
        `• price - Harga (USD)\n` +
        `• description - Deskripsi\n` +
        `• stock - Jumlah stok\n\n` +
        `*Contoh:*\n` +
        `/editproduct netflix | price | 2\n` +
        `/editproduct spotify | name | Spotify Premium Family`
      );
    }

    const parts = commandText.split("|").map((p) => p.trim());

    if (parts.length !== 3) {
      return `❌ *Format Salah*\n\nHarus ada 3 bagian dipisah dengan |`;
    }

    const [id, field, value] = parts;
    const { editProduct } = require("../../config");
    const result = editProduct(id, field, value);

    if (result.success) {
      this.log(adminId, "product_edited", { productId: id, field, value });
      return result.message;
    } else {
      return result.message;
    }
  }

  /**
   * /removeproduct - Remove product from catalog
   */
  handleRemoveProduct(adminId, message) {
    const parts = message.split(/\s+/);

    if (parts.length !== 2) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /removeproduct <productId>\n\n` +
        `*Contoh:*\n` +
        `/removeproduct netflix`
      );
    }

    const productId = parts[1];
    const { removeProduct } = require("../../config");
    const result = removeProduct(productId);

    if (result.success) {
      this.log(adminId, "product_removed", { productId });
      return result.message;
    } else {
      return result.message;
    }
  }

  /**
   * /settings - Manage system settings
   */
  handleSettings(adminId, message) {
    const parts = message.split(/\s+/);

    if (parts.length === 1) {
      let msg = "⚙️ *CURRENT SETTINGS*\n\n";
      msg += `Currency: ${process.env.CURRENCY || 'USD'}\n`;
      msg += `Shop Name: ${process.env.SHOP_NAME || 'Premium Shop'}\n`;
      msg += `Session Timeout: ${process.env.SESSION_TIMEOUT || 30} minutes\n`;
      msg += `Low Stock Threshold: ${process.env.LOW_STOCK_THRESHOLD || 5}\n\n`;
      msg += `Use /settings help for commands`;
      return msg;
    }

    if (parts.length === 2 && parts[1] === "help") {
      let msg = "⚙️ *SETTINGS COMMANDS*\n\n";
      msg += `/settings - View all settings\n`;
      msg += `/settings help - Show this help\n`;
      msg += `/settings <key> <value> - Update setting\n\n`;
      msg += `*Available Keys:*\n`;
      msg += `• shopName - Nama toko\n`;
      msg += `• sessionTimeout - Session timeout (minutes)\n`;
      msg += `• lowStockThreshold - Batas stok rendah\n\n`;
      msg += `⚠️ *Note:* Settings temporary. Edit .env for permanent.`;
      return msg;
    }

    if (parts.length === 3) {
      const [, key, value] = parts;
      const { updateSetting } = require("../../config");
      const result = updateSetting(key, value);

      if (result.success) {
        this.log(adminId, "settings_update", {
          key,
          oldValue: result.oldValue,
          newValue: result.newValue,
        });

        return (
          `✅ *Setting Berhasil Diupdate*\n\n` +
          `🔧 *Key:* ${result.key}\n` +
          `📝 *Nilai Lama:* ${result.oldValue}\n` +
          `📝 *Nilai Baru:* ${result.newValue}\n` +
          `⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}`
        );
      } else {
        return result.message;
      }
    }

    return (
      `❌ *Format Salah*\n\n` +
      `*Cara menggunakan:*\n` +
      `• /settings - Lihat semua settings\n` +
      `• /settings help - Lihat panduan\n` +
      `• /settings <key> <value> - Update setting`
    );
  }

  showAdminHelp() {
    let message = "👨‍💼 *ADMIN COMMAND REFERENCE*\n\n";
    message += "Gunakan /help untuk melihat pesan ini\n";
    message += "━━━━━━━━━━━━━━━━━━\n\n";

    message += "📦 *Order & Communication* (2 commands)\n";
    message += "• /approve <order-id> - Setujui pembayaran & kirim produk\n";
    message +=
      "• /broadcast <message> - Kirim pesan ke semua customer aktif\n\n";

    message += "📊 *Analytics & Stats* (3 commands)\n";
    message += "• /stats [days] - Dashboard analytics (default: 30 hari)\n";
    message += "• /paymentstats [days] - Statistik metode payment (NEW!)\n";
    message += "• /status - Status sistem (RAM, uptime, Redis, logs)\n\n";

    message += "🏷️ *Product Management* (7 commands)\n";
    message += "• /stock [id] [qty] - Lihat/update stock produk\n";
    message += "• /newproduct <id> <name> <price> - Quick create (NEW!)\n";
    message += "• /addproduct <id|name|price|desc|cat> - Tambah produk baru\n";
    message += "• /editproduct <id> <field> <value> - Edit produk\n";
    message += "• /removeproduct <product-id> - Hapus produk\n";
    message += "• /generate-desc <product-id> - AI generate deskripsi\n";
    message += "• /refreshproducts - Reload produk dari folder\n\n";

    message += "📦 *Inventory Management* (5 commands)\n";
    message += "• /addstock <id> <credentials> - Tambah 1 credential\n";
    message += "• /addstock-bulk <product-id> - Mode bulk add\n";
    message += "• /syncstock - Sync stock dari folder products_data/\n";
    message += "• /stockreport - Laporan stock semua produk\n";
    message += "• /salesreport [days] - Laporan penjualan (default: 30)\n\n";

    message += "🎟️ *Promo Management* (4 commands)\n";
    message += "• /createpromo <CODE> <diskon%> <hari> - Buat promo\n";
    message += "• /listpromos - Lihat semua promo aktif\n";
    message += "• /deletepromo <CODE> - Hapus promo\n";
    message += "• /promostats [CODE] - Statistik penggunaan promo\n\n";

    message += "⭐ *Review Management* (3 commands)\n";
    message += "• /reviews <product-id> - Lihat review produk\n";
    message += "• /reviewstats - Statistik review keseluruhan\n";
    message += "• /deletereview <prod-id> <idx> - Hapus review\n\n";

    message += "⚙️ *Settings* (1 command)\n";
    message += "• /settings [key] [value] - Kelola pengaturan bot\n\n";

    message += "━━━━━━━━━━━━━━━━━━\n";
    message += "📝 *Total: 25 Admin Commands* (+ 2 NEW!)\n\n";
    message += "💡 Tips:\n";
    message += "• Semua command dimulai dengan /\n";
    message += "• Parameter <wajib> | [opsional]\n";
    message += "• Gunakan /help kapan saja\n";
    message += "• Command case-insensitive";

    return message;
  }
}

module.exports = AdminHandler;
