import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  // ✅ Halaman Beranda (Public/Customer)
  {
    path: "",
    name: "Beranda",
    component: () => import("@/views/Home.vue"),
    meta: {
      title: "Beranda | SUMILIR",
    },
  },

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
    ],
  },

  // Halaman merchant register
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

  // Halaman admin
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/views/admin/Dashboard.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
    children: [
      {
        path: "",
        redirect: { name: "Admin Dashboard" },
      },
      {
        path: "dashboard",
        name: "Admin Dashboard",
        component: () => import("@/views/merchant/dashboard/Index.vue"),
        meta: {
          title: "Admin Dashboard | SUMILIR",
        },
      },
    ],
  },

  // Halaman merchant
  {
    path: "/merchant-center/:merchantId",
    name: "Merchant",
    component: () => import("@/layouts/MerchantLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: ["umkm-owner"],
      requiresMerchantId: true,
    },
    children: [
      {
        path: "",
        redirect: (to) => ({
          name: "Merchant - Dashboard",
          params: { merchantId: to.params.merchantId },
        }),
      },
      {
        path: "dashboard",
        name: "Merchant - Dashboard",
        component: () => import("@/views/merchant/dashboard/Index.vue"),
        meta: {
          title: "Merchant Dashboard | SUMILIR",
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
        path: "products/create",
        name: "Merchant - Buat Product",
        component: () => import("@/views/merchant/products/Create.vue"),
        meta: {
          title: "Buat Product UMKM | SUMILIR",
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
        path: "products/:id/edit",
        name: "Merchant - Product Edit",
        component: () => import("@/views/merchant/products/Edit.vue"),
        meta: {
          title: "Edit Product UMKM | SUMILIR",
        },
      },
      {
        path: "community",
        name: "Merchant - Community",
        component: () => import("@/views/merchant/community/Index.vue"),
        meta: {
          title: "Community | SUMILIR",
        },
      },
      {
        path: "discounts",
        name: "Merchant - Discounts",
        component: () => import("@/views/merchant/discounts/Index.vue"),
        meta: {
          title: "Discounts | SUMILIR",
        },
      },
      {
        path: "orders",
        name: "Merchant - Orders",
        component: () => import("@/views/merchant/orders/Index.vue"),
        meta: {
          title: "Orders | SUMILIR",
        },
      },
    ],
  },

  // // ✅ Halaman Unauthorized
  // {
  //   path: "/unauthorized",
  //   name: "Unauthorized",
  //   component: () => import("@/views/errors/Unauthorized.vue"),
  //   meta: { title: "Unauthorized | SUMILIR" },
  // },

  // Fallback
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Track navigation to prevent excessive calls
let lastNavigationPath = null;

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  document.title = to.meta.title || "SUMILIR";

  // ✅ ADD: Skip if navigating to same path
  if (to.path === lastNavigationPath) {
    console.log("[Router] Same path navigation detected, skipping...");
    next();
    return;
  }

  lastNavigationPath = to.path;

  console.log("🔍 [Router Guard]", {
    to: to.path,
    from: from.path,
    isAuthenticated: authStore.isAuthenticated,
  });

  // ✅ 1. Jika route butuh auth tapi user belum login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.warn("⚠️ Not authenticated, redirecting to /login");
    return next("/login");
  }

  // ✅ 2. Jika user sudah login dan akses halaman guest
  if (to.meta.guest && authStore.isAuthenticated) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    if (userRoles.includes("admin") || userRoles.includes("umkm-owner")) {
      return next("/merchant-center");
    } else if (userRoles.includes("customer")) {
      return next("/");
    } else {
      return next("/");
    }
  }

  // ✅ 3. Role-based access control
  const requiredRoles = to.meta.roles || [];
  if (requiredRoles.length && authStore.isAuthenticated) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      userRoles.includes(requiredRole.toLowerCase())
    );

    if (!hasRequiredRole) {
      console.warn("⚠️ Role not allowed, redirecting to /");
      return next("/");
    }
  }

  next();
});

export default router;
