/**
 * Admin Inventory Handler
 * Handles inventory management commands: addstock, stockreport, salesreport
 */

const BaseHandler = require("./BaseHandler");

class AdminInventoryHandler extends BaseHandler {
  constructor(sessionManager, logger = null) {
    super(sessionManager, logger);
  }

  /**
   * /addstock <product-id> <credentials> - Add single credential
   */
  async handleAddStock(adminId, message) {
    const parts = message.split(" ");
    if (parts.length < 3) {
      return (
        "❌ *Format salah!*\n\n" +
        "*Format:* `/addstock <product-id> <email:password>`\n\n" +
        "*Contoh:*\n" +
        "`/addstock netflix premium@netflix.com:Pass123!`\n" +
        "`/addstock spotify music@domain.com:Spotify456!`\n\n" +
        "*Note:* Gunakan `:` atau `|` untuk memisahkan email dan password"
      );
    }

    const productId = parts[1];
    const credentials = parts.slice(2).join(" ");

    const InventoryManager = require("../services/inventory/InventoryManager");
    const inventoryManager = new InventoryManager();

    const result = await inventoryManager.addCredentials(
      productId,
      credentials,
      adminId
    );

    if (result.success) {
      return (
        `✅ *Credentials berhasil ditambahkan!*\n\n` +
        `📦 *Produk:* ${result.productId}\n` +
        `📊 *Stok sekarang:* ${result.stockCount}\n\n` +
        `💾 Credentials tersimpan dan siap dijual!`
      );
    } else {
      return `❌ *Gagal menambahkan credentials:*\n\n${result.error}`;
    }
  }

  /**
   * /addstock-bulk <product-id> - Start bulk add mode
   */
  async handleAddStockBulk(adminId, message) {
    const parts = message.split(" ");
    if (parts.length < 2) {
      return (
        "❌ *Format salah!*\n\n" +
        "*Format:* `/addstock-bulk <product-id>`\n\n" +
        "*Contoh:* `/addstock-bulk netflix`\n\n" +
        "Setelah itu, kirim credentials (satu per baris):\n" +
        "```\n" +
        "email1@domain.com:password1\n" +
        "email2@domain.com:password2\n" +
        "email3@domain.com:password3\n" +
        "```"
      );
    }

    const productId = parts[1];

    // Set admin state to bulk adding
    await this.sessionManager.setStep(adminId, "admin_bulk_add");
    await this.sessionManager.setData(adminId, { bulkProductId: productId });

    return (
      `📝 *Mode Bulk Add untuk: ${productId}*\n\n` +
      `Silakan kirim credentials sekarang (satu per baris):\n\n` +
      `*Format per baris:*\n` +
      "`email:password` atau `email|password`\n\n" +
      `*Contoh:*\n` +
      "```\n" +
      "premium1@netflix.com:Pass123!\n" +
      "premium2@netflix.com:Secret456!\n" +
      "premium3@netflix.com:Secure789!\n" +
      "```\n\n" +
      `Kirim "done" atau "selesai" jika sudah selesai.`
    );
  }

  /**
   * Process bulk add credentials (called when admin in bulk_add mode)
   */
  async processBulkAdd(adminId, message) {
    // Get product ID from session data
    const sessionData = await this.sessionManager.getData(adminId);
    const productId = sessionData?.bulkProductId;

    if (!productId) {
      return "❌ Session expired. Mulai lagi dengan /addstock-bulk";
    }

    // Check if done
    if (
      message.toLowerCase() === "done" ||
      message.toLowerCase() === "selesai"
    ) {
      await this.sessionManager.setStep(adminId, "menu");
      await this.sessionManager.setData(adminId, {});
      return "✅ Bulk add selesai! Gunakan /stockreport untuk melihat stok.";
    }

    // Parse credentials (one per line)
    const lines = message
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return "❌ Tidak ada credentials valid. Coba lagi atau kirim 'done' untuk selesai.";
    }

