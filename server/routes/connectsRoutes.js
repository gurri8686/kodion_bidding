const express = require("express");
const { getProfileConnectsUsage,updateCost,createPlatform } = require('../controller/ConnectsController');
const { checkAuth } = require("../controller/checkAuth");
const router = express.Router();
const authenticate = require("../middleware/middleware");


router.get("/get-connects/:userId", authenticate, getProfileConnectsUsage);
router.post("/save-connect-cost", authenticate, updateCost);
router.post("/create-platform", authenticate, createPlatform);

module.exports = router;
