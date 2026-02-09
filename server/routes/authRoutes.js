const express = require("express");
const { registerUser, loginUser ,logoutUser } = require("../controller/authController");
const { checkAuth } = require("../controller/checkAuth");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check", checkAuth);
router.post("/logout", logoutUser);

module.exports = router;
