module.exports = {
  rootDir: __dirname,
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/setup/jest.setup.js"],
  modulePaths: ["<rootDir>/../backend/node_modules"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverageFrom: [
    "../backend/controllers/**/*.js",
    "../backend/routes/**/*.js",
    "../backend/middlewares/**/*.js",
    "!../backend/logs/**",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html"],
  coveragePathIgnorePatterns: ["/node_modules/"],
};
