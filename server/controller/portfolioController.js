const { Portfolio, User } = require('../models/index');
const { Op } = require('sequelize');

// Get all portfolios for a specific user
const getUserPortfolios = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: portfolios } = await Portfolio.findAndCountAll({
      where: { user_id: userId },
      order: [
        ['display_order', 'ASC'],
        ['created_at', 'DESC']
      ],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      count: portfolios.length,
      totalCount: count,
      totalPages,
      currentPage: page,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching user portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
};

// Get single portfolio by ID
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email']
        }
      ]
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
};

// Create new portfolio
const createPortfolio = async (req, res) => {
  try {
    const { user_id, portfolio_url, technologies } = req.body;

    // Validation
    if (!user_id || !portfolio_url || !technologies) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: user_id, portfolio_url, technologies'
      });
    }

    // Validate technologies is an array
    if (!Array.isArray(technologies) || technologies.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Technologies must be a non-empty array'
      });
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(portfolio_url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid portfolio URL format'
      });
    }

    // Get the highest display_order for this user and increment
    const maxOrder = await Portfolio.max('display_order', {
      where: { user_id }
    });
    const display_order = (maxOrder || 0) + 1;

    const portfolio = await Portfolio.create({
      user_id,
      portfolio_url,
      technologies,
      display_order
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
};

// Update portfolio
const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { portfolio_url, technologies } = req.body;

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Validate technologies if provided
    if (technologies !== undefined) {
      if (!Array.isArray(technologies) || technologies.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Technologies must be a non-empty array'
        });
      }
    }

    // Validate URL if provided
    if (portfolio_url) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(portfolio_url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid portfolio URL format'
        });
      }
    }

    // Update only provided fields
    const updateData = {};
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url;
    if (technologies !== undefined) updateData.technologies = technologies;

    await portfolio.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
};

// Delete portfolio
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    await portfolio.destroy();

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
};

// Reorder portfolios
const reorderPortfolios = async (req, res) => {
  try {
    const { portfolios } = req.body; // Array of { id, display_order }

    if (!Array.isArray(portfolios) || portfolios.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Portfolios array is required'
      });
    }

    // Update each portfolio's display_order
    const updatePromises = portfolios.map(item =>
      Portfolio.update(
        { display_order: item.display_order },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Portfolios reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder portfolios',
      error: error.message
    });
  }
};

// Get all portfolios (Admin only)
const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email']
        }
      ],
      order: [
        ['created_at', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching all portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
};

module.exports = {
  getUserPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  reorderPortfolios,
  getAllPortfolios
};
