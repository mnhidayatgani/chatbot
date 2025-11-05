# WhatsApp Shopping Chatbot - Copilot Instructions

## AI Agent Guidelines

**CRITICAL - Read First:**

1. **Keep responses concise** - Save detailed summaries to agent memory instead of long replies
2. **Test Framework is Jest** - Use `describe()`, `test()`, `expect()` for all new tests (not Mocha)
3. **Reference memory** - Check `.github/memory/` for project context and previous decisions
4. **Document in memory** - Update memory with implementation summaries, not user-facing responses
5. **CHECK WORKFLOWS BEFORE PUSH** - Read `.github/memory/github-workflows-rules.md` for CI/CD requirements

**GitHub Actions Rules (MUST FOLLOW):**

- 🚨 **File size limit:** Max 700 lines per .js file in `src/` (BLOCKING CI/CD)
- 🚨 **No hardcoded secrets:** No `xnd_production`, API keys in code (BLOCKING)
- 🚨 **ESLint clean:** 0 errors required (BLOCKING)
- 🚨 **Tests passing:** All 885 Jest tests must pass (BLOCKING)
- ⚠️ **Pre-push checklist:** Run `npm run lint && npm test` locally before pushing

## Architecture Overview

This is a WhatsApp chatbot built on `whatsapp-web.js` with a stateful session manager pattern. The architecture follows **modular design principles** with clear separation of concerns - optimized for maintainability, testability, and scalability while still being VPS-friendly (1 vCPU, 2GB RAM).

**Project Structure:**

```
chatbot/
├── src/                  # NEW: Modular source code
│   ├── core/            # Framework & infrastructure
│   │   ├── WhatsAppClient.js      # WhatsApp initialization
│   │   ├── EventHandler.js        # Event management
│   │   ├── MessageDispatcher.js   # Message dispatch
│   │   ├── MessageRouter.js       # Routing logic
│   │   └── DependencyContainer.js # DI container
│   ├── handlers/        # Business logic per domain
│   │   ├── BaseHandler.js         # Abstract base class
│   │   ├── CustomerHandler.js     # Customer commands (~300 lines)
│   │   ├── AdminHandler.js        # Admin commands (~400 lines)
│   │   └── ProductHandler.js      # Product management (~250 lines)
│   ├── services/        # Domain services
│   │   ├── session/     # Session & cart services
│   │   ├── payment/     # Payment service abstractions
│   │   └── product/     # Product service operations
│   ├── models/          # Data models (Session, Product, Order)
│   ├── middleware/      # Cross-cutting concerns (rate limiting, validation)
│   ├── utils/           # Utilities (formatters, fuzzy search, constants)
│   └── config/          # Configuration split (app, products, payment)
├── index.js             # Bootstrap only (~80 lines)
├── lib/                 # Legacy: Core modules (being phased out)
├── services/            # Legacy: External integrations (being phased out)
├── tests/               # Test suites (unit + integration)
├── docs/                # Documentation including MODULARIZATION.md
└── archive/             # Old/backup files

**TOTAL: Changed from 4 large files (2,668 lines) to 16+ modular files (~150 lines each)**
```

**Core Architectural Principles:**

1. **Single Responsibility** - Each module has ONE clear purpose
2. **Dependency Injection** - Services injected, not hardcoded
3. **Separation of Concerns** - Business logic separated from infrastructure
4. **Testability** - Each module can be unit tested independently
5. **SOLID Principles** - Applied throughout the codebase

**New Modular Components:**

**Core Layer** (`src/core/`):

- `WhatsAppClient.js` - WhatsApp client lifecycle management
- `EventHandler.js` - Event listener registration and handling
- `MessageDispatcher.js` - Message receiving, filtering, and dispatch
- `MessageRouter.js` - Routes messages to appropriate handlers based on command/step
- `DependencyContainer.js` - Manages service dependencies and lifecycle

**Handler Layer** (`src/handlers/`):

- `CustomerHandler.js` - Menu, browsing, cart, checkout, order history (~570 lines)
- `AdminHandler.js` - Admin commands (approve, broadcast, stats, stock, settings) (~686 lines)
- `AdminInventoryHandler.js` - Inventory management (addstock, stockreport, salesreport) (~230 lines)
- `AdminReviewHandler.js` - Review moderation and management (~187 lines)
- `AdminAnalyticsHandler.js` - Enhanced dashboard and analytics (~150 lines)
- `ProductHandler.js` - Product management (add, edit, remove, fuzzy search)
- `CustomerWishlistHandler.js` - Wishlist features (save, view, remove) (~120 lines)
- `CustomerCheckoutHandler.js` - Checkout flow with promo codes (~280 lines)
- `BaseHandler.js` - Abstract base class with common handler functionality

