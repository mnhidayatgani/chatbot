# ❓ FAQ - Pertanyaan yang Sering Ditanyakan

**Terakhir update:** November 6, 2025

---

## 📋 Daftar Isi

1. [Mata Uang & Harga](#mata-uang--harga)
2. [Input Akun & Stok](#input-akun--stok)
3. [Virtual Credit Card (VCC)](#virtual-credit-card-vcc)
4. [Payment & Checkout](#payment--checkout)
5. [Admin Commands](#admin-commands)
6. [Troubleshooting](#troubleshooting)
7. [Sistem & Konfigurasi](#sistem--konfigurasi)

---

## 💰 Mata Uang & Harga

### Q: Mata uang apa yang dipakai sistem?

**A:** **IDR (Rupiah)** - semua harga sudah dalam Rupiah.

- ✅ Harga produk: `15800` (Rp 15.800)
- ✅ Display: Rupiah
- ✅ Payment: Rupiah
- ❌ USD dihapus dari sistem (November 6, 2025)

**Catatan:** USD hanya muncul di nama produk VCC untuk info balance (contoh: "VCC Basic ($10)")

---

### Q: Kenapa ada $ di nama VCC kalau pakai Rupiah?

**A:** Itu hanya informasi balance VCC, **bukan harga**!

**Contoh:**
- Nama produk: "Virtual Card Basic ($10)" ← Info balance
- Harga: Rp 15.800 ← Ini yang dibayar customer

---

### Q: Apakah ada konversi USD ke IDR?

**A:** **TIDAK**. Sistem sudah tidak pakai konversi USD.

- ❌ `usdToIdrRate` sudah dihapus
- ❌ `convertToIDR()` sudah dihapus
- ✅ Semua harga langsung dalam IDR

---

## 📦 Input Akun & Stok

### Q: Bagaimana cara input akun premium (Netflix, Spotify, dll)?

**A:** Ada 2 cara:

**Cara 1 - Satu per satu:**
```
/addstock netflix premium@netflix.com:Pass123!
/addstock spotify music@domain.com:Spotify456!
```

**Cara 2 - Banyak sekaligus:**
```
/addstock-bulk netflix
```
Lalu kirim list akun (satu per baris), ketik `done` kalau selesai.

**Format yang diterima:**
- `email:password` ✅
- `email|password` ✅
- `email,password` ✅

📖 **Dokumentasi lengkap:** `docs/CARA_INPUT_AKUN.md`

---

### Q: Bagaimana cek stok produk?

**A:** Ketik `/stockreport`

**Output:**
```
📊 LAPORAN STOK

🟢 netflix: 20       (Stok aman)
🟡 spotify: 4        (Stok menipis)
🔴 youtube: 0        (Stok habis)

📦 Total stok: 24
```

**Legend:**
- 🟢 Stok > 10 (Aman)
- 🟡 Stok 1-10 (Menipis)
- 🔴 Stok 0 (Habis)

---

### Q: Stok berkurang otomatis atau manual?

**A:** **Otomatis!** Sistem menggunakan FIFO (First In First Out).

**Flow:**
1. Customer checkout → Payment approved
2. Sistem ambil akun pertama dari file
3. Akun terkirim ke customer
4. Akun otomatis terhapus dari file
5. Stok berkurang 1
6. Akun tercatat di sales ledger

**Benefit:** Admin tidak perlu manual manage stok!

---

## 💳 Virtual Credit Card (VCC)

### Q: Bagaimana cara input VCC?

**A:** Format VCC: `CardNumber|CVV|ExpDate`

**Cara 1 - Single VCC:**
```
/addstock vcc-basic 4222222222222222|456|01/26
```

**Cara 2 - Bulk VCC:**
```
/addstock-bulk vcc-basic
```
Lalu kirim:
```
4222222222222222|456|01/26
4333333333333333|789|02/26
5424000000000015|123|12/25
```
Ketik `done`

**Format wajib:**
- Nomor kartu: 16 digit
- CVV: 3 digit
- Expiry: MM/YY
- Separator: `|` (pipe)

---

### Q: Apa bedanya vcc-basic dan vcc-standard?

**A:** Perbedaan ada di **balance** VCC:

| Product ID | Nama | Balance | Harga | File |
|------------|------|---------|-------|------|
| `vcc-basic` | Virtual Card Basic | $10 | Rp 15.800 | `vcc-basic.txt` |
| `vcc-standard` | Virtual Card Standard | $25 | Rp 15.800 | `vcc-standard.txt` |

**Tips:** Pisahkan file berdasarkan balance agar tidak tertukar!

---

### Q: VCC saya expired, bagaimana update?

**A:** Hapus VCC lama, input VCC baru.

**Opsi 1 - Via WhatsApp:**
```
/addstock-bulk vcc-basic
(kirim list VCC baru)
done
```

**Opsi 2 - Via SSH:**
```bash
nano products_data/vcc-basic.txt
# Edit/hapus yang expired
# Save: Ctrl+O, Enter, Ctrl+X
```

**Cek hasil:** `/stockreport`

---

## 💰 Payment & Checkout

### Q: Payment method apa saja yang tersedia?

**A:** Ada 3 kategori:

**1. QRIS (Otomatis via Xendit)**
- QR code unik per order
- Payment terverifikasi otomatis
- Produk terkirim otomatis

**2. E-Wallet (Manual)**
- DANA
- OVO
- GoPay
- ShopeePay

**3. Bank Transfer (Manual)**
- BCA
- BNI
- BRI
- Mandiri

**Konfigurasi:** Edit di file `.env` atau gunakan `/settings`

📖 **Dokumentasi lengkap:** `docs/PAYMENT_SYSTEM.md`

---

### Q: Bagaimana cara approve payment manual?

**A:** Ketik `/approve <orderId>`

**Contoh:**
```
/approve ORD-1730123456789-c.us
```

**Flow:**
1. Customer transfer → upload bukti
2. Admin cek bukti transfer
3. Admin ketik `/approve ORD-xxx`
4. Sistem kirim produk otomatis
5. Order status → completed

---

### Q: Bagaimana tracking payment analytics?

**A:** Ketik `/paymentstats [days]`

**Contoh:**
```
/paymentstats          # 7 hari terakhir
/paymentstats 30       # 30 hari terakhir
```

**Output:**
```
💳 PAYMENT ANALYTICS (7 hari)

📊 Payment Method Usage:
1. QRIS        45% (127 orders)
2. DANA        28% (79 orders)  

💰 Revenue by Method:
QRIS     ████████████ Rp 675.000 (53%)
DANA     ██████       Rp 350.000 (27%)

✅ Success Rate: 94.2%
📈 Trend: +12% vs last period
```

---

## 🔧 Admin Commands

### Q: Apa saja admin command yang tersedia?

**A:** Ada **25+ commands**. Yang paling sering dipakai:

**Inventory:**
- `/stockreport` - Cek stok semua produk
- `/addstock <id> <credentials>` - Tambah 1 akun
- `/addstock-bulk <id>` - Tambah banyak akun
- `/salesreport [days]` - Laporan penjualan

**Orders:**
- `/approve <orderId>` - Approve payment manual
- `/orders` - Lihat semua pending orders
- `/broadcast <message>` - Broadcast ke semua customer

**Analytics:**
- `/stats [days]` - Dashboard analytics
- `/paymentstats [days]` - Payment analytics

**Product Management:**
- `/newproduct <id> <name> <price>` - Quick create product
- `/refreshproducts` - Refresh product catalog

**System:**
- `/settings <key> <value>` - Update settings
- `/help` - Lihat semua commands

📖 **Dokumentasi lengkap:** `docs/ADMIN_COMMANDS.md`

---

### Q: Bagaimana cara membuat produk baru?

**A:** Ketik `/newproduct <id> <name> <price>`

**Contoh:**
```
/newproduct canva-pro "Canva Pro" 25000
```

**Sistem akan:**
1. ✅ Auto-create file `products_data/canva-pro.txt`
2. ✅ Auto-detect category (premium/vcc)
3. ✅ Auto-refresh catalog
4. ✅ Produk langsung muncul di menu

**Lalu input akun:**
```
/addstock-bulk canva-pro
(kirim list akun)
done
```

---

### Q: Command tidak berfungsi, kenapa?

**A:** Kemungkinan nomor Anda **belum jadi admin**.

**Solusi:**
1. Edit file `.env`:
```bash
ADMIN_NUMBER_1=6281234567890
ADMIN_NUMBER_2=6289876543210  # Tambah nomor baru di sini
```

2. Restart bot:
```bash
pm2 restart whatsapp-bot
```

3. Test command:
```
/stats
```

**Validasi admin:** Sistem auto-cek nomor di startup.

---

## 🔧 Troubleshooting

### Q: Bot tidak merespons pesan

**Kemungkinan penyebab & solusi:**

**1. Bot mati**
```bash
pm2 status whatsapp-bot
pm2 restart whatsapp-bot
```

**2. WhatsApp session expired**
```bash
pm2 logs whatsapp-bot
# Cek ada error "Session expired"
# Solusi: Scan QR code lagi
```

**3. Rate limit tercapai**
- Customer kirim terlalu banyak pesan (>20/menit)
- Tunggu 1 menit, coba lagi

**4. Maintenance mode aktif**
```bash
# Cek di .env
MAINTENANCE_MODE=false
```

---

### Q: Customer tidak terima produk setelah payment

**Troubleshooting:**

**1. Cek order status**
```
/orders
```

**2. Cek stok**
```
/stockreport
```

**3. Cek file produk**
```bash
cat products_data/netflix.txt
# Harus ada akun
```

**4. Manual delivery**
```
/approve <orderId>
```

**5. Cek logs**
```bash
pm2 logs whatsapp-bot --lines 50
```

---

### Q: "Invalid format" saat input akun

**A:** Cek format credentials:

**✅ Format BENAR:**
```
email@domain.com:Password123!
email@domain.com|Password123!
email@domain.com,Password123!
4222222222222222|456|01/26  (VCC)
```

**❌ Format SALAH:**
```
email password              # Tidak ada separator
email:                      # Tidak ada password
:password                   # Tidak ada email
email@domain.com : pass     # Ada spasi
```

**Rules:**
- Minimal 10 karakter total
- Ada separator: `:` atau `|` atau `,`
- Tidak ada spasi di awal/akhir

---

### Q: Test gagal, ada error

**A:** Langkah debugging:

**1. Cek error message**
```bash
npm test 2>&1 | grep "FAIL"
```

**2. Run specific test**
```bash
npm test -- tests/unit/handlers/CustomerHandler.test.js
```

**3. Check lint**
```bash
npm run lint
```

**4. Common fixes:**
- Clear cache: `npm test -- --clearCache`
- Reinstall: `rm -rf node_modules && npm install`
- Check Node version: `node -v` (should be 18+)

**5. Pre-commit checks**
```bash
npm run check  # Runs lint + test
```

---

## ⚙️ Sistem & Konfigurasi

### Q: File apa saja yang penting untuk di-backup?

**A:** Backup files berikut secara rutin:

**Critical (Daily):**
```
products_data/           # Akun & VCC
data/orders.json         # Order history
data/reviews.json        # Customer reviews
data/promos.json         # Promo codes
logs/transactions.log    # Transaction logs
.env                     # Configuration
```

**Important (Weekly):**
```
.wwebjs_auth/           # WhatsApp session
logs/                   # All logs
```

**Auto-backup script:**
```bash
bash scripts/backup-daily.sh
```

**Restore:**
```bash
# Extract backup
tar -xzf backup-2025-11-06.tar.gz

# Restore files
cp -r backup/products_data/* products_data/
```

---

### Q: Bagaimana cara monitoring sistem?

**A:** Gunakan command berikut:

**Real-time monitoring:**
```bash
pm2 monit              # CPU, memory, logs
pm2 logs whatsapp-bot  # Live logs
```

**Dashboard analytics:**
```
/stats               # System overview
/paymentstats        # Payment analytics
/salesreport         # Sales report
/stockreport         # Inventory status
```

**Health check:**
```bash
curl http://localhost:3000/health  # Webhook status
pm2 status                          # Bot status
```

---

### Q: Bagaimana update bot ke versi terbaru?

**A:** Pull update dari GitHub:

```bash
# Backup dulu
bash scripts/backup-daily.sh

# Pull latest
git pull origin main

# Install dependencies
npm install

# Run tests
npm test

# Restart bot
pm2 restart whatsapp-bot

# Monitor
pm2 logs whatsapp-bot
```

**Rollback jika ada masalah:**
```bash
git reset --hard HEAD~1
pm2 restart whatsapp-bot
```

---

### Q: Berapa banyak tests yang harus passing?

**A:** Target: **99%+ pass rate**

**Current status:**
```
Tests:       1182/1188 passing (99.5%)
Test Suites: 39/40 passing
Lint:        0 errors
```

**Pre-push requirement:**
```bash
npm run check  # Must pass before git push
```

**CI/CD blocks jika:**
- ❌ Lint errors > 0
- ❌ File size > 700 lines (in src/)
- ❌ Hardcoded secrets detected
- ❌ Test pass rate < 95%

---

### Q: Redis perlu diinstall?

**A:** **Opsional**, tapi sangat direkomendasikan untuk production.

**Tanpa Redis:**
- ✅ Stok di memory (restart = reset)
- ✅ Session di memory (restart = hilang)
- ❌ Tidak ada persistence

**Dengan Redis:**
- ✅ Stok persisted (restart = tetap ada)
- ✅ Session persisted
- ✅ Better performance
- ✅ Distributed system ready

**Install Redis:**
```bash
# Ubuntu/Debian
sudo apt install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Test
redis-cli ping  # Should return: PONG
```

**Konfigurasi di .env:**
```bash
REDIS_URL=redis://localhost:6379
```

---

### Q: Bagaimana cara menghubungi saya via WhatsApp saat task selesai?

**A:** Sistem sudah auto-detect admin number dari `.env`:

```bash
ADMIN_NUMBER_1=6285345902520
```

**Bot akan kirim notifikasi untuk:**
- ✅ Task completion
- ✅ Low stock alerts
- ✅ System errors
- ✅ Payment confirmations

**Test notification:**
```bash
node -e "
  require('dotenv').config();
  console.log('Admin:', process.env.ADMIN_NUMBER_1);
"
```

---

## 📚 Dokumentasi Tambahan

**Dokumentasi lengkap tersedia di folder `docs/`:**

| File | Topik |
|------|-------|
| `ADMIN_COMMANDS.md` | Semua admin commands |
| `CARA_INPUT_AKUN.md` | Cara input akun via WhatsApp |
| `PAYMENT_SYSTEM.md` | Payment integration guide |
| `AI_INTEGRATION.md` | AI fallback system |
| `TESTING_GUIDE.md` | Testing best practices |
| `DEPLOYMENT.md` | VPS deployment guide |
| `ARCHITECTURE.md` | System architecture |

**GitHub Copilot Instructions:**
- `.github/copilot-instructions.md` - Main index
- `.github/instructions/*.md` - Modular guides

---

## 🆘 Butuh Bantuan?

**Dalam bot:**
```
/help         # Lihat semua commands
menu          # Main menu
help          # Customer support
```

**Dokumentasi:**
- Baca file di folder `docs/`
- Cek `.github/instructions/`

**Developer:**
- GitHub Issues
- Contact admin

---

**Terakhir update:** November 6, 2025  
**Version:** 3.1 (Post USD cleanup)  
**Status:** ✅ Production Ready
