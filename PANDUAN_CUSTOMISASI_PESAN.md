# 📝 Panduan Customisasi Pesan - Centralized Messages System

**Terakhir Update:** November 12, 2025 (Refactored - Split to 2 files)  
**File Utama:** `lib/messages.customer.js` & `lib/messages.admin.js`  
**Status:** ✅ Production Ready

---

## 🎯 Tujuan

SEMUA pesan customer, admin, dan payment sekarang terpusat di **2 file** (refactored):  
📁 `lib/messages.customer.js` - Customer & payment messages  
📁 `lib/messages.admin.js` - Admin messages only

**Keuntungan Refactor:**

- ✅ File lebih kecil & mudah dicari (1000 → 700 + 300 lines)
- ✅ Separation of concerns (customer vs admin)
- ✅ Tidak perlu scroll panjang
- ✅ Format konsisten
- ✅ Multi-language ready
- ✅ Lebih mudah maintain

---

## 📂 Struktur File (After Refactor)

```
lib/
├── messages.customer.js       ← EDIT customer & payment (1007 lines)
├── messages.admin.js          ← EDIT admin messages (309 lines)
├── messages.customer.js         ← Main export (45 lines) - AUTO
├── uiMessages.js              ← Proxy (155 lines) - JANGAN EDIT
├── paymentMessages.js         ← Proxy (191 lines) - JANGAN EDIT
└── paymentHandlers.js         ← Logic only
```

**⚠️ PENTING:**

- Edit **customer/payment** pesan di: **messages.customer.js**
- Edit **admin** pesan di: **messages.admin.js**
- JANGAN edit: messages.customer.js (auto-export), uiMessages.js, paymentMessages.js

---

## 🏗️ Struktur Messages

### 📁 messages.customer.js (1007 lines)

```javascript
const CustomerMessages = {
  // 💳 Payment Messages (24 functions)
  payment: {
    qris: { auto(), manual() },
    ewallet: { redirect(), manual(), notAvailable() },
    bank: { selection(), manual(), failed(), invalidChoice() },
    va: { instructions() },
    selection: { menu(), invalidChoice(), notAvailable() },
    status: { pending(), success(), expired(), failed(), awaiting() },
    proof: { received(), invalid(), rejected() },
    error: { generic(), noInvoice(), checkFailed() },
  },

  // 🛍️ Customer Messages (30+ functions)
  customer: {
    menu: { main(), help(), about(), contact() },
    product: { added(), notFound(), browsingInstructions() },
    cart: { view(), empty(), cleared(), checkoutPrompt() },
    wishlist: { view(), empty() },
    order: { summary(), list(), empty() },
    error: { invalidOption(), sessionExpired(), rateLimitExceeded() },
    system: { awaitingApproval() },
  },

  // 🎨 Format Helpers
  format: {
    separator: { short, medium, long },
    box: { simple(), fancy() },
    currency(),
    datetime(),
    emoji: { success, error, money, cart, ... },
  },
};
```

### 📁 messages.admin.js (309 lines)

```javascript
const AdminMessages = {
  // 🔐 Authentication
  auth: {
    unauthorized(),
  },

  // 📦 Order Management
  order: {
    approvalFormatInvalid(),
    notFound(),
    notPending(),
    deliveryFailed(),
    approvalSuccess(),
  },

  // 🔔 Admin Notifications
  adminNotification: {
    newOrder(),
    proofUploaded(),
    lowStock(),
    stockEmpty(),
    dailyReport(),
  },

  // 📈 Statistics
  stats: {
    help(),
  },
};
```

---

## 📖 Cara Customisasi Pesan

### 🎯 Quick Guide: Edit Mana?

| Mau Edit Apa?                       | File                   | Contoh                       |
| ----------------------------------- | ---------------------- | ---------------------------- |
| Payment messages (QRIS, bank, etc.) | `messages.customer.js` | "Transfer ke rekening..."    |
| Customer UI (menu, cart, wishlist)  | `messages.customer.js` | "Selamat datang di..."       |
| Admin notifications                 | `messages.admin.js`    | "Order baru!", "Stock habis" |
| Admin commands response             | `messages.admin.js`    | "/approve success"           |
| Format helpers (emoji, currency)    | `messages.customer.js` | Currency format, box         |

