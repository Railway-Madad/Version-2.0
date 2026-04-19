const { request, app, setAuthState, setAllHandlersToSuccess, writeApiTrace } = require("./routeTestHarness");

const securedPaths = [
  { role: "user", path: "/user/profile" },
  { role: "admin", path: "/admin/train-staff" },
  { role: "staff", path: "/staff/profile" },
];

describe("Auth guard route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  securedPaths.forEach(({ role, path }) => {
    it(`returns 401 when ${role} auth token is missing for ${path}`, async () => {
      setAuthState(role, "missing");
      const response = await request(app).get(path);
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      writeApiTrace({
        pattern: `GET ${path}`,
        testCase: `returns 401 when ${role} auth token is missing for ${path}`,
        inputJson: {},
        outputJson: response.body,
        statusCode: response.status,
        pathFollowed: `GET ${path} -> ${role}Authentication middleware [missing token] -> 401`,
      });
    });

    it(`returns 401 when ${role} auth token is malformed for ${path}`, async () => {
      setAuthState(role, "malformed");
      const response = await request(app).get(path);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token.");

      writeApiTrace({
        pattern: `GET ${path}`,
        testCase: `returns 401 when ${role} auth token is malformed for ${path}`,
        inputJson: {},
        outputJson: response.body,
        statusCode: response.status,
        pathFollowed: `GET ${path} -> ${role}Authentication middleware [malformed token] -> 401`,
      });
    });

    it(`returns 401 when ${role} auth token is expired for ${path}`, async () => {
      setAuthState(role, "expired");
      const response = await request(app).get(path);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Token expired. Please login again.");

      writeApiTrace({
        pattern: `GET ${path}`,
        testCase: `returns 401 when ${role} auth token is expired for ${path}`,
        inputJson: {},
        outputJson: response.body,
        statusCode: response.status,
        pathFollowed: `GET ${path} -> ${role}Authentication middleware [expired token] -> 401`,
      });
    });

    it(`returns 403 on unauthorized role access for ${path}`, async () => {
      setAuthState(role, "forbidden");
      const response = await request(app).get(path);
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");

      writeApiTrace({
        pattern: `GET ${path}`,
        testCase: `returns 403 on unauthorized role access for ${path}`,
        inputJson: {},
        outputJson: response.body,
        statusCode: response.status,
        pathFollowed: `GET ${path} -> ${role}Authentication middleware [forbidden role] -> 403`,
      });
    });
  });
});
