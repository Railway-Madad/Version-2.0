const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  foodController,
} = require("./routeTestHarness");

describe("Food route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "get", path: "/food", handler: foodController.getAllFoods },
    { method: "post", path: "/food", handler: foodController.addFood },
    { method: "get", path: "/food/f1", handler: foodController.getFoodById },
    { method: "put", path: "/food/f1", handler: foodController.updateFood },
    { method: "delete", path: "/food/f1", handler: foodController.deleteFood },
  ]);
});
