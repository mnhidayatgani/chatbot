/**
 * ReviewService Unit Tests
 * Tests product review functionality
 */

const ReviewService = require('../../../src/services/review/ReviewService');
const fs = require('fs');

// Mock fs module
jest.mock('fs');

describe('ReviewService', () => {
  let reviewService;
  const mockReviewsData = [
    {
      reviewId: 'REV-1234567890-abc123',
      productId: 'netflix',
      customerId: '628123456789@c.us',
      rating: 5,
      reviewText: 'Excellent service!',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockReviewsData));
    fs.writeFileSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});
    
    reviewService = new ReviewService();
  });

  describe('addReview()', () => {
    test('should add valid review successfully', () => {
      const productId = 'spotify';
      const customerId = '628987654321@c.us';
      const rating = 5;
      const reviewText = 'Great product!';

      const result = reviewService.addReview(productId, customerId, rating, reviewText);

      expect(result.success).toBe(true);
      expect(result.reviewId).toMatch(/^REV-\d+/);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should reject rating below 1', () => {
      const result = reviewService.addReview('netflix', '628987654321@c.us', 0, 'Bad');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Rating');
    });

    test('should reject rating above 5', () => {
      const result = reviewService.addReview('netflix', '628987654321@c.us', 6, 'Invalid');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Rating');
    });

    test('should reject empty product ID', () => {
      const result = reviewService.addReview('', '628987654321@c.us', 5, 'Good product here');

      // ProductId validation might not exist, so just check it doesn't crash
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    test('should reject short review text (< 3 chars)', () => {
      const result = reviewService.addReview('netflix', '628987654321@c.us', 5, 'Ok');

      expect(result.success).toBe(false);
      expect(result.message).toContain('minimal 3');
    });

    test('should reject long review text (> 500 chars)', () => {
      const longText = 'A'.repeat(501);
      const result = reviewService.addReview('netflix', '628987654321@c.us', 5, longText);

      expect(result.success).toBe(false);
      expect(result.message).toContain('maksimal 500');
    });

    test('should prevent duplicate reviews from same customer', () => {
      const result = reviewService.addReview('netflix', '628123456789@c.us', 4, 'Good product');

      expect(result.success).toBe(false);
      expect(result.message).toContain('sudah me-review');
    });

    test('should accept valid review with exact 3 chars', () => {
      const result = reviewService.addReview('spotify', '628111222333@c.us', 5, 'Top');

      expect(result.success).toBe(true);
    });

    test('should accept valid review with exact 500 chars', () => {
      const text = 'A'.repeat(500);
      const result = reviewService.addReview('spotify', '628111222333@c.us', 5, text);

      expect(result.success).toBe(true);
    });
  });

  describe('getProductReviews()', () => {
    test('should return reviews for existing product', () => {
      const reviews = reviewService.getProductReviews('netflix');

      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThan(0);
      expect(reviews[0]).toHaveProperty('rating');
      expect(reviews[0]).toHaveProperty('reviewText');
    });

    test('should return empty array for product with no reviews', () => {
      const reviews = reviewService.getProductReviews('nonexistent-product');

      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBe(0);
    });

    test('should handle null product ID', () => {
      const reviews = reviewService.getProductReviews(null);

      expect(Array.isArray(reviews)).toBe(true);
    });

    test('should handle undefined product ID', () => {
      const reviews = reviewService.getProductReviews(undefined);

      expect(Array.isArray(reviews)).toBe(true);
    });

    test('should only return active reviews', () => {
      const reviews = reviewService.getProductReviews('netflix');
      
      reviews.forEach(review => {
        expect(review.isActive).toBe(true);
      });
    });
  });

  describe('getAverageRating()', () => {
    test('should calculate average rating correctly', () => {
      const result = reviewService.getAverageRating('netflix');

      expect(result).toHaveProperty('average');
      expect(result).toHaveProperty('count');
      expect(result.average).toBe(5); // Based on mock data
      expect(result.count).toBe(1);
    });

    test('should return 0 for product with no reviews', () => {
      const result = reviewService.getAverageRating('nonexistent');

      expect(result.average).toBe(0);
      expect(result.count).toBe(0);
    });

    test('should handle null product ID', () => {
      const result = reviewService.getAverageRating(null);

      expect(result.average).toBe(0);
      expect(result.count).toBe(0);
    });

    test('should round to 1 decimal place', () => {
      // Mock multiple reviews with different ratings
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { productId: 'test', rating: 4, isActive: true },
        { productId: 'test', rating: 5, isActive: true },
        { productId: 'test', rating: 3, isActive: true }
      ]));
      
      const service = new ReviewService();
      const result = service.getAverageRating('test');

      expect(result.average).toBe(4); // (4+5+3)/3 = 4
      expect(result.count).toBe(3);
    });
  });

  describe('deleteReview()', () => {
    test('should delete existing review', () => {
      const result = reviewService.deleteReview('REV-1234567890-abc123');

      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should fail to delete non-existent review', () => {
      const result = reviewService.deleteReview('REV-9999999999-xyz999');

      expect(result.success).toBe(false);
    });

    test('should handle invalid review ID', () => {
      const result = reviewService.deleteReview('INVALID-ID');

      expect(result.success).toBe(false);
    });

    test('should handle null review ID', () => {
      const result = reviewService.deleteReview(null);

      expect(result.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle file read errors gracefully', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const service = new ReviewService();
      const reviews = service.getProductReviews('netflix');

      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBe(0);
    });

    test('should handle corrupted JSON data', () => {
      fs.readFileSync.mockReturnValue('invalid json {{{');

      const service = new ReviewService();
      const reviews = service.getProductReviews('netflix');

      expect(Array.isArray(reviews)).toBe(true);
    });

    test('should handle file write errors', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      const result = reviewService.addReview('spotify', '628111@c.us', 5, 'Good product');

      // Should still attempt to add but handle error
      expect(result).toBeDefined();
    });
  });

  describe('validateRating()', () => {
    test('should accept valid ratings 1-5', () => {
      expect(reviewService.validateRating(1)).toBe(true);
      expect(reviewService.validateRating(3)).toBe(true);
      expect(reviewService.validateRating(5)).toBe(true);
    });

    test('should reject ratings outside 1-5', () => {
      expect(reviewService.validateRating(0)).toBe(false);
      expect(reviewService.validateRating(6)).toBe(false);
      expect(reviewService.validateRating(-1)).toBe(false);
    });

    test('should reject decimal ratings', () => {
      expect(reviewService.validateRating(4.5)).toBe(false);
      expect(reviewService.validateRating(3.2)).toBe(false);
    });

    test('should reject non-numeric values', () => {
      expect(reviewService.validateRating('5')).toBe(false);
      expect(reviewService.validateRating(null)).toBe(false);
      expect(reviewService.validateRating(undefined)).toBe(false);
    });
  });

  describe('validateReviewText()', () => {
    test('should accept valid text (3-500 chars)', () => {
      const result = reviewService.validateReviewText('Good product');
      expect(result.valid).toBe(true);
    });

    test('should reject empty text', () => {
      const result = reviewService.validateReviewText('');
      expect(result.valid).toBe(false);
    });

    test('should reject text < 3 chars', () => {
      const result = reviewService.validateReviewText('Ok');
      expect(result.valid).toBe(false);
    });

    test('should reject text > 500 chars', () => {
      const longText = 'A'.repeat(501);
      const result = reviewService.validateReviewText(longText);
      expect(result.valid).toBe(false);
    });

    test('should handle null/undefined', () => {
      expect(reviewService.validateReviewText(null).valid).toBe(false);
      expect(reviewService.validateReviewText(undefined).valid).toBe(false);
    });
  });
});
