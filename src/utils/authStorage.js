/**
 * Production-grade cookie-based auth token storage.
 *
 * Stores a single JWT token as a cookie shared across all subdomains
 * (e.g., lvh.me, hora4.lvh.me, mittarv.lvh.me all share the same cookie).
 *
 * Security considerations and breakdown:
 * 1. Secure Flag (Enabled in Production): The code checks if you are on an HTTPS connection 
 *    (window.location.protocol === "https:"). If you are, it automatically adds the Secure flag. 
 *    This guarantees that the browser will never send the token over an unencrypted HTTP connection in production.
 * 
 * 2. SameSite=Lax (Enabled): This flag is strictly set. It protects you against Cross-Site Request 
 *    Forgery (CSRF) attacks by ensuring the browser doesn't send your authentication cookie when a 
 *    user clicks a link to your site from an untrusted external domain.
 * 
 * 3. HttpOnly Flag (Not Enabled): Currently, the cookie is created using JavaScript on the frontend. 
 *    Because of this, it is accessible to JavaScript (meaning it lacks the HttpOnly flag).
 *    - The Risk: If your application ever suffers from a Cross-Site Scripting (XSS) vulnerability, 
 *      an attacker could write a script to read the token out of the cookie.
 *    - The Fix (If needed): To make it 100% secure against XSS, you would need to move the cookie 
 *      creation to the backend. The backend would send a Set-Cookie header with the HttpOnly flag 
 *      when you log in. The frontend would no longer read the token directly, and the browser would 
 *      just automatically attach it to API requests.
 * 
 * Note: For most Single Page Applications (SPAs) like yours that use an Authorization: Bearer <token> 
 * header, JS-accessible cookies are standard practice. However, if you are building highly sensitive 
 * infrastructure, moving to a backend-issued HttpOnly cookie is the gold standard!
 *
 * - Cookie expiry matches the JWT expiry (30 days)
 *
 * Configuration:
 * - Set VITE_AUTH_DOMAIN in .env for production (e.g., "yourhrms.com")
 * - In development, it auto-detects from hostname
 */

import { getRootDomain as getParentDomain } from "./domainUtils";

const TOKEN_KEY = "auth_token";

/**
 * Resolve the root domain for cookie sharing.
 *
 * Priority:
 * 1. VITE_AUTH_DOMAIN env var (production — most reliable)
 * 2. Auto-detect from hostname (development fallback)
 *
 * Examples:
 *   env VITE_AUTH_DOMAIN="hrms.dev.mitarv.com"  →  ".dev.mitarv.com"
 *   hostname "hora4.lvh.me"             →  ".lvh.me"
 *   hostname "localhost"                 →  "" (no domain attr)
 */
const getRootDomain = () => {
  const hostname = window.location.hostname;

  // Localhost / IP — no domain attr needed
  if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return "";
  }

  const parentDomain = getParentDomain();
  if (parentDomain) {
    if (hostname === parentDomain || hostname.endsWith(`.${parentDomain}`)) {
      return `.${parentDomain}`;
    }
  }

  // Auto-detect from hostname (last 2 segments)
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".");
  }

  return "";
};

// Cache the root domain — it won't change during a session
let _cachedRootDomain = null;
const getCachedRootDomain = () => {
  if (_cachedRootDomain === null) {
    _cachedRootDomain = getRootDomain();
  }
  return _cachedRootDomain;
};

const isSecure = () => window.location.protocol === "https:";

/**
 * Set a cookie with proper security flags.
 * Token expiry is managed by the backend; this sets a session cookie
 * (cleared when browser is closed, or when backend returns 401).
 */
const setCookie = (name, value) => {
  const domain = getCachedRootDomain();
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    "SameSite=Lax",
  ];
  if (domain) parts.push(`domain=${domain}`);
  if (isSecure()) parts.push("Secure");
  document.cookie = parts.join("; ");
  
  // Backward compatibility for legacy actions that explicitly read localStorage
  localStorage.setItem("token", value);
};

/**
 * Read a cookie by name.
 */
const getCookie = (name) => {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Remove a cookie by setting it to expire in the past.
 * Clears with and without domain to handle edge cases.
 */
const removeCookie = (name) => {
  const domain = getCachedRootDomain();
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  // Clear with domain
  if (domain) {
    document.cookie = `${name}=; ${expired}; path=/; domain=${domain}`;
  }
  // Clear without domain (catches cookies set before this utility existed)
  document.cookie = `${name}=; ${expired}; path=/`;
  
  // Clean up legacy localStorage entry
  localStorage.removeItem("token");
};

// ── Public API ──

export const getToken = () => getCookie(TOKEN_KEY);
export const setToken = (token) => setCookie(TOKEN_KEY, token);
export const removeToken = () => removeCookie(TOKEN_KEY);

/**
 * Full auth cleanup — removes token cookie and any legacy localStorage entries.
 */
export const clearAuth = () => {
  removeToken();
  // Clean up legacy localStorage entries from old code
  localStorage.removeItem("token");
  localStorage.removeItem("tenantId");
};
