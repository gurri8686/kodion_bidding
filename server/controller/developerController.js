const { v4: uuidv4 } = require('uuid');
const Developer = require('../models/Developer');

// Get all developers
exports.getAllDevelopers = async (req, res) => {
    try {
        const developers = await Developer.findAll();
        res.json(developers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch developers', details: error.message });
    }
};

exports.addDeveloper = async (req, res) => {
    try {
        const { name, email, contact } = req.body;
        const developer = await Developer.create({
            developerId: uuidv4(),
            name,
            email,
            contact
        });
        res.status(201).json(developer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add developer', details: error.message });
    }
};

// Edit a developer
exports.editDeveloper = async (req, res) => {
    try {
        const { developerId } = req.params;
        const { name, email, contact } = req.body;
        const developer = await Developer.findByPk(developerId);
        if (!developer) {
            return res.status(404).json({ error: 'Developer not found' });
        }
        developer.name = name || developer.name;
        developer.email = email || developer.email;
        developer.contact = contact || developer.contact;
        await developer.save();
        res.json(developer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update developer', details: error.message });
    }
};

// Delete a developer
exports.deleteDeveloper = async (req, res) => {
    try {
        const { developerId } = req.params;
        const developer = await Developer.findByPk(developerId);
        if (!developer) {
            return res.status(404).json({ error: 'Developer not found' });
        }
        await developer.destroy();
        res.json({ message: 'Developer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete developer', details: error.message });
    }
};
