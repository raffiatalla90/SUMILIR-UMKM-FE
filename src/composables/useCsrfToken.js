// import { ref, computed } from "vue";
// import { ensureCsrfToken, refreshCsrfToken, readCookie } from "@/libs/axios";

// const csrfToken = ref(null);
// const isFetching = ref(false);
// const lastFetchTime = ref(null);

// /**
//  * Initialize CSRF token on page load
//  * Automatically called by router guard on every navigation
//  */
// export async function initializeCsrfToken() {
//   try {
//     if (isFetching.value) {
//       console.log("[CSRF] Fetch already in progress, waiting...");
//       return csrfToken.value;
//     }

//     isFetching.value = true;
//     const token = await ensureCsrfToken();
//     csrfToken.value = token;
//     lastFetchTime.value = Date.now();
//     console.log("[CSRF] Token initialized:", token?.substring(0, 10) + "...");
//     return token;
//   } catch (error) {
//     console.error("[CSRF] Failed to initialize token:", error);
//     return null;
//   } finally {
//     isFetching.value = false;
//   }
// }

// /**
//  * Refresh CSRF token manually
//  */
// export async function refreshToken() {
//   try {
//     isFetching.value = true;
//     const token = await refreshCsrfToken();
//     csrfToken.value = token;
//     lastFetchTime.value = Date.now();
//     console.log("[CSRF] Token refreshed");
//     return token;
//   } catch (error) {
//     console.error("[CSRF] Failed to refresh token:", error);
//     return null;
//   } finally {
//     isFetching.value = false;
//   }
// }

// /**
//  * Get current CSRF token from cookie
//  */
// export function getCsrfTokenFromCookie() {
//   return readCookie("XSRF-TOKEN");
// }

// /**
//  * Use in components - reactive composable
//  */
// export function useCsrfToken() {
//   return {
//     csrfToken: computed(() => csrfToken.value),
//     isFetching: computed(() => isFetching.value),
//     getCsrfTokenFromCookie,
//     refreshToken,
//     initializeCsrfToken,
//   };
// }
