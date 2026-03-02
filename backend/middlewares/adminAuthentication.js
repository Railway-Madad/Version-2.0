const jwt = require("jsonwebtoken");

const adminAuthentication = (req, res, next) => {
    const token = req.cookies.adminToken;

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Access denied. Please login." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.adminId;
        req.trainNo = decoded.trainNo;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            message: error.name === "TokenExpiredError" ? "Token expired. Please login again." : "Invalid token." 
        });
    }
};

module.exports = adminAuthentication;