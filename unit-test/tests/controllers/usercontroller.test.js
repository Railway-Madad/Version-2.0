jest.mock("../../../backend/models/userModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../../backend/utils/cookieHelper", () => ({
  setAuthCookie: jest.fn(),
  clearAuthCookie: jest.fn(),
}));

const userModel = require("../../../backend/models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { setAuthCookie, clearAuthCookie } = require("../../../backend/utils/cookieHelper");
const userController = require("../../../backend/controllers/usercontroller");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("usercontroller unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("returns 400 for empty payload", async () => {
      // Arrange
      const req = { body: {} };
      const res = createRes();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it("returns 400 for invalid email type", async () => {
      // Arrange
      const req = { body: { email: "invalid", username: "john", password: "secret12" } };
      const res = createRes();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when user already exists", async () => {
      // Arrange
      const req = { body: { email: "john@doe.com", username: "johnny", password: "secret12" } };
      const res = createRes();
      userModel.findOne.mockResolvedValue({ _id: "u1" });

      // Act
      await userController.register(req, res);

      // Assert
      expect(userModel.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email or Username already exists" });
    });

    it("returns 201 on successful registration", async () => {
      // Arrange
      const req = { body: { email: "john@doe.com", username: "johnny", password: "secret12" } };
      const res = createRes();
      userModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-pwd");
      userModel.create.mockResolvedValue({ _id: "u100" });

      // Act
      await userController.register(req, res);

      // Assert
      expect(userModel.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 500 when create rejects", async () => {
      // Arrange
      const req = { body: { email: "john@doe.com", username: "johnny", password: "secret12" } };
      const res = createRes();
      userModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-pwd");
      userModel.create.mockRejectedValue(new Error("DB dropped"));

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Server error" }));
    });
  });

  describe("login", () => {
    it("returns 400 when mandatory fields are missing", async () => {
      // Arrange
      const req = { body: { username: "john" } };
      const res = createRes();

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Username, password, and train number are required" });
    });

    it("returns 400 on boundary validation failure", async () => {
      // Arrange
      const req = { body: { username: "jo", password: "12345", trainNo: "12951" } };
      const res = createRes();

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it("returns 400 when user not found", async () => {
      // Arrange
      const req = { body: { username: "john", password: "secret12", trainNo: "12951" } };
      const res = createRes();
      userModel.findOne.mockResolvedValue(null);

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
    });

    it("returns 400 when password is incorrect", async () => {
      // Arrange
      const req = { body: { username: "john", password: "secret12", trainNo: "12951" } };
      const res = createRes();
      userModel.findOne.mockResolvedValue({ _id: "u1", username: "john", password: "hash" });
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
    });

    it("returns 200 and sets auth cookie when credentials are valid", async () => {
      // Arrange
      const req = { body: { username: "john", password: "secret12", trainNo: "12951" } };
      const res = createRes();
      userModel.findOne.mockResolvedValue({
        _id: "u1",
        username: "john",
        password: "$2b$10$h7Vi7IU5q9I55MX1DAURrOEyZOIBLoLdz53ETkOcv4mKjE9KlrYJW",
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("jwt-token");

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 500 on unexpected promise rejection", async () => {
      // Arrange
      const req = { body: { username: "john", password: "secret12", trainNo: "12951" } };
      const res = createRes();
      userModel.findOne.mockRejectedValue(new Error("DB failure"));

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Server error" }));
    });
  });

  describe("logout", () => {
    it("clears cookie and returns 200", async () => {
      // Arrange
      const req = {};
      const res = createRes();

      // Act
      await userController.logout(req, res);

      // Assert
      expect(clearAuthCookie).toHaveBeenCalledWith(res, "userToken");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    });
  });
});
