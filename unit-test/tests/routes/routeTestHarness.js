const request = require("supertest");
const fs = require("fs");
const { setAuthState } = require("../../setup/authState");

jest.mock("../../../backend/models/userModel", () => ({
  findById: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ _id: "user-1", username: "demo" }),
  })),
}));

jest.mock("../../../backend/controllers/usercontroller", () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../../../backend/controllers/admincontroller", () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getDashboardStats: jest.fn(),
  getTrainStatistics: jest.fn(),
  getTrainStaff: jest.fn(),
  updateStaff: jest.fn(),
  deleteStaff: jest.fn(),
  getTrainComplaints: jest.fn(),
  getTrainOrders: jest.fn(),
  sendCommand: jest.fn(),
  getTrainCommands: jest.fn(),
  deleteCommand: jest.fn(),
  addTrain: jest.fn(),
  getAllOrdersAll: jest.fn(),
  getAllComplaintsAll: jest.fn(),
  getAllLostFoundAll: jest.fn(),
  updateLostFoundStatus: jest.fn(),
  getAllStaffAll: jest.fn(),
}));

jest.mock("../../../backend/controllers/staffcontroller", () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getComplaints: jest.fn(),
  resolveComplaint: jest.fn(),
  getProfile: jest.fn(),
  getStaffById: jest.fn(),
  getMyCommands: jest.fn(),
  markCommandRead: jest.fn(),
}));

jest.mock("../../../backend/controllers/foodcontroller", () => ({
  getAllFoods: jest.fn(),
  addFood: jest.fn(),
  getFoodById: jest.fn(),
  updateFood: jest.fn(),
  deleteFood: jest.fn(),
}));

jest.mock("../../../backend/controllers/complaintController", () => ({
  getAllComplaints: jest.fn(),
  postComplaint: jest.fn(),
  getMyAllComplaints: jest.fn(),
  getComplaintsByUser: jest.fn(),
  resolveComplaint: jest.fn(),
  getComplaintsByDomain: jest.fn(),
  deleteComplaint: jest.fn(),
  getImagesByUser: jest.fn(),
  getComplaintByStatus: jest.fn(),
  getPendingComplaints: jest.fn(),
  handleSatisfaction: jest.fn(),
}));

