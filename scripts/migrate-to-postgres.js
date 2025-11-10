/**
 * Migration Script: products_data/*.txt → PostgreSQL
 * Reads all .txt files and populates database
 * 
 * Usage:
 *   node scripts/migrate-to-postgres.js
 * 
 * Requirements:
 *   - DATABASE_URL env variable set (Heroku provides this)
 *   - products_data/*.txt files present
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function migrateProductData() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 PostgreSQL Migration - Products Data");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected");
    console.log("");

    // Get all .txt files in products_data/
    const dataDir = path.join(__dirname, "../products_data");
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".txt") && !f.includes("README"));

    console.log(`📁 Found ${files.length} product files`);
    console.log("");

    let totalCredentials = 0;

    // Process each file
    for (const file of files) {
      const productId = file.replace(".txt", "");
      const filePath = path.join(dataDir, file);
      
      console.log(`📝 Processing: ${productId}`);

      // Read file content
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content
        .split("\n")
        .map(l => l.trim())
        .filter(l => l && !l.startsWith("#")); // Skip comments and empty lines

      if (lines.length === 0) {
        console.log(`   ⚠️  No credentials found (file is empty or all comments)`);
        continue;
      }

      // Insert credentials
      let inserted = 0;
      for (const credential of lines) {
        try {
          await pool.query(
            `INSERT INTO product_credentials (product_id, credential, sold)
             VALUES ($1, $2, FALSE)
             ON CONFLICT DO NOTHING`,
            [productId, credential]
          );
          inserted++;
          totalCredentials++;
        } catch (error) {
          console.log(`   ❌ Error inserting credential: ${error.message}`);
        }
      }

      console.log(`   ✅ Inserted ${inserted}/${lines.length} credentials`);
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Migration Complete!`);
    console.log(`   Total credentials: ${totalCredentials}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");

    // Show stock summary
    console.log("📊 Stock Summary:");
    const result = await pool.query(`
      SELECT * FROM v_product_stock ORDER BY category, name
    `);

    console.table(result.rows);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrateProductData()
    .then(() => {
      console.log("✅ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

module.exports = migrateProductData;
