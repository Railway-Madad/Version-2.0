import { createContext, useContext } from "react";

// Fallback to localhost if environment variable is missing
const API_BASE = import.meta.env.VITE_API_BASE || "https://version-2-0-ed6g.onrender.com";

const ApiContext = createContext({ apiBase: API_BASE });

export const ApiProvider = ({ children }) => (
  <ApiContext.Provider value={{ apiBase: API_BASE }}>
    {children}
  </ApiContext.Provider>
);

export const useApi = () => useContext(ApiContext);
