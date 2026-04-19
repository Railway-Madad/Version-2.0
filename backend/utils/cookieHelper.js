// Simple Cookie Helper for Authentication

const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
});

// Set authentication cookie
const setAuthCookie = (res, cookieName, token) => {
    res.cookie(cookieName, token, {
        ...getCookieOptions(),
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
};

// Clear authentication cookie
const clearAuthCookie = (res, cookieName) => {
    res.cookie(cookieName, '', {
        ...getCookieOptions(),
        expires: new Date(0),
    });
};

module.exports = {
    setAuthCookie,
    clearAuthCookie
};
