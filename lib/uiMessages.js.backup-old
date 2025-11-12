/**
 * UI Messages & Templates
 * Centralized user interface messages
 */

const config = require("../src/config/app.config");

class UIMessages {
  /**
   * Main menu
   */
  static mainMenu() {
    const shopName = config.shop.name;
    return `╔═══════════════════════╗
║  🛍️ *${shopName.toUpperCase()}*  ║
╚═══════════════════════╝

Halo! Mau belanja apa hari ini?

┌─────────────────────┐
│ 🎯 *MENU UTAMA*    │
└─────────────────────┘

1️⃣ 🛍️ *Belanja* - Lihat produk
2️⃣ 🛒 *Keranjang* - Cek order
3️⃣ ⭐ *Favorit* - Wishlist
4️⃣ 📞 *Bantuan* - Hubungi kami

━━━━━━━━━━━━━━━━━━━━━

� *Quick:* cart • wishlist • track
💡 Stock realtime • 6 payment`;
  }

  /**
   * Help command - Full command reference
   */
  static helpCommand() {
    return `� *PANDUAN LENGKAP*

━━━ 🏠 *NAVIGASI* ━━━
menu    →  Menu utama
browse  →  Lihat produk
help    →  Panduan ini

━━━ 🛒 *BELANJA* ━━━
cart       →  Lihat keranjang
checkout   →  Bayar sekarang
clear      →  Kosongkan cart
promo CODE →  Pakai kode

━━━ ⭐ *FAVORIT* ━━━
wishlist       →  Lihat favorit
simpan [nama]  →  Tambah favorit
hapus [nama]   →  Hapus favorit

━━━ 📦 *TRACKING* ━━━
track     →  Semua order
history   →  Riwayat lengkap

━━━━━━━━━━━━━━━━━━━━━
💡 Tips:
• Semua command case-free
• Ketik nama produk langsung
• Prefix / opsional

🏠 Ketik *menu* untuk kembali`;
  }

  /**
   * Product added to cart
   */
  static productAdded(productName, priceIDR) {
    return `✅ *DITAMBAHKAN!*

📦 ${productName}
💰 Rp ${priceIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━━━━

*Lanjut?*
🛍️ Tambah lagi → Ketik nama
🛒 Checkout → *cart*
⭐ Favorit → *simpan ${productName}*

Stock di-hold sampai checkout ✨`;
  }

  /**
   * Product browsing instructions
   */
  static browsingInstructions(productList) {
    let message = productList;
    message += "\n━━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "*🎯 CARA ORDER:*\n";
    message += "Ketik nama produk langsung\n\n";
    message += "*Contoh:*\n";
    message += "• netflix\n";
    message += "• spotify premium\n\n";
    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += "🛒 cart • ⭐ wishlist • 🏠 menu";
    return message;
  }