**CRITICAL:** All files in `src/` must be < 700 lines (GitHub Actions requirement)

**Service Layer** (`src/services/`):

- `session/SessionService.js` - Session CRUD operations
- `session/CartService.js` - Shopping cart business logic
- `session/RedisStorage.js` - Redis persistence implementation
- `session/MemoryStorage.js` - In-memory fallback storage
- `payment/PaymentService.js` - Payment abstraction
- `payment/PaymentReminderService.js` - Automated payment reminders (cron-based)
- `product/ProductService.js` - Product operations
- `inventory/RedisStockManager.js` - Redis-backed stock tracking and validation
- `order/OrderService.js` - Order tracking and history
- `wishlist/WishlistService.js` - Wishlist/favorites management
- `review/ReviewService.js` - Product reviews and ratings
- `promo/PromoService.js` - Promo code management and validation
- `analytics/DashboardService.js` - Admin dashboard analytics and reporting
- `ai/AIService.js` - Gemini 2.5 Flash integration for typo correction and Q&A

**Configuration** (`src/config/`):

- `app.config.js` - System settings (currency, session, rate limits, features)
- `products.config.js` - Product catalog (premium accounts, virtual cards)
- `payment.config.js` - Payment accounts (e-wallet, bank transfer)

**Key insight:** Each customer's journey is tracked via a "step" (menu/browsing/checkout) that determines how their next message is interpreted. The modular architecture allows handlers to be independently tested and modified without affecting other parts of the system. The `DependencyContainer` manages service lifecycle and provides clean dependency injection.

## Development Workflow

**Running locally:**

```bash
npm install
npm start  # Displays QR code - scan with WhatsApp to link
```

**Development commands:**

```bash
npm run dev          # Start in dev mode (alias for npm start)
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm test             # Run all Jest tests with coverage
npm run test:watch   # Run tests in watch mode
npm run check        # Lint + test (pre-commit validation)
```

**Pre-push checklist:**

```bash
npm run check        # This runs lint + test
# Wait for: ✨ 0 errors, 0 warnings AND all tests passing
git add .
git commit -m "your message"
git push
```

**VPS deployment:**

- Use `install-vps.sh` for automated setup (Node.js, Chromium, dependencies)
- Use PM2 for process management: `pm2 start index.js --name whatsapp-bot`
- Sessions auto-cleanup every 10 minutes; inactive sessions expire after 30 minutes

**GitHub Actions Workflows:**

- **Quick Scan** (< 5 min): Linter, secrets check, file size check - BLOCKING
- **Deep Review** (< 15 min): Code complexity, unused deps, JSDoc - warnings only
- **AI Code Guardian** (< 2 min): AI-powered code quality review - informational

Check `.github/memory/github-workflows-rules.md` for detailed CI/CD requirements.

## Project-Specific Patterns

### Handler Delegation Pattern (CRITICAL)

AdminHandler uses **delegation to sub-handlers** to maintain <700 line limit:

```javascript
// AdminHandler.js delegates to specialized handlers
class AdminHandler extends BaseHandler {
  constructor(sessionManager, xenditService, logger) {
    super(sessionManager, logger);
    // Delegate to sub-handlers for domain separation
    this.inventoryHandler = new AdminInventoryHandler(sessionManager, logger);
    this.reviewHandler = new AdminReviewHandler(reviewService, logger);
    this.analyticsHandler = new AdminAnalyticsHandler(dashboardService, logger);
    this.orderHandler = new AdminOrderHandler(
      sessionManager,
      xenditService,
      logger
    );
    this.promoHandler = new AdminPromoHandler(
      sessionManager,
      promoService,
      logger
    );

    // Command routing map for O(1) lookup
    this.commandRoutes = this._initializeCommandRoutes();
  }

  handle(adminId, message) {
    const route = this.commandRoutes.get(command);
    if (route) {
      // Delegate to appropriate sub-handler
      return route.handler[route.method](adminId, message);
    }
  }
}
```

**When adding admin features:**

