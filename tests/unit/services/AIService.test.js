/**
 * Smoke Tests for AIService
 * Basic coverage for Gemini integration
 */

const AIService = require("../../../../src/services/ai/AIService");

// Mock Vercel AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn().mockResolvedValue({
    text: "Suggested product name",
  }),
}));

// Mock config
jest.mock("../../../src/config/ai.config", () => ({
  AI_ENABLE: true,
  GOOGLE_API_KEY: "test_key",
  AI_RATE_LIMIT_PER_HOUR: 5,
  AI_COST_PER_CALL: 0.00005,
}));

describe("AIService", () => {
  let aiService;
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue("OK"),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
    };

    aiService = new AIService(mockRedisClient);
  });

  describe("constructor", () => {
    test("should initialize with redis client", () => {
      expect(aiService.redisClient).toBe(mockRedisClient);
    });
  });

  describe("isEnabled()", () => {
    test("should return true when AI is enabled", () => {
      expect(aiService.isEnabled()).toBe(true);
    });
  });

  describe("checkRateLimit()", () => {
    test("should allow when under rate limit", async () => {
      mockRedisClient.get.mockResolvedValue("2");

      const result = await aiService.checkRateLimit("customer123");

      expect(result.allowed).toBe(true);
    });

    test("should deny when over rate limit", async () => {
      mockRedisClient.get.mockResolvedValue("6");

      const result = await aiService.checkRateLimit("customer123");

      expect(result.allowed).toBe(false);
    });
  });

  describe("correctTypo()", () => {
    test("should suggest product when AI enabled", async () => {
      const products = [
        { name: "Netflix Premium" },
        { name: "Spotify Premium" },
      ];

      const result = await aiService.correctTypo("netflx", products);

      expect(typeof result).toBe("string");
    });

    test("should return null when AI disabled", async () => {
      aiService.aiConfig = { AI_ENABLE: false };

      const result = await aiService.correctTypo("netflx", []);

      expect(result).toBeNull();
    });
  });

  describe("getCostEstimate()", () => {
    test("should calculate cost estimate", () => {
      const cost = aiService.getCostEstimate(10);

      expect(typeof cost).toBe("number");
      expect(cost).toBeGreaterThan(0);
    });
  });
});