  /**
   * Cart view
   */
  /**
   * Order list view (for /track command)
   */
  static orderList(orders) {
    if (!orders || orders.length === 0) {
      return `╔═══════════════════════╗
║  📦 *RIWAYAT*       ║
╚═══════════════════════╝

Belum ada pesanan

━━━━━━━━━━━━━━━━━━━━━
🛍️ *menu* untuk belanja`;
    }

    let message = `╔═══════════════════════╗
║  📦 *RIWAYAT*       ║
╚═══════════════════════╝

`;

    orders.forEach((order) => {
      const statusEmoji = order.status.includes("pending") ? "⏳" : "✅";
      message += `${statusEmoji} ${order.status}\n`;
      message += `   ${order.orderId}\n`;
      message += `   ${order.date}\n`;
      message += `   💰 Rp ${order.totalIDR.toLocaleString("id-ID")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += `📊 ${orders.length} total orders\n\n`;
    message += "*Filter:*\n";
    message += "track pending • track completed\n\n";
    message += "🏠 menu";

    return message;
  }

  static cartView(cart, total) {
    const totalIDR = total;
    let message = `╔═══════════════════╗
║  🛒 *KERANJANG*  ║
╚═══════════════════╝

`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   💰 Rp ${item.price.toLocaleString("id-ID")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += `💵 *TOTAL*\n`;
    message += `   *Rp ${totalIDR.toLocaleString("id-ID")}*\n`;
    message += "━━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "*Siap bayar?*\n";
    message += "💳 checkout → Lanjut\n";
    message += "🎟️ promo → Pakai kode\n";
    message += "🗑️ clear → Kosongkan\n\n";
    message += "💡 Punya promo? Pakai dulu!";

    return message;
  }

  /**
   * Order summary
   */
  static orderSummary(
    orderId,
    cart,
    totalIDR,
    promoCode = null,
    discountAmount = 0
  ) {
    let message = "✅ *PESANAN DIKONFIRMASI!*\n\n";
    message += `📋 Order ID: ${orderId}\n\n`;
    message += "*Ringkasan Pesanan:*\n";

    cart.forEach((item, index) => {
      const priceIDR = item.price;
      message += `${index + 1}. ${item.name} - Rp ${priceIDR.toLocaleString(
        "id-ID"
      )}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━\n`;

    if (promoCode && discountAmount > 0) {
      const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
      message += `💵 Subtotal: Rp ${subtotal.toLocaleString("id-ID")}\n`;
      message += `🎟️ Promo (${promoCode}): -Rp ${discountAmount.toLocaleString(
        "id-ID"
      )}\n`;
      message += `━━━━━━━━━━━━━━━━━━\n`;
    }

    message += `💳 *Total: Rp ${totalIDR.toLocaleString("id-ID")}*\n\n`;

    return message;
  }

  /**
   * About page
   */
  static about() {
    const shopName = config.shop.name;
    return `╔═══════════════════════╗
║  ℹ️ *TENTANG KAMI*   ║
╚═══════════════════════╝

Halo dari ${shopName}! 🎉

━━━ 🎯 *PRODUK* ━━━
📺 Streaming premium
💳 Virtual credit card
🎮 Gaming accounts

━━━ ⚡ *KEUNGGULAN* ━━━
✅ Stock realtime
✅ Auto delivery 5-15 min
✅ 6 payment methods
✅ Promo & discount
✅ 100% original

━━━ 💳 *PEMBAYARAN* ━━━
• QRIS (all e-wallet)
• DANA, OVO, GoPay
• Transfer bank

━━━━━━━━━━━━━━━━━━━━━
💡 Mulai dari Rp 15.800!

🏠 Ketik *menu* untuk belanja`;
  }

  /**
   * Contact page
   */
  static contact() {
    const supportWhatsapp = config.shop.supportWhatsapp;
    const workingHours = config.shop.workingHours;
    return `╔═══════════════════════╗
║  📞 *HUBUNGI KAMI*   ║
╚═══════════════════════╝

Butuh bantuan? Kami siap! 💬

⏰ ${workingHours}
📱 ${supportWhatsapp}

━━━━━━━━━━━━━━━━━━━━━
💡 Respons < 5 menit!

🏠 Ketik *menu* untuk kembali`;
  }

  /**
   * Error messages
   */
  static invalidOption() {
    return `🤔 *Hmm, tidak paham...*

Coba command ini:

🏠 *menu* → Menu utama
🛍️ *browse* → Lihat produk
🛒 *cart* → Keranjang
⭐ *wishlist* → Favorit
📦 *track* → Lacak order
💬 *help* → Panduan lengkap

━━━━━━━━━━━━━━━━━━━━━
💡 Atau ketik nama produk
langsung saat browsing!`;
  }

  static productNotFound(input = "") {
    const searchText = input ? `"${input}"` : "";
    return `🔍 *Produk ${searchText} tidak ada*

━━━━━━━━━━━━━━━━━━━━━

*Coba ini:*
1️⃣ Cek typo (kami sudah coba
   auto-correct)
2️⃣ Ketik *browse* untuk
   lihat semua produk
3️⃣ Contoh: netflix, spotify

━━━━━━━━━━━━━━━━━━━━━
🏠 *menu* • 💬 *help*`;
  }

  static emptyCart() {
    return `🛒 *Keranjang kosong*

Yuk mulai belanja! 🛍️

🎯 *browse* → Lihat produk
⭐ *wishlist* → Cek favorit
🏠 *menu* → Menu utama

━━━━━━━━━━━━━━━━━━━━━
💡 Auto-delivery & original!`;
  }

  static cartCleared() {
    return "🗑️ Keranjang dikosongkan!\n\nKetik *menu* untuk lanjut belanja.";
  }

  static checkoutPrompt() {
    return `💳 *Siap Checkout?*

• *checkout* - Lanjut ke pembayaran
• *promo KODE* - Gunakan kode promo
• *clear* - Kosongkan keranjang
• *menu* - Menu utama

🎁 Punya kode promo? Gunakan sebelum checkout!`;
  }

  /**
   * Admin messages
   */
  static unauthorized() {
    return `❌ *Akses Ditolak*

Anda tidak memiliki izin untuk perintah admin.

Ketik *help* untuk perintah customer atau *menu* untuk menu utama.`;
  }

  static adminApprovalFormat() {
    return "❌ Format: /approve <order_id>\n\nContoh: /approve ORD-1730000000000-1234";
  }

  static orderNotFound(orderId) {
    return `❌ Order ID ${orderId} tidak ditemukan.\n\nPastikan order ID benar.`;
  }

  static orderNotPending(orderId) {
    return `❌ Order ${orderId} tidak dalam status menunggu approval.`;
  }

  static deliveryFailed(orderId) {
    return `❌ Gagal mengirim produk untuk order ${orderId}.\n\nTidak ada produk yang tersedia di database.`;
  }

  static approvalSuccess(orderId) {
    return `✅ *APPROVED!*\n\nOrder ${orderId} telah disetujui.\nProduk akan dikirim ke customer.`;
  }

  /**
   * Waiting messages
   */
  static awaitingAdminApproval() {
    return "⏱️ Menunggu verifikasi admin...\n\nPembayaran Anda sedang diverifikasi.\nMohon tunggu 5-15 menit.";
  }

  /**
   * Wishlist view
   * @param {Array} wishlist - Array of wishlist items
   * @returns {string} Formatted wishlist message
   */
  static wishlistView(wishlist) {
    if (!wishlist || wishlist.length === 0) {
      return `╔═══════════════════════╗
║  ⭐ *WISHLIST*      ║
╚═══════════════════════╝

Belum ada favorit

━━━━━━━━━━━━━━━━━━━━━

*Cara tambah:*
⭐ simpan [nama]

*Contoh:*
• simpan netflix
• simpan spotify

━━━━━━━━━━━━━━━━━━━━━
�️ *browse* untuk lihat produk`;
    }

    let message = `╔═══════════════════════╗
║  ⭐ *WISHLIST*      ║
╚═══════════════════════╝

`;

    wishlist.forEach((item, index) => {
      const priceIDR = item.price * config.exchangeRate;
      message += `${index + 1}. ${item.name}\n`;
      message += `   💰 Rp ${priceIDR.toLocaleString("id-ID")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += `📊 ${wishlist.length} produk favorit\n\n`;
    message += "*Actions:*\n";
    message += "• Ketik nama → Add to cart\n";
    message += "• hapus [nama] → Remove\n\n";
    message += "🛒 cart • 🏠 menu";

    return message;
  }
}

module.exports = UIMessages;