**💡 Tips:**

- 95% edit akan di `messages.customer.js` (payment & UI)
- `messages.admin.js` hanya untuk admin internal messages
- Gunakan Ctrl+F untuk cari pesan yang mau diedit

---

### 1️⃣ Edit Greeting Main Menu

**File:** `lib/messages.customer.js`  
**Lokasi:** Search "main menu" (Ctrl+F)

```javascript
// BEFORE:
main: (shopName) =>
  `🛍️ *${shopName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━

Halo! Mau belanja apa hari ini?`,

// AFTER (Custom):
main: (shopName) =>
  `🛍️ *${shopName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━

Selamat datang! Ada yang bisa kami bantu?`,
```

**Restart bot:**

```bash
pm2 restart whatsapp-bot
```

---

### 2️⃣ Edit Cart Empty Message

**Lokasi:** Baris ~730

```javascript
// BEFORE:
empty: () =>
  `🛒 *Keranjang kosong*

Yuk mulai belanja! 🛍️`,

// AFTER (Custom):
empty: () =>
  `🛒 *Keranjang masih kosong nih!*

Yuk cari produk favorit kamu! 🎁`,
```

---

### 3️⃣ Edit Payment Success Message

**Lokasi:** Baris ~355

```javascript
// BEFORE:
success: (orderId, paymentMethod, deliveryMessage) =>
  `✅ *PEMBAYARAN BERHASIL!* 🎉

📋 Order ID: ${orderId}
💳 Metode: ${paymentMethod}`,

// AFTER (Custom):
success: (orderId, paymentMethod, deliveryMessage) =>
  `🎉 *TRANSAKSI SUKSES!*

ID Pesanan: ${orderId}
Via: ${paymentMethod}`,
```

---

### 4️⃣ Edit Product Added Message

**Lokasi:** Baris ~637

```javascript
// BEFORE:
added: (productName, priceIDR) =>
  `✅ *DITAMBAHKAN!*

📦 ${productName}
💰 Rp ${priceIDR.toLocaleString("id-ID")}`,

// AFTER (Custom):
added: (productName, priceIDR) =>
  `🎉 *BERHASIL DITAMBAHKAN!*

🛍️ ${productName}
💵 Rp ${priceIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━
💡 Tip: Ketik 'cart' untuk checkout`,
```

---

### 5️⃣ Edit Header Box Format

**Lokasi:** Baris ~1047

```javascript
// CURRENT (Compact):
simple: (emoji, title) =>
  `${emoji} *${title}*
━━━━━━━━━━━━━━━━━━`,

// ALTERNATIVE (Fancy):
simple: (emoji, title) =>
  `╔═══════════════════════╗
║  ${emoji} *${title}*  ║
╚═══════════════════════╝`,
```

**⚠️ Catatan:** Fancy box lebih bagus tapi lebih panjang. Compact lebih mobile-friendly.

---

## 🎨 Contoh Customisasi Lengkap

### Scenario: Brand Voice Lebih Friendly

```javascript
// File: lib/messages.customer.js

// 1. Main menu greeting (lebih ramah)
main: (shopName) =>
  `🎉 *Hai dari ${shopName}!*
━━━━━━━━━━━━━━━━━━

Seneng banget kamu mampir!
Ada yang bisa kami bantuin? 😊

🎯 *MENU UTAMA*

1️⃣ 🛍️ *Belanja* - Lihat produk
2️⃣ 🛒 *Keranjang* - Cek order
3️⃣ ⭐ *Favorit* - Wishlist
4️⃣ 📞 *Bantuan* - Chat admin

━━━━━━━━━━━━━━━━━━

💬 *Quick:* cart • wishlist • track
💡 Stock realtime • 6 payment`,

// 2. Product not found (lebih helpful)
notFound: (input = "") => {
  const searchText = input ? `"${input}"` : "";
  return `🔍 *Oops! ${searchText} ga ketemu*

━━━━━━━━━━━━━━━━━━

*Coba tips ini:*
1️⃣ Cek ejaan (typo kali?)
2️⃣ Ketik *browse* untuk
   lihat semua produk
3️⃣ Contoh: netflix, spotify

━━━━━━━━━━━━━━━━━━
💬 *help* • 🏠 *menu*`;
},

// 3. Cart empty (lebih encouraging)
empty: () =>
  `🛒 *Keranjang masih kosong nih!*

Yuk mulai belanja! 🎁
Banyak produk keren menanti! ✨

🎯 *browse* → Lihat produk
⭐ *wishlist* → Cek favorit
🏠 *menu* → Menu utama

━━━━━━━━━━━━━━━━━━
💡 Auto-delivery & 100% original!`,
```

---

## 🚀 Workflow Customisasi

### Step-by-step:

**1. Backup dulu (opsional)**

```bash
cp lib/messages.customer.js lib/messages.customer.js.backup
```

**2. Edit file**

```bash
nano lib/messages.customer.js
# atau
code lib/messages.customer.js  # VS Code
```

**3. Cari pesan yang mau diubah**

- Gunakan Ctrl+F untuk search
- Lihat function name di struktur di atas

**4. Edit pesan**

- Jangan hapus `${variable}` placeholders
- Pastikan format tetap konsisten
- Gunakan \n untuk new line

**5. Save file**

- Ctrl+O (nano)
- Ctrl+S (VS Code)

**6. Test di local (opsional)**

```bash
npm start
# Coba command yang diubah
```

**7. Restart bot**

```bash
pm2 restart whatsapp-bot
```

**8. Test di production**

- Kirim pesan ke bot
- Verify pesan sudah berubah

---

## ⚠️ Hal Yang HARUS Diperhatikan

### 1. Jangan Hapus Variables

```javascript
// ❌ SALAH:
added: (productName, priceIDR) =>
  `✅ DITAMBAHKAN!

  Produk sudah masuk cart`,  // Ga ada productName & priceIDR

// ✅ BENAR:
added: (productName, priceIDR) =>
  `✅ DITAMBAHKAN!

  📦 ${productName}
  💰 Rp ${priceIDR.toLocaleString("id-ID")}`,
```

### 2. Jaga Konsistensi Format

```javascript
// ❌ SALAH (separator beda-beda):
message += "─────────\n"; // 9 chars
message += "━━━━━━━━━━━━\n"; // 12 chars

// ✅ BENAR (konsisten):
message += Messages.format.separator.short; // 18 chars
```

### 3. Emoji Boleh Diubah

```javascript
// Boleh ganti emoji sesuai selera:
simple: (emoji, title) => `${emoji} *${title}*`,
  // Usage:
  Messages.format.box.simple("🔥", "HOT DEALS");
Messages.format.box.simple("💎", "PREMIUM");
Messages.format.box.simple("🎁", "PROMO");
```

### 4. Test Setelah Edit

**Minimal test:**

- ✅ Menu utama (ketik: menu)
- ✅ Browse produk (ketik: browse)
- ✅ Add to cart (ketik nama produk)
- ✅ View cart (ketik: cart)
- ✅ Checkout flow

---

## 🎨 Template Brand Voice

### Casual & Friendly

```javascript
"Hai kak! Mau belanja apa hari ini? 😊";
"Wah, produknya udah masuk cart nih! 🎉";
"Yuk langsung checkout! Tinggal klik *cart* 🛒";
```

### Professional & Formal

```javascript
"Selamat datang. Silakan pilih menu.";
"Produk telah ditambahkan ke keranjang Anda.";
"Untuk melanjutkan, silakan ketik *cart*.";
```

### Fun & Energetic

```javascript
"Halo Shoppers! 🛍️ Ready to shop? 🔥";
"YEAY! Produkmu udah di cart! 🎉🎊";
"Buruan checkout sebelum kehabisan! ⚡";
```

---

## 📊 Quick Reference

| Pesan             | Lokasi (Baris) | Function                      |
| ----------------- | -------------- | ----------------------------- |
| Main Menu         | ~537           | `customer.menu.main()`        |
| Help              | ~549           | `customer.menu.help()`        |
| About             | ~609           | `customer.menu.about()`       |
| Contact           | ~637           | `customer.menu.contact()`     |
| Product Added     | ~655           | `customer.product.added()`    |
| Product Not Found | ~673           | `customer.product.notFound()` |
| Cart View         | ~698           | `customer.cart.view()`        |
| Empty Cart        | ~730           | `customer.cart.empty()`       |
| Wishlist View     | ~810           | `customer.wishlist.view()`    |
| Order Summary     | ~853           | `customer.order.summary()`    |
| Payment Success   | ~355           | `payment.status.success()`    |
| QRIS Auto         | ~39            | `payment.qris.auto()`         |
| Bank Transfer     | ~235           | `payment.bank.manual()`       |

**Full list:** Lihat di `lib/messages.customer.js` (sudah ada comment di tiap function)

---

## 🔧 Troubleshooting

### Pesan tidak berubah setelah edit?

**Solusi:**

```bash
# 1. Pastikan file sudah save
cat lib/messages.customer.js | grep "teks yang diubah"

# 2. Restart bot
pm2 restart whatsapp-bot

# 3. Clear cache (optional)
pm2 flush whatsapp-bot

# 4. Test lagi
```

### Error setelah edit?

**Solusi:**

```bash
# 1. Check syntax error
npm run lint

# 2. Restore backup jika ada
cp lib/messages.customer.js.backup lib/messages.customer.js

# 3. Restart bot
pm2 restart whatsapp-bot
```

### Placeholder tidak tampil (${variable})?

**Penyebab:** Salah ketik variable name

**Solusi:**

```javascript
// ❌ SALAH:
`Produk: ${produkName}` // ✅ BENAR: // Typo: produkName
`Produk: ${productName}`; // Sesuai parameter
```

---

## 📝 Changelog

**November 12, 2025:**

- ✅ Semua pesan dipindah ke messages.customer.js
- ✅ uiMessages.js & paymentMessages.js jadi proxy
- ✅ Header box format compact (emoji + title)
- ✅ 60+ message functions centralized
- ✅ Multi-language ready structure

**Stats:**

- Before: 1273 lines across 3 files
- After: 1098 lines in 1 file (messages.customer.js)
- Reduction: ~62% in proxy files

---

## 🎯 Best Practices

1. **Backup sebelum edit besar**

   ```bash
   cp lib/messages.customer.js lib/messages.customer.js.$(date +%Y%m%d)
   ```

2. **Edit bertahap, test per section**

   - Edit 1 kategori (contoh: customer.menu)
   - Test
   - Lanjut ke kategori berikutnya

3. **Gunakan format helpers**

   ```javascript
   Messages.format.currency(15800); // "Rp 15.800"
   Messages.format.separator.short; // "━━━━━━━━━━━━━━━━━━"
   ```

4. **Konsisten dengan brand voice**

   - Tentukan tone (casual/professional/fun)
   - Apply ke semua pesan
   - Jaga konsistensi emoji

5. **Test di staging dulu (if possible)**
   - Clone bot di nomor lain
   - Test customisasi
   - Baru apply ke production

---

## 📞 Support

**Butuh bantuan?**

- Check dokumentasi: `docs/`
- Check code examples di messages.customer.js
- Test dengan `npm start` di local
- Restore backup jika error

**File penting:**

- `lib/messages.customer.js` - EDIT DI SINI
- `lib/uiMessages.js` - Proxy only
- `lib/paymentMessages.js` - Proxy only
- `.backup/` - Backup files

---

**🎉 Selamat Customizing!**

Semua pesan sekarang di 1 tempat. Edit sesuka hati, restart bot, done! ✨
