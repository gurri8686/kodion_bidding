const jwt = require("jsonwebtoken");

exports.checkAuth = async (req, res) => {
  // Get token from cookies
  let token = req.cookies?.token;

  // If not in cookies, check Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } 

  // If still no token, return unauthorized
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const SECRET = process.env.SECRET_KEY || 'dev_secret_change_me';
    const decoded = jwt.verify(token, SECRET);
    res.json({ userId: decoded.id, role: decoded.role });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
