const LostFound = require("../../../backend/models/lostnfoundModel");
const User = require("../../../backend/models/userModel");
const { mongo } = require("mongoose");
const controller = require("../../../backend/controllers/lostnfoundController");

jest.mock("../../../backend/models/lostnfoundModel", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../../../backend/models/userModel", () => ({
  findById: jest.fn(),
}));

jest.mock("mongoose", () => ({
  mongo: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../../backend/config/cloudinary", () => ({
  cloudinary: {
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

jest.mock("streamifier", () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
  })),
}));

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("lostnfoundController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addItem", () => {
    it("returns 401 when userId is missing", async () => {
      // Arrange
      const req = { body: {}, file: null };
      const res = createRes();

      // Act
      await controller.addItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized" });
    });

    it("returns 404 when user is not found", async () => {
      // Arrange
      const req = { userId: "u1", body: {}, file: null };
      const res = createRes();
      User.findById.mockResolvedValue(null);

      // Act
      await controller.addItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 when fields are missing", async () => {
      // Arrange
      const req = { userId: "u1", body: { title: "Wallet" }, file: null };
      const res = createRes();
      User.findById.mockResolvedValue({ email: "u1@test.com" });

      // Act
      await controller.addItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Please fill all fields" });
    });

    it("returns 201 on success", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: {
          title: "Wallet",
          description: "Black wallet",
          category: "Lost",
          location: "Coach B2",
        },
        file: null,
      };
      const res = createRes();
      User.findById.mockResolvedValue({ email: "u1@test.com" });
      LostFound.create.mockResolvedValue({ _id: "i1" });

      // Act
      await controller.addItem(req, res);

      // Assert
      expect(LostFound.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getItemById", () => {
    it("returns 400 for invalid id format", async () => {
      // Arrange
      const req = { params: { id: "bad-id" } };
      const res = createRes();
      mongo.ObjectId.isValid.mockReturnValue(false);

      // Act
      await controller.getItemById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid ID format" });
    });

    it("returns 404 when item not found", async () => {
      // Arrange
      const req = { params: { id: "507f191e810c19729de860ea" } };
      const res = createRes();
      mongo.ObjectId.isValid.mockReturnValue(true);
      LostFound.findById.mockResolvedValue(null);

      // Act
      await controller.getItemById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteItem", () => {
    it("returns 403 if non-owner tries to delete", async () => {
      // Arrange
      const req = { userId: "u1", params: { id: "i1" } };
      const res = createRes();
      LostFound.findById.mockResolvedValue({ userId: { toString: () => "u2" } });

      // Act
      await controller.deleteItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized" });
    });
  });

  describe("markAsResolved", () => {
    it("returns 404 when item does not exist", async () => {
      // Arrange
      const req = { userId: "u1", params: { id: "i1" } };
      const res = createRes();
      LostFound.findById.mockResolvedValue(null);

      // Act
      await controller.markAsResolved(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 500 when database operation rejects", async () => {
      // Arrange
      const req = { userId: "u1", params: { id: "i1" } };
      const res = createRes();
      LostFound.findById.mockRejectedValue(new Error("db down"));

      // Act
      await controller.markAsResolved(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server Error" });
    });
  });
});
