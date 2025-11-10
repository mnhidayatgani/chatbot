/**
 * Heroku Setup Script
 * Runs on first deployment (postdeploy hook)
 * Uploads QRIS image to Cloudinary
 */

require("dotenv").config();
const MediaStorage = require("../lib/mediaStorage");
const fs = require("fs");
const path = require("path");

async function setupHeroku() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Heroku Setup - Running postdeploy tasks...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const mediaStorage = new MediaStorage();

  // Task 1: Upload QRIS image to Cloudinary
  if (mediaStorage.isEnabled()) {
    const qrisPath = path.join(__dirname, "../assets/qris/qris-static.jpg");

    if (fs.existsSync(qrisPath)) {
      console.log("📤 Uploading QRIS image to Cloudinary...");
      try {
        const url = await mediaStorage.uploadQRIS(qrisPath);
        console.log("✅ QRIS uploaded successfully!");
        console.log(`   URL: ${url}`);
        console.log("");
        console.log("💡 Tip: Save this URL to QRIS_CLOUDINARY_URL in Heroku config");
        console.log(`   heroku config:set QRIS_CLOUDINARY_URL="${url}"`);
      } catch (error) {
        console.error("❌ QRIS upload failed:", error.message);
        console.log("⚠️  Bot will use local file as fallback");
      }
    } else {
      console.log("⚠️  QRIS image not found at:", qrisPath);
      console.log("   Upload your QRIS image manually to Cloudinary");
    }
  } else {
    console.log("⚠️  Cloudinary not configured");
    console.log("   Set CLOUDINARY_* environment variables to enable media storage");
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Heroku setup complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("Next steps:");
  console.log("1. Scale web dyno: heroku ps:scale web=1");
  console.log("2. View logs: heroku logs --tail");
  console.log("3. Open app: heroku open");
  console.log("");
}

// Run if called directly
if (require.main === module) {
  setupHeroku()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

module.exports = setupHeroku;
