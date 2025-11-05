/**
 * Smoke Tests for XenditService
 * Basic coverage for payment integration
 */

const XenditService = require("../../../services/xenditService");

// Mock axios
jest.mock("axios");
const axios = require("axios");

describe("XenditService", () => {
  let xenditService;

  beforeEach(() => {
    process.env.XENDIT_SECRET_KEY = "xnd_test_key";
    xenditService = new XenditService();
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("should initialize with API key", () => {
      expect(xenditService.apiKey).toBe("xnd_test_key");
    });
  });

  describe("createQRISInvoice()", () => {
    test("should create QRIS invoice successfully", async () => {
      axios.post.mockResolvedValue({
        data: {
          id: "qr_123",
          qr_string: "00020101021126",
          amount: 15000,
          status: "ACTIVE",
        },
      });

      const result = await xenditService.createQRISInvoice("ORD-123", 15000);

      expect(result.success).toBe(true);
      expect(result.qrCode).toBeDefined();
    });

    test("should handle API errors", async () => {
      axios.post.mockRejectedValue(new Error("API Error"));

      const result = await xenditService.createQRISInvoice("ORD-123", 15000);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("createInvoice()", () => {
    test("should create standard invoice", async () => {
      axios.post.mockResolvedValue({
        data: {
          id: "inv_123",
          invoice_url: "https://invoice.xendit.co/web/inv_123",
          amount: 15000,
          status: "PENDING",
        },
      });

      const result = await xenditService.createInvoice("ORD-123", 15000, "customer@example.com");

      expect(result.success).toBe(true);
      expect(result.invoiceUrl).toBeDefined();
    });
  });

  describe("getInvoiceStatus()", () => {
    test("should get invoice status", async () => {
      axios.get.mockResolvedValue({
        data: {
          id: "inv_123",
          status: "PAID",
          amount: 15000,
        },
      });

      const result = await xenditService.getInvoiceStatus("inv_123");

      expect(result.success).toBe(true);
      expect(result.status).toBe("PAID");
    });
  });
});
