const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const rfs = require("rotating-file-stream");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create rotating write stream for access logs
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: logsDir,
  maxFiles: 14, // keep 14 days of logs
});

// Create rotating write stream for error logs
const errorLogStream = rfs.createStream("error.log", {
  interval: "1d", // rotate daily
  path: logsDir,
  maxFiles: 14, // keep 14 days of logs
});

// Custom token for error messages
morgan.token("error-message", (req, res) => {
  return res.locals.errorMessage || "";
});

// Custom format for request logging
const requestFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Custom format for error logging
const errorFormat =
  ':remote-addr - [:date[clf]] ":method :url" :status ":error-message" - :response-time ms';

// Request logger middleware - logs all requests
const requestLogger = morgan(requestFormat, {
  stream: accessLogStream,
});

// Console logger for development
const consoleLogger = morgan("dev");

// Error logger middleware - logs only errors (status >= 400)
const errorLogger = morgan(errorFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400,
});

// Error capture middleware - captures error messages for logging
const errorCapture = (err, req, res, next) => {
  res.locals.errorMessage = err.message || "Unknown error";
  
  // Log to error file
  const errorLog = `[${new Date().toISOString()}] ${req.method} ${req.url} - Error: ${err.message}\nStack: ${err.stack}\n\n`;
  fs.appendFileSync(path.join(logsDir, "error.log"), errorLog);
  
  next(err);
};

// Final error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  requestLogger,
  consoleLogger,
  errorLogger,
  errorCapture,
  errorHandler,
};
