/**
 * 🎯 CENTRALIZED MESSAGES - MAIN EXPORT
 * 
 * ⚠️ REFACTORED - File ini sekarang split menjadi 2 file:
 * 
 * 📁 lib/messages.customer.js - Customer & payment messages (~700 lines)
 * 📁 lib/messages.admin.js - Admin messages only (~200 lines)
 * 
 * File ini hanya export kombinasi keduanya untuk backward compatibility.
 * 
 * 📖 CARA EDIT:
 * ✅ Edit customer/payment messages → lib/messages.customer.js
 * ✅ Edit admin messages → lib/messages.admin.js
 * ❌ JANGAN edit file ini (auto-generated export)
 * 
 * After edit:
 * 1. Save file yang diedit
 * 2. Restart bot: pm2 restart whatsapp-bot
 * 
 * Last Updated: November 12, 2025 (Refactored - Split to 2 files)
 */

const CustomerMessages = require('./messages.customer');
const AdminMessages = require('./messages.admin');

/**
 * Main Messages object - combines customer & admin messages
 * 
 * Structure:
 * - payment: Payment messages (from customer)
 * - customer: Customer UI messages (from customer)
 * - admin: Admin messages (from admin)
 * - format: Format helpers (from customer)
 */
const Messages = {
  // From messages.customer.js
  payment: CustomerMessages.payment,
  customer: CustomerMessages.customer,
  format: CustomerMessages.format,

  // From messages.admin.js
  admin: AdminMessages,
};

module.exports = Messages;
