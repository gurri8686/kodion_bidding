const express = require('express');
const authenticate = require('../middleware/middleware');
const {
    getAllDevelopers,
    addDeveloper,
    editDeveloper,
    deleteDeveloper
} = require('../controller/developerController');

const router = express.Router();

// Get all developers
router.get('/get-all-developers', authenticate, getAllDevelopers);
// Add a new developer
router.post('/add-developer', authenticate, addDeveloper);
// Edit a developer
router.put('/edit-developer/:developerId', authenticate, editDeveloper);
// Delete a developer
router.delete('/delete-developer/:developerId', authenticate, deleteDeveloper);

module.exports = router;