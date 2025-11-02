/**
 * Wishlist Feature Tests
 * Tests wishlist/favorites functionality
 */

const SessionManager = require("../sessionManager");
const WishlistService = require("../src/services/wishlist/WishlistService");
const CustomerHandler = require("../src/handlers/CustomerHandler");
const { getProductById } = require("../config");

// Mock payment handlers
const mockPaymentHandlers = {
  xendit: { createQRIS: async () => ({ success: false }) },
  manualQRIS: { getQRIS: async () => ({ success: false }) },
};

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🧪 WISHLIST FEATURE TESTS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Test setup
const sessionManager = new SessionManager();
const wishlistService = new WishlistService(sessionManager);
const customerHandler = new CustomerHandler(
  sessionManager,
  mockPaymentHandlers
);

// Test customer IDs
const customerId1 = "6281234567890@c.us";
const customerId2 = "6289876543210@c.us";

// Test products
const netflixProduct = getProductById("netflix");
const spotifyProduct = getProductById("spotify");

let passedTests = 0;
let totalTests = 0;

/**
 * Test utility
 */
function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Async test utility
 */
async function asyncTest(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  // ============================================
  // 1. WishlistService Tests
  // ============================================
  console.log("\n📦 WishlistService Tests\n");

  await asyncTest("Should add product to wishlist", async () => {
    const result = await wishlistService.addProduct(
      customerId1,
      netflixProduct
    );
    if (!result.success) throw new Error("Failed to add product");
    if (result.wishlistCount !== 1)
      throw new Error(`Expected count 1, got ${result.wishlistCount}`);
  });

  await asyncTest("Should not add duplicate product", async () => {
    const result = await wishlistService.addProduct(
      customerId1,
      netflixProduct
    );
    if (result.success) throw new Error("Should not allow duplicate");
    if (!result.message.includes("sudah ada"))
      throw new Error("Wrong error message");
  });

  await asyncTest("Should get wishlist items", async () => {
    const wishlist = await wishlistService.getWishlist(customerId1);
    if (wishlist.length !== 1)
      throw new Error(`Expected 1 item, got ${wishlist.length}`);
    if (wishlist[0].id !== "netflix")
      throw new Error(`Expected netflix, got ${wishlist[0].id}`);
  });

  await asyncTest("Should get wishlist count", async () => {
    const count = await wishlistService.getWishlistCount(customerId1);
    if (count !== 1) throw new Error(`Expected count 1, got ${count}`);
  });

  await asyncTest("Should check if product in wishlist", async () => {
    const inWishlist = await wishlistService.isInWishlist(
      customerId1,
      "netflix"
    );
    if (!inWishlist) throw new Error("Product should be in wishlist");

    const notInWishlist = await wishlistService.isInWishlist(
      customerId1,
      "spotify"
    );
    if (notInWishlist) throw new Error("Product should not be in wishlist");
  });

  await asyncTest("Should add second product to wishlist", async () => {
    const result = await wishlistService.addProduct(
      customerId1,
      spotifyProduct
    );
    if (!result.success) throw new Error("Failed to add second product");
    if (result.wishlistCount !== 2)
      throw new Error(`Expected count 2, got ${result.wishlistCount}`);
  });

  await asyncTest("Should move wishlist item to cart", async () => {
    const result = await wishlistService.moveToCart(customerId1, "netflix");
    if (!result.success) throw new Error("Failed to move to cart");

    // Check wishlist count decreased
    const wishlist = await wishlistService.getWishlist(customerId1);
    if (wishlist.length !== 1)
      throw new Error(`Expected 1 item in wishlist, got ${wishlist.length}`);

    // Check cart has item
    const session = await sessionManager.getSession(customerId1);
    if (session.cart.length !== 1)
      throw new Error(`Expected 1 item in cart, got ${session.cart.length}`);
    if (session.cart[0].id !== "netflix")
      throw new Error(`Expected netflix in cart, got ${session.cart[0].id}`);
  });

  await asyncTest("Should not move already-in-cart item", async () => {
    const result = await wishlistService.moveToCart(customerId1, "netflix");
    if (result.success)
      throw new Error("Should not allow moving item already in cart");
  });

  await asyncTest("Should remove product from wishlist", async () => {
    const result = await wishlistService.removeProduct(customerId1, "spotify");
    if (!result.success) throw new Error("Failed to remove product");
    if (result.wishlistCount !== 0)
      throw new Error(`Expected count 0, got ${result.wishlistCount}`);
  });

  await asyncTest("Should handle removing non-existent product", async () => {
    const result = await wishlistService.removeProduct(
      customerId1,
      "nonexistent"
    );
    if (result.success)
      throw new Error("Should not succeed removing non-existent product");
  });

  await asyncTest("Should clear entire wishlist", async () => {
    // Add some products first
    await wishlistService.addProduct(customerId1, netflixProduct);
    await wishlistService.addProduct(customerId1, spotifyProduct);

    const result = await wishlistService.clearWishlist(customerId1);
    if (!result.success) throw new Error("Failed to clear wishlist");
    if (result.wishlistCount !== 0)
      throw new Error(`Expected count 0, got ${result.wishlistCount}`);

    const wishlist = await wishlistService.getWishlist(customerId1);
    if (wishlist.length !== 0)
      throw new Error(`Wishlist should be empty, has ${wishlist.length} items`);
  });

  // ============================================
  // 2. CustomerHandler Tests
  // ============================================
  console.log("\n👤 CustomerHandler Tests\n");

  await asyncTest("Should handle 'simpan <product>' command", async () => {
    const response = await customerHandler.handleAddToWishlist(
      customerId2,
      "simpan netflix"
    );
    if (!response.includes("ditambahkan ke wishlist"))
      throw new Error("Wrong response message");

    const wishlist = await wishlistService.getWishlist(customerId2);
    if (wishlist.length !== 1)
      throw new Error(`Expected 1 item, got ${wishlist.length}`);
  });

  await asyncTest("Should handle '⭐ <product>' command", async () => {
    const response = await customerHandler.handleAddToWishlist(
      customerId2,
      "⭐ spotify"
    );
    if (!response.includes("ditambahkan ke wishlist"))
      throw new Error("Wrong response message");

    const wishlist = await wishlistService.getWishlist(customerId2);
    if (wishlist.length !== 2)
      throw new Error(`Expected 2 items, got ${wishlist.length}`);
  });

  await asyncTest("Should handle fuzzy product matching", async () => {
    const response = await customerHandler.handleAddToWishlist(
      customerId2,
      "simpan netflx"
    );
    // Should still work due to fuzzy matching, but duplicate
    if (!response.includes("sudah ada"))
      throw new Error("Should detect duplicate");
  });

  await asyncTest("Should handle invalid product name", async () => {
    const response = await customerHandler.handleAddToWishlist(
      customerId2,
      "simpan nonexistentproduct123"
    );
    if (!response.includes("tidak ditemukan"))
      throw new Error("Should show not found message");
  });

  await asyncTest("Should handle empty product name", async () => {
    const response = await customerHandler.handleAddToWishlist(
      customerId2,
      "simpan "
    );
    if (!response.includes("tidak boleh kosong"))
      throw new Error("Should show empty error");
  });

  await asyncTest("Should handle invalid format", async () => {
    const response = await customerHandler.handleAddToWishlist(
      customerId2,
      "invalid format"
    );
    if (!response.includes("Format salah"))
      throw new Error("Should show format error");
  });

  await asyncTest("Should view wishlist via handler", async () => {
    const response = await customerHandler.handleViewWishlist(customerId2);
    if (!response.includes("Wishlist Anda"))
      throw new Error("Wrong response format");
    if (!response.includes("netflix"))
      throw new Error("Should include product name");
  });

  await asyncTest("Should view empty wishlist", async () => {
    const response = await customerHandler.handleViewWishlist(customerId1);
    if (!response.includes("masih kosong"))
      throw new Error("Should show empty message");
  });

  await asyncTest("Should remove from wishlist via handler", async () => {
    const response = await customerHandler.handleRemoveFromWishlist(
      customerId2,
      "netflix"
    );
    if (!response.includes("dihapus dari wishlist"))
      throw new Error("Wrong response message");

    const wishlist = await wishlistService.getWishlist(customerId2);
    if (wishlist.length !== 1)
      throw new Error(`Expected 1 item, got ${wishlist.length}`);
  });

  await asyncTest("Should move to cart via handler", async () => {
    const response = await customerHandler.handleMoveToCart(
      customerId2,
      "spotify"
    );
    if (!response.includes("dipindahkan ke keranjang"))
      throw new Error("Wrong response message");

    const wishlist = await wishlistService.getWishlist(customerId2);
    if (wishlist.length !== 0)
      throw new Error(`Expected 0 items, got ${wishlist.length}`);

    const session = await sessionManager.getSession(customerId2);
    if (session.cart.length !== 1)
      throw new Error(`Expected 1 item in cart, got ${session.cart.length}`);
  });

  // ============================================
  // 3. Session Isolation Tests
  // ============================================
  console.log("\n🔒 Session Isolation Tests\n");

  await asyncTest("Customer wishlists should be isolated", async () => {
    // Reset and add different products to each customer
    await wishlistService.clearWishlist(customerId1);
    await wishlistService.clearWishlist(customerId2);

    await wishlistService.addProduct(customerId1, netflixProduct);
    await wishlistService.addProduct(customerId2, spotifyProduct);

    const wishlist1 = await wishlistService.getWishlist(customerId1);
    const wishlist2 = await wishlistService.getWishlist(customerId2);

    if (wishlist1.length !== 1)
      throw new Error(`Customer 1: Expected 1 item, got ${wishlist1.length}`);
    if (wishlist2.length !== 1)
      throw new Error(`Customer 2: Expected 1 item, got ${wishlist2.length}`);

    if (wishlist1[0].id === wishlist2[0].id)
      throw new Error("Wishlists should have different products");
  });

  // ============================================
  // 4. Edge Cases
  // ============================================
  console.log("\n⚠️  Edge Case Tests\n");

  await asyncTest("Should handle non-existent customer", async () => {
    const wishlist = await wishlistService.getWishlist("invalid@c.us");
    if (wishlist.length !== 0) throw new Error("Should return empty array");
  });

  await asyncTest("Should handle product with special characters", async () => {
    const specialProduct = {
      id: "test-special",
      name: "Test $pecial & Product",
      price: 1,
      description: "Test",
    };

    const result = await wishlistService.addProduct(
      customerId1,
      specialProduct
    );
    if (!result.success) throw new Error("Failed to add special product");
  });

  await asyncTest("Should preserve wishlist on cart operations", async () => {
    await wishlistService.clearWishlist(customerId1);
    await sessionManager.clearCart(customerId1);

    await wishlistService.addProduct(customerId1, netflixProduct);
    await wishlistService.addProduct(customerId1, spotifyProduct);

    // Add one to cart via addToCart (not moveToCart)
    await sessionManager.addToCart(customerId1, netflixProduct);

    // Wishlist should still have 2 items
    const wishlist = await wishlistService.getWishlist(customerId1);
    if (wishlist.length !== 2)
      throw new Error(
        `Wishlist should be preserved, expected 2, got ${wishlist.length}`
      );
  });

  // ============================================
  // Test Summary
  // ============================================
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 TEST SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`
  );

  if (passedTests === totalTests) {
    console.log("✅ ALL WISHLIST TESTS PASSED!");
    process.exit(0);
  } else {
    console.log("❌ SOME TESTS FAILED");
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("\n❌ Test suite error:", error);
  process.exit(1);
});