    const InventoryManager = require("../services/inventory/InventoryManager");
    const inventoryManager = new InventoryManager();

    const result = await inventoryManager.addBulkCredentials(
      productId,
      lines,
      adminId
    );

    if (result.success) {
      let response =
        `✅ *Bulk add berhasil!*\n\n` +
        `📦 *Produk:* ${result.productId}\n` +
        `✅ *Berhasil:* ${result.validCount}\n` +
        `❌ *Gagal:* ${result.invalidCount}\n` +
        `📊 *Total stok:* ${result.stockCount}\n\n`;

      if (result.errors && result.errors.length > 0) {
        response += `⚠️ *Error (3 pertama):*\n`;
        result.errors.forEach((err) => (response += `• ${err}\n`));
        response += "\n";
      }

      response += `Kirim lagi untuk tambah, atau "done" untuk selesai.`;
      return response;
    } else {
      return `❌ *Gagal:* ${result.error}\n\nCoba lagi atau kirim "done" untuk selesai.`;
    }
  }

  /**
   * /stockreport - Show current stock for all products
   */
  async handleStockReport(_adminId) {
    const InventoryManager = require("../services/inventory/InventoryManager");
    const inventoryManager = new InventoryManager();

    const stocks = await inventoryManager.getAllStockCounts();

    let message = "*📊 LAPORAN STOK*\n\n";

    if (Object.keys(stocks).length === 0) {
      message += "❌ Belum ada produk atau stok kosong.";
    } else {
      let totalStock = 0;

      for (const [productId, count] of Object.entries(stocks)) {
        const status =
          count === 0 ? "🔴" : count < 5 ? "🟡" : count < 10 ? "🟢" : "🟢";
        message += `${status} *${productId}:* ${count}\n`;
        totalStock += count;
      }

      message += `\n📦 *Total stok:* ${totalStock}`;
    }

    return message;
  }

  /**
   * /syncstock - Sync stock from products_data/ folder to Redis
   */
  async handleSyncStock(_adminId) {
    const { syncStockFromFolder } = require("../../../config");

    const result = await syncStockFromFolder();

    if (result.success) {
      let message = `✅ *${result.message}*\n\n`;

      if (result.updated > 0) {
        message += "*🔄 Produk yang diupdate:*\n";
        result.results
          .filter((r) => r.changed)
          .forEach((r) => {
            message += `  • ${r.productId}: ${r.oldStock} → ${r.newStock}\n`;
          });
      }

      if (result.unchanged > 0) {
        message += `\n✔️  ${result.unchanged} produk tidak berubah`;
      }

      return message;
    } else {
      return `❌ *Sync gagal:* ${result.message}`;
    }
  }

  /**
   * /salesreport [days] - Show sales report
   */
  async handleSalesReport(adminId, message) {
    const parts = message.split(" ");
    const days = parts.length > 1 ? parseInt(parts[1]) : 7;

    if (isNaN(days) || days < 1 || days > 90) {
      return "❌ Invalid days. Gunakan angka 1-90.\n\n*Contoh:* `/salesreport 7`";
    }

    const InventoryManager = require("../services/inventory/InventoryManager");
    const inventoryManager = new InventoryManager();

    const report = await inventoryManager.getSalesReport(days);

    if (!report) {
      return "❌ Gagal generate sales report.";
    }

    let response = `*📊 SALES REPORT*\n*${report.period}*\n\n`;

    if (report.totalSales === 0) {
      response += "❌ Belum ada penjualan.";
    } else {
      response += `💰 *Total penjualan:* ${report.totalSales}\n\n`;
      response += "*Breakdown per produk:*\n";

      for (const [productId, count] of Object.entries(report.salesByProduct)) {
        response += `📦 ${productId}: ${count}\n`;
      }
    }

    return response;
  }
}

module.exports = AdminInventoryHandler;
