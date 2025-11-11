# 📱 Admin Commands - Quick Reference

**Format WhatsApp-friendly untuk copy-paste**

---

## 🎯 COMMAND CEPAT

### 📦 Manajemen Produk

```
/addproduct <id>|<name>|<price>|<desc>|<stock>|<category>
```
Contoh:
```
/addproduct canva|Canva Pro|15000|Design tool premium|20|premium
```

---

```
/editproduct <id>|<field>|<value>
```
Contoh:
```
/editproduct netflix|price|18000
/editproduct spotify|name|Spotify Family Premium
```

---

```
/removeproduct <id>
```
Contoh:
```
/removeproduct hbo
```

---

```
/stock
/stock <id> <jumlah>
```
Contoh:
```
/stock
/stock netflix 50
```

---

```
/newproduct <id> <name> <price> [desc]
```
Contoh:
```
/newproduct youtube-premium "YouTube Premium" 20000 "Ad-free + Music"
```

---

```
/refreshproducts
```

---

### 💳 Manajemen Order

```
/approve <order_id>
```
Contoh:
```
/approve ORD-1730123456789-6281234567890
```

---

### 📊 Statistik & Monitoring

```
/stats
/stats <days>
```
Contoh:
```
/stats
/stats 30
```

---

```
/paymentstats
/paymentstats <days>
```
Contoh:
```
/paymentstats
/paymentstats 7
```

---

```
/status
```

---

### 📢 Komunikasi

```
/broadcast <pesan>
```
Contoh:
```
/broadcast 🎉 PROMO HARI INI! 
Diskon 20% semua produk premium!
Gunakan kode: PROMO20
```

---

### ⚙️ Settings

```
/settings
/settings <key> <value>
```
Contoh:
```
/settings
/settings shopName "Toko Voucher Premium"
/settings sessionTimeout 45
```

---

## 📋 CHEAT SHEET - COPY SEMUA

```
=== PRODUK ===
/addproduct id|nama|harga|desk|stok|kategori
/editproduct id|field|value
/removeproduct id
/stock
/stock id jumlah
/newproduct id nama harga
/refreshproducts

=== ORDER ===
/approve order_id

=== STATS ===
/stats
/stats 30
/paymentstats
/paymentstats 7
/status

=== KOMUNIKASI ===
/broadcast pesan

=== SETTINGS ===
/settings
/settings key value
```

---

## 💡 TIPS CEPAT

**Tambah Produk Baru:**
```
/newproduct disney-plus "Disney+ Hotstar" 25000
```

**Update Harga:**
```
/editproduct netflix|price|19000
```

**Cek Stok Semua:**
```
/stock
```

**Tambah Stok:**
```
/stock netflix 100
```

**Approve Pembayaran:**
```
/approve ORD-1730123456789-6281234567890
```

**Broadcast Promo:**
```
/broadcast 🔥 FLASH SALE! 
Netflix Premium cuma 15rb!
Stok terbatas, buruan order!
```

**Lihat Statistik 7 Hari:**
```
/stats 7
```

**Analytics Payment:**
```
/paymentstats 30
```

---

## 🚀 WORKFLOW HARIAN

**Pagi (09:00):**
```
/stock
/stats
```

**Siang (12:00 & 17:00):**
```
/approve <order_id>
/approve <order_id>
```

**Malam (21:00):**
```
/stats
/paymentstats
```

**Mingguan (Senin):**
```
/stats 7
/paymentstats 7
/stock
```

---

## ⚡ SHORTCUT COMMANDS

| Command | Fungsi |
|---------|--------|
| `/stock` | Cek semua stok |
| `/stats` | Statistik hari ini |
| `/status` | Status bot |
| `/settings` | Lihat semua setting |
| `/refreshproducts` | Reload produk |

---

**Last Updated:** November 12, 2025  
**Version:** 2.0 (WhatsApp-Friendly)
