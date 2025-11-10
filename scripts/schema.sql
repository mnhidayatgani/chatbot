/**
 * Database Schema for PostgreSQL
 * Run this on Heroku PostgreSQL after deployment
 * 
 * Tables:
 * - products: Product catalog
 * - product_credentials: Stock (email:password or card data)
 * - orders: Order tracking
 */

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Products Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  stock INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_enabled ON products(enabled);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Product Credentials Table (Stock)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS product_credentials (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  credential TEXT NOT NULL,
  sold BOOLEAN DEFAULT FALSE,
  order_id VARCHAR(100),
  customer_id VARCHAR(50),
  sold_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster stock queries
CREATE INDEX idx_credentials_product ON product_credentials(product_id);
CREATE INDEX idx_credentials_sold ON product_credentials(sold);
CREATE INDEX idx_credentials_order ON product_credentials(order_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Orders Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(100) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  total_idr INTEGER NOT NULL,
  total_usd DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_proof_url TEXT,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for order queries
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Order Items Table (for multiple products per order)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id),
  credential_id INTEGER REFERENCES product_credentials(id),
  price_idr INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for order items
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Insert Default Products
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO products (id, name, price, description, category) VALUES
  ('netflix', 'Netflix Premium', 15800, '4K UHD • 4 devices • 1 month', 'premium'),
  ('spotify', 'Spotify Premium', 15800, 'Ad-free • Downloads • 1 month', 'premium'),
  ('youtube', 'YouTube Premium', 15800, 'Ad-free • Downloads • 1 month', 'premium'),
  ('disney', 'Disney+ Hotstar', 15800, '4K • Downloads • 1 month', 'premium'),
  ('canva-pro', 'Canva Pro', 15800, 'Premium templates • 1 month', 'premium'),
  ('vcc-basic', 'VCC Basic ($10)', 150000, 'Virtual Credit Card • $10 balance', 'vcc'),
  ('vcc-standard', 'VCC Standard ($25)', 350000, 'Virtual Credit Card • $25 balance', 'vcc')
ON CONFLICT (id) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Update Stock Count Function
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = (
    SELECT COUNT(*) 
    FROM product_credentials 
    WHERE product_id = NEW.product_id AND sold = FALSE
  ),
  updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stock count
CREATE TRIGGER trigger_update_stock
AFTER INSERT OR UPDATE OR DELETE ON product_credentials
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Helpful Views
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Product stock summary
CREATE OR REPLACE VIEW v_product_stock AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  COUNT(c.id) FILTER (WHERE c.sold = FALSE) as available_stock,
  COUNT(c.id) FILTER (WHERE c.sold = TRUE) as sold_count,
  COUNT(c.id) as total_credentials
FROM products p
LEFT JOIN product_credentials c ON p.id = c.product_id
GROUP BY p.id, p.name, p.category, p.price
ORDER BY p.category, p.name;

-- Order summary
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
  DATE(o.created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(o.total_idr) as revenue_idr,
  COUNT(*) FILTER (WHERE o.status = 'completed') as completed,
  COUNT(*) FILTER (WHERE o.status = 'pending') as pending
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Grant Permissions (if needed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
