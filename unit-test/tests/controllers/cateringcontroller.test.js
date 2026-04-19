const Catering = require("../../../backend/models/cateringModel");
const Food = require("../../../backend/models/foodModel");
const cateringController = require("../../../backend/controllers/cateringcontroller");

jest.mock("../../../backend/models/cateringModel", () => ({
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../../../backend/models/foodModel", () => ({
  findById: jest.fn(),
}));

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("cateringcontroller unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("placeOrder", () => {
    it("returns 400 for empty payload", async () => {
      // Arrange
      const req = { body: {}, userId: "u1" };
      const res = createRes();

      // Act
      await cateringController.placeOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 401 when user context is missing", async () => {
      // Arrange
      const req = { body: { items: [{ foodItem: "f1", quantity: 1 }], deliveryAddress: "B2" } };
      const res = createRes();

      // Act
      await cateringController.placeOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Not authorized" });
    });

    it("returns 404 when food item does not exist", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: { items: [{ foodItem: "f1", quantity: 1 }], deliveryAddress: "B2" },
      };
      const res = createRes();
      Food.findById.mockResolvedValue(null);

      // Act
      await cateringController.placeOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 for invalid quantity boundary", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: { items: [{ foodItem: "f1", quantity: 0 }], deliveryAddress: "B2" },
      };
      const res = createRes();
      Food.findById.mockResolvedValue({ _id: "f1", price: 100, name: "Tea" });

      // Act
      await cateringController.placeOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Quantity must be at least 1." });
    });

    it("returns 201 on successful order", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: {
          items: [
            { foodItem: "f1", quantity: 2 },
            { foodItem: "f2", quantity: 1 },
          ],
          deliveryAddress: "B2",
          notes: "No onion",
        },
      };
      const res = createRes();
      Food.findById
        .mockResolvedValueOnce({ _id: "f1", price: 20 })
        .mockResolvedValueOnce({ _id: "f2", price: 10 });
      Catering.create.mockResolvedValue({ _id: "o1", totalPrice: 50 });

      // Act
      await cateringController.placeOrder(req, res);

      // Assert
      expect(Catering.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 50 }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 500 on unexpected rejection", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: { items: [{ foodItem: "f1", quantity: 1 }], deliveryAddress: "B2" },
      };
      const res = createRes();
      Food.findById.mockRejectedValue(new Error("db down"));

      // Act
      await cateringController.placeOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server Error" });
    });
  });

  describe("updateOrderStatus", () => {
    it("returns 400 for invalid status", async () => {
      // Arrange
      const req = { params: { id: "o1" }, body: { status: "packed" } };
      const res = createRes();

      // Act
      await cateringController.updateOrderStatus(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 404 when order does not exist", async () => {
      // Arrange
      const req = { params: { id: "o1" }, body: { status: "preparing" } };
      const res = createRes();
      Catering.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }),
      });

      // Act
      await cateringController.updateOrderStatus(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
