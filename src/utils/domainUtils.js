/**
 * Utility functions for domain, subdomain, and host extraction in hrms-frontend.
 */

/**
 * Extract subdomain from a hostname string.
 * E.g., 'hora4.lvh.me' -> 'hora4', 'mittarv.com' -> ''
 */
export const extractSubdomainFromHostname = (hostname = window.location.hostname) => {
  if (!hostname) return '';
  const parts = hostname.split('.');
  return parts.length >= 3 ? parts[0] : '';
};

/**
 * Extract root host for domain redirects (includes port).
 */
export const getRootHost = (host = window.location.host, envDomain = import.meta.env.VITE_AUTH_DOMAIN) => {
  if (envDomain) {
    const cleanEnvDomain = envDomain.replace(/^\./, "");
    const parts = cleanEnvDomain.split('.');
    const parentDomain = parts.length > 2 ? parts.slice(1).join('.') : cleanEnvDomain;
    const portStr = window.location.port ? `:${window.location.port}` : "";
    return parentDomain + portStr;
  }
  const parts = host.split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : host;
};

/**
 * Extract root domain (no port, no login subdomain).
 */
export const getRootDomain = (envDomain = import.meta.env.VITE_AUTH_DOMAIN) => {
  if (envDomain) {
    const cleanEnvDomain = envDomain.replace(/^\./, "");
    const parts = cleanEnvDomain.split('.');
    return parts.length > 2 ? parts.slice(1).join('.') : cleanEnvDomain;
  }
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
};

/**
 * Extract full login host with port.
 */
export const getLoginHost = (envDomain = import.meta.env.VITE_AUTH_DOMAIN) => {
  if (envDomain) {
    const cleanEnvDomain = envDomain.replace(/^\./, "");
    const portStr = window.location.port ? `:${window.location.port}` : "";
    return cleanEnvDomain + portStr;
  }
  return window.location.host;
};

/**
 * Extract domain from an email address.
 * E.g., 'user@company.com' -> 'company.com'
 */
export const extractDomainFromEmail = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase().trim() : '';
};
