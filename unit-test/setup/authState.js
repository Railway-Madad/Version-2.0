const resetAuthState = () => {
  global.__AUTH_STATE__ = {
    user: "valid",
    admin: "valid",
    staff: "valid",
  };
};

const setAuthState = (role, state) => {
  if (!global.__AUTH_STATE__) {
    resetAuthState();
  }
  global.__AUTH_STATE__[role] = state;
};

module.exports = {
  resetAuthState,
  setAuthState,
};
