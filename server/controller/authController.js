const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sequelize } = require("../config/db");

// Register User Function
exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// Login User Function
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    console.log(`🔐 Login attempt for: ${email}`);
    // Quick DB health check to return 503 instead of a 500 when DB is unreachable
    try {
      await sequelize.authenticate();
    } catch (dbErr) {
      console.error("DB connection unavailable during login:", dbErr);
      return res.status(503).json({ error: "Database unavailable" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn(`⚠️  Login failed: User not found for email=${email}`);
      return res.status(400).json({ error: "User not found" });
    }

    // 🔒 Check if user is blocked
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account is blocked by the admin." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`⚠️  Login failed: Invalid password for user id=${user.id}`);
      return res.status(400).json({ error: "Invalid Password" });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Use a fallback secret in development to avoid throwing when env is missing
    const SECRET = process.env.SECRET_KEY || 'dev_secret_change_me';

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, {
      expiresIn: "1d",
    });

    // Send token via cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        // Only set secure in production (localhost/dev uses http)
        secure: process.env.NODE_ENV === 'production',
        // Lax is friendlier for local dev while still offering CSRF protection
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 6 * 60 * 60 * 1000, // 6 hours
      })
      .json({
        message: "Login successful",
        role: user.role,
        token,
        userId: user.id,
        user,
      });
  } catch (error) {
    console.error("Login Error:", error?.stack || error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
// controllers/authController.js
exports.logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
