const Emergency = require("../../../backend/models/emergencyModel");
const controller = require("../../../backend/controllers/emergencyController");

jest.mock("../../../backend/models/emergencyModel", () => {
  const EmergencyModel = jest.fn().mockImplementation((doc) => ({
    ...doc,
    save: jest.fn().mockResolvedValue(),
  }));

  EmergencyModel.find = jest.fn();
  EmergencyModel.findById = jest.fn();

  return EmergencyModel;
});

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("emergencyController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEmergency", () => {
    it("returns 400 for missing payload fields", async () => {
      // Arrange
      const req = { body: { username: "u1" }, userId: "u1", trainNo: "12951" };
      const res = createRes();

      // Act
      await controller.createEmergency(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "All fields are required (username, seatNumber)" });
    });

    it("returns 201 when emergency is created", async () => {
      // Arrange
      const req = { body: { username: "u1", seatNumber: "21" }, userId: "u1", trainNo: "12951" };
      const res = createRes();

      // Act
      await controller.createEmergency(req, res);

      // Assert
      expect(Emergency).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("markEmergencyInProcess", () => {
    it("returns 404 when emergency does not exist", async () => {
      // Arrange
      const req = { params: { id: "e1" } };
      const res = createRes();
      Emergency.findById.mockResolvedValue(null);

      // Act
      await controller.markEmergencyInProcess(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 when status is not Active", async () => {
      // Arrange
      const req = { params: { id: "e1" } };
      const res = createRes();
      Emergency.findById.mockResolvedValue({ status: "Resolved" });

      // Act
      await controller.markEmergencyInProcess(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("resolveEmergency", () => {
    it("returns 403 when user is not owner", async () => {
      // Arrange
      const req = { params: { id: "e1" }, userId: "u1" };
      const res = createRes();
      Emergency.findById.mockResolvedValue({ userId: "u2", status: "InProcess" });

      // Act
      await controller.resolveEmergency(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "You can only resolve your own emergencies" });
    });

    it("returns 400 when emergency is not InProcess", async () => {
      // Arrange
      const req = { params: { id: "e1" }, userId: "u1" };
      const res = createRes();
      Emergency.findById.mockResolvedValue({ userId: "u1", status: "Active" });

      // Act
      await controller.resolveEmergency(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 200 when emergency is resolved", async () => {
      // Arrange
      const req = { params: { id: "e1" }, userId: "u1" };
      const res = createRes();
      const emergency = { userId: "u1", status: "InProcess", save: jest.fn().mockResolvedValue() };
      Emergency.findById.mockResolvedValue(emergency);

      // Act
      await controller.resolveEmergency(req, res);

      // Assert
      expect(emergency.status).toBe("Resolved");
      expect(emergency.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 500 on unexpected rejection", async () => {
      // Arrange
      const req = { params: { id: "e1" }, userId: "u1" };
      const res = createRes();
      Emergency.findById.mockRejectedValue(new Error("db connection dropped"));

      // Act
      await controller.resolveEmergency(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Server error" });
    });
  });
});
