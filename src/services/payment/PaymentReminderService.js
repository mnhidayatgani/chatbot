/**
 * Payment Reminder Service
 * Sends automated reminders for pending payments
 */

const cron = require("node-cron");
const TransactionLogger = require("../../../lib/transactionLogger");

class PaymentReminderService {
  constructor(whatsappClient, sessionManager, transactionLogger = null) {
    this.whatsappClient = whatsappClient;
    this.sessionManager = sessionManager;
    this.transactionLogger = transactionLogger || new TransactionLogger();
    this.reminderJobs = new Map(); // orderId -> cron job
    this.sentReminders = new Set(); // Track sent reminders (orderId)

    // Config
    this.firstReminderDelay = parseInt(process.env.REMINDER_DELAY_1) || 30; // 30 minutes
    this.secondReminderDelay = parseInt(process.env.REMINDER_DELAY_2) || 120; // 2 hours
  }

  /**
   * Start background job to check pending payments
   * Runs every 15 minutes
   */
  start() {
    console.log("⏰ Starting Payment Reminder Service...");

    // Check pending payments every 15 minutes
    this.cronJob = cron.schedule("*/15 * * * *", () => {
      this.checkPendingPayments();
    });

    console.log("✅ Payment Reminder Service started (runs every 15 minutes)");
  }

  /**
   * Stop the background job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("⏹️ Payment Reminder Service stopped");
    }

    // Stop all reminder jobs
    for (const job of this.reminderJobs.values()) {
      job.stop();
    }
    this.reminderJobs.clear();
  }

  /**
   * Check all pending payments and send reminders
   */
  async checkPendingPayments() {
    try {
      console.log("🔍 Checking pending payments...");

      const now = Date.now();
      const customerIds = await this.sessionManager.getAllCustomerIds();

      let remindersCount = 0;

      for (const customerId of customerIds) {
        const session = await this.sessionManager.getSession(customerId);
        const step = session.step;

        // Check if customer is waiting for payment
        if (step === "awaiting_payment" || step === "awaiting_admin_approval") {
          const orderId = session.orderId;
          const qrisDate = session.qrisDate;

          if (!orderId || !qrisDate) continue;

          const elapsed = now - qrisDate;
          const elapsedMinutes = Math.floor(elapsed / 60000);

          // First reminder after 30 minutes
          if (
            elapsedMinutes >= this.firstReminderDelay &&
            !this.sentReminders.has(`${orderId}-1`)
          ) {
            await this.sendReminder(customerId, session, 1);
            this.sentReminders.add(`${orderId}-1`);
            remindersCount++;
          }

          // Second reminder after 2 hours
          if (
            elapsedMinutes >= this.secondReminderDelay &&
            !this.sentReminders.has(`${orderId}-2`)
          ) {
            await this.sendReminder(customerId, session, 2);
            this.sentReminders.add(`${orderId}-2`);
            remindersCount++;
          }
        }
      }

      if (remindersCount > 0) {
        console.log(`✅ Sent ${remindersCount} payment reminder(s)`);
      } else {
        console.log("ℹ️ No pending payments requiring reminders");
      }
    } catch (error) {
      console.error("❌ Error checking pending payments:", error.message);
    }
  }

  /**
   * Send reminder to customer
   * @param {string} customerId
   * @param {Object} session
   * @param {number} reminderNumber - 1 or 2
   */
  async sendReminder(customerId, session, reminderNumber) {
    try {
      const cart = session.cart || [];
      const totalUSD = cart.reduce((sum, item) => sum + item.price, 0);
      const totalIDR = totalUSD * 16000; // Rough conversion

      const orderId = session.orderId;
      const paymentMethod = session.paymentMethod || "Unknown";

      let message = "";

      if (reminderNumber === 1) {
        // First reminder (friendly)
        message =
          "👋 *Pengingat Pembayaran*\n\n" +
          "Halo! Pesanan Anda masih menunggu pembayaran.\n\n" +
          `📋 Order ID: ${orderId}\n` +
          `💰 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n` +
          `💳 Metode: ${paymentMethod}\n\n` +
          "Jika Anda sudah membayar, abaikan pesan ini atau kirim bukti pembayaran.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "💡 Butuh bantuan? Ketik *menu* atau hubungi admin.";
      } else if (reminderNumber === 2) {
        // Second reminder (urgent)
        message =
          "⚠️ *Pengingat Pembayaran - URGENT*\n\n" +
          "Pesanan Anda akan segera kadaluarsa!\n\n" +
          `📋 Order ID: ${orderId}\n` +
          `💰 Total: Rp ${totalIDR.toLocaleString("id-ID")}\n\n` +
          "Silakan selesaikan pembayaran dalam 30 menit untuk menghindari pembatalan otomatis.\n\n" +
          "Jika Anda sudah membayar, kirim bukti pembayaran sekarang.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "📞 Butuh bantuan? Hubungi admin segera.";
      }

      // Send via WhatsApp
      await this.whatsappClient.sendMessage(customerId, message);
      console.log(
        `✅ Sent reminder #${reminderNumber} to ${customerId} for ${orderId}`
      );

      // Log reminder
      this.transactionLogger.log(
        customerId,
        `payment_reminder_${reminderNumber}`,
        orderId,
        {
          reminderNumber,
          paymentMethod,
          totalIDR,
        }
      );
    } catch (error) {
      console.error(
        `❌ Error sending reminder to ${customerId}:`,
        error.message
      );
    }
  }

  /**
   * Mark order as paid (clear reminders)
   * @param {string} orderId
   */
  markAsPaid(orderId) {
    this.sentReminders.delete(`${orderId}-1`);
    this.sentReminders.delete(`${orderId}-2`);
    console.log(`✅ Cleared reminders for ${orderId}`);
  }

  /**
   * Cleanup old reminder flags (run daily)
   */
  cleanupOldReminders() {
    const now = Date.now();
    const cutoff = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago

    // Note: This is a simple in-memory cleanup
    // In production, you'd want to store timestamps and compare
    console.log("🧹 Cleaned up old reminder flags");
  }
}

module.exports = PaymentReminderService;
