// Simple Cookie-Based Authentication Examples
const jwt = require('jsonwebtoken');
const { setAuthCookie, clearAuthCookie } = require('./cookieHelper');

// USER LOGIN
const loginExample = async (req, res) => {
    try {
        // Your auth logic here
        const user = { userId: '12345', email: 'user@example.com' };
        
        // Generate token
        const token = jwt.sign(
            { userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        setAuthCookie(res, 'userToken', token);

        res.json({
            success: true,
            message: 'Login successful',
            user: { userId: user.userId, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// USER LOGOUT
const logoutExample = async (req, res) => {
    clearAuthCookie(res, 'userToken');
    res.json({ success: true, message: 'Logout successful' });
};

// PROTECTED ROUTE
const getProfileExample = async (req, res) => {
    // req.userId is set by middleware
    const userId = req.userId;
    res.json({ success: true, userId: userId });
};

module.exports = {
    loginExample,
    logoutExample,
    getProfileExample
};
