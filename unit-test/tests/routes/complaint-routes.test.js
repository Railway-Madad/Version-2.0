const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  complaintController,
} = require("./routeTestHarness");

describe("Complaint route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "get", path: "/complaint", handler: complaintController.getAllComplaints, authRole: "user" },
    { method: "post", path: "/complaint/submit-complaint", handler: complaintController.postComplaint, authRole: "user" },
    { method: "get", path: "/complaint/my-complaints-history", handler: complaintController.getMyAllComplaints, authRole: "user" },
    { method: "get", path: "/complaint/api/complaints/user/u1", handler: complaintController.getComplaintsByUser, authRole: "user" },
    { method: "put", path: "/complaint/api/complaints/resolve/c1", handler: complaintController.resolveComplaint, authRole: "admin" },
    { method: "get", path: "/complaint/api/complaints/general", handler: complaintController.getComplaintsByDomain, authRole: "user" },
    { method: "delete", path: "/complaint/api/complaints/c1", handler: complaintController.deleteComplaint, authRole: "user" },
    { method: "get", path: "/complaint/complaints/all", handler: complaintController.getAllComplaints, authRole: "user" },
    { method: "get", path: "/complaint/api/images/user/u1", handler: complaintController.getImagesByUser, authRole: "user" },
    { method: "get", path: "/complaint/api/complaintsIMP", handler: complaintController.getComplaintByStatus, authRole: "admin" },
    { method: "get", path: "/complaint/api/complaintsRES", handler: complaintController.getPendingComplaints, authRole: "user" },
    { method: "put", path: "/complaint/api/complaints/c1/satisfaction", handler: complaintController.handleSatisfaction, authRole: "user" },
  ]);
});
