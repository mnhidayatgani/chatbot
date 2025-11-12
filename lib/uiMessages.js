/**
 * UI Messages & Templates
 * 
 * ⚠️ DEPRECATED: This file now uses centralized messages.config.js
 * Edit messages in: lib/messages.config.js instead
 * 
 * This file is kept for backward compatibility only.
 * All messages are now proxied to messages.config.js
 */

const config = require("../src/config/app.config");
const Messages = require("./messages.config");

class UIMessages {
  /**
   * Main menu
   */
  static mainMenu() {
    const shopName = config.shop.name;
    return Messages.customer.menu.main(shopName);
  }

  /**
   * Help command - Full command reference
   */
  static helpCommand() {
    return Messages.customer.menu.help();
  }

  /**
   * Product added to cart
   */
  static productAdded(productName, priceIDR) {
    return Messages.customer.product.added(productName, priceIDR);
  }

  /**
   * Product browsing instructions
   */
  static browsingInstructions(productList) {
    return Messages.customer.product.browsingInstructions(productList);
  }

  /**
   * Cart view
   */
  static cartView(cart, total) {
    return Messages.customer.cart.view(cart, total);
  }

  /**
   * Order summary
   */
  static orderSummary(orderId, cart, totalIDR, promoCode = null, discountAmount = 0) {
    return Messages.customer.order.summary(orderId, cart, totalIDR, promoCode, discountAmount);
  }

  /**
   * About page
   */
  static about() {
    const shopName = config.shop.name;
    return Messages.customer.menu.about(shopName);
  }

  /**
   * Contact page
   */
  static contact() {
    const supportWhatsapp = config.shop.supportWhatsapp;
    const workingHours = config.shop.workingHours;
    return Messages.customer.menu.contact(supportWhatsapp, workingHours);
  }

  /**
   * Error messages
   */
  static invalidOption() {
    return Messages.customer.error.invalidOption();
  }

  static productNotFound(input = "") {
    return Messages.customer.product.notFound(input);
  }

  static emptyCart() {
    return Messages.customer.cart.empty();
  }

  static cartCleared() {
    return Messages.customer.cart.cleared();
  }

  static checkoutPrompt() {
    return Messages.customer.cart.checkoutPrompt();
  }

  /**
   * Admin messages
   */
  static unauthorized() {
    return Messages.admin.auth.unauthorized();
  }

  static adminApprovalFormat() {
    return Messages.admin.order.approvalFormatInvalid();
  }

  static orderNotFound(orderId) {
    return Messages.admin.order.notFound(orderId);
  }

  static orderNotPending(orderId) {
    return Messages.admin.order.notPending(orderId);
  }

  static deliveryFailed(orderId) {
    return Messages.admin.order.deliveryFailed(orderId);
  }

  static approvalSuccess(orderId) {
    return Messages.admin.order.approvalSuccess(orderId);
  }

  /**
   * Waiting messages
   */
  static awaitingAdminApproval() {
    return Messages.customer.system.awaitingApproval();
  }

  /**
   * Order list view (for /track command)
   */
  static orderList(orders) {
    if (!orders || orders.length === 0) {
      return Messages.customer.order.empty();
    }
    return Messages.customer.order.list(orders);
  }

  /**
   * Wishlist view
   * @param {Array} wishlist - Array of wishlist items
   * @returns {string} Formatted wishlist message
   */
  static wishlistView(wishlist) {
    if (!wishlist || wishlist.length === 0) {
      return Messages.customer.wishlist.empty();
    }
    return Messages.customer.wishlist.view(wishlist);
  }
}

module.exports = UIMessages;