1. Check AdminHandler.js size FIRST
2. If >650 lines, create new `Admin*Handler.js`
3. Delegate in `_initializeCommandRoutes()`
4. Follow pattern: `this.reviewHandler.handleViewReviews()`

### Message Processing Flow

Messages follow a modular pipeline using the new architecture:

**Pipeline:** `MessageDispatcher` → `MessageRouter` → `Handler` → Response

1. **Dispatcher** (`src/core/MessageDispatcher.js`) - Receives WhatsApp message, filters groups/status
2. **Router** (`src/core/MessageRouter.js`) - Analyzes command type and session step
3. **Handler** (`src/handlers/*`) - Processes business logic (Customer/Admin/Product handler)
4. **Response** - Handler returns formatted message string

**Flow Details:**

1. Normalize input (lowercase, trim) in Dispatcher
2. Check for global commands (`menu`, `cart`) in Router - always accessible
3. Check for admin commands (prefix `/`) in Router - delegate to AdminHandler
4. Route to step-specific handler method based on current session step
5. Handler updates session state via SessionService
6. Handler returns response string to Dispatcher
7. Dispatcher sends reply via WhatsApp client

**Example:** When customer types "netflix" during browsing step:

- `MessageDispatcher` receives message, validates not from group
- `MessageRouter` sees step='browsing', routes to `CustomerHandler.handleProductSelection()`
- `CustomerHandler` uses `FuzzySearch` utility (in `src/utils/`) to find product
- Handler calls `CartService.add()` to add product to cart
- Handler returns confirmation message
- Dispatcher sends reply to customer

**Key Advantages of New Flow:**

- Each component has single responsibility
- Easy to test each step independently
- Easy to add middleware (logging, rate limiting, validation)
- Clear error handling boundaries
- Services are reusable across handlers

### Session State Machine

Three states in `sessionManager.js`:

- `menu` - Initial state, customer selects action (browse/cart/about/support)
- `browsing` - Customer can type product names to add to cart
- `checkout` - Customer reviews cart, can checkout or clear

**Critical:** Always call `sessionManager.setStep()` when transitioning states. The step determines which handler processes the next message.

### Product Configuration

Products in `config.js` have structure: `{ id, name, price, description, stock, category }`.

- Use `getProductById(id)` for exact matches
- `getAllProducts()` merges premium accounts + virtual cards with category labels
- Stock controlled by `DEFAULT_STOCK` and `VCC_STOCK` env vars

**Customization:** To add products, extend `products.premiumAccounts` or `products.virtualCards` arrays. Product ID must be unique and URL-safe (used for matching).

### Error Handling Pattern

All errors in `index.js` message handler:

1. Log to console with emoji prefix (❌)
2. Reply to customer with friendly message + support instructions
3. Never expose technical details to customers

### VPS Optimization

Puppeteer config in `index.js` disables GPU, 2D canvas, uses single-process mode for minimal memory footprint:

```javascript
args: [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--single-process",
  "--disable-gpu",
];
```

**Do not remove these flags** - they're essential for 2GB RAM constraint.

### AI/Gemini Integration Pattern

Uses Vercel AI SDK with Gemini 2.5 Flash Lite for intelligent features:

**AIService Pattern:**

- Rate limiting: 5 calls/hour per customer via Redis
- Cost tracking: ~$0.00005 per call (97% cheaper than GPT-4o)
- Fallback-first: Gracefully degrades if API unavailable
- Streaming support for long responses

**Integration Points:**

```javascript
// CustomerHandler - typo correction fallback
if (!product) {
  const aiSuggestion = await this.aiService.correctTypo(message, products);
  if (aiSuggestion) return aiSuggestion;
}

// AdminHandler - AI-generated descriptions
handleGenerateDescription(adminId, productName) {
  const description = await this.aiHandler.generateProductDescription(productName);
  return description;
}
```

**Configuration:** `src/config/ai.config.js`

- Enable/disable AI features globally
- Adjust rate limits, costs, model settings
- Feature toggles for typo correction, Q&A, recommendations

**Testing:** Mock AIService in tests to avoid API costs during CI/CD

## Integration Points

**WhatsApp Web Protocol:**

- Uses `whatsapp-web.js` with `LocalAuth` strategy (stores session in `.wwebjs_auth/`)
- Two authentication methods:
  - **QR Code** (default): Scan QR code with WhatsApp phone app
  - **Pairing Code**: Enter 8-digit code in WhatsApp Linked Devices (set `USE_PAIRING_CODE=true` and `PAIRING_PHONE_NUMBER` in .env)
