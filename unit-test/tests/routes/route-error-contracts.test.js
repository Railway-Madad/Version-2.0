const {
  request,
  app,
  setAllHandlersToSuccess,
  writeApiTrace,
  userController,
  feedbackController,
  cateringController,
  foodController,
  newsController,
} = require("./routeTestHarness");

describe("Route error contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  it("returns 400 for empty payload in register endpoint", async () => {
    userController.register.mockImplementation((req, res) => {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Payload is empty" });
      }
      return res.status(201).json({ success: true });
    });

    const response = await request(app).post("/user/register").send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Payload is empty");

    writeApiTrace({
      pattern: "POST /user/register",
      testCase: "returns 400 for empty payload in register endpoint",
      inputJson: {},
      outputJson: response.body,
      statusCode: response.status,
      pathFollowed: "POST /user/register -> usercontroller.register validation -> 400",
    });
  });

  it("returns 400 for missing mandatory fields in feedback endpoint", async () => {
    feedbackController.addFeedback.mockImplementation((req, res) => {
      if (!req.body.name || !req.body.comment) {
        return res.status(400).json({ message: "Missing mandatory fields" });
      }
      return res.status(201).json({ success: true });
    });

    const payload = { name: "u" };
    const response = await request(app).post("/feedback").send(payload);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Missing mandatory fields");

    writeApiTrace({
      pattern: "POST /feedback",
      testCase: "returns 400 for missing mandatory fields in feedback endpoint",
      inputJson: payload,
      outputJson: response.body,
      statusCode: response.status,
      pathFollowed: "POST /feedback -> feedbackController.addFeedback validation -> 400",
    });
  });

  it("returns 400 for invalid data types in catering order endpoint", async () => {
    cateringController.placeOrder.mockImplementation((req, res) => {
      if (!Array.isArray(req.body.items)) {
        return res.status(400).json({ message: "items must be an array" });
      }
      return res.status(201).json({ success: true });
    });

    const payload = { items: "not-an-array", deliveryAddress: "B2" };
    const response = await request(app)
      .post("/catering/order")
      .send(payload);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("items must be an array");

    writeApiTrace({
      pattern: "POST /catering/order",
      testCase: "returns 400 for invalid data types in catering order endpoint",
      inputJson: payload,
      outputJson: response.body,
      statusCode: response.status,
      pathFollowed: "POST /catering/order -> cateringController.placeOrder validation -> 400",
    });
  });

  it("returns 400 for boundary value violation in rating", async () => {
    feedbackController.addFeedback.mockImplementation((req, res) => {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ message: "rating must be in range 1..5" });
      }
      return res.status(201).json({ success: true });
    });

    const payload = { name: "A", email: "a@a.com", rating: 10, comment: "bad" };
    const response = await request(app)
      .post("/feedback")
      .send(payload);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("rating must be in range 1..5");

    writeApiTrace({
      pattern: "POST /feedback",
      testCase: "returns 400 for boundary value violation in rating",
      inputJson: payload,
      outputJson: response.body,
      statusCode: response.status,
      pathFollowed: "POST /feedback -> feedbackController.addFeedback rating guard -> 400",
    });
  });

  it("returns 404 when resource is not found", async () => {
    foodController.getFoodById.mockImplementation((req, res) =>
      res.status(404).json({ message: "Food item not found" })
    );

    const response = await request(app).get("/food/non-existent-id");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Food item not found");

    writeApiTrace({
      pattern: "GET /food/non-existent-id",
      testCase: "returns 404 when resource is not found",
      inputJson: {},
      outputJson: response.body,
      statusCode: response.status,
      pathFollowed: "GET /food/:id -> foodController.getFoodById -> resource lookup miss -> 404",
    });
  });

  it("returns 500 when controller throws unexpected rejection", async () => {
    newsController.getAllNews.mockImplementation(async () => {
      throw new Error("Simulated database connection drop");
    });

    const response = await request(app).get("/news");
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");

    writeApiTrace({
      pattern: "GET /news",
      testCase: "returns 500 when controller throws unexpected rejection",
      inputJson: {},
      outputJson: response.body,
      statusCode: response.status,
      pathFollowed: "GET /news -> newsController.getAllNews throws -> express error middleware -> 500",
    });
  });
});
