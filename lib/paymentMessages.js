/**
 * Payment Message Templates
 * Centralized payment-related messages
 */

class PaymentMessages {
  /**
   * QRIS payment message
   */
  static qrisPayment(orderId, totalIDR) {
    let message = "✅ *QRIS PAYMENT*\n\n";
    message += `📋 Order ID: ${orderId}\n`;
    message += `💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "📸 *QR Code akan dikirim segera*\n\n";
    message += "✅ Scan dengan aplikasi apapun:\n";
    message += "• E-Wallet: DANA, OVO, GoPay, ShopeePay, LinkAja\n";
    message += "• Mobile Banking: BCA, BNI, BRI, Mandiri, dll\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "⏱️ QR Code berlaku 24 jam\n";
    message += "🔔 Auto-verify setelah pembayaran\n";
    message += "🚀 Produk otomatis terkirim 5-15 menit\n\n";
    message += "🔍 Ketik *cek* untuk cek status pembayaran\n\n";
    message += "💡 *Tips:* Pastikan nominal sesuai persis!";
    return message;
  }

  /**
   * E-Wallet payment message
   */
  static ewalletPayment(walletType, orderId, totalIDR, redirectUrl) {
    return `✅ *${walletType.toUpperCase()} PAYMENT*\n\n📋 Order ID: ${orderId}\n💵 Total: Rp ${totalIDR.toLocaleString(
      "id-ID"
    )}\n\n━━━━━━━━━━━━━━━━━━\n\n📱 Klik link ini untuk bayar:\n${redirectUrl}\n\n⏱️ Link berlaku 24 jam\n🔍 Ketik *cek* untuk cek status`;
  }

  /**
   * Virtual Account payment message
   */
  static virtualAccount(bankName, vaNumber, orderId, totalIDR) {
    let message = `✅ *VIRTUAL ACCOUNT ${bankName}*\n\n`;
    message += `📋 Order ID: ${orderId}\n`;
    message += `💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += `🏦 Bank: ${bankName}\n`;
    message += `💳 Nomor VA: ${vaNumber}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "📱 Cara Bayar:\n";
    message += "1. Buka mobile/internet banking\n";
    message += `2. Pilih Transfer ke ${bankName}\n`;
    message += `3. Input nomor VA: ${vaNumber}\n`;
    message += `4. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}\n`;
    message += "5. Konfirmasi pembayaran\n\n";
    message += "⏱️ VA berlaku 24 jam\n";
    message += "🔍 Ketik *cek* untuk cek status\n\n";
    message += "💡 Pastikan nominal sesuai!";
    return message;
  }

  /**
   * Bank selection menu
   */
  static bankSelection(orderId, totalIDR) {
    let message = "� *PILIH BANK TRANSFER*\n\n";
    message += `📋 Order ID: ${orderId}\n`;
    message += `💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "*Pilih bank untuk Virtual Account:*\n\n";
    message += "1️⃣ 🏬 *BCA* - Bank Central Asia\n";
    message += "2️⃣ 🏬 *BNI* - Bank Negara Indonesia\n";
    message += "3️⃣ 🏬 *BRI* - Bank Rakyat Indonesia\n";
    message += "4️⃣ 🏬 *Mandiri* - Bank Mandiri\n";
    message += "5️⃣ 🏬 *Permata* - Bank Permata\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "💡 *Transfer dari bank manapun* ke Virtual Account\n\n";
    message += "Ketik nomor pilihan (1-5)";
    return message;
  }

  /**
   * Payment method selection menu
   */
  static paymentMethodSelection(orderId) {
    let message = "✅ *PESANAN DIKONFIRMASI!*\n\n";
    message += `📋 Order ID: ${orderId}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "💳 *PILIH METODE PEMBAYARAN*\n\n";
    message += "1️⃣ *QRIS* - Universal QR (semua e-wallet & bank)\n";
    message += "2️⃣ *DANA* - E-Wallet DANA\n";
    message += "3️⃣ *GoPay* - E-Wallet GoPay\n";
    message += "4️⃣ *OVO* - E-Wallet OVO\n";
    message += "5️⃣ *ShopeePay* - E-Wallet ShopeePay\n";
    message += "6️⃣ *Transfer Bank* - Virtual Account\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "💡 *Pilihan Terpopuler:*\n";
    message += "• QRIS (paling praktis, scan langsung)\n";
    message += "• E-Wallet (langsung redirect ke app)\n";
    message += "• Virtual Account (dari bank apapun)\n\n";
    message += "Ketik nomor pilihan (1-6) untuk lanjut pembayaran";
    return message;
  }

  /**
   * Payment success message
   */
  static paymentSuccess(orderId, paymentMethod, deliveryMessage) {
    let message = "✅ *PEMBAYARAN BERHASIL!* 🎉\n\n";
    message += `📋 Order ID: ${orderId}\n`;
    message += `💳 Metode: ${paymentMethod}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "🎁 *Produk Anda:*\n\n";
    message += deliveryMessage + "\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "⭐ *Puas dengan layanan kami?*\n";
    message += "Ketik */review <produk> <rating 1-5> <komentar>*\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "Terima kasih sudah berbelanja! 🙏\n\n";
    message += "• *menu* - Belanja lagi\n";
    message += "• */history* - Riwayat pesanan\n";
    message += "• */track* - Lacak pesanan";
    return message;
  }

  /**
   * Payment status messages
   */
  static paymentPending() {
    return (
      "⏱️ *Status Pembayaran: PENDING*\n\n" +
      "Pembayaran Anda sedang menunggu.\n\n" +
      "━━━━━━━━━━━━━━━━━━\n\n" +
      "✅ Selesaikan pembayaran Anda\n" +
      "🔔 Auto-verify setelah bayar\n" +
      "🚀 Produk otomatis terkirim\n\n" +
      "🔍 Ketik *cek* untuk cek status\n" +
      "🏠 Ketik *menu* untuk menu utama"
    );
  }

  static paymentExpired() {
    return "❌ *PEMBAYARAN EXPIRED*\n\nSilakan mulai order baru. Ketik *menu*.";
  }

  static paymentFailed() {
    return "❌ *PEMBAYARAN GAGAL*\n\nSilakan mulai order baru. Ketik *menu*.";
  }

  static awaitingPayment() {
    return (
      "⏱️ *Menunggu Pembayaran...*\n\n" +
      "━━━━━━━━━━━━━━━━━━\n\n" +
      "✅ Selesaikan pembayaran Anda\n" +
      "� Sistem otomatis verifikasi pembayaran\n" +
      "🚀 Produk terkirim 5-15 menit setelah bayar\n\n" +
      "━━━━━━━━━━━━━━━━━━\n\n" +
      "�🔍 Ketik *cek* untuk cek status\n" +
      "📞 Ketik *support* untuk bantuan\n" +
      "🏠 Ketik *menu* untuk kembali"
    );
  }

  /**
   * Error messages
   */
  static paymentError(errorMessage) {
    return `❌ Gagal membuat pembayaran.\n\nError: ${errorMessage}\n\nSilakan coba lagi atau ketik *menu*.`;
  }

  static invalidBankChoice() {
    return "❌ *Pilihan Tidak Valid*\n\nSilakan ketik nomor 1-5 untuk memilih bank.\n\nBank tersedia:\n1=BCA, 2=BNI, 3=BRI, 4=Mandiri, 5=Permata";
  }

  static noActiveInvoice() {
    return "❌ Tidak ada invoice aktif.\n\nKetik *menu* untuk mulai belanja.";
  }

  static checkStatusError() {
    return "❌ Gagal mengecek status pembayaran.\n\nSilakan coba lagi.";
  }

  /**
   * Manual E-Wallet payment instructions
   */
  static manualEWalletInstructions(
    walletType,
    accountNumber,
    accountName,
    totalIDR,
    orderId
  ) {
    let message = `✅ *TRANSFER ${walletType.toUpperCase()}*\n\n`;
    message += `📋 Order ID: ${orderId}\n`;
    message += `💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += `📱 Transfer ke nomor ${walletType}:\n`;
    message += `💳 ${accountNumber}\n`;
    message += `👤 a.n. ${accountName}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "📝 *Langkah-langkah:*\n";
    message += `1. Buka aplikasi ${walletType}\n`;
    message += "2. Pilih menu Transfer\n";
    message += `3. Input nomor: ${accountNumber}\n`;
    message += `4. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}\n`;
    message += "5. Selesaikan transfer\n\n";
    message += "⚠️ *PENTING:*\n";
    message += `• Transfer TEPAT: Rp ${totalIDR.toLocaleString("id-ID")}\n`;
    message += "• Screenshot bukti transfer\n";
    message += `• Catat Order ID: ${orderId}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "📸 Setelah transfer, kirim screenshot bukti + Order ID\n\n";
    message += "⏱️ Admin akan verifikasi dalam 5-15 menit\n";
    message += "✅ Produk otomatis dikirim setelah diverifikasi\n\n";
    message += "💡 Butuh bantuan? Ketik *support*";
    return message;
  }

  /**
   * Manual Bank Transfer instructions
   */
  static manualBankTransferInstructions(
    bankCode,
    accountNumber,
    accountName,
    totalIDR,
    orderId
  ) {
    let message = `✅ *TRANSFER BANK ${bankCode}*\n\n`;
    message += `📋 Order ID: ${orderId}\n`;
    message += `💵 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += `🏦 Transfer ke rekening ${bankCode}:\n`;
    message += `💳 ${accountNumber}\n`;
    message += `👤 a.n. ${accountName}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "📝 *Cara Transfer:*\n\n";
    message += "📱 *Via Mobile Banking:*\n";
    message += "1. Buka aplikasi m-banking\n";
    message += "2. Pilih Transfer > Antar Bank / Dalam Bank\n";
    message += `3. Pilih Bank: ${bankCode}\n`;
    message += `4. Input rekening: ${accountNumber}\n`;
    message += `5. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}\n`;
    message += "6. Konfirmasi transfer\n\n";
    message += "🏧 *Via ATM:*\n";
    message += "1. Masukkan kartu ATM\n";
    message += "2. Pilih Transfer\n";
    message += `3. Pilih ke Bank ${bankCode}\n`;
    message += `4. Input rekening: ${accountNumber}\n`;
    message += `5. Input jumlah: Rp ${totalIDR.toLocaleString("id-ID")}\n`;
    message += "6. Konfirmasi\n\n";
    message += "⚠️ *PENTING:*\n";
    message += `• Transfer TEPAT: Rp ${totalIDR.toLocaleString("id-ID")}\n`;
    message += "• Screenshot / foto bukti transfer\n";
    message += `• Catat Order ID: ${orderId}\n\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "📸 Setelah transfer, kirim bukti + Order ID\n\n";
    message += "⏱️ Admin akan verifikasi dalam 5-15 menit\n";
    message += "✅ Produk otomatis dikirim setelah diverifikasi\n\n";
    message += "💡 Butuh bantuan? Ketik *support*";
    return message;
  }
}

module.exports = PaymentMessages;
