const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  adminController,
} = require("./routeTestHarness");

describe("Admin route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "post", path: "/admin/register", handler: adminController.register },
    { method: "post", path: "/admin/login", handler: adminController.login },
    { method: "post", path: "/admin/logout", handler: adminController.logout },
    { method: "get", path: "/admin/dashboard-stats", handler: adminController.getDashboardStats },
    { method: "get", path: "/admin/train-statistics", handler: adminController.getTrainStatistics },
    { method: "get", path: "/admin/train-staff", handler: adminController.getTrainStaff, authRole: "admin" },
    { method: "put", path: "/admin/staff/s1", handler: adminController.updateStaff, authRole: "admin" },
    { method: "delete", path: "/admin/staff/s1", handler: adminController.deleteStaff, authRole: "admin" },
    { method: "get", path: "/admin/train-complaints", handler: adminController.getTrainComplaints, authRole: "admin" },
    { method: "get", path: "/admin/train-orders", handler: adminController.getTrainOrders, authRole: "admin" },
    { method: "post", path: "/admin/commands", handler: adminController.sendCommand, authRole: "admin" },
    { method: "get", path: "/admin/commands", handler: adminController.getTrainCommands, authRole: "admin" },
    { method: "delete", path: "/admin/commands/c1", handler: adminController.deleteCommand, authRole: "admin" },
    { method: "post", path: "/admin/trains", handler: adminController.addTrain, authRole: "admin" },
    { method: "get", path: "/admin/all-orders", handler: adminController.getAllOrdersAll },
    { method: "get", path: "/admin/all-complaints", handler: adminController.getAllComplaintsAll },
    { method: "get", path: "/admin/all-lostnfound", handler: adminController.getAllLostFoundAll },
    { method: "put", path: "/admin/lostnfound/l1/status", handler: adminController.updateLostFoundStatus, authRole: "admin" },
    { method: "get", path: "/admin/all-staff", handler: adminController.getAllStaffAll },
    { method: "get", path: "/admin/test", authRole: "admin" },
  ]);
});
