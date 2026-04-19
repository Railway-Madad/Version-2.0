process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "unit-test-secret";

const { resetAuthState } = require("./authState");

const buildAuthMiddleware = (role) => (req, res, next) => {
  const state = (global.__AUTH_STATE__ && global.__AUTH_STATE__[role]) || "valid";

  if (state === "missing") {
    return res.status(401).json({ success: false, message: "Access denied. Please login." });
  }

  if (state === "malformed") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }

  if (state === "expired") {
    return res.status(401).json({ success: false, message: "Token expired. Please login again." });
  }

  if (state === "forbidden") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (role === "user") {
    req.userId = "user-1";
  }
  if (role === "admin") {
    req.adminId = "admin-1";
    req.adminRole = "admin";
  }
  if (role === "staff") {
    req.staffId = "staff-1";
  }
  req.trainNo = "12345";

  return next();
};

jest.mock("../../backend/middlewares/userAuthentication", () => buildAuthMiddleware("user"));
jest.mock("../../backend/middlewares/adminAuthentication", () => buildAuthMiddleware("admin"));
jest.mock("../../backend/middlewares/staffAuthentication", () => buildAuthMiddleware("staff"));

beforeEach(() => {
  resetAuthState();
  // Negative-path tests intentionally trigger controller error handlers.
  // Silence console.error to keep test output clean while still asserting responses.
  jest.spyOn(console, "error").mockImplementation(() => {});
});
