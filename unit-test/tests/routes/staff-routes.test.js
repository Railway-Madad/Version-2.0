const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  staffController,
} = require("./routeTestHarness");

describe("Staff route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "post", path: "/staff/register", handler: staffController.register },
    { method: "post", path: "/staff/login", handler: staffController.login },
    { method: "post", path: "/staff/logout", handler: staffController.logout },
    { method: "get", path: "/staff/complaints", handler: staffController.getComplaints, authRole: "staff" },
    { method: "put", path: "/staff/complaints/c1/resolve", handler: staffController.resolveComplaint, authRole: "staff" },
    { method: "get", path: "/staff/profile", handler: staffController.getProfile, authRole: "staff" },
    { method: "get", path: "/staff/getname/st1", handler: staffController.getStaffById, authRole: "staff" },
    { method: "get", path: "/staff/commands", handler: staffController.getMyCommands, authRole: "staff" },
    { method: "put", path: "/staff/commands/c1/read", handler: staffController.markCommandRead, authRole: "staff" },
    { method: "get", path: "/staff/test" },
  ]);
});
