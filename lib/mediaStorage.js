/**
 * Media Storage Service - Cloudinary Integration
 * Handles image uploads for QRIS and payment proofs
 * 
 * Free Tier: 25GB bandwidth/month, 25 credits/month
 * Perfect for Heroku ephemeral filesystem
 */

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

class MediaStorage {
  constructor() {
    // Configure Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      
      this.enabled = true;
      console.log("✅ Cloudinary configured:", process.env.CLOUDINARY_CLOUD_NAME);
    } else {
      this.enabled = false;
      console.log("⚠️  Cloudinary not configured (optional for local dev)");
    }
  }

  /**
   * Check if Cloudinary is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Upload QRIS static image to Cloudinary
   * @param {string} filePath - Local path to QRIS image
   * @returns {Promise<string>} - Cloudinary URL
   */
  async uploadQRIS(filePath) {
    if (!this.enabled) {
      console.log("⚠️  Cloudinary disabled, using local file");
      return filePath;
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "qris",
        public_id: "qris-static",
        overwrite: true, // Replace existing
        resource_type: "image",
      });

      console.log("✅ QRIS uploaded to Cloudinary:", result.secure_url);
      return result.secure_url;
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error.message);
      return filePath; // Fallback to local
    }
  }

  /**
   * Upload payment proof to Cloudinary
   * @param {string} filePath - Local path to payment proof
   * @param {string} orderId - Order ID for identification
   * @returns {Promise<string>} - Cloudinary URL
   */
  async uploadPaymentProof(filePath, orderId) {
    if (!this.enabled) {
      console.log("⚠️  Cloudinary disabled, using local file");
      return filePath;
    }

    try {
      // Extract filename
      const timestamp = Date.now();
      const publicId = `${orderId}-${timestamp}`;

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "payment_proofs",
        public_id: publicId,
        resource_type: "image",
      });

      console.log(`✅ Payment proof uploaded: ${publicId}`);
      
      // Delete local file after upload (save disk space on Heroku)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Local file deleted: ${filePath}`);
      }

      return result.secure_url;
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error.message);
      return filePath; // Fallback to local
    }
  }

  /**
   * Get QRIS URL from Cloudinary
   * @returns {string} - Cloudinary URL or local fallback
   */
  getQRISUrl() {
    if (!this.enabled) {
      return "assets/qris/qris-static.jpg";
    }

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/qris/qris-static.jpg`;
  }

  /**
   * Upload file from buffer (for WhatsApp media)
   * @param {Buffer} buffer - File buffer
   * @param {string} filename - Filename
   * @param {string} folder - Cloudinary folder
   * @returns {Promise<string>} - Cloudinary URL
   */
  uploadFromBuffer(buffer, filename, folder = "temp") {
    if (!this.enabled) {
      // Save to local disk
      const localPath = `./temp/${filename}`;
      fs.writeFileSync(localPath, buffer);
      return localPath;
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            public_id: filename,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error("❌ Buffer upload error:", error.message);
      throw error;
    }
  }

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @param {string} folder - Folder name
   */
  async deleteFile(publicId, folder) {
    if (!this.enabled) return;

    try {
      const fullId = `${folder}/${publicId}`;
      await cloudinary.uploader.destroy(fullId);
      console.log(`🗑️  Deleted from Cloudinary: ${fullId}`);
    } catch (error) {
      console.error("❌ Cloudinary delete error:", error.message);
    }
  }

  /**
   * List all files in a folder
   * @param {string} folder - Folder name
   * @returns {Promise<Array>} - List of resources
   */
  async listFiles(folder) {
    if (!this.enabled) return [];

    try {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: folder,
        max_results: 500,
      });

      return result.resources;
    } catch (error) {
      console.error("❌ Cloudinary list error:", error.message);
      return [];
    }
  }
}

module.exports = MediaStorage;
