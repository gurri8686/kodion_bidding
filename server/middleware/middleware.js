const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  let token = req.cookies?.token;

  // If no token in cookies, try Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const SECRET = process.env.SECRET_KEY || 'dev_secret_change_me';
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findByPk(decoded.id); // Fetch full user from DB
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account has been blocked by the admin." });
    }

    req.user = user; // Attach full user object to request
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;
