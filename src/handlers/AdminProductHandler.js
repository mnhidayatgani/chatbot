/**
 * Admin Product Handler
 * Handles product template generation and quick creation
 */

const fs = require('fs');
const path = require('path');

class AdminProductHandler {
  constructor(sessionManager, logger = null) {
    this.sessionManager = sessionManager;
    this.logger = logger;
  }

  /**
   * /newproduct - Quick product template generator
   * Creates product file and metadata template
   * Usage: /newproduct <id> <name> <price> [description]
   */
  handleNewProduct(adminId, message) {
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
    
    // Parse command (handle quoted strings)
    const regex = /(?:[^\s"]+|"[^"]*")+/g;
    const parts = commandText.match(regex).map(p => p.replace(/^"(.*)"$/, '$1'));
    
    if (parts.length < 3) {
      return `❌ *Format Salah*\n\nMinimal: /newproduct <id> <nama> <harga>`;
    }
    
    const [id, name, price, ...descParts] = parts;
    const description = descParts.join(' ') || `${name} - Premium account`;
    
    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(id)) {
      return `❌ *ID Invalid*\n\nID harus huruf kecil, angka, atau dash (-)\nContoh: netflix, canva-pro, vcc-basic`;
    }
    
    // Validate price
    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return `❌ *Harga Invalid*\n\nHarga harus angka positif (dalam Rupiah)`;
    }
    
    try {
      // 1. Create empty product file
      const productFile = path.join(process.cwd(), 'products_data', `${id}.txt`);
      
      if (fs.existsSync(productFile)) {
        return `❌ *Produk Sudah Ada*\n\nFile ${id}.txt sudah ada.\nGunakan /editproduct atau /addstock untuk mengelola.`;
      }
      
      // Create empty file (will be filled by admin using /addstock)
      fs.writeFileSync(productFile, '# Product credentials\n# Add credentials using: /addstock ' + id + ' <email:password>\n');
      
      // 2. Add/update metadata in products.json
      const metadataFile = path.join(process.cwd(), 'products_data', 'products.json');
      let metadata = {};
      
      if (fs.existsSync(metadataFile)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
        } catch (error) {
          // If JSON is invalid, start fresh
          console.warn('Invalid products.json, starting fresh:', error.message);
          metadata = {};
        }
      }
      
      // Auto-detect category
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
      
      // 3. Refresh products
      productsConfig.refreshProducts();
      
      if (this.logger) {
        this.logger.logAdmin(adminId, 'new_product_created', { 
          productId: id, 
          name, 
          price: priceNum, 
          category 
        });
      }
      
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
      if (this.logger) {
        this.logger.logAdmin(adminId, 'new_product_error', { error: error.message });
      }
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
    const { addProduct } = require('../../config');
    const result = addProduct({
      id,
      name,
      price,
      description,
      stock,
      category,
    });

    if (result.success) {
      if (this.logger) {
        this.logger.logAdmin(adminId, 'product_added', { productId: id, category });
      }
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
    const { editProduct } = require('../../config');
    const result = editProduct(id, field, value);

    if (result.success) {
      if (this.logger) {
        this.logger.logAdmin(adminId, 'product_edited', { productId: id, field, value });
      }
      return result.message;
    } else {
      return result.message;
    }
  }

  /**
   * /removeproduct - Remove a product from catalog
   */
  handleRemoveProduct(adminId, message) {
    const productId = message.substring("/removeproduct ".length).trim();

    if (!productId) {
      return `❌ *Format Salah*\n\nGunakan: /removeproduct <product-id>`;
    }

    const { removeProduct } = require('../../config');
    const result = removeProduct(productId);

    if (result.success) {
      if (this.logger) {
        this.logger.logAdmin(adminId, 'product_removed', { productId });
      }
      return result.message;
    } else {
      return result.message;
    }
  }

  /**
   * /refreshproducts - Reload products from products_data/ folder
   */
  handleRefreshProducts(adminId) {
    try {
      const productsConfig = require('../../src/config/products.config');
      const DynamicProductLoader = productsConfig.DynamicProductLoader;

      // Scan for new products
      const productFiles = DynamicProductLoader.scanProductFiles();
      const oldProducts = productsConfig.getAllProducts();
      const oldCount = oldProducts.length;

      // Refresh products
      productsConfig.refreshProducts();
      const newProducts = productsConfig.getAllProducts();
      const newCount = newProducts.length;

      // Find added/removed products
      const oldIds = new Set(oldProducts.map((p) => p.id));
      const newIds = new Set(newProducts.map((p) => p.id));

      const added = newProducts.filter((p) => !oldIds.has(p.id));
      const removed = oldProducts.filter((p) => !newIds.has(p.id));

      let response = '🔄 *Products Refreshed*\n\n';
      response += `📦 *Total Products:* ${newCount}\n`;
      response += `📊 *Change:* ${oldCount} → ${newCount} (${newCount - oldCount >= 0 ? '+' : ''}${newCount - oldCount})\n\n`;

      if (added.length > 0) {
        response += `✅ *Added (${added.length}):*\n`;
        added.forEach((p) => {
          response += `• ${p.id} - ${p.name}\n`;
        });
        response += '\n';
      }

      if (removed.length > 0) {
        response += `❌ *Removed (${removed.length}):*\n`;
        removed.forEach((p) => {
          response += `• ${p.id} - ${p.name}\n`;
        });
        response += '\n';
      }

      if (added.length === 0 && removed.length === 0) {
        response += `✅ No changes detected\n\n`;
      }

      response += `📁 *Files Scanned:* ${productFiles.length}\n`;
      response += `⏰ *Updated:* ${new Date().toLocaleString('id-ID')}`;

      if (this.logger) {
        this.logger.logAdmin(adminId, 'products_refreshed', {
          oldCount,
          newCount,
          added: added.length,
          removed: removed.length,
        });
      }

      return response;
    } catch (error) {
      if (this.logger) {
        this.logger.logAdmin(adminId, 'refresh_products_error', { error: error.message });
      }
      return `❌ *Error Refreshing Products*\n\n${error.message}`;
    }
  }
}

module.exports = AdminProductHandler;
