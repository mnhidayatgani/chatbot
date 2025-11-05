/**
 * Unit Tests for FuzzySearch Utility
 * Tests fuzzy matching and Levenshtein distance algorithm
 */

const FuzzySearch = require('../../../src/utils/FuzzySearch');

describe('FuzzySearch', () => {
  let products;

  beforeEach(() => {
    products = [
      { id: 'netflix', name: 'Netflix Premium', price: 50000 },
      { id: 'spotify', name: 'Spotify Premium', price: 30000 },
      { id: 'youtube', name: 'YouTube Premium', price: 40000 },
      { id: 'disney', name: 'Disney+ Hotstar', price: 45000 },
      { id: 'vcc-basic', name: 'VCC Basic', price: 20000 },
      { id: 'vcc-premium', name: 'VCC Premium', price: 35000 }
    ];
  });

  describe('search()', () => {
    test('should find exact match by ID', () => {
      const result = FuzzySearch.search(products, 'netflix');

      expect(result).toBeDefined();
      expect(result.id).toBe('netflix');
    });

    test('should find exact match by name', () => {
      const result = FuzzySearch.search(products, 'Spotify Premium');

      expect(result).toBeDefined();
      expect(result.name).toBe('Spotify Premium');
    });

    test('should be case-insensitive for exact match', () => {
      const result = FuzzySearch.search(products, 'NETFLIX');

      expect(result).toBeDefined();
      expect(result.id).toBe('netflix');
    });

    test('should find partial match (contains)', () => {
      const result = FuzzySearch.search(products, 'spot');

      expect(result).toBeDefined();
      expect(result.id).toBe('spotify');
    });

    test('should find fuzzy match with typo', () => {
      const result = FuzzySearch.search(products, 'netflx'); // Missing 'i'

      expect(result).toBeDefined();
      expect(result.id).toBe('netflix');
    });

    test('should find fuzzy match with multiple typos', () => {
      const result = FuzzySearch.search(products, 'spotfy'); // Missing 'i'

      expect(result).toBeDefined();
      expect(result.id).toBe('spotify');
    });

    test('should return null when no match found', () => {
      const result = FuzzySearch.search(products, 'nonexistent');

      expect(result).toBeNull();
    });

    test('should return null when distance exceeds threshold', () => {
      const result = FuzzySearch.search(products, 'xyz123', 2);

      expect(result).toBeNull();
    });

    test('should use custom threshold', () => {
      const result = FuzzySearch.search(products, 'yt', 10); // Very loose

      expect(result).toBeDefined();
    });

    test('should prefer exact match over partial match', () => {
      const customProducts = [
        { id: 'premium', name: 'Premium Account' },
        { id: 'netflix-premium', name: 'Netflix Premium' }
      ];

      const result = FuzzySearch.search(customProducts, 'premium');

      expect(result.id).toBe('premium');
    });

    test('should prefer partial match over fuzzy match', () => {
      const result = FuzzySearch.search(products, 'tube'); // Partial of 'YouTube'

      expect(result.id).toBe('youtube');
    });

    test('should handle empty query', () => {
      const result = FuzzySearch.search(products, '');

      expect(result).toBeNull();
    });

    test('should handle empty products array', () => {
      const result = FuzzySearch.search([], 'netflix');

      expect(result).toBeNull();
    });

    test('should handle single character query', () => {
      const result = FuzzySearch.search(products, 'n', 5);

      expect(result).toBeDefined();
    });

    test('should match VCC products with hyphen', () => {
      const result = FuzzySearch.search(products, 'vcc-basic');

      expect(result).toBeDefined();
      expect(result.id).toBe('vcc-basic');
    });

    test('should match VCC products without hyphen', () => {
      const result = FuzzySearch.search(products, 'vcc premium');

      expect(result).toBeDefined();
      expect(result.id).toBe('vcc-premium');
    });
  });

  describe('levenshteinDistance()', () => {
    test('should return 0 for identical strings', () => {
      const distance = FuzzySearch.levenshteinDistance('netflix', 'netflix');

      expect(distance).toBe(0);
    });

    test('should return 1 for single character difference', () => {
      const distance = FuzzySearch.levenshteinDistance('cat', 'bat');

      expect(distance).toBe(1);
    });

    test('should calculate insertion distance', () => {
      const distance = FuzzySearch.levenshteinDistance('cat', 'cats');

      expect(distance).toBe(1);
    });

    test('should calculate deletion distance', () => {
      const distance = FuzzySearch.levenshteinDistance('cats', 'cat');

      expect(distance).toBe(1);
    });

    test('should calculate substitution distance', () => {
      const distance = FuzzySearch.levenshteinDistance('cat', 'cut');

      expect(distance).toBe(1);
    });

    test('should handle completely different strings', () => {
      const distance = FuzzySearch.levenshteinDistance('abc', 'xyz');

      expect(distance).toBe(3);
    });

    test('should handle empty strings', () => {
      const distance = FuzzySearch.levenshteinDistance('', '');

      expect(distance).toBe(0);
    });

    test('should handle empty vs non-empty string', () => {
      const distance = FuzzySearch.levenshteinDistance('', 'abc');

      expect(distance).toBe(3);
    });

    test('should be case-sensitive', () => {
      const distance = FuzzySearch.levenshteinDistance('ABC', 'abc');

      expect(distance).toBe(3);
    });

    test('should handle long strings efficiently', () => {
      const str1 = 'a'.repeat(100);
      const str2 = 'b'.repeat(100);

      const start = Date.now();
      const distance = FuzzySearch.levenshteinDistance(str1, str2);
      const duration = Date.now() - start;

      expect(distance).toBe(100);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('similarityRatio()', () => {
    test('should return 1.0 for identical strings', () => {
      const ratio = FuzzySearch.similarityRatio('netflix', 'netflix');

      expect(ratio).toBe(1.0);
    });

    test('should return 0.0 for completely different strings', () => {
      const str1 = 'abc';
      const str2 = 'xyz';
      const ratio = FuzzySearch.similarityRatio(str1, str2);

      expect(ratio).toBe(0.0);
    });

    test('should return value between 0 and 1', () => {
      const ratio = FuzzySearch.similarityRatio('netflix', 'netflx');

      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(1);
    });

    test('should handle empty strings', () => {
      const ratio = FuzzySearch.similarityRatio('', '');

      expect(ratio).toBe(1.0);
    });

    test('should calculate ratio for similar strings', () => {
      const ratio = FuzzySearch.similarityRatio('spotify', 'spotfy');

      expect(ratio).toBeGreaterThan(0.8);
    });

    test('should handle one empty string', () => {
      const ratio = FuzzySearch.similarityRatio('abc', '');

      expect(ratio).toBe(0.0);
    });
  });

  describe('findMatches()', () => {
    test('should find multiple matches', () => {
      const matches = FuzzySearch.findMatches(products, 'premium', 0.3);

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
    });

    test('should return matches sorted by similarity', () => {
      const matches = FuzzySearch.findMatches(products, 'netflix', 0.3);

      expect(matches[0].similarity).toBeGreaterThanOrEqual(matches[1]?.similarity || 0);
    });

    test('should include similarity scores', () => {
      const matches = FuzzySearch.findMatches(products, 'netflix');

      expect(matches[0]).toHaveProperty('product');
      expect(matches[0]).toHaveProperty('similarity');
      expect(typeof matches[0].similarity).toBe('number');
    });

    test('should filter by minimum similarity', () => {
      const matches = FuzzySearch.findMatches(products, 'net', 0.9);

      matches.forEach(match => {
        expect(match.similarity).toBeGreaterThanOrEqual(0.9);
      });
    });

    test('should limit results', () => {
      const matches = FuzzySearch.findMatches(products, 'premium', 0.1, 2);

      expect(matches.length).toBeLessThanOrEqual(2);
    });

    test('should return empty array when no matches', () => {
      const matches = FuzzySearch.findMatches(products, 'xyz123', 0.8);

      expect(matches).toEqual([]);
    });

    test('should handle empty products array', () => {
      const matches = FuzzySearch.findMatches([], 'netflix');

      expect(matches).toEqual([]);
    });

    test('should find exact matches with 1.0 similarity', () => {
      const matches = FuzzySearch.findMatches(products, 'netflix');

      expect(matches[0].similarity).toBe(1.0);
    });

    test('should use default parameters', () => {
      const matches = FuzzySearch.findMatches(products, 'premium');

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeLessThanOrEqual(5);
    });

    test('should handle very low similarity threshold', () => {
      const matches = FuzzySearch.findMatches(products, 'xyz', 0.0);

      expect(Array.isArray(matches)).toBe(true);
    });

    test('should handle very high similarity threshold', () => {
      const matches = FuzzySearch.findMatches(products, 'netflx', 0.99);

      expect(matches.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle products with special characters', () => {
      const specialProducts = [
        { id: 'product-1', name: 'Product #1' },
        { id: 'product@2', name: 'Product @2' }
      ];

      const result = FuzzySearch.search(specialProducts, 'product-1');

      expect(result).toBeDefined();
    });

    test('should handle Unicode characters', () => {
      const unicodeProducts = [
        { id: 'emoji', name: '😊 Premium' },
        { id: 'unicode', name: 'Üñíçödé' }
      ];

      const result = FuzzySearch.search(unicodeProducts, 'emoji');

      expect(result).toBeDefined();
    });

    test('should handle very long product names', () => {
      const longProducts = [
        { id: 'long', name: 'a'.repeat(1000) }
      ];

      const result = FuzzySearch.search(longProducts, 'a'.repeat(1000));

      expect(result).toBeDefined();
    });

    test('should handle numeric queries', () => {
      const numProducts = [
        { id: '123', name: 'Product 123' }
      ];

      const result = FuzzySearch.search(numProducts, '123');

      expect(result).toBeDefined();
    });

    test('should handle whitespace in queries', () => {
      const result = FuzzySearch.search(products, '  netflix  ');

      expect(result).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('should handle large product catalogs efficiently', () => {
      const largeProducts = Array(1000).fill(0).map((_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`
      }));

      const start = Date.now();
      const result = FuzzySearch.search(largeProducts, 'product-500');
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(500);
    });

    test('should handle findMatches efficiently', () => {
      const start = Date.now();
      const matches = FuzzySearch.findMatches(products, 'premium', 0.3, 10);
      const duration = Date.now() - start;

      expect(Array.isArray(matches)).toBe(true);
      expect(duration).toBeLessThan(100);
    });

    test('should handle multiple searches efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        FuzzySearch.search(products, 'netflix');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Integration', () => {
    test('should work with real-world product names', () => {
      const result1 = FuzzySearch.search(products, 'netflx');
      const result2 = FuzzySearch.search(products, 'spotif');
      const result3 = FuzzySearch.search(products, 'youtub');

      expect(result1.id).toBe('netflix');
      expect(result2.id).toBe('spotify');
      expect(result3.id).toBe('youtube');
    });

    test('should find best match among similar products', () => {
      const similarProducts = [
        { id: 'vcc-1', name: 'VCC Basic' },
        { id: 'vcc-2', name: 'VCC Premium' },
        { id: 'vcc-3', name: 'VCC Plus' }
      ];

      const result = FuzzySearch.search(similarProducts, 'vcc basic');

      expect(result.id).toBe('vcc-1');
    });
  });
});
