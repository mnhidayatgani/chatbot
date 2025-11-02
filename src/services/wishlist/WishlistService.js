/**
 * WishlistService.js
 *
 * Purpose: Manage customer wishlists/favorites
 * Allows customers to save products for later purchase
 *
 * Features:
 * - Add/remove products from wishlist
 * - View all wishlist items
 * - Persist wishlist data (Redis or in-memory)
 * - Integrate with cart (add wishlist item to cart)
 *
 * Storage:
 * - Stored in session object under 'wishlist' field
 * - Format: Array of product objects [{id, name, price, addedAt}]
 * - Auto-syncs with Redis if available
 *
 * @module WishlistService
 */

class WishlistService {
  /**
   * @param {Object} sessionManager - Session manager instance
   */
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  /**
   * Add product to wishlist
   * @param {string} customerId
   * @param {Object} product - Product object {id, name, price, description}
   * @returns {Object} {success: boolean, message: string, wishlistCount: number}
   */
  async addProduct(customerId, product) {
    try {
      const session = await this.sessionManager.getSession(customerId);

      // Initialize wishlist if it doesn't exist
      if (!session.wishlist) {
        session.wishlist = [];
      }

      // Check if product already in wishlist
      const existingIndex = session.wishlist.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex !== -1) {
        return {
          success: false,
          message: `❌ ${product.name} sudah ada di wishlist Anda`,
          wishlistCount: session.wishlist.length,
        };
      }

      // Add product with timestamp
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description || "",
        addedAt: Date.now(),
      };

      session.wishlist.push(wishlistItem);

      // Update session
      await this.sessionManager._updateSession(customerId, session);

      return {
        success: true,
        message: `⭐ ${product.name} ditambahkan ke wishlist!\n\nTotal wishlist: ${session.wishlist.length} produk\nKetik /wishlist untuk melihat`,
        wishlistCount: session.wishlist.length,
      };
    } catch (error) {
      console.error("❌ WishlistService.addProduct error:", error);
      return {
        success: false,
        message: "❌ Gagal menambahkan ke wishlist. Silakan coba lagi.",
        wishlistCount: 0,
      };
    }
  }

  /**
   * Remove product from wishlist
   * @param {string} customerId
   * @param {string} productId
   * @returns {Object} {success: boolean, message: string, wishlistCount: number}
   */
  async removeProduct(customerId, productId) {
    try {
      const session = await this.sessionManager.getSession(customerId);

      if (!session.wishlist || session.wishlist.length === 0) {
        return {
          success: false,
          message: "❌ Wishlist Anda kosong",
          wishlistCount: 0,
        };
      }

      const index = session.wishlist.findIndex((item) => item.id === productId);

      if (index === -1) {
        return {
          success: false,
          message: "❌ Produk tidak ditemukan di wishlist",
          wishlistCount: session.wishlist.length,
        };
      }

      const removedProduct = session.wishlist[index];
      session.wishlist.splice(index, 1);

      // Update session
      await this.sessionManager._updateSession(customerId, session);

      return {
        success: true,
        message: `✅ ${removedProduct.name} dihapus dari wishlist\n\nSisa wishlist: ${session.wishlist.length} produk`,
        wishlistCount: session.wishlist.length,
      };
    } catch (error) {
      console.error("❌ WishlistService.removeProduct error:", error);
      return {
        success: false,
        message: "❌ Gagal menghapus dari wishlist. Silakan coba lagi.",
        wishlistCount: 0,
      };
    }
  }

  /**
   * Get all wishlist items for customer
   * @param {string} customerId
   * @returns {Array} Array of wishlist items
   */
  async getWishlist(customerId) {
    try {
      const session = await this.sessionManager.getSession(customerId);
      return session.wishlist || [];
    } catch (error) {
      console.error("❌ WishlistService.getWishlist error:", error);
      return [];
    }
  }

  /**
   * Get wishlist count
   * @param {string} customerId
   * @returns {number} Number of items in wishlist
   */
  async getWishlistCount(customerId) {
    const wishlist = await this.getWishlist(customerId);
    return wishlist.length;
  }

  /**
   * Check if product is in wishlist
   * @param {string} customerId
   * @param {string} productId
   * @returns {boolean} True if product is in wishlist
   */
  async isInWishlist(customerId, productId) {
    const wishlist = await this.getWishlist(customerId);
    return wishlist.some((item) => item.id === productId);
  }

  /**
   * Clear entire wishlist
   * @param {string} customerId
   * @returns {Object} {success: boolean, message: string}
   */
  async clearWishlist(customerId) {
    try {
      const session = await this.sessionManager.getSession(customerId);
      const count = session.wishlist ? session.wishlist.length : 0;

      session.wishlist = [];

      await this.sessionManager._updateSession(customerId, session);

      return {
        success: true,
        message: `✅ Wishlist dikosongkan (${count} produk dihapus)`,
        wishlistCount: 0,
      };
    } catch (error) {
      console.error("❌ WishlistService.clearWishlist error:", error);
      return {
        success: false,
        message: "❌ Gagal mengosongkan wishlist. Silakan coba lagi.",
        wishlistCount: 0,
      };
    }
  }

  /**
   * Move wishlist item to cart
   * @param {string} customerId
   * @param {string} productId
   * @returns {Object} {success: boolean, message: string}
   */
  async moveToCart(customerId, productId) {
    try {
      const session = await this.sessionManager.getSession(customerId);

      if (!session.wishlist || session.wishlist.length === 0) {
        return {
          success: false,
          message: "❌ Wishlist Anda kosong",
        };
      }

      const index = session.wishlist.findIndex((item) => item.id === productId);

      if (index === -1) {
        return {
          success: false,
          message: "❌ Produk tidak ditemukan di wishlist",
        };
      }

      const product = session.wishlist[index];

      // Check if already in cart
      const inCart = session.cart.some((item) => item.id === product.id);
      if (inCart) {
        return {
          success: false,
          message: `❌ ${product.name} sudah ada di keranjang`,
        };
      }

      // Add to cart
      session.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
      });

      // Remove from wishlist
      session.wishlist.splice(index, 1);

      await this.sessionManager._updateSession(customerId, session);

      return {
        success: true,
        message: `✅ ${product.name} dipindahkan ke keranjang!\n\nKetik /cart untuk checkout`,
      };
    } catch (error) {
      console.error("❌ WishlistService.moveToCart error:", error);
      return {
        success: false,
        message: "❌ Gagal memindahkan ke keranjang. Silakan coba lagi.",
      };
    }
  }
}

module.exports = WishlistService;
