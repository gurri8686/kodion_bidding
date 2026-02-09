const User = require('../models/User.js')
const Technologies = require('../models/Technologies.js')
const UserTechnologies = require('../models/UserTechnologies.js')
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const ActivateTechnology = async (req, res) => {
    const { userId, technologyName } = req.body;
    try {
        // Normalize the technology name to handle case insensitivity
        const formattedTechName = technologyName.trim().toLowerCase();
        // Find technology by matching name or aliases (case insensitive)
        const technology = await Technologies.findOne({
            where: {
                [Op.or]: [
                    // Match the 'name' column (case insensitive)
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), formattedTechName),
                    // Match the 'aliases' JSON column (case insensitive)
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('aliases')), {
                        [Op.like]: `%${formattedTechName}%`,
                    })
                ]
            }
        });
        if (!technology) {
            return res.status(404).json({ message: 'Technology not found' });
        }

        // Check if the user already has this technology
        const existingTech = await UserTechnologies.findOne({
            where: {
                userId,
                technologyId: technology.id,
            }
        });

        if (existingTech) {
            if (existingTech.is_active === false) {
                // If the technology is inactive, reactivate it
                existingTech.is_active = true;
                await existingTech.save();
                return res.status(200).json({ message: 'Technology reactivated successfully' });
            } else {
                // If the technology is already active, send a message
                return res.status(400).json({ message: 'Technology is already active for this user' });
            }
        }

        // If the user does not have the technology, create a new entry
        await UserTechnologies.create({
            userId,
            technologyId: technology.id,
            is_active: true,
        });

        res.status(200).json({ message: 'Technology added successfully' });
    } catch (error) {
        console.error('Error adding technology:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deactivateTechnology = async (req, res) => {
    const { userId, technologyName } = req.body;

    if (!userId || !technologyName) {
        return res.status(400).json({ message: 'userId and technologyName are required' });
    }

    try {
        const formattedTechName = technologyName.trim().toLowerCase();

        const technology = await Technologies.findOne({
            where: {
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), formattedTechName),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('aliases')), {
                        [Op.like]: `%${formattedTechName}%`,
                    })
                ]
            }
        });

        if (!technology) {
            return res.status(404).json({ message: 'Technology not found' });
        }

        const updated = await UserTechnologies.update(
            { is_active: false },
            { where: { userId, technologyId: technology.id } }
        );

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Technology not associated with user' });
        }

        return res.status(200).json({ message: `${technologyName} deactivated for user ${userId}` });
    } catch (error) {
        console.error('Error deactivating technology:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const gettechnologiesByUserId = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const allTechnologies = await UserTechnologies.findAll({
            where: { userId },
            include: [{
                model: Technologies,
                as: 'technology',
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']]
        });

        const formattedTechs = allTechnologies.map(entry => ({
            id: entry.technology.id,
            name: entry.technology.name,
            is_active: entry.is_active
        }));

        return res.status(200).json({ technologies: formattedTechs });
    } catch (error) {
        console.error('Error fetching technologies:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllActiveTechnologies = async (req, res) => {
    try {
        const technologies = await UserTechnologies.findAll({
            where: { is_active: true },
            include: [
                {
                    model: Technologies,
                    as: 'technology',
                    attributes: ['name']
                }
            ],
            raw: true
        });

        // Extract and deduplicate technology names
        const techNamesSet = new Set(
            technologies.map(t => t['technology.name'])
        );

        const uniqueTechnologies = Array.from(techNamesSet);
        return res.status(200).json({ technologies: uniqueTechnologies });
    } catch (error) {
        console.error('Error fetching unique active technologies:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllTechnologyNames = async (req, res) => {
    try {
        const technologies = await Technologies.findAll({
            attributes: ['name'],
            order: [['name', 'ASC']]
        });
        const names = technologies.map(t => t.name);
        return res.status(200).json({ technologies: names });
    } catch (error) {
        console.error('Error fetching all technology names:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    ActivateTechnology,
    deactivateTechnology,
    gettechnologiesByUserId,
    getAllActiveTechnologies,
    getAllTechnologyNames
};