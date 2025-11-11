/**
 * Messages Configuration
 * Centralized message templates for easy customization
 * 
 * CARA PAKAI:
 * 1. Edit pesan di file ini sesuai kebutuhan
 * 2. Save file
 * 3. Restart bot atau reload
 * 
 * FORMAT:
 * - Gunakan ${variable} untuk dynamic content
 * - \n untuk new line
 * - *text* untuk bold
 * - _text_ untuk italic
 */

const Messages = {
  // ============================================
  // PAYMENT HANDLERS MESSAGES
  // ============================================
  
  payment: {
    /**
     * Error - Invalid payment choice
     */
    invalidChoice: (maxChoice) => 
      `❌ Pilihan tidak valid. Ketik nomor 1-${maxChoice}.`,

    /**
     * Error - Payment method not available
     */
    methodNotAvailable: () =>
      `❌ Metode pembayaran tidak tersedia.`,

    /**
     * Error - E-wallet not available
     */
    ewalletNotAvailable: (walletType) =>
      `❌ Metode pembayaran ${walletType} sedang tidak tersedia.\n\nSilakan pilih metode lain.`,

    /**
     * Error - Bank transfer setup failed
     */
    bankTransferFailed: (bankCode, errorMessage) =>
      `❌ Gagal setup transfer ${bankCode}.\n\nError: ${errorMessage}\n\nSilakan coba lagi atau pilih bank lain.`,

    /**
     * Error - Invalid bank choice
     */
    invalidBankChoice: (maxChoice) =>
      `❌ Pilihan tidak valid. Ketik nomor 1-${maxChoice}.`,

    /**
     * Success - Payment completed
     */
    paymentSuccess: (orderId, method) =>
      `✅ *PEMBAYARAN BERHASIL!*\n\n📋 Order ID: ${orderId}\n💳 Metode: ${method}`,

    /**
     * Success but no products
     */
    paymentSuccessNoProducts: (orderId, method) =>
      `✅ *PEMBAYARAN BERHASIL!*\n\n📋 Order ID: ${orderId}\n💳 Metode: ${method}\n\n❌ Namun produk tidak tersedia di database.\nSilakan hubungi admin.`,

    /**
     * Payment expired
     */
    paymentExpired: () =>
      `❌ *PEMBAYARAN EXPIRED*\n\nSilakan buat pesanan baru.\nKetik *menu* untuk mulai belanja.`,

    /**
     * Payment failed
     */
    paymentFailed: () =>
      `❌ *PEMBAYARAN GAGAL*\n\nSilakan coba lagi atau pilih metode lain.\nKetik *menu* untuk mulai.`,

    /**
     * Payment pending
     */
    paymentPending: () =>
      `⏳ *PEMBAYARAN PENDING*\n\nSilakan selesaikan pembayaran Anda.\nKetik *status* untuk cek lagi.`,

    /**
     * No active invoice
     */
    noActiveInvoice: () =>
      `❌ Tidak ada invoice aktif.\n\nKetik *menu* untuk mulai belanja.`,

    /**
     * Check status error
     */
    checkStatusError: () =>
      `❌ Gagal mengecek status pembayaran.\n\nSilakan coba lagi nanti.`,
  },

  // ============================================
  // UI MESSAGES (dari uiMessages.js)
  // ============================================

  ui: {
    /**
     * Main menu header
     */
    mainMenuHeader: (shopName) =>
      `╔═══════════════════════╗
║  🛍️ *${shopName.toUpperCase()}*   ║
╚═══════════════════════╝`,

    /**
     * Main menu greeting
     */
    mainMenuGreeting: () =>
      `Halo! Mau belanja apa hari ini?`,

    /**
     * Main menu section header
     */
    mainMenuSectionHeader: () =>
      `┌─────────────────────┐
│ 🎯 *MENU UTAMA*     │
└─────────────────────┘`,

    /**
     * Main menu options
     */
    mainMenuOptions: () =>
      `1️⃣ 🛍️ *Belanja* - Lihat produk
2️⃣ 🛒 *Keranjang* - Cek order
3️⃣ ⭐ *Favorit* - Wishlist
4️⃣ 📞 *Bantuan* - Hubungi kami`,

    /**
     * Main menu footer
     */
    mainMenuFooter: () =>
      `💬 *Quick:* cart • wishlist • track
💡 Stock realtime • 6 payment`,

    /**
     * Product added success
     */
    productAdded: (productName, priceIDR) =>
      `✅ *DITAMBAHKAN!*

📦 ${productName}
💰 Rp ${priceIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━━━━

*Lanjut?*
🛍️ Tambah lagi → Ketik nama
🛒 Checkout → *cart*
⭐ Favorit → *simpan ${productName}*

Stock di-hold sampai checkout ✨`,

    /**
     * Product not found
     */
    productNotFound: (input = "") => {
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
    },

    /**
     * Empty cart message
     */
    emptyCart: () =>
      `🛒 *Keranjang kosong*

Yuk mulai belanja! 🛍️

🎯 *browse* → Lihat produk
⭐ *wishlist* → Cek favorit
🏠 *menu* → Menu utama

━━━━━━━━━━━━━━━━━━━━━
💡 Auto-delivery & original!`,

    /**
     * Cart cleared
     */
    cartCleared: () =>
      `🗑️ Keranjang dikosongkan!\n\nKetik *menu* untuk lanjut belanja.`,

    /**
     * Invalid option
     */
    invalidOption: () =>
      `🤔 *Hmm, tidak paham...*

Coba command ini:

🏠 *menu* → Menu utama
🛍️ *browse* → Lihat produk
🛒 *cart* → Keranjang
⭐ *wishlist* → Favorit
📦 *track* → Lacak order
💬 *help* → Panduan lengkap

━━━━━━━━━━━━━━━━━━━━━
💡 Atau ketik nama produk
langsung saat browsing!`,

    /**
     * Checkout prompt
     */
    checkoutPrompt: () =>
      `💳 *Siap Checkout?*

• *checkout* - Lanjut ke pembayaran
• *promo KODE* - Gunakan kode promo
• *clear* - Kosongkan keranjang
• *menu* - Menu utama

🎁 Punya kode promo? Gunakan sebelum checkout!`,

    /**
     * Awaiting admin approval
     */
    awaitingAdminApproval: () =>
      `⏱️ Menunggu verifikasi admin...

Pembayaran Anda sedang diverifikasi.
Mohon tunggu 5-15 menit.`,

    /**
     * Order header (empty)
     */
    orderListHeaderEmpty: () =>
      `╔═══════════════════════╗
║  📦 *RIWAYAT*         ║
╚═══════════════════════╝

Belum ada pesanan

━━━━━━━━━━━━━━━━━━━━━
🛍️ *menu* untuk belanja`,

    /**
     * Order header (with items)
     */
    orderListHeader: () =>
      `╔═══════════════════════╗
║  📦 *RIWAYAT*         ║
╚═══════════════════════╝

`,

    /**
     * Cart header
     */
    cartHeader: () =>
      `╔═══════════════════╗
║  🛒 *KERANJANG*  ║
╚═══════════════════╝

`,

    /**
     * Wishlist header (empty)
     */
    wishlistHeaderEmpty: () =>
      `╔═══════════════════════╗
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
🛍️ *browse* untuk lihat produk`,

    /**
     * Wishlist header (with items)
     */
    wishlistHeader: () =>
      `╔═══════════════════════╗
║  ⭐ *WISHLIST*      ║
╚═══════════════════════╝

`,

    /**
     * About header
     */
    aboutHeader: (shopName) =>
      `╔═══════════════════════╗
║  ℹ️ *TENTANG KAMI*   ║
╚═══════════════════════╝

Halo dari ${shopName}! 🎉`,

    /**
     * Contact header
     */
    contactHeader: () =>
      `╔═══════════════════════╗
║  📞 *HUBUNGI KAMI*   ║
╚═══════════════════════╝

Butuh bantuan? Kami siap! 💬`,
  },

  // ============================================
  // ADMIN MESSAGES
  // ============================================

  admin: {
    /**
     * Unauthorized access
     */
    unauthorized: () =>
      `❌ *Akses Ditolak*

Anda tidak memiliki izin untuk perintah admin.

Ketik *help* untuk perintah customer atau *menu* untuk menu utama.`,

    /**
     * Invalid approval format
     */
    approvalFormatInvalid: () =>
      `❌ Format: /approve <order_id>

Contoh: /approve ORD-1730000000000-1234`,

    /**
     * Order not found
     */
    orderNotFound: (orderId) =>
      `❌ Order ID ${orderId} tidak ditemukan.

Pastikan order ID benar.`,

    /**
     * Order not pending
     */
    orderNotPending: (orderId) =>
      `❌ Order ${orderId} tidak dalam status menunggu approval.`,

    /**
     * Delivery failed
     */
    deliveryFailed: (orderId) =>
      `❌ Gagal mengirim produk untuk order ${orderId}.

Tidak ada produk yang tersedia di database.`,

    /**
     * Approval success
     */
    approvalSuccess: (orderId) =>
      `✅ *APPROVED!*

Order ${orderId} telah disetujui.
Produk akan dikirim ke customer.`,
  },

  // ============================================
  // SEPARATORS
  // ============================================

  separators: {
    short: '━━━━━━━━━━━━━━━━━━',
    medium: '━━━━━━━━━━━━━━━━━━━━━',
    long: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  },
};

module.exports = Messages;
