const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  newsController,
  feedbackController,
  lostnfoundController,
  superadminController,
} = require("./routeTestHarness");

describe("News, Feedback, Lost&Found, Superadmin route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "post", path: "/news", handler: newsController.addNews },
    { method: "get", path: "/news", handler: newsController.getAllNews },
    { method: "delete", path: "/news/n1", handler: newsController.deleteNews },

    { method: "post", path: "/feedback", handler: feedbackController.addFeedback },
    { method: "get", path: "/feedback", handler: feedbackController.getAllFeedbacks },
    { method: "get", path: "/feedback/stats", handler: feedbackController.getFeedbackStats },

    { method: "get", path: "/lostnfound", handler: lostnfoundController.getAllItems, authRole: "user" },
    { method: "post", path: "/lostnfound", handler: lostnfoundController.addItem, authRole: "user" },
    { method: "get", path: "/lostnfound/myitems", handler: lostnfoundController.getUserItems, authRole: "user" },
    { method: "get", path: "/lostnfound/i1", handler: lostnfoundController.getItemById, authRole: "user" },
    { method: "delete", path: "/lostnfound/i1", handler: lostnfoundController.deleteItem, authRole: "user" },
    { method: "put", path: "/lostnfound/i1/resolve", handler: lostnfoundController.markAsResolved, authRole: "user" },
    { method: "get", path: "/lostnfound/test", authRole: "user" },

    { method: "get", path: "/superadmin/stats/system", handler: superadminController.getSystemStats },
    { method: "get", path: "/superadmin/stats/trains", handler: superadminController.getAllTrainsStats },
    { method: "get", path: "/superadmin/stats/performance", handler: superadminController.getTrainPerformanceMetrics },
    { method: "get", path: "/superadmin/stats/complaints-analysis", handler: superadminController.getComplaintAnalysis },
    { method: "get", path: "/superadmin/users", handler: superadminController.getAllUsers },
    { method: "get", path: "/superadmin/users/u1", handler: superadminController.getUserDetails },
    { method: "get", path: "/superadmin/staff", handler: superadminController.getAllStaff },
    { method: "get", path: "/superadmin/staff/s1", handler: superadminController.getStaffDetails },
    { method: "get", path: "/superadmin/admins", handler: superadminController.getAllAdmins },
    { method: "get", path: "/superadmin/admins/a1", handler: superadminController.getAdminDetails },
  ]);
});
