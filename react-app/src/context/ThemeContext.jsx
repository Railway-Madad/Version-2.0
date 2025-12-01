import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

const getStoredTheme = () => {
  if (typeof localStorage === "undefined") return "dark";
  return localStorage.getItem("theme") || "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    const nextTheme = theme || "dark";
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
