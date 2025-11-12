/**
 * ✨ CENTRALIZED MESSAGE CONFIGURATION ✨
 * 
 * Semua pesan customer & admin dalam 1 file untuk easy customization
 * 
 * 📖 CARA PAKAI:
 * 1. Edit pesan di file ini sesuai kebutuhan
 * 2. Save file (Ctrl+S)
 * 3. Restart bot: pm2 restart whatsapp-bot
 * 
 * 📝 FORMAT:
 * - ${variable} = Dynamic content
 * - \n = New line
 * - *text* = Bold (WhatsApp)
 * - _text_ = Italic (WhatsApp)
 * - ~text~ = Strikethrough (WhatsApp)
 * 
 * ⚠️ PERHATIAN:
 * - Jangan hapus ${variable} placeholders
 * - Pastikan struktur tetap konsisten
 * - Test setelah edit untuk memastikan format OK
 * 
 * Last Updated: November 12, 2025
 */

const Messages = {
  // ============================================
  // 💳 PAYMENT MESSAGES (Complete dari paymentMessages.js)
  // ============================================
  
  payment: {
    // --- QRIS Messages ---
    qris: {
      /**
       * QRIS Auto (Xendit/Dynamic QR)
       */
      auto: (orderId, totalIDR) => 
        `✅ *QRIS PAYMENT*

📋 Order ID: ${orderId}
💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

📸 *QR Code akan dikirim segera*

✅ Scan dengan aplikasi apapun:
• E-Wallet: DANA, OVO, GoPay, ShopeePay, LinkAja
• Mobile Banking: BCA, BNI, BRI, Mandiri, dll

━━━━━━━━━━━━━━━━━━

⏱️ QR Code berlaku 24 jam
🔔 Auto-verify setelah pembayaran
🚀 Produk otomatis terkirim 5-15 menit

🔍 Ketik *cek* untuk cek status pembayaran

💡 *Tips:* Pastikan nominal sesuai persis!`,

      /**
       * QRIS Manual (Static QR)
       */
      manual: (orderId, totalIDR) =>
        `📱 *QRIS MANUAL - Scan & Bayar*

Silakan scan QR code berikut:

━━━━━━━━━━━━━━━━━━

💰 *Total Bayar:* Rp ${totalIDR.toLocaleString("id-ID")}
📋 *Order ID:* ${orderId}

━━━━━━━━━━━━━━━━━━

⚠️ *PENTING:*
• Bayar sesuai jumlah EXACT
• Setelah bayar, upload BUKTI TRANSFER
• Admin akan verifikasi dalam 5-15 menit

━━━━━━━━━━━━━━━━━━

📸 *Sudah bayar?*
Upload screenshot bukti transfer sekarang!`,
    },

    // --- E-Wallet Messages ---
    ewallet: {
      /**
       * E-Wallet redirect (auto)
       */
      redirect: (walletType, orderId, totalIDR, redirectUrl) =>
        `✅ *${walletType.toUpperCase()} PAYMENT*

📋 Order ID: ${orderId}
💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

📱 Klik link ini untuk bayar:
${redirectUrl}

⏱️ Link berlaku 24 jam
🔍 Ketik *cek* untuk cek status`,

      /**
       * E-Wallet manual transfer
       */
      manual: (walletType, accountNumber, accountName, totalIDR, orderId) =>
        `✅ *TRANSFER ${walletType.toUpperCase()}*

📋 Order ID: ${orderId}
💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

📱 Transfer ke nomor ${walletType}:
💳 ${accountNumber}
👤 a.n. ${accountName}

━━━━━━━━━━━━━━━━━━

📝 *Langkah-langkah:*
1. Buka aplikasi ${walletType}
2. Pilih menu Transfer
3. Input nomor: ${accountNumber}
4. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}
5. Selesaikan transfer

⚠️ *PENTING:*
• Transfer TEPAT: Rp ${totalIDR.toLocaleString("id-ID")}
• Screenshot bukti transfer
• Catat Order ID: ${orderId}

━━━━━━━━━━━━━━━━━━

📸 Setelah transfer, kirim screenshot bukti + Order ID

⏱️ Admin akan verifikasi dalam 5-15 menit
✅ Produk otomatis dikirim setelah diverifikasi

💡 Butuh bantuan? Ketik *support*`,

      /**
       * E-Wallet not available
       */
      notAvailable: (walletType) =>
        `❌ Metode pembayaran ${walletType} sedang tidak tersedia.

Silakan pilih metode lain.`,
    },

    // --- Bank Transfer Messages ---
    bank: {
      /**
       * Bank selection menu
       */
      selection: (orderId, totalIDR, availableBanks) => {
        if (availableBanks.length === 0) {
          return `❌ *BANK NOT CONFIGURED*

Silakan hubungi admin untuk setup rekening bank.`;
        }

        let message = `🏦 *PILIH BANK TRANSFER*

📋 Order ID: ${orderId}
💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

*Pilih bank untuk transfer:*

`;

        availableBanks.forEach((bank, index) => {
          const number = index + 1;
          message += `${number}️⃣ 🏬 *${bank.code}*\n`;
        });

        message += `
━━━━━━━━━━━━━━━━━━

💡 *Transfer dari bank manapun*

Ketik nomor pilihan (1-${availableBanks.length})`;

        return message;
      },

      /**
       * Bank transfer instructions
       */
      manual: (bankCode, accountNumber, accountName, totalIDR, orderId) =>
        `✅ *TRANSFER BANK ${bankCode}*

📋 Order ID: ${orderId}
💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

🏦 Transfer ke rekening ${bankCode}:
💳 ${accountNumber}
👤 a.n. ${accountName}

━━━━━━━━━━━━━━━━━━

📝 *Cara Transfer:*

📱 *Via Mobile Banking:*
1. Buka aplikasi m-banking
2. Pilih Transfer > Antar Bank / Dalam Bank
3. Pilih Bank: ${bankCode}
4. Input rekening: ${accountNumber}
5. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}
6. Konfirmasi transfer

🏧 *Via ATM:*
1. Masukkan kartu ATM
2. Pilih Transfer
3. Pilih ke Bank ${bankCode}
4. Input rekening: ${accountNumber}
5. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}
6. Konfirmasi

⚠️ *PENTING:*
• Transfer TEPAT: Rp ${totalIDR.toLocaleString("id-ID")}
• Screenshot / foto bukti transfer
• Catat Order ID: ${orderId}

━━━━━━━━━━━━━━━━━━

📸 Setelah transfer, kirim bukti + Order ID

⏱️ Admin akan verifikasi dalam 5-15 menit
✅ Produk otomatis dikirim setelah diverifikasi

💡 Butuh bantuan? Ketik *support*`,

      /**
       * Bank transfer failed
       */
      failed: (bankCode, errorMessage) =>
        `❌ Gagal setup transfer ${bankCode}.

Error: ${errorMessage}

Silakan coba lagi atau pilih bank lain.`,

      /**
       * Invalid bank choice
       */
      invalidChoice: (maxChoice) =>
        `❌ Pilihan tidak valid. Ketik nomor 1-${maxChoice}.`,
    },

    // --- Virtual Account Messages ---
    va: {
      /**
       * Virtual Account instructions
       */
      instructions: (bankName, vaNumber, orderId, totalIDR) =>
        `✅ *VIRTUAL ACCOUNT ${bankName}*

📋 Order ID: ${orderId}
💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

🏦 Bank: ${bankName}
💳 Nomor VA: ${vaNumber}

━━━━━━━━━━━━━━━━━━

📱 Cara Bayar:
1. Buka mobile/internet banking
2. Pilih Transfer ke ${bankName}
3. Input nomor VA: ${vaNumber}
4. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}
5. Konfirmasi pembayaran

⏱️ VA berlaku 24 jam
🔍 Ketik *cek* untuk cek status

💡 Pastikan nominal sesuai!`,
    },

    // --- Payment Method Selection ---
    selection: {
      /**
       * Payment method menu
       */
      menu: (orderId, availablePayments) => {
        if (availablePayments.length === 0) {
          return `❌ *PAYMENT NOT CONFIGURED*

Silakan hubungi admin untuk setup metode pembayaran.`;
        }

        let message = `✅ *PESANAN DIKONFIRMASI!*

📋 Order ID: ${orderId}

━━━━━━━━━━━━━━━━━━

💳 *PILIH METODE PEMBAYARAN*

`;

        availablePayments.forEach((payment, index) => {
          const number = index + 1;
          message += `${number}️⃣ ${payment.emoji} *${payment.name}*\n`;
        });

        message += `
━━━━━━━━━━━━━━━━━━

`;

        // Add tips based on available methods
        if (availablePayments.length > 1) {
          if (availablePayments.some(p => p.id === 'qris')) {
            message += `💡 *Rekomen: QRIS* - Scan & bayar langsung!\n\n`;
          }
          message += `💬 Semua metode aman & terpercaya\n`;
          message += `🔒 Pembayaran otomatis diverifikasi\n`;
          message += `🚀 Produk dikirim 5-15 menit\n\n`;
        }

        message += `Ketik nomor pilihan (1-${availablePayments.length}) untuk lanjut pembayaran`;

        return message;
      },

      /**
       * Invalid payment choice
       */
      invalidChoice: (maxChoice) =>
        `❌ Pilihan tidak valid. Ketik nomor 1-${maxChoice}.`,

      /**
       * Payment method not available
       */
      notAvailable: () =>
        `❌ Metode pembayaran tidak tersedia.`,
    },

    // --- Payment Status Messages ---
    status: {
      /**
       * Payment pending
       */
      pending: () =>
        `⏱️ *Status Pembayaran: PENDING*

Pembayaran Anda sedang menunggu.

━━━━━━━━━━━━━━━━━━

✅ Selesaikan pembayaran Anda
🔔 Auto-verify setelah bayar
🚀 Produk otomatis terkirim

🔍 Ketik *cek* untuk cek status
🏠 Ketik *menu* untuk menu utama`,

      /**
       * Payment success
       */
      success: (orderId, paymentMethod, deliveryMessage) =>
        `✅ *PEMBAYARAN BERHASIL!* 🎉

📋 Order ID: ${orderId}
💳 Metode: ${paymentMethod}

━━━━━━━━━━━━━━━━━━

🎁 *Produk Anda:*

${deliveryMessage}

━━━━━━━━━━━━━━━━━━

⭐ *Puas dengan layanan kami?*
Ketik */review <produk> <rating 1-5> <komentar>*

━━━━━━━━━━━━━━━━━━

Terima kasih sudah berbelanja! 🙏

• *menu* - Belanja lagi
• */history* - Riwayat pesanan
• */track* - Lacak pesanan`,

      /**
       * Payment expired
       */
      expired: () =>
        `❌ *PEMBAYARAN EXPIRED*

Silakan buat pesanan baru.
Ketik *menu* untuk mulai belanja.`,

      /**
       * Payment failed
       */
      failed: () =>
        `❌ *PEMBAYARAN GAGAL*

Silakan coba lagi atau pilih metode lain.
Ketik *menu* untuk mulai.`,

      /**
       * Awaiting payment
       */
      awaiting: () =>
        `⏱️ *Menunggu Pembayaran...*

━━━━━━━━━━━━━━━━━━

✅ Selesaikan pembayaran Anda
🔔 Sistem otomatis verifikasi pembayaran
🚀 Produk terkirim 5-15 menit setelah bayar

━━━━━━━━━━━━━━━━━━

🔍 Ketik *cek* untuk cek status
📞 Ketik *support* untuk bantuan
🏠 Ketik *menu* untuk kembali`,
    },

    // --- Payment Proof Messages ---
    proof: {
      /**
       * Proof received
       */
      received: (orderId) =>
        `✅ *Bukti Transfer Diterima*

📋 Order ID: ${orderId}
⏰ Waktu Upload: ${new Date().toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

⏳ *Status:* Menunggu Verifikasi Admin

Admin akan memverifikasi pembayaran Anda
dalam 5-15 menit.

━━━━━━━━━━━━━━━━━━

Anda akan menerima notifikasi jika:
✅ Pembayaran disetujui → Produk dikirim
❌ Pembayaran ditolak → Upload ulang

━━━━━━━━━━━━━━━━━━

Ketik *menu* untuk kembali ke menu utama`,

      /**
       * Proof invalid
       */
      invalid: () =>
        `❌ *File Tidak Valid*

File harus berupa gambar (JPG/PNG).

📸 Silakan upload screenshot bukti transfer Anda.`,

      /**
       * Proof rejected
       */
      rejected: (orderId, reason) =>
        `❌ *Pembayaran Ditolak*

📋 Order ID: ${orderId}
📝 Alasan: ${reason}

━━━━━━━━━━━━━━━━━━

*Silakan:*
1. Cek kembali nominal transfer
2. Pastikan transfer ke rekening yang benar
3. Upload bukti yang lebih jelas
4. Hubungi *support* jika butuh bantuan

━━━━━━━━━━━━━━━━━━

📸 Upload bukti transfer yang baru`,
    },

    // --- Payment Error Messages ---
    error: {
      /**
       * Generic payment error
       */
      generic: (errorMessage) =>
        `❌ Gagal membuat pembayaran.

Error: ${errorMessage}

Silakan coba lagi atau ketik *menu*.`,

      /**
       * No active invoice
       */
      noInvoice: () =>
        `❌ Tidak ada invoice aktif.

Ketik *menu* untuk mulai belanja.`,

      /**
       * Check status error
       */
      checkFailed: () =>
        `❌ Gagal mengecek status pembayaran.

Silakan coba lagi nanti.`,
    },

    // --- Admin Notification Messages ---
    adminNotification: {
      /**
       * Payment proof uploaded
       */
      proofUploaded: (orderId, customerId, productName, totalIDR, proofPath) =>
        `🔔 *BUKTI TRANSFER BARU*

📋 Order ID: ${orderId}
👤 Customer: ${customerId}
📦 Produk: ${productName}
💰 Total: Rp ${totalIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

📸 Bukti: ${proofPath}

⏱️ Menunggu approval Anda

Ketik */approve ${orderId}* untuk approve`,
    },
  },

  // ============================================
  // 🛍️ CUSTOMER/UI MESSAGES (Complete dari uiMessages.js)
  // ============================================

  customer: {
    // --- Menu & Navigation ---
    menu: {
      /**
       * Main menu (complete message)
       */
      main: (shopName) =>
        `🛍️ *${shopName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━

Halo! Mau belanja apa hari ini?

🎯 *MENU UTAMA*

1️⃣ 🛍️ *Belanja* - Lihat produk
2️⃣ 🛒 *Keranjang* - Cek order
3️⃣ ⭐ *Favorit* - Wishlist
4️⃣ 📞 *Bantuan* - Hubungi kami

━━━━━━━━━━━━━━━━━━

💬 *Quick:* cart • wishlist • track
💡 Stock realtime • 6 payment`,

      /**
       * Help command (complete guide)
       */
      help: () =>
        `📚 *PANDUAN LENGKAP*

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

━━━━━━━━━━━━━━━━━━
💡 Tips:
• Semua command case-free
• Ketik nama produk langsung
• Prefix / opsional

🏠 Ketik *menu* untuk kembali`,

      /**
       * About page
       */
      about: (shopName) =>
        `ℹ️ *TENTANG KAMI*
━━━━━━━━━━━━━━━━━━

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

━━━━━━━━━━━━━━━━━━
💡 Mulai dari Rp 15.800!

🏠 Ketik *menu* untuk belanja`,

      /**
       * Contact page
       */
      contact: (supportWhatsapp, workingHours) =>
        `📞 *HUBUNGI KAMI*
━━━━━━━━━━━━━━━━━━

Butuh bantuan? Kami siap! 💬

⏰ ${workingHours}
📱 ${supportWhatsapp}

━━━━━━━━━━━━━━━━━━
💡 Respons < 5 menit!

🏠 Ketik *menu* untuk kembali`,
    },

    // --- Product Messages ---
    product: {
      /**
       * Product added to cart
       */
      added: (productName, priceIDR) =>
        `✅ *DITAMBAHKAN!*

📦 ${productName}
💰 Rp ${priceIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━

*Lanjut?*
🛍️ Tambah lagi → Ketik nama
🛒 Checkout → *cart*
⭐ Favorit → *simpan ${productName}*

Stock di-hold sampai checkout ✨`,

      /**
       * Product not found
       */
      notFound: (input = "") => {
        const searchText = input ? `"${input}"` : "";
        return `🔍 *Produk ${searchText} tidak ada*

━━━━━━━━━━━━━━━━━━

*Coba ini:*
1️⃣ Cek typo (kami sudah coba
   auto-correct)
2️⃣ Ketik *browse* untuk
   lihat semua produk
3️⃣ Contoh: netflix, spotify

━━━━━━━━━━━━━━━━━━
🏠 *menu* • 💬 *help*`;
      },

      /**
       * Browsing instructions
       */
      browsingInstructions: (productList) =>
        `${productList}

━━━━━━━━━━━━━━━━━━

*🎯 CARA ORDER:*
Ketik nama produk langsung

*Contoh:*
• netflix
• spotify premium

━━━━━━━━━━━━━━━━━━
🛒 cart • ⭐ wishlist • 🏠 menu`,
    },

    // --- Cart Messages ---
    cart: {
      /**
       * Cart view (with items)
       */
      view: (cart, total) => {
        const totalIDR = total;
        let message = `🛒 *KERANJANG*
━━━━━━━━━━━━━━━━━━

`;

        cart.forEach((item, index) => {
          message += `${index + 1}. ${item.name}\n`;
          message += `   💰 Rp ${item.price.toLocaleString("id-ID")}\n\n`;
        });

        message += "━━━━━━━━━━━━━━━━━━\n";
        message += `💵 *TOTAL*\n`;
        message += `   *Rp ${totalIDR.toLocaleString("id-ID")}*\n`;
        message += "━━━━━━━━━━━━━━━━━━\n\n";
        message += "*Siap bayar?*\n";
        message += "💳 checkout → Lanjut\n";
        message += "🎟️ promo → Pakai kode\n";
        message += "🗑️ clear → Kosongkan\n\n";
        message += "💡 Punya promo? Pakai dulu!";

        return message;
      },

      /**
       * Empty cart
       */
      empty: () =>
        `🛒 *Keranjang kosong*

Yuk mulai belanja! 🛍️

🎯 *browse* → Lihat produk
⭐ *wishlist* → Cek favorit
🏠 *menu* → Menu utama

━━━━━━━━━━━━━━━━━━
💡 Auto-delivery & original!`,

      /**
       * Cart cleared
       */
      cleared: () =>
        `🗑️ Keranjang dikosongkan!

Ketik *menu* untuk lanjut belanja.`,

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
    },

    // --- Wishlist Messages ---
    wishlist: {
      /**
       * Wishlist view (with items)
       */
      view: (wishlist) => {
        let message = `⭐ *WISHLIST*
━━━━━━━━━━━━━━━━━━

`;

        wishlist.forEach((item, index) => {
          message += `${index + 1}. ${item.name}\n`;
          message += `   💰 Rp ${item.price.toLocaleString("id-ID")}\n\n`;
        });

        message += "━━━━━━━━━━━━━━━━━━\n";
        message += `📊 ${wishlist.length} produk favorit\n\n`;
        message += "*Actions:*\n";
        message += "• Ketik nama → Add to cart\n";
        message += "• hapus [nama] → Remove\n\n";
        message += "🛒 cart • 🏠 menu";

        return message;
      },

      /**
       * Empty wishlist
       */
      empty: () =>
        `⭐ *WISHLIST*
━━━━━━━━━━━━━━━━━━

Belum ada favorit

━━━━━━━━━━━━━━━━━━

*Cara tambah:*
⭐ simpan [nama]

*Contoh:*
• simpan netflix
• simpan spotify

━━━━━━━━━━━━━━━━━━
🛍️ *browse* untuk lihat produk`,
    },

    // --- Order Messages ---
    order: {
      /**
       * Order summary
       */
      summary: (orderId, cart, totalIDR, promoCode = null, discountAmount = 0) => {
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
      },

      /**
       * Order list (with items)
       */
      list: (orders) => {
        let message = `📦 *RIWAYAT*
━━━━━━━━━━━━━━━━━━

`;

        orders.forEach((order) => {
          const statusEmoji = order.status.includes("pending") ? "⏳" : "✅";
          message += `${statusEmoji} ${order.status}\n`;
          message += `   ${order.orderId}\n`;
          message += `   ${order.date}\n`;
          message += `   💰 Rp ${order.totalIDR.toLocaleString("id-ID")}\n\n`;
        });

        message += "━━━━━━━━━━━━━━━━━━\n";
        message += `📊 ${orders.length} total orders\n\n`;
        message += "*Filter:*\n";
        message += "track pending • track completed\n\n";
        message += "🏠 menu";

        return message;
      },

      /**
       * Empty order list
       */
      empty: () =>
        `📦 *RIWAYAT*
━━━━━━━━━━━━━━━━━━

Belum ada pesanan

━━━━━━━━━━━━━━━━━━
🛍️ *menu* untuk belanja`,
    },

    // --- Error Messages ---
    error: {
      /**
       * Invalid option/command
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

━━━━━━━━━━━━━━━━━━
💡 Atau ketik nama produk
langsung saat browsing!`,

      /**
       * Session expired
       */
      sessionExpired: () =>
        `⏱️ *Sesi Expired*

Sesi Anda telah berakhir karena tidak aktif.

Ketik *menu* untuk mulai lagi.`,

      /**
       * Rate limit exceeded
       */
      rateLimitExceeded: () =>
        `⚠️ *Terlalu Banyak Pesan*

Mohon tunggu sebentar sebelum mengirim pesan lagi.

Limit: 20 pesan per menit`,
    },

    // --- System Messages ---
    system: {
      /**
       * Awaiting admin approval
       */
      awaitingApproval: () =>
        `⏱️ Menunggu verifikasi admin...

Pembayaran Anda sedang diverifikasi.
Mohon tunggu 5-15 menit.`,
    },
  },

  // ============================================
  // 👨‍💼 ADMIN MESSAGES
  // ============================================

  admin: {
    // --- Authorization ---
    auth: {
      /**
       * Unauthorized access
       */
      unauthorized: () =>
        `❌ *Akses Ditolak*

Anda tidak memiliki izin untuk perintah admin.

Ketik *help* untuk perintah customer atau *menu* untuk menu utama.`,
    },

    // --- Order Management ---
    order: {
      /**
       * Invalid approval format
       */
      approvalFormatInvalid: () =>
        `❌ Format: /approve <order_id>

Contoh: /approve ORD-1730000000000-1234`,

      /**
       * Order not found
       */
      notFound: (orderId) =>
        `❌ Order ID ${orderId} tidak ditemukan.

Pastikan order ID benar.`,

      /**
       * Order not pending
       */
      notPending: (orderId) =>
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
  },

  // ============================================
  // 🎨 FORMATTING HELPERS
  // ============================================

  format: {
    /**
     * Separators (compact version)
     */
    separator: {
      short: '━━━━━━━━━━━━━━━━━━',      // 18 chars
      medium: '━━━━━━━━━━━━━━━━━━━━━',   // 21 chars
      long: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', // 29 chars
    },

    /**
     * Box headers (compact format)
     */
    box: {
      /**
       * Simple compact header
       */
      simple: (emoji, title) =>
        `${emoji} *${title}*
━━━━━━━━━━━━━━━━━━`,

      /**
       * Fancy box header (for special messages)
       */
      fancy: (emoji, title, width = 23) => {
        const padding = ' '.repeat(Math.max(0, width - title.length - 4));
        return `╔${'═'.repeat(width)}╗
║  ${emoji} *${title}*${padding}║
╚${'═'.repeat(width)}╝`;
      },
    },

    /**
     * Currency formatter
     */
    currency: (amount) =>
      `Rp ${amount.toLocaleString('id-ID')}`,

    /**
     * Date & Time formatter
     */
    datetime: (date = new Date()) =>
      date.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),

    /**
     * Emoji shortcuts
     */
    emoji: {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳',
      money: '💰',
      cart: '🛒',
      star: '⭐',
      package: '📦',
      phone: '📞',
      shop: '🛍️',
      qr: '📱',
      bank: '🏦',
      card: '💳',
      receipt: '📋',
      gift: '🎁',
      fire: '🔥',
      rocket: '🚀',
      bell: '🔔',
      search: '🔍',
      home: '🏠',
      help: '💬',
    },
  },
};

module.exports = Messages;