- Pairing code format: phone number without + or spaces (e.g., `6281234567890` for Indonesia)
- Code expires every 3 minutes and auto-refreshes
- Group messages and status updates are ignored in message handler

**No external APIs:** Payment is manual (customer receives instructions at checkout). To integrate payment, modify `handleCheckout()` in `chatbotLogic.js`.

### Payment Integration Patterns

Three payment tiers supported:

**1. Automatic QRIS (Recommended for scale):**

- Integrate QRIS payment gateway API (e.g., Midtrans, Xendit, Duitku)
- In `handleCheckout()`: generate unique QRIS code per order, send image via `message.reply(MessageMedia.fromUrl(qrisUrl))`
- Add new step `'awaiting_payment'` to session state
- Poll payment status via webhook or polling interval
- Auto-deliver product on payment confirmation
- Store order ID in session: `session.orderId = response.order_id`

**2. Semi-Automatic QRIS (Static QR per e-wallet):**

- Store static QRIS images in `/assets/qris/` (dana.jpg, ovo.jpg, gopay.jpg, shopeepay.jpg)
- In `handleCheckout()`: ask customer to select e-wallet (add `'select_payment'` step)
- Send corresponding static QR: `MessageMedia.fromFilePath('./assets/qris/dana.jpg')`
- Customer sends payment proof screenshot
- Add message handler for image messages: check `message.hasMedia` and `message.type === 'image'`
- Forward to admin or store in `/payment_proofs/` for manual verification
- Admin sends confirmation command to trigger delivery

**3. Manual (Current implementation):**

- Text-based payment instructions in `handleCheckout()`
- Customer contacts admin with proof
- No automation

**Implementation example (semi-auto):**

```javascript
// In chatbotLogic.js, add to handleCheckout()
if (message === "qris") {
  this.sessionManager.setStep(customerId, "upload_proof");
  return "Please send your payment proof screenshot.";
}

// In index.js message handler, check for images
if (message.hasMedia && message.type === "image") {
  const step = sessionManager.getStep(message.from);
  if (step === "upload_proof") {
    const media = await message.downloadMedia();
    // Save: fs.writeFileSync(`./proofs/${Date.now()}.jpg`, media.data, 'base64');
    await message.reply(
      "✅ Payment proof received! Admin will verify within 5-15 minutes."
    );
    // Notify admin via another WhatsApp number or webhook
  }
}
```

## Common Modifications

**Adding a new command:**

**NEW APPROACH (Modular):**

1. **For global commands** - Add to `MessageRouter.route()` routing logic
2. **For customer commands** - Add method to `CustomerHandler` class
3. **For admin commands** - Add method to `AdminHandler` class
4. **For product commands** - Add method to `ProductHandler` class
5. **Register in DI container** if new service is needed

**Example - Add new customer command:**

```javascript
// In src/handlers/CustomerHandler.js
async handleTrackOrder(customerId, orderId) {
  const order = await this.orderService.findById(orderId);
  return UIMessages.orderTracking(order);
}

// In src/core/MessageRouter.js
if (message === 'track' || message === '/track') {
  return this.handlers.customer.handleTrackOrder(customerId, message);
}
```

**OLD APPROACH (Legacy - being phased out):**

1. Add global command check in `processMessage()` (like `menu` and `cart`)
2. Or add to step-specific handler if only available in certain states

**Changing product prices:**
Edit `config.js` price field. All prices currently $1 for simplicity.

**Modifying messages:**
All customer-facing text is in `chatbotLogic.js` methods. Use emoji heavily (matches existing style) and keep messages concise for mobile readability.

**Session timeout:**
Modify `cleanupSessions()` interval (default: 10 min) or inactivity threshold (default: 30 min) in `index.js` and `sessionManager.js`.

**Rate limiting (prevent WhatsApp bans):**
Add message throttling in `sessionManager.js`:

```javascript
// Track messages per customer
this.messageCount = new Map(); // customerId -> {count, resetTime}

canSendMessage(customerId) {
  const limit = 20; // messages per minute
  const now = Date.now();
  const data = this.messageCount.get(customerId) || {count: 0, resetTime: now + 60000};

  if (now > data.resetTime) {
    data.count = 0;
    data.resetTime = now + 60000;
  }

  if (data.count >= limit) return false;
  data.count++;
  this.messageCount.set(customerId, data);
  return true;
}
```

