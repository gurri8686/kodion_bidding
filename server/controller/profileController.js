const { v4: uuidv4 } = require('uuid');
const Profiles = require('../models/Profiles');

// Get all developers
exports.getAllProfileNames = async (req, res) => {
    try {
        const profiles = await Profiles.findAll();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profiles', details: error.message });
    }
};
