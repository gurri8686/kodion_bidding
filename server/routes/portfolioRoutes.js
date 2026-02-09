const express = require('express');
const authenticate = require('../middleware/middleware');
const {
  getUserPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  reorderPortfolios,
  getAllPortfolios
} = require('../controller/portfolioController');

const router = express.Router();

// Get all portfolios (Admin only)
router.get('/portfolios/all', authenticate, getAllPortfolios);

// Get all portfolios for a user
router.get('/portfolios/user/:userId', authenticate, getUserPortfolios);

// Get single portfolio by ID
router.get('/portfolios/:id', authenticate, getPortfolioById);

// Create new portfolio
router.post('/portfolios', authenticate, createPortfolio);

// Update portfolio
router.put('/portfolios/:id', authenticate, updatePortfolio);

// Delete portfolio
router.delete('/portfolios/:id', authenticate, deletePortfolio);

// Reorder portfolios
router.patch('/portfolios/reorder', authenticate, reorderPortfolios);

module.exports = router;
