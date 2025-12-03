/**
 * Clear all cookies
 */
export function clearAllCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    // Clear cookie dengan berbagai path
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
  }

  console.log("✅ All cookies cleared");
}

/**
 * Clear specific cookie
 */
export function clearCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  console.log(`✅ Cookie cleared: ${name}`);
}

/**
 * Get all cookies as object
 */
export function getAllCookies() {
  return document.cookie.split(";").reduce((cookies, cookie) => {
    const [name, value] = cookie.split("=").map((c) => c.trim());
    if (name) cookies[name] = value;
    return cookies;
  }, {});
}

/**
 * Count total cookies
 */
export function countCookies() {
  const cookies = getAllCookies();
  return Object.keys(cookies).length;
}

/**
 * Log cookies (for debugging)
 */
export function logCookies() {
  const cookies = getAllCookies();
  console.table(cookies);
  console.log("Total cookies:", countCookies());
}
