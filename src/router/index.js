import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  // Grup halaman Auth pakai AuthLayout
  {
    path: "/auth",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [

      {
        path: "login",
        name: "Login",
        component: () => import("@/views/auth/Login.vue"),
        meta: { guest: true, title: "Login | SUMILIR" },
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/views/auth/Register.vue"),
        meta: { guest: true, title: "Register | SUMILIR" },
      },
      {
        path: "forgot-password",
        name: "Forgot Password",
        component: () => import("@/views/auth/ForgotPassword.vue"),
        meta: { guest: true, title: "Forgot Password | SUMILIR" },
      },
      {
        path: "reset-password/:token?",
        name: "Reset Password",
        component: () => import("@/views/auth/ResetPassword.vue"),
        meta: { guest: true, title: "Reset Password | SUMILIR" },
      },
      {
        path: "verify-email",
        name: "Email Verification",
        component: () => import("@/views/auth/EmailVerification.vue"),
        meta: { guest: true, title: "Email Verification | SUMILIR" },
      },
      { path: "", redirect: { name: "Login" } },
    ],
  },

  // Halaman non-auth (tanpa AuthLayout)

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

  // Fallback
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  document.title = to.meta.title || "SUMILIR";

  if (to.meta.requiresAuth && !authStore.isAuthenticated) return next("/login");

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
    const allowed = requiredRoles.some(
      (rr) =>
        userRoles.includes(rr.toLowerCase()) ||
        abilities.includes(`role:${rr.toLowerCase()}`)
    );
    if (!allowed) return next("/dashboard");
  }

  if (to.meta.guest && authStore.isAuthenticated) return next("/dashboard");
  next();
});

export default router;
