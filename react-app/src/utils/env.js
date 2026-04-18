const DEV_API_BASE = "http://localhost:4000";
const PROD_API_BASE = "https://version-2-0-ed6g.onrender.com";

const prodFlag = String(import.meta.env.VITE_PROD || "").toLowerCase();
const isExplicitProd = prodFlag === "true" || prodFlag === "1" || prodFlag === "yes";

const configuredApiBase = isExplicitProd
	? import.meta.env.VITE_API_BASE || PROD_API_BASE
	: DEV_API_BASE;

export const API_BASE = configuredApiBase.replace(/\/+$/, "");
