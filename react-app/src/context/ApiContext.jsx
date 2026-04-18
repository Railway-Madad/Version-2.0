import { createContext, useContext } from "react";
import { API_BASE } from "../utils/env";

const ApiContext = createContext({ apiBase: API_BASE });

export const ApiProvider = ({ children }) => (
  <ApiContext.Provider value={{ apiBase: API_BASE }}>
    {children}
  </ApiContext.Provider>
);

export const useApi = () => useContext(ApiContext);
