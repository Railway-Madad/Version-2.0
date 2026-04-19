const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  emergencyController,
} = require("./routeTestHarness");

describe("Emergency route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "post", path: "/emergency/postEmg", handler: emergencyController.createEmergency, authRole: "user" },
    { method: "get", path: "/emergency/getEmg", handler: emergencyController.getallEmergencies },
    { method: "get", path: "/emergency/my-emergencies", handler: emergencyController.getUserEmergencies, authRole: "user" },
    { method: "get", path: "/emergency/admin/getEmg", handler: emergencyController.getAdminEmergencies, authRole: "admin" },
    { method: "put", path: "/emergency/e1/inprocess", handler: emergencyController.markEmergencyInProcess, authRole: "admin" },
    { method: "put", path: "/emergency/e1/resolve", handler: emergencyController.resolveEmergency, authRole: "user" },
  ]);
});