In `index.js`, check before replying: `if (!sessionManager.canSendMessage(customerId)) return;`

**Admin commands:**
Add admin number whitelist in `config.js`:

```javascript
const ADMIN_NUMBERS = [process.env.ADMIN_NUMBER_1, process.env.ADMIN_NUMBER_2];

function isAdmin(customerId) {
  return ADMIN_NUMBERS.includes(customerId);
}
```

Admin commands in `chatbotLogic.js`:

- `/stats` - Show active sessions count, total orders today
- `/broadcast <message>` - Send to all active customers
- `/stock <productId> <quantity>` - Update product stock
- `/approve <orderId>` - Manually approve payment
- `/ban <number>` - Block customer

Implement in `processMessage()` before normal flow:

```javascript
if (message.startsWith("/") && isAdmin(customerId)) {
  return this.handleAdminCommand(customerId, message);
}
```

**Multi-language support:**
Create `messages/` directory with language files:

- `messages/id.js` - Bahasa Indonesia (default)
- `messages/en.js` - English

Structure:

```javascript
// messages/id.js
module.exports = {
  welcome: "👋 *Selamat datang di Premium Shop!*",
  menu: "*Apa yang ingin Anda lakukan?*",
  browse: "Jelajahi Produk",
  cart: "Lihat Keranjang",
  // ...
};
```

Store language preference in session: `session.language = 'id'`
Load messages: `const msg = require(`./messages/${session.language}.js`);`
Detect language from first message or add `/language` command

## Testing Strategy

**Framework:** Jest with 885 total tests (817 passing, 68 edge case failures)

**Test Structure:**

```
tests/
├── unit/                 # Unit tests (isolated components)
│   ├── handlers/        # Handler tests (CustomerHandler, AdminHandler, etc.)
│   ├── services/        # Service tests (ProductService, ReviewService, etc.)
│   ├── utils/           # Utility tests (FuzzySearch, ValidationHelpers, etc.)
│   └── lib/             # Library tests (MessageRouter, UIMessages, etc.)
├── integration/         # Integration tests (service interactions)
└── e2e/                # End-to-end tests (complete flows)
```

**Running Tests:**

```bash
npm test              # Run all tests with coverage
npm run test:unit     # Run unit tests only
npm run test:watch    # Watch mode for development
npm run check         # Lint + test (pre-commit)
```

**Test Patterns:**

- Use AAA pattern (Arrange-Act-Assert)
- Mock external dependencies (Redis, WhatsApp client, file system)
- Test edge cases (null, undefined, empty strings, large values)
- Each new feature requires corresponding tests
- Target: 80%+ code coverage

**Example Test Structure:**

```javascript
describe("ServiceName", () => {
  let service;
  let mockDependency;

  beforeEach(() => {
    mockDependency = { method: jest.fn() };
    service = new ServiceName(mockDependency);
  });

  describe("methodName()", () => {
    test("should handle valid input", () => {
      // Arrange
      const input = "valid";
      mockDependency.method.mockReturnValue("result");

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe("expected");
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });

    test("should handle invalid input", () => {
      expect(() => service.methodName(null)).toThrow();
    });
  });
});
```

**Run tests after changes to core logic** - catches state machine errors before deployment.

## Critical Gotchas

1. **Session data is not persisted** - restarting the bot clears all carts. For production, use Redis:

   ```javascript
   // Install: npm install redis
   const redis = require('redis');
   const client = redis.createClient();

   // In sessionManager.js, replace Map with Redis:
   async getSession(customerId) {
     const data = await client.get(`session:${customerId}`);
     return data ? JSON.parse(data) : this.createSession(customerId);
   }

   async setSession(customerId, session) {
     await client.set(`session:${customerId}`, JSON.stringify(session), {
       EX: 1800 // 30 min TTL
     });
   }
   ```

   Redis auto-expires sessions and survives bot restarts.

2. **Product stock is decorative** - no enforcement. To add:
   - In `handleCheckout()`, check `product.stock > 0` before allowing purchase
   - Decrement in `config.js`: `product.stock--` after successful payment
   - Use Redis or DB for stock persistence: `await redis.decr(`stock:${productId}`)`
   - Add stock notifications: alert admin when `stock < 3`
