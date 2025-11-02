/**
 * Test Admin Settings Feature
 * Tests: /settings command
 */

const ChatbotLogic = require("../chatbotLogic");
const SessionManager = require("../sessionManager");
const { getSetting, getAllSettings } = require("../config");

// Set admin number for testing
process.env.ADMIN_NUMBER_1 = "6281234567890";

async function testAdminSettings() {
  console.log("🧪 Testing Admin Settings Feature\n");

  const sessionManager = new SessionManager();
  await sessionManager.initialize();

  const chatbot = new ChatbotLogic(sessionManager);
  const adminId = "6281234567890@c.us";
  const nonAdminId = "6289999999999@c.us";

  let passCount = 0;
  let failCount = 0;

  // Test 1: View all settings
  console.log("--- Test 1: View All Settings ---");
  try {
    const response = await chatbot.processMessage(adminId, "/settings");

    if (
      response.includes("SYSTEM SETTINGS") &&
      response.includes("usdToIdrRate")
    ) {
      console.log("✅ PASS: Settings displayed");
      passCount++;
    } else {
      console.log("❌ FAIL: Settings not displayed correctly");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 2: View settings help
  console.log("\n--- Test 2: View Settings Help ---");
  try {
    const response = await chatbot.processMessage(adminId, "/settings help");

    if (
      response.includes("SETTINGS GUIDE") &&
      response.includes("Available Settings")
    ) {
      console.log("✅ PASS: Settings help displayed");
      passCount++;
    } else {
      console.log("❌ FAIL: Settings help not displayed");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 3: Update currency rate
  console.log("\n--- Test 3: Update USD to IDR Rate ---");
  try {
    const oldRate = getSetting("usdToIdrRate");
    const response = await chatbot.processMessage(
      adminId,
      "/settings usdToIdrRate 16000"
    );
    const newRate = getSetting("usdToIdrRate");

    if (response.includes("Setting Berhasil Diupdate") && newRate === 16000) {
      console.log("✅ PASS: Currency rate updated");
      console.log(`   Old: ${oldRate}, New: ${newRate}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Currency rate not updated");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 4: Update session timeout
  console.log("\n--- Test 4: Update Session Timeout ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings sessionTimeout 45"
    );
    const newTimeout = getSetting("sessionTimeout");

    if (response.includes("Setting Berhasil Diupdate") && newTimeout === 45) {
      console.log("✅ PASS: Session timeout updated");
      console.log(`   New timeout: ${newTimeout} minutes`);
      passCount++;
    } else {
      console.log("❌ FAIL: Session timeout not updated");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 5: Update boolean setting (maintenanceMode)
  console.log("\n--- Test 5: Update Maintenance Mode ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings maintenanceMode true"
    );
    const maintenanceMode = getSetting("maintenanceMode");

    if (
      response.includes("Setting Berhasil Diupdate") &&
      maintenanceMode === true
    ) {
      console.log("✅ PASS: Maintenance mode enabled");
      passCount++;
    } else {
      console.log("❌ FAIL: Maintenance mode not enabled");
      failCount++;
    }

    // Reset to false
    await chatbot.processMessage(adminId, "/settings maintenanceMode false");
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 6: Update auto delivery setting
  console.log("\n--- Test 6: Update Auto Delivery Setting ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings autoDeliveryEnabled true"
    );
    const autoDelivery = getSetting("autoDeliveryEnabled");

    if (
      response.includes("Setting Berhasil Diupdate") &&
      autoDelivery === true
    ) {
      console.log("✅ PASS: Auto delivery enabled");
      passCount++;
    } else {
      console.log("❌ FAIL: Auto delivery not enabled");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 7: Update low stock threshold
  console.log("\n--- Test 7: Update Low Stock Threshold ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings lowStockThreshold 10"
    );
    const threshold = getSetting("lowStockThreshold");

    if (response.includes("Setting Berhasil Diupdate") && threshold === 10) {
      console.log("✅ PASS: Low stock threshold updated");
      console.log(`   New threshold: ${threshold}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Low stock threshold not updated");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 8: Update rate limit
  console.log("\n--- Test 8: Update Max Messages Per Minute ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings maxMessagesPerMinute 30"
    );
    const rateLimit = getSetting("maxMessagesPerMinute");

    if (response.includes("Setting Berhasil Diupdate") && rateLimit === 30) {
      console.log("✅ PASS: Rate limit updated");
      console.log(`   New limit: ${rateLimit} msg/min`);
      passCount++;
    } else {
      console.log("❌ FAIL: Rate limit not updated");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 9: Invalid setting key
  console.log("\n--- Test 9: Invalid Setting Key ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings invalidKey 123"
    );

    if (response.includes("tidak ditemukan")) {
      console.log("✅ PASS: Invalid key rejected");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject invalid key");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 10: Invalid value type (string for number)
  console.log("\n--- Test 10: Invalid Value Type ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/settings usdToIdrRate abc"
    );

    if (response.includes("Nilai harus berupa angka")) {
      console.log("✅ PASS: Invalid value type rejected");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject non-numeric value");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 11: Non-admin access
  console.log("\n--- Test 11: Non-Admin Access (should fail) ---");
  try {
    const response = await chatbot.processMessage(nonAdminId, "/settings");

    if (
      response.includes("Tidak diizinkan") ||
      response.includes("khusus admin")
    ) {
      console.log("✅ PASS: Non-admin blocked");
      passCount++;
    } else {
      console.log("❌ FAIL: Non-admin should be blocked");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 12: Verify all settings are accessible
  console.log("\n--- Test 12: Verify All Settings Accessible ---");
  try {
    const allSettings = getAllSettings();
    const requiredKeys = [
      "usdToIdrRate",
      "sessionTimeout",
      "maxMessagesPerMinute",
      "shopName",
      "autoDeliveryEnabled",
      "maintenanceMode",
      "lowStockThreshold",
    ];

    const allKeysPresent = requiredKeys.every((key) => key in allSettings);

    if (allKeysPresent) {
      console.log("✅ PASS: All required settings present");
      console.log(`   Total settings: ${Object.keys(allSettings).length}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Some settings missing");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 TEST SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Passed: ${passCount}/12`);
  console.log(`❌ Failed: ${failCount}/12`);
  console.log(`📈 Success Rate: ${((passCount / 12) * 100).toFixed(1)}%`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (failCount === 0) {
    console.log("🎉 ALL TESTS PASSED! Admin settings feature working!");
  } else {
    console.log("⚠️  Some tests failed. Please review the code.");
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
testAdminSettings().catch((error) => {
  console.error("❌ Test suite error:", error);
  process.exit(1);
});
