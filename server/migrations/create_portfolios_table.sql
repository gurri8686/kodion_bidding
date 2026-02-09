-- =====================================================
-- Portfolio Management System - Database Migration
-- =====================================================
-- Description: Creates portfolios table with user relationship
-- Created: 2025-12-22
-- =====================================================

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  portfolio_url VARCHAR(500) NOT NULL,
  technologies JSON NOT NULL COMMENT 'Array of technology names, e.g., ["React", "Node.js", "MongoDB"]',
  image_url VARCHAR(500) COMMENT 'Optional screenshot or preview image URL',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0 COMMENT 'For custom sorting of portfolios',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_portfolio_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if table was created successfully
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'portfolios';

-- View table structure
DESCRIBE portfolios;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample data
/*
INSERT INTO portfolios (user_id, title, description, portfolio_url, technologies, image_url) VALUES
(1, 'E-Commerce Platform', 'Full-stack e-commerce application with payment integration', 'https://example.com/ecommerce', '["React", "Node.js", "MongoDB", "Stripe"]', 'https://example.com/images/ecommerce.png'),
(1, 'Task Management App', 'Real-time collaborative task management system', 'https://example.com/taskmanager', '["Vue.js", "Firebase", "Tailwind CSS"]', NULL),
(1, 'Portfolio Website', 'Personal portfolio showcasing projects and skills', 'https://example.com/portfolio', '["Next.js", "TypeScript", "Prisma"]', 'https://example.com/images/portfolio.png');
*/

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================

-- Uncomment below to drop the table
-- DROP TABLE IF EXISTS portfolios;
