const Complaint = require("../../../backend/models/complaintModel");
const complaintController = require("../../../backend/controllers/complaintController");

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

jest.mock("../../../backend/models/complaintModel", () => {
  const ComplaintModel = jest.fn().mockImplementation((doc) => ({
    ...doc,
    save: jest.fn().mockResolvedValue(),
  }));

  ComplaintModel.find = jest.fn();
  ComplaintModel.findById = jest.fn();

  return ComplaintModel;
});

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("complaintController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("postComplaint", () => {
    it("returns 400 when mandatory fields are missing", async () => {
      // Arrange
      const req = { body: { username: "u1" }, file: null };
      const res = createRes();

      // Act
      await complaintController.postComplaint(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "All fields are required" });
    });

    it("creates complaint successfully for valid payload", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: {
          username: "u1",
          pnr: "1234567890",
          bogieNumber: "B1",
          seatNumber: "21",
          description: "AC not working",
          issueDomain: "cleanliness",
        },
        file: null,
      };
      const res = createRes();

      // Act
      await complaintController.postComplaint(req, res);

      // Assert
      expect(Complaint).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("returns 500 when save rejects", async () => {
      // Arrange
      const req = {
        userId: "u1",
        trainNo: "12951",
        body: {
          username: "u1",
          pnr: "1234567890",
          description: "AC not working",
          issueDomain: "cleanliness",
        },
        file: null,
      };
      const res = createRes();
      Complaint.mockImplementationOnce((doc) => ({
        ...doc,
        save: jest.fn().mockRejectedValue(new Error("tx rollback")),
      }));

      // Act
      await complaintController.postComplaint(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "tx rollback" }));
    });
  });

  describe("deleteComplaint", () => {
    it("returns 404 when complaint is not found", async () => {
      // Arrange
      const req = { params: { id: "c1" } };
      const res = createRes();
      Complaint.findById.mockResolvedValue(null);

      // Act
      await complaintController.deleteComplaint(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Complaint not found" });
    });
  });

  describe("resolveComplaint", () => {
    it("returns 404 when complaint does not exist", async () => {
      // Arrange
      const req = { params: { id: "c1" } };
      const res = createRes();
      Complaint.findById.mockResolvedValue(null);

      // Act
      await complaintController.resolveComplaint(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("marks complaint resolved", async () => {
      // Arrange
      const req = { params: { id: "c1" } };
      const res = createRes();
      const save = jest.fn().mockResolvedValue();
      Complaint.findById.mockResolvedValue({ status: "Pending", save });

      // Act
      await complaintController.resolveComplaint(req, res);

      // Assert
      expect(save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe("handleSatisfaction", () => {
    it("returns 404 when complaint id does not exist", async () => {
      // Arrange
      const req = { params: { id: "c1" }, body: { satisfied: true } };
      const res = createRes();
      Complaint.findById.mockResolvedValue(null);

      // Act
      await complaintController.handleSatisfaction(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 when complaint is not awaiting confirmation", async () => {
      // Arrange
      const req = { params: { id: "c1" }, body: { satisfied: true } };
      const res = createRes();
      Complaint.findById.mockResolvedValue({ status: "Pending" });

      // Act
      await complaintController.handleSatisfaction(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Complaint is not awaiting confirmation" });
    });

    it("rolls complaint back to pending when satisfied is false", async () => {
      // Arrange
      const req = { params: { id: "c1" }, body: { satisfied: false } };
      const res = createRes();
      const complaint = {
        status: "AwaitingConfirmation",
        resolvedAt: "old-date",
        resolutionDetails: "old",
        resolvedBy: "a1",
        save: jest.fn().mockResolvedValue(),
      };
      Complaint.findById.mockResolvedValue(complaint);

      // Act
      await complaintController.handleSatisfaction(req, res);

      // Assert
      expect(complaint.status).toBe("Pending");
      expect(complaint.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });
});
