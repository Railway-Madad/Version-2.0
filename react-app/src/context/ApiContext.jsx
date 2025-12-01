import { createContext, useContext } from "react";

const API_BASE = "http://localhost:4000";

const ApiContext = createContext({ apiBase: API_BASE });

export const ApiProvider = ({ children }) => (
  <ApiContext.Provider value={{ apiBase: API_BASE }}>
    {children}
  </ApiContext.Provider>
);

export const useApi = () => useContext(ApiContext);
