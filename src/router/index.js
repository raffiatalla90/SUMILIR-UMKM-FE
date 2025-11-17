import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  // Grup halaman Auth pakai AuthLayout
  {
    path: "/",
    component: () => import("@/layouts/AuthLayout.vue"),
    meta: { guest: true },
    children: [
      {
        path: "login",
        name: "Login",
        component: () => import("@/views/auth/Login.vue"),
        meta: { title: "Login | SUMILIR" },
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/views/auth/Register.vue"),
        meta: { title: "Register | SUMILIR" },
      },
      {
        path: "forgot-password",
        name: "Forgot Password",
        component: () => import("@/views/auth/ForgotPassword.vue"),
        meta: { title: "Forgot Password | SUMILIR" },
      },
      {
        path: "reset-password/:token?",
        name: "Reset Password",
        component: () => import("@/views/auth/ResetPassword.vue"),
        meta: { title: "Reset Password | SUMILIR" },
      },
      {
        path: "verify-email",
        name: "Email Verification",
        component: () => import("@/views/auth/EmailVerification.vue"),
        meta: { title: "Email Verification | SUMILIR" },
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

  // {
  //   path: "/dashboard",
  //   name: "Dashboard",
  //   component: () => import("@/views/dashboard/Index.vue"),
  //   meta: { requiresAuth: true },
  // },

  {
    path: "/merchant-center",
    name: "Merchant Center",
    component: () => import("@/layouts/MerchantLayout.vue"),
    meta: {
      // requiresAuth: true,
      guest: true,
      // roles: ["umkm-owner"],
    },
    children: [
      { path: "", redirect: { name: "Merchant - Dashboard" } },
      {
        path: "dashboard",
        name: "Merchant - Dashboard",
        component: () => import("@/views/merchant/products/Index.vue"),
        meta: {
          title: "Merchant Center | SUMILIR",
        },
      },
      {
        path: "products",
        name: "Merchant - Product UMKM",
        component: () => import("@/views/merchant/products/Index.vue"),
        meta: {
          title: "Product UMKM | SUMILIR",
        },
      },
      {
        path: "products/:id",
        name: "Merchant - Product Detail",
        component: () => import("@/views/merchant/products/Detail.vue"),
        meta: {
          title: "Product Detail UMKM | SUMILIR",
        },
      },
      {
        path: "products/create",
        name: "Merchant - Buat Product",
        component: () => import("@/views/merchant/products/Create.vue"),
        meta: {
          title: "Buat Product UMKM | SUMILIR",
        },
      },
      {
        path: "products/:id/edit",
        name: "Merchant - Product Edit",
        component: () => import("@/views/merchant/products/Edit.vue"),
        meta: {
          title: "Edit Product UMKM | SUMILIR",
        },
      },
      // {
      //   path: "products/:id/variants",
      //   name: "Merchant - Product Variants",
      //   component: () => import("@/views/merchant/products/Variants.vue"),
      // },
    ],
  },

  // Fallback
  { path: "/:pathMatch(.*)*", redirect: "/login" },
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
