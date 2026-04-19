const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  cateringController,
} = require("./routeTestHarness");

describe("Catering route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "post", path: "/catering/order", handler: cateringController.placeOrder, authRole: "user" },
    { method: "get", path: "/catering/my-orders", handler: cateringController.getMyCateringOrders, authRole: "user" },
    { method: "get", path: "/catering/my-orders-history", handler: cateringController.getMyAllCateringOrders, authRole: "user" },
    { method: "get", path: "/catering/all-orders", handler: cateringController.getAllCateringOrders, authRole: "staff" },
    { method: "put", path: "/catering/o1/status", handler: cateringController.updateOrderStatus, authRole: "staff" },
  ]);
});
