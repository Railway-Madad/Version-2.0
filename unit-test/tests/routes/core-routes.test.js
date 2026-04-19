const { request, app, setAllHandlersToSuccess, writeApiTrace } = require("./routeTestHarness");

describe("Core route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  it("supports train endpoints without starting real server", async () => {
    const createPayload = { trainNumber: "12951" };
    const createResponse = await request(app).post("/api/trains").send(createPayload);
    const listResponse = await request(app).get("/api/trains");

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.trainNumber).toBe("12951");
    expect(listResponse.status).toBe(200);

    writeApiTrace({
      pattern: "POST /api/trains",
      testCase: "supports train endpoints without starting real server [create]",
      inputJson: createPayload,
      outputJson: createResponse.body,
      statusCode: createResponse.status,
      pathFollowed: "POST /api/trains -> app-level train handler -> in-memory train registry create",
    });

    writeApiTrace({
      pattern: "GET /api/trains",
      testCase: "supports train endpoints without starting real server [list]",
      inputJson: {},
      outputJson: listResponse.body,
      statusCode: listResponse.status,
      pathFollowed: "GET /api/trains -> app-level train handler -> in-memory train registry list",
    });
  });
});
