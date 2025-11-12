/**
 * 👨‍💼 ADMIN MESSAGES
 * 
 * File ini berisi SEMUA pesan untuk admin:
 * - Authentication messages
 * - Order management messages
 * - Admin notifications
 * 
 * 📖 CARA EDIT:
 * 1. Cari pesan yang mau diubah (Ctrl+F)
 * 2. Edit pesannya
 * 3. Save (Ctrl+S)
 * 4. Restart bot: pm2 restart whatsapp-bot
 * 
 * ⚠️ JANGAN hapus ${variable} placeholders!
 */

const AdminMessages = {
  // ============================================
  // 🔐 AUTHENTICATION
  // ============================================

  auth: {
    /**
     * Unauthorized access
     */
    unauthorized: () =>
      `⛔ *AKSES DITOLAK*

Anda tidak memiliki akses ke fitur admin.

Hanya nomor admin yang terdaftar yang dapat menggunakan command ini.`,
  },

  // ============================================
  // 📦 ORDER MANAGEMENT
  // ============================================

  order: {
    /**
     * Approval format invalid
     */
    approvalFormatInvalid: () =>
      `❌ *FORMAT SALAH*

Format yang benar:
*/approve <orderId>*

Contoh:
/approve ORD-1699123456789-c.us

━━━━━━━━━━━━━━━━━━

💡 Copy Order ID dari notifikasi order`,

    /**
     * Order not found
     */
    notFound: (orderId) =>
      `❌ *ORDER TIDAK DITEMUKAN*

Order ID: ${orderId}

Kemungkinan:
• Order ID salah (typo)
• Order sudah diproses
• Order dibatalkan

━━━━━━━━━━━━━━━━━━

Ketik */pending* untuk list order pending`,

    /**
     * Order not pending
     */
    notPending: (orderId) =>
      `⚠️ *ORDER BUKAN PENDING*

Order ID: ${orderId}

Order ini sudah:
• Sudah diapprove
• Atau sudah dibatalkan

━━━━━━━━━━━━━━━━━━

Ketik */pending* untuk list order pending`,

    /**
     * Delivery failed
     */
    deliveryFailed: (orderId) =>
      `❌ *GAGAL DELIVER PRODUK*

Order ID: ${orderId}

Kemungkinan:
• Stock habis
• File produk tidak ada
• Error sistem

━━━━━━━━━━━━━━━━━━

✅ Lakukan manual:
1. Cek stock produk
2. Kirim produk manual ke customer
3. Catat di log

💡 Hubungi developer jika error terus`,

    /**
     * Approval success
     */
    approvalSuccess: (orderId) =>
      `✅ *ORDER DISETUJUI!*

Order ID: ${orderId}

━━━━━━━━━━━━━━━━━━

✅ Pembayaran verified
✅ Produk sudah dikirim ke customer
✅ Stock sudah dikurangi

━━━━━━━━━━━━━━━━━━

Customer akan menerima notifikasi + produk.

💡 Ketik */stats* untuk lihat statistik`,
  },

  // ============================================
  // 🔔 ADMIN NOTIFICATIONS
  // ============================================

  adminNotification: {
    /**
     * New order notification
     */
    newOrder: (orderId, customerId, productName, totalIDR) =>
      `🔔 *ORDER BARU!*

━━━━━━━━━━━━━━━━━━

📋 Order ID: ${orderId}
👤 Customer: ${customerId}
📦 Produk: ${productName}
💰 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

⏳ Status: Pending Payment

━━━━━━━━━━━━━━━━━━

💡 Order otomatis diproses setelah payment terverifikasi`,

    /**
     * Payment proof uploaded notification
     */
    proofUploaded: (orderId, customerId, productName, totalIDR, proofPath) =>
      `📸 *BUKTI TRANSFER DITERIMA*

━━━━━━━━━━━━━━━━━━

📋 Order ID: ${orderId}
👤 Customer: ${customerId}
📦 Produk: ${productName}
💰 Total: Rp ${totalIDR.toLocaleString("id-ID")}
📁 Bukti: ${proofPath}

━━━━━━━━━━━━━━━━━━

⚡ *ACTION REQUIRED*

✅ Approve:
   */approve ${orderId}*

❌ Reject:
   */reject ${orderId} <reason>*

━━━━━━━━━━━━━━━━━━

💡 Verifikasi dalam 5-15 menit untuk customer satisfaction!`,

    /**
     * Low stock alert
     */
    lowStock: (productId, currentStock, threshold = 5) =>
      `⚠️ *STOCK RENDAH!*

━━━━━━━━━━━━━━━━━━

📦 Produk: ${productId}
📊 Stock: ${currentStock} unit
🔴 Threshold: ${threshold} unit

━━━━━━━━━━━━━━━━━━

⚡ ACTION REQUIRED

Segera isi ulang stock!

✅ */addstock ${productId} <jumlah>*

━━━━━━━━━━━━━━━━━━

💡 Stock rendah dapat mengurangi penjualan!`,

    /**
     * Stock empty alert
     */
    stockEmpty: (productId) =>
      `🚨 *STOCK HABIS!*

━━━━━━━━━━━━━━━━━━

📦 Produk: ${productId}
📊 Stock: 0 unit

━━━━━━━━━━━━━━━━━━

🔴 PRODUK TIDAK BISA DIJUAL

Customer tidak bisa memesan produk ini sampai stock diisi!

━━━━━━━━━━━━━━━━━━

⚡ ISI STOCK SEKARANG

*/addstock ${productId} <jumlah>*

━━━━━━━━━━━━━━━━━━

💡 URGENT! Segera isi stock untuk mencegah lost sales!`,

    /**
     * Daily report
     */
    dailyReport: (stats) =>
      `📊 *LAPORAN HARIAN*

━━━━━━━━━━━━━━━━━━

📅 Tanggal: ${new Date().toLocaleDateString("id-ID")}

*💰 REVENUE*
• Total: Rp ${stats.totalRevenue.toLocaleString("id-ID")}
• Avg/Order: Rp ${stats.avgOrderValue.toLocaleString("id-ID")}

*📦 ORDERS*
• Completed: ${stats.completedOrders}
• Pending: ${stats.pendingOrders}
• Total: ${stats.totalOrders}

*📊 TOP PRODUCTS*
${stats.topProducts
  .map((p, i) => `${i + 1}. ${p.name} (${p.count}x)`)
  .join("\n")}

*💳 PAYMENT METHODS*
${stats.paymentMethods
  .map((pm) => `• ${pm.name}: ${pm.count}x`)
  .join("\n")}

━━━━━━━━━━━━━━━━━━

💡 Ketik */stats 7* untuk weekly report`,
  },

  // ============================================
  // 📈 STATISTICS & REPORTS
  // ============================================

  stats: {
    /**
     * Stats command help
     */
    help: () =>
      `📊 *PANDUAN STATS*

━━━━━━━━━━━━━━━━━━

*Format:*
/stats [days]

*Contoh:*
/stats → Last 7 days
/stats 1 → Today
/stats 30 → Last month
/stats 90 → Last quarter

━━━━━━━━━━━━━━━━━━

*Metrics Included:*
• Revenue & avg order value
• Total orders (pending/completed)
• Top products
• Payment methods breakdown
• Customer retention
• Success rate

━━━━━━━━━━━━━━━━━━

💡 Default: 7 days jika tidak ditentukan`,
  },
};

module.exports = AdminMessages;
