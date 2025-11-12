/**
 * Payment Message Templates
 * 
 * ⚠️ DEPRECATED: This file now uses centralized messages.config.js
 * Edit messages in: lib/messages.config.js instead
 * 
 * This file is kept for backward compatibility only.
 * All messages are now proxied to messages.config.js
 */

const paymentConfig = require("../src/config/payment.config");
const Messages = require("./messages.config");

class PaymentMessages {
  /**
   * QRIS payment message
   */
  static qrisPayment(orderId, totalIDR) {
    return Messages.payment.qris.auto(orderId, totalIDR);
  }

  /**
   * QRIS Manual payment message (Static QR)
   */
  static qrisManualPayment(orderId, totalIDR) {
    return Messages.payment.qris.manual(orderId, totalIDR);
  }

  /**
   * E-Wallet payment message
   */
  static ewalletPayment(walletType, orderId, totalIDR, redirectUrl) {
    return Messages.payment.ewallet.redirect(walletType, orderId, totalIDR, redirectUrl);
  }

  /**
   * Virtual Account payment message
   */
  static virtualAccount(bankName, vaNumber, orderId, totalIDR) {
    return Messages.payment.va.instructions(bankName, vaNumber, orderId, totalIDR);
  }

  /**
   * Bank selection menu - DYNAMIC based on .env
   */
  static bankSelection(orderId, totalIDR) {
    const availableBanks = paymentConfig.getAvailableBanks();
    return Messages.payment.bank.selection(orderId, totalIDR, availableBanks);
  }

  /**
   * Payment method selection menu - DYNAMIC based on .env
   */
  static paymentMethodSelection(orderId) {
    const availablePayments = paymentConfig.getAvailablePayments();
    return Messages.payment.selection.menu(orderId, availablePayments);
  }

  /**
   * Payment success message
   */
  static paymentSuccess(orderId, paymentMethod, deliveryMessage) {
    return Messages.payment.status.success(orderId, paymentMethod, deliveryMessage);
  }

  /**
   * Payment status messages
   */
  static paymentPending() {
    return Messages.payment.status.pending();
  }

  static paymentExpired() {
    return Messages.payment.status.expired();
  }

  static paymentFailed() {
    return Messages.payment.status.failed();
  }

  static awaitingPayment() {
    return Messages.payment.status.awaiting();
  }

  /**
   * Error messages
   */
  static paymentError(errorMessage) {
    return Messages.payment.error.generic(errorMessage);
  }

  static invalidBankChoice() {
    const maxChoice = paymentConfig.getAvailableBanks().length;
    return Messages.payment.bank.invalidChoice(maxChoice);
  }

  static noActiveInvoice() {
    return Messages.payment.error.noInvoice();
  }

  static checkStatusError() {
    return Messages.payment.error.checkFailed();
  }

  /**
   * Manual E-Wallet payment instructions
   */
  static manualEWalletInstructions(walletType, accountNumber, accountName, totalIDR, orderId) {
    return Messages.payment.ewallet.manual(walletType, accountNumber, accountName, totalIDR, orderId);
  }

  /**
   * Manual Bank Transfer instructions
   */
  static manualBankTransferInstructions(bankCode, accountNumber, accountName, totalIDR, orderId) {
    return Messages.payment.bank.manual(bankCode, accountNumber, accountName, totalIDR, orderId);
  }

  /**
   * Get payment method by index (1-based)
   * @param {number} index - User input (1, 2, 3, etc.)
   * @returns {object|null} Payment method object or null
   */
  static getPaymentMethodByIndex(index) {
    const available = paymentConfig.getAvailablePayments();
    const arrayIndex = parseInt(index) - 1;
    return available[arrayIndex] || null;
  }

  /**
   * Get bank by index (1-based)
   * @param {number} index - User input (1, 2, 3, etc.)
   * @returns {object|null} Bank object or null
   */
  static getBankByIndex(index) {
    const available = paymentConfig.getAvailableBanks();
    const arrayIndex = parseInt(index) - 1;
    return available[arrayIndex] || null;
  }

  /**
   * Get total available payment methods count
   * @returns {number}
   */
  static getPaymentMethodCount() {
    return paymentConfig.getAvailablePayments().length;
  }

  /**
   * Get total available banks count
   * @returns {number}
   */
  static getBankCount() {
    return paymentConfig.getAvailableBanks().length;
  }

  /**
   * Payment proof upload confirmation
   */
  static paymentProofReceived(orderId) {
    return Messages.payment.proof.received(orderId);
  }

  /**
   * Payment proof invalid (not an image)
   */
  static paymentProofInvalid() {
    return Messages.payment.proof.invalid();
  }

  /**
   * Payment proof rejected by admin
   */
  static paymentProofRejected(orderId, reason) {
    return Messages.payment.proof.rejected(orderId, reason);
  }

  /**
   * Admin notification for proof upload
   */
  static adminPaymentProofNotification(orderId, customerId, productName, totalIDR, proofPath) {
    return Messages.payment.adminNotification.proofUploaded(orderId, customerId, productName, totalIDR, proofPath);
  }
}

module.exports = PaymentMessages;
