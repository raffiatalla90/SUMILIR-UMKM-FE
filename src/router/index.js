import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { initializeCsrfToken } from "@/composables/useCsrfToken";
import CommunityView from "@/views/CommunityView.vue";
import CommunityDetailView from "@/views/CommunityDetailView.vue";

const routes = [
  // ✅ Halaman Beranda (Public/Customer)
  {
    path: "/",
    component: () => import("@/layouts/CustomerLayout.vue"),
    children: [
      {
        path: "",
        name: "Beranda",
        component: () => import("@/views/customer/Home.vue"),
        meta: { title: "Beranda | SUMILIR" },
      },

      // Halaman Jasa Teknisi & Pembayaran
      {
        path: "jasa-teknisi",
        name: "JasaTeknisi",
        component: () => import("@/views/customer/JasaTeknisi.vue"),
        meta: { title: "Semua Jasa Teknisi | SUMILIR" },
      },
      {
        path: "jasa/:id",
        name: "JasaDetail",
        component: () => import("@/views/customer/JasaDetail.vue"),
        meta: { title: "Detail Jasa | SUMILIR" },
      },
      {
        path: "pembayaran-jasa",
        name: "Pembayaran Jasa",
        component: () => import("@/views/customer/PembayaranJasa.vue"),
        meta: { title: "Pembayaran | SUMILIR" },
      },

      {
        path: "products/:slug",
        name: "Product Detail",
        component: () => import("@/views/customer/ProductDetail.vue"),
        meta: { title: "Product Detail | SUMILIR" },
      },
      {
        path: "pembayaran-product",
        name: "Pembayaran Produk",
        component: () => import("@/views/customer/PembayaranProduct.vue"),
        meta: { title: "Pembayaran | SUMILIR" },
      },

      // Halaman Community
      {
        path: "community",
        name: "community",
        component: CommunityView,
        meta: { title: "Community | SUMILIR" },
      },
      {
        path: "community/:slug",
        name: "community-detail",
        component: CommunityDetailView,
        props: true,
        meta: { title: "Community Detail | SUMILIR" },
      },
    ],
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

  // Halaman merchant center
  {
    path: "/merchant-center/:merchantId",
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

      // ===========================
      // PRODUK UMKM TOKO/KULINER
      // ===========================
      {
        path: "products",
        name: "Merchant - Product UMKM",
        component: () => import("@/views/merchant/products/Index.vue"),
        meta: { title: "Product UMKM | SUMILIR" },
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

      // ===========================
      // ✅ JASA (UMKM JASA)
      // ===========================
      {
        path: "jasas",
        name: "Merchant - Jasa Index",
        component: () =>
          import("@/views/merchant/productsjasa/Indexjasa.vue"),
        meta: { title: "Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/create",
        name: "Merchant - Jasa Create",
        component: () =>
          import("@/views/merchant/productsjasa/Createjasa.vue"),
        meta: { title: "Buat Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/createjasa",
        component: () =>
          import("@/views/merchant/productsjasa/Createjasa.vue"),
        meta: { title: "Buat Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/:id",
        name: "Merchant - Jasa Detail",
        component: () =>
          import("@/views/merchant/productsjasa/Detailjasa.vue"),
        meta: { title: "Detail Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/:id/edit",
        name: "Merchant - Jasa Edit",
        component: () =>
          import("@/views/merchant/productsjasa/Editjasa.vue"),
        meta: { title: "Edit Jasa UMKM | SUMILIR" },
      },

      // ===========================
      // BACKWARD COMPATIBILITY: productsjasa routes
      // ===========================
      {
        path: "productsjasa",
        redirect: (to) => ({
          name: "Merchant - Jasa Index",
          params: { merchantId: to.params.merchantId },
        }),
      },
      {
        path: "productsjasa/create",
        redirect: (to) => ({
          name: "Merchant - Jasa Create",
          params: { merchantId: to.params.merchantId },
        }),
      },
      {
        path: "productsjasa/createjasa",
        redirect: (to) => ({
          name: "Merchant - Jasa Create",
          params: { merchantId: to.params.merchantId },
        }),
      },
      {
        path: "productsjasa/:id",
        redirect: (to) => ({
          name: "Merchant - Jasa Detail",
          params: { merchantId: to.params.merchantId, id: to.params.id },
        }),
      },
      {
        path: "productsjasa/:id/edit",
        redirect: (to) => ({
          name: "Merchant - Jasa Edit",
          params: { merchantId: to.params.merchantId, id: to.params.id },
        }),
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
      // ✅ Route untuk productsjasa
      {
        path: "productsjasa",
        name: "Merchant - Products Jasa",
        component: () =>
          import("@/views/merchant/productsjasa/Indexjasa.vue"),
        meta: { title: "Products Jasa | SUMILIR" },
      },
    ],
  },

  // Fallback
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Track navigation to prevent excessive calls
let lastNavigationPath = null;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  document.title = to.meta.title || "SUMILIR";

  // ✅ Ensure CSRF token is initialized on every navigation
  try {
    await initializeCsrfToken();
  } catch (error) {
    console.warn("[Router] CSRF token initialization failed:", error);
    // Continue navigation even if CSRF fails (user might be on public page)
  }

  // Skip if same path
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

  // 1. butuh auth tapi belum login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.warn("⚠️ Not authenticated, redirecting to /login");
    return next("/login");
  }

  // 2. halaman guest tapi user sudah login
  if (to.meta.guest && authStore.isAuthenticated) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    if (userRoles.includes("admin") || userRoles.includes("umkm-owner")) {
      return next("/");
    } else if (userRoles.includes("customer")) {
      return next("/");
    } else {
      return next("/");
    }
  }

  // 3. Role-based access control
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

  // Require approved merchant untuk /merchant-center
  if (to.path.startsWith("/merchant-center")) {
    const merchantIdParam = to.params.merchantId
      ? Number(to.params.merchantId)
      : null;

    if (!merchantIdParam || Number.isNaN(merchantIdParam)) {
      console.warn(
        "⚠️ merchantId kosong/tidak valid, redirect ke /merchant-register"
      );
      return next("/merchant-register");
    }

    const merchant = authStore.getMerchantById(merchantIdParam);

    if (!merchant) {
      console.warn(
        "⚠️ Merchant tidak ditemukan/ belum approved, redirect ke /merchant-register"
      );
      return next("/merchant-register");
    }

    if (merchant.status !== "approved") {
      console.warn(
        "⚠️ Merchant belum approved, redirect ke /merchant-register"
      );
      return next("/merchant-register");
    }
  }

  next();
});

export default router;