jest.mock("../../../backend/controllers/cateringcontroller", () => ({
  placeOrder: jest.fn(),
  getMyCateringOrders: jest.fn(),
  getMyAllCateringOrders: jest.fn(),
  getAllCateringOrders: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

jest.mock("../../../backend/controllers/emergencyController", () => ({
  createEmergency: jest.fn(),
  getallEmergencies: jest.fn(),
  getAdminEmergencies: jest.fn(),
  markEmergencyInProcess: jest.fn(),
  resolveEmergency: jest.fn(),
  getUserEmergencies: jest.fn(),
}));

jest.mock("../../../backend/controllers/newsController", () => ({
  addNews: jest.fn(),
  getAllNews: jest.fn(),
  deleteNews: jest.fn(),
}));

jest.mock("../../../backend/controllers/feedbackController", () => ({
  addFeedback: jest.fn(),
  getAllFeedbacks: jest.fn(),
  getFeedbackStats: jest.fn(),
}));

jest.mock("../../../backend/controllers/lostnfoundController", () => ({
  getAllItems: jest.fn(),
  addItem: jest.fn(),
  getUserItems: jest.fn(),
  getItemById: jest.fn(),
  deleteItem: jest.fn(),
  markAsResolved: jest.fn(),
}));

jest.mock("../../../backend/controllers/superadmincontroller", () => ({
  getSystemStats: jest.fn(),
  getAllTrainsStats: jest.fn(),
  getTrainPerformanceMetrics: jest.fn(),
  getComplaintAnalysis: jest.fn(),
  getAllUsers: jest.fn(),
  getUserDetails: jest.fn(),
  getAllStaff: jest.fn(),
  getStaffDetails: jest.fn(),
  getAllAdmins: jest.fn(),
  getAdminDetails: jest.fn(),
}));

const userController = require("../../../backend/controllers/usercontroller");
const adminController = require("../../../backend/controllers/admincontroller");
const staffController = require("../../../backend/controllers/staffcontroller");
const foodController = require("../../../backend/controllers/foodcontroller");
const complaintController = require("../../../backend/controllers/complaintController");
const cateringController = require("../../../backend/controllers/cateringcontroller");
const emergencyController = require("../../../backend/controllers/emergencyController");
const newsController = require("../../../backend/controllers/newsController");
const feedbackController = require("../../../backend/controllers/feedbackController");
const lostnfoundController = require("../../../backend/controllers/lostnfoundController");
const superadminController = require("../../../backend/controllers/superadmincontroller");
const { buildTestApp } = require("../../setup/testApp");

const app = buildTestApp();

const controllerModuleEntries = [
  ["usercontroller", userController],
  ["admincontroller", adminController],
  ["staffcontroller", staffController],
  ["foodcontroller", foodController],
  ["complaintController", complaintController],
  ["cateringController", cateringController],
  ["emergencyController", emergencyController],
  ["newsController", newsController],
  ["feedbackController", feedbackController],
  ["lostnfoundController", lostnfoundController],
  ["superadminController", superadminController],
];

const controllerModules = controllerModuleEntries.map(([, moduleObject]) => moduleObject);

const handlerLabels = new Map();
controllerModuleEntries.forEach(([moduleName, moduleObject]) => {
  Object.entries(moduleObject).forEach(([handlerName, handlerFn]) => {
    if (typeof handlerFn === "function") {
      handlerLabels.set(handlerFn, `${moduleName}.${handlerName}`);
    }
  });
});

const writeApiTrace = ({
  pattern,
  testCase,
  inputJson,
  outputJson,
  statusCode,
  pathFollowed,
}) => {
  if (!process.env.API_TRACE_FILE) return;

  const traceEntry = {
    pattern,
    testCase,
    inputJson,
    outputJson,
    statusCode,
    pathFollowed,
  };
  fs.appendFileSync(process.env.API_TRACE_FILE, `${JSON.stringify(traceEntry)}\n`, "utf-8");
};

const setAllHandlersToSuccess = () => {
  controllerModules.forEach((moduleObject) => {
    Object.values(moduleObject).forEach((handler) => {
      if (typeof handler === "function" && handler.mockImplementation) {
        handler.mockImplementation((req, res) =>
          res.status(200).json({ success: true, endpoint: req.originalUrl })
        );
      }
    });
  });
};

const sendRequest = (method, routePath, body) => {
  const lower = method.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(lower)) {
    return request(app)[lower](routePath).send(body || {});
  }
  return request(app)[lower](routePath);
};

const runEndpointChecks = (endpoints) => {
  endpoints.forEach(({ method, path, handler, authRole, trace }) => {
    it(`invokes controller for ${method.toUpperCase()} ${path}`, async () => {
      const defaultInput = ["post", "put", "patch", "delete"].includes(method.toLowerCase())
        ? { sample: true }
        : {};
      const requestBody = (trace && trace.inputJson) || defaultInput;

      const response = await sendRequest(method, path, requestBody);
      expect([200, 201]).toContain(response.status);
      if (handler) expect(handler).toHaveBeenCalled();
      if (authRole) expect(response.status).not.toBe(401);

      const handlerLabel = handler ? handlerLabels.get(handler) || "controller handler" : "inline route handler";
      const pathFollowed =
        (trace && trace.pathFollowed) ||
        [
          `${method.toUpperCase()} ${path}`,
          authRole ? `${authRole}Authentication middleware` : "Public route",
          handlerLabel,
        ].join(" -> ");

      writeApiTrace({
        pattern: `${method.toUpperCase()} ${path}`,
        testCase: `invokes controller for ${method.toUpperCase()} ${path}`,
        inputJson: requestBody,
        outputJson: response.body,
        statusCode: response.status,
        pathFollowed,
      });
    });
  });
};

module.exports = {
  request,
  app,
  setAuthState,
  runEndpointChecks,
  setAllHandlersToSuccess,
  writeApiTrace,
  userController,
  adminController,
  staffController,
  foodController,
  complaintController,
  cateringController,
  emergencyController,
  newsController,
  feedbackController,
  lostnfoundController,
  superadminController,
};
