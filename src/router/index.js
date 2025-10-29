import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: { guest: true, title: "Login | SUMILIR" },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/auth/Register.vue"),
    meta: { guest: true, title: "Register | SUMILIR" },
  },
  {
    path: "/merchant-register",
    name: "Merchant Register",
    component: () => import("@/views/auth/MerchantRegister.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
      title: "Merchant Register | SUMILIR",
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/dashboard/Index.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Set document title
  document.title = to.meta.title || "SUMILIR";

  // Auth check
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next("/login");
  }

  // Role check (dukungan user.roles: [{name}], atau ability 'role:customer')
  const requiredRoles = to.meta.roles || [];
  if (requiredRoles.length) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());
    const abilities = (
      authStore.user?.abilities ||
      authStore.abilities ||
      []
    ).map((a) => a.toLowerCase());

    const allowed = requiredRoles.some((rr) => {
      const need = rr.toLowerCase();
      return userRoles.includes(need) || abilities.includes(`role:${need}`);
    });

    if (!allowed) {
      // arahkan sesuai kebutuhan (mis. dashboard atau halaman 403)
      return next("/dashboard");
    }
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return next("/dashboard");
  }

  next();
});

export default router;