3. **Payment is manual** - to automate delivery:
   - On payment confirmation, call `deliverProduct(customerId, productId)`
   - For accounts: read credentials from `products_data/${productId}.txt` (one per line)
   - Send to customer: `client.sendMessage(customerId, 'Your credentials:\nEmail: ...\nPassword: ...')`
   - For VCC: integrate with card issuer API or send pre-generated card details
   - Log delivery: append to `deliveries.log` for accounting
4. **WhatsApp rate limits** - Implemented! Rate limiting: 20 messages/minute per customer with auto-reset. Protects from bans.
5. **Group messages are ignored** - bot only responds to direct messages (1:1 chats).
6. **Media messages require special handling** - `message.hasMedia` must be checked separately. Download with `await message.downloadMedia()`. Send with `MessageMedia.fromFilePath(path)` or `MessageMedia.fromUrl(url)`. Supports images (QRIS), documents (invoices), audio (voice notes for support).
7. **WhatsApp Web session can expire** - monitor `disconnected` event. Implement auto-reconnect: `client.initialize()` with exponential backoff. Store QR auth in `.wwebjs_auth/` - backup this directory daily.
8. **Message order not guaranteed** - WhatsApp can deliver messages out of order under poor network. Use message IDs for idempotency: `const msgId = message.id._serialized;` Check if already processed before handling.

## File-Specific Notes

**index.js:** Entry point. Handles WhatsApp lifecycle (qr, ready, authenticated, disconnected, error events). Sets up SIGINT/SIGTERM handlers for graceful shutdown. PM2-friendly. Initializes PaymentReminderService and cleanup intervals.

**chatbotLogic.js:** Bootstrap layer that wires together handlers and services. Delegates actual business logic to modular handlers in `src/handlers/`. Routes messages through MessageRouter to appropriate handler.

**sessionManager.js:** Key-value store wrapping a Map. Every method takes customerId (phone number like "1234567890@c.us"). Auto-updates lastActivity timestamp. Includes rate limiting (20 msg/min). Session schema includes `cart: []`, `wishlist: []`, `step`, `orderId`, payment fields.

**src/handlers/BaseHandler.js:** Abstract base class providing common functionality for all handlers. Inherit from this when creating new handlers. Provides session access, logging, and error handling patterns.

**src/core/MessageRouter.js:** Central message routing logic. Analyzes message content and session state to determine which handler should process it. Critical for understanding message flow.

**lib/inputValidator.js:** Input validation and sanitization. Use this before processing any user input to prevent injection attacks and handle edge cases.

**lib/uiMessages.js:** All customer-facing message templates. Centralized for consistency and easy i18n. Heavy emoji usage for mobile-friendly readability.

## Recent Features (Phase 1 & 2)

**Phase 1: Quick Wins (✅ COMPLETE)**

- ✅ Order Tracking: `/track` command with status filters (pending, completed)
- ✅ Rate Limiting: 20 messages/minute per customer
- ✅ Auto Screenshot Detection: Image upload → Order ID prompt
- ✅ Payment Reminders: Cron job (_/15 _ \* \* \*) with 30min & 2h reminders
- ✅ Webhook Auto-Retry: Exponential backoff (1s→16s, max 5 retries)

**Phase 2: Features Delivered (✅ COMPLETE)**

- ✅ **Wishlist/Favorites:**
  - Commands: `simpan <product>` or `⭐ <product>`, `/wishlist`, `hapus <product>`
  - Storage: Session-based with Redis persistence
  - Features: Add, view, remove, move to cart
  - Tests: 25/25 passing
  - Service: `WishlistService.js` (264 lines)
- ✅ **Promo Code System:**
  - Admin: `/createpromo CODE DISCOUNT DAYS`
  - Customer: `promo CODE` during checkout
  - Features: Expiry validation, usage tracking, discount calculation
  - Service: `PromoService.js`
- ✅ **Product Reviews:**
  - Command: `/review <product> <rating> <text>`
  - Features: Star ratings (1-5), review text, average ratings in product list
  - Admin moderation: `/reviews <product>`, `/deletereview <reviewId>`
  - Service: `ReviewService.js`
- ✅ **Enhanced Admin Dashboard:**
  - Command: `/stats [days]`
  - Features: Revenue by payment method, top 5 products, retention rate, ASCII graphs
  - Service: `DashboardService.js` (401 lines)
