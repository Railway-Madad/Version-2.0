const jwt = require("jsonwebtoken");

const adminAuthentication = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.adminId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = adminAuthentication;