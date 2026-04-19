const {
  setAllHandlersToSuccess,
  runEndpointChecks,
  userController,
} = require("./routeTestHarness");

describe("User route contracts", () => {
  beforeEach(() => {
    setAllHandlersToSuccess();
  });

  runEndpointChecks([
    { method: "post", path: "/user/register", handler: userController.register },
    { method: "post", path: "/user/login", handler: userController.login },
    { method: "post", path: "/user/logout", handler: userController.logout },
    {
      method: "get",
      path: "/user/profile",
      authRole: "user",
      trace: {
        pathFollowed:
          "GET /user/profile -> userAuthentication middleware -> userRoutes inline handler -> User.findById(req.user.userId).select('-password') -> res.status(200).json(profile)",
      },
    },
    { method: "get", path: "/user/test", authRole: "user" },
  ]);
});
