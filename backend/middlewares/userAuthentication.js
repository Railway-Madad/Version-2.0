// const jwt = require("jsonwebtoken");

// const userAuthentication = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "Authorization header missing or malformed" });
//     }

//     const token = authHeader.split(" ")[1];
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.userId = decoded.userId; // Attach userId from decoded token to request object
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: "Invalid or expired token" });
//     }
// };

// module.exports = userAuthentication;    



//me testing 
// middleware/fakeUser.js
module.exports = (req, res, next) => {
  req.userId = "650f1c2b5e1a2b3c4d5e6f7a"; 
  req.username = "TestUser"; 
  next();
};
