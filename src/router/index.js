import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import CommunityView from "@/views/CommunityView.vue";
import CommunityDetailView from "@/views/CommunityDetailView.vue";
import MyOrderLayout from "@/views/CustomerOrder/MyOrderLayout.vue";

const adminGuard = (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    toast.warning("Silakan login terlebih dahulu");
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }

  if (!authStore.isAdmin) {
    toast.error("Anda tidak memiliki akses ke halaman admin");
    next({ name: "Home" });
    return;
  }

  next();
};

const routes = [
  {
    path: "/test-api",
    name: "ApiTest",
    component: () => import("@/views/ApiTest.vue"),
    meta: { title: "API Test" },
  },
  {
    path: "/test-api",
    name: "ApiTest",
    component: () => import("@/views/ApiTest.vue"),
    meta: { title: "API Test" },
  },
  // ✅ Halaman Beranda (Public/Customer)
  {
    path: "/",
    component: () => import("@/layouts/CustomerLayout.vue"),
    children: [
      {
        path: "",
        name: "Beranda",
        component: () => import("@/views/customer/Home.vue"),
        meta: {
          title: "Marketplace UMKM Lokal Banyuanyar",
          description:
            "Sumilir adalah marketplace UMKM lokal Banyuanyar. Temukan produk kuliner, toko, dan jasa UMKM atau mulai berinteraksi dengan komunitas UMKM lokal.",
        },
      },
      {
        path: "explore",
        name: "UMKM & Produk-Layanan Jasa",
        component: () => import("@/views/customer/Explore.vue"),
        meta: { title: "Semua Produk & Layanan | SUMILIR" },
      },
      {
        path: "products/:slug",
        name: "Product Detail",
        component: () => import("@/views/customer/ProductDetail.vue"),
        meta: { title: "Product Detail | SUMILIR" },
      },
      {
        path: "merchant/:slug",
        name: "Merchant Detail",
        component: () => import("@/views/customer/MerchantStore.vue"),
        meta: { title: "Detail Toko | SUMILIR" },
      },
      {
        path: "/map",
        name: "Peta UMKM",
        component: () => import("@/views/customer/PetaUmkm.vue"),
        meta: { title: "Peta UMKM Banyuanyar" },
      },
      {
        path: "jasa/:id",
        name: "JasaDetail",
        component: () => import("@/views/customer/JasaDetail.vue"),
        meta: { title: "Detail Jasa" },
      },
      {
        path: "pembayaran-jasa",
        name: "Pembayaran Jasa",
        component: () => import("@/views/customer/PembayaranJasa.vue"),
        meta: { title: "Pembayaran", denyRoles: ["admin"] },
      },

      {
        path: "products/:slug",
        name: "Product Detail",
        component: () => import("@/views/customer/ProductDetail.vue"),
        meta: { title: "Product Detail" },
      },
      {
        path: "cart",
        name: "Keranjang",
        component: () => import("@/views/customer/Cart.vue"),
        meta: {
          requiresAuth: true,
          roles: ["customer"],
          denyRoles: ["admin"],
          title: "Keranjang",
        },
      },
      {
        path: "product-payment",
        path: "product-payment",
        name: "Pembayaran Produk",
        component: () => import("@/views/customer/PembayaranProduct.vue"),
        meta: {
          // requiresAuth: true,
          // roles: ["customer"],
          denyRoles: ["admin"],
          title: "Pembayaran",
        },
      },
      {
        path: "search",
        name: "Search Page",
        component: () => import("@/views/customer/SearchPage.vue"),
        meta: { title: "Search | SUMILIR" },
        meta: {
          title: "Pembayaran",
        },
      },
      {
        path: "search/:keyword?",
        name: "Search Page",
        component: () => import("@/views/customer/SearchPage.vue"),
        meta: { title: "Cari" },
      },

      // Halaman Community
      {
        path: "community",
        name: "community",
        component: CommunityView,
        meta: {
          title: "Komunitas UMKM Lokal Banyuanyar",
          description:
            "Komunitas UMKM lokal Banyuanyar di Sumilir. Tempat berbagi informasi, diskusi, dan promosi antar pelaku UMKM dan warga.",
        },
      },
      {
        path: "community/:slug",
        name: "community-detail",
        component: CommunityDetailView,
        props: true,
        meta: { title: "Community Detail" },
      },

      {
        path: "/profile",
        component: () => import("@/views/ProfileLayout.vue"),
        meta: { requiresAuth: true },
        children: [
          {
            path: "",
            name: "Profile",
            component: () => import("@/views/customer/profile/ProfileView.vue"),
            meta: { title: "Profile " }, // ← dari kodemu
          },
          {
            path: "edit",
            name: "EditProfile",
            component: () =>
              import("@/views/customer/profile/EditProfileView.vue"),
            meta: { title: "Edit Profile " }, // ← dari kodemu
          },
          {
            path: "address",
            name: "MyAddress",
            component: () => import("@/views/customer/profile/Address.vue"),
            meta: { title: "Address Profile " }, // ← dari kodemu
          },
          {
            path: "change-password",
            name: "ChangePassword",
            component: () =>
              import("@/views/customer/profile/ChangePasswordView.vue"),
            meta: { title: "Ubah Kata Sandi" }, // ← dari kodemu
          },
        ],
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
        meta: { title: "Login" },
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/views/auth/Register.vue"),
        meta: { title: "Register" },
      },
      {
        path: "forgot-password",
        name: "Forgot Password",
        component: () => import("@/views/auth/ForgotPassword.vue"),
        meta: { title: "Forgot Password" },
      },
      {
        path: "reset-password/:token?",
        name: "Reset Password",
        component: () => import("@/views/auth/ResetPassword.vue"),
        meta: { title: "Reset Password" },
      },
      {
        path: "verify-email",
        name: "Email Verification",
        component: () => import("@/views/auth/EmailVerification.vue"),
        meta: { title: "Email Verification" },
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
      denyRoles: ["admin"],
      title: "Merchant Register",
    },
  },

  // Halaman admin
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
    beforeEnter: adminGuard,
    children: [
      {
        path: "",
        redirect: { name: "Admin - Dashboard" },
      },
      {
        path: "dashboard",
        name: "Admin - Dashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: { title: "Admin Dashboard | SUMILIR" },
      },

      // USERS
      {
        path: "users",
        component: () => import("@/views/admin/users/Index.vue"),
        children: [
          {
            path: "",
            redirect: { name: "Admin - Customers List" },
          },
          {
            path: "customers",
            name: "Admin - Customers List",
            component: () => import("@/views/admin/users/customers/Index.vue"),
            meta: { title: "Customer List | Admin SUMILIR" },
          },
          {
            path: "customers/create",
            name: "Admin - Customer Create",
            component: () => import("@/views/admin/users/customers/Create.vue"),
            meta: { title: "Tambah Customer | Admin SUMILIR" },
          },
          {
            path: "customers/:id",
            name: "Admin - Customer Detail",
            component: () => import("@/views/admin/users/customers/Detail.vue"),
            meta: { title: "Customer Detail | Admin SUMILIR" },
          },
          {
            path: "merchants",
            name: "Admin - Merchants List",
            component: () => import("@/views/admin/users/merchants/Index.vue"),
            meta: { title: "Merchant List | Admin SUMILIR" },
          },
          {
            path: "merchants/create",
            name: "Admin - Merchant Create",
            component: () => import("@/views/admin/users/merchants/Create.vue"),
            meta: { title: "Tambah Merchant | Admin SUMILIR" },
          },
          {
            path: "merchants/:id",
            name: "Admin - Merchant Detail",
            component: () => import("@/views/admin/users/merchants/Detail.vue"),
            meta: { title: "Merchant Detail | Admin SUMILIR" },
          },
        ],
      },

      // EVENTS
      {
        path: "events",
        component: () => import("@/views/admin/events/Index.vue"),
        children: [
          {
            path: "",
            name: "Admin - Events",
            component: () => import("@/views/admin/events/List.vue"),
            meta: { title: "Events | Admin SUMILIR" },
          },
          {
            path: "create",
            name: "Admin - Create Event",
            component: () => import("@/views/admin/events/Create.vue"),
            meta: { title: "Tambah Event | Admin SUMILIR" },
          },
          {
            path: ":id",
            name: "Admin - Event Detail",
            component: () => import("@/views/admin/events/Detail.vue"),
            meta: { title: "Detail Event | Admin SUMILIR" },
          },
          // ✅ ADD: Edit Event route
          {
            path: ":id/edit",
            name: "Admin - Edit Event",
            component: () => import("@/views/admin/events/Edit.vue"),
            meta: { title: "Edit Event | Admin SUMILIR" },
          },
        ],
      },

      // VOUCHERS
      {
        path: "vouchers",
        component: () => import("@/views/admin/vouchers/Index.vue"),
        children: [
          {
            path: "",
            name: "Admin - Vouchers",
            component: () => import("@/views/admin/vouchers/List.vue"),
            meta: { title: "Vouchers | Admin SUMILIR" },
          },
          {
            path: "create",
            name: "Admin - Create Voucher",
            component: () => import("@/views/admin/vouchers/Create.vue"),
            meta: { title: "Tambah Voucher | Admin SUMILIR" },
          },
          {
            path: ":id",
            name: "Admin - Voucher Detail",
            component: () => import("@/views/admin/vouchers/Detail.vue"),
            meta: {
              requiresAuth: true,
              requiresAdmin: true,
            },
          },
        ],
      },

      // REPORTS
      {
        path: "reports",
        name: "Admin - Reports",
        component: () => import("@/views/admin/reports/Index.vue"),
        meta: { title: "Reports | Admin SUMILIR" },
      },
      {
        path: "reports/:id",
        name: "Admin - Report Detail",
        component: () => import("@/views/admin/reports/Detail.vue"),
        meta: { title: "Report Detail | Admin SUMILIR" },
      },
    ],
  },

  // Halaman merchant center
  {
    path: "/merchant-center/:merchantSlug",
    component: () => import("@/layouts/MerchantLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: ["umkm-owner"],
      requiresMerchantSlug: true,
    },
    children: [
      {
        path: "",
        redirect: (to) => ({
          name: "Merchant - Dashboard",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "dashboard",
        name: "Merchant - Dashboard",
        component: () => import("@/views/merchant/dashboard/Index.vue"),
        meta: {
          title: "Dashboard UMKM",
        },
      },

      // ===========================
      // PRODUK UMKM TOKO/KULINER
      // ===========================

      {
        path: "products",
        name: "Merchant - Product UMKM",
        component: () => import("@/views/merchant/products/Index.vue"),
        meta: { title: "Product UMKM" },
      },
      {
        path: "products/create",
        name: "Merchant - Buat Product",
        component: () => import("@/views/merchant/products/Create.vue"),
        meta: {
          title: "Buat Product UMKM",
        },
      },
      // ✅ UPDATED: Use slug instead of id
      {
        path: "products/:slug",
        name: "Merchant - Product Detail",
        component: () => import("@/views/merchant/products/Detail.vue"),
        meta: {
          title: "Product Detail UMKM",
        },
      },
      // ✅ UPDATED: Use slug instead of id
      {
        path: "products/:slug/edit",
        name: "Merchant - Product Edit",
        component: () => import("@/views/merchant/products/Edit.vue"),
        meta: {
          title: "Edit Product UMKM",
        },
      },

      // ===========================
      // ✅ JASA (UMKM JASA)
      // ===========================
      {
        path: "jasas",
        name: "Merchant - Jasa Index",
        component: () => import("@/views/merchant/productsjasa/Indexjasa.vue"),
        meta: { title: "Jasa UMKM | SUMILIR" },
      },
      // Handle /jasas/index agar tidak dianggap sebagai :id = "index"
      {
        path: "jasas/index",
        redirect: (to) => ({
          name: "Merchant - Jasa Index",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "jasas/create",
        name: "Merchant - Jasa Create",
        component: () => import("@/views/merchant/productsjasa/Createjasa.vue"),
        meta: { title: "Buat Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/createjasa",
        component: () => import("@/views/merchant/productsjasa/Createjasa.vue"),
        meta: { title: "Buat Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/:id",
        name: "Merchant - Jasa Detail",
        component: () => import("@/views/merchant/productsjasa/Detailjasa.vue"),
        meta: { title: "Detail Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/:id/edit",
        name: "Merchant - Jasa Edit",
        component: () => import("@/views/merchant/productsjasa/Editjasa.vue"),
        meta: { title: "Edit Jasa UMKM | SUMILIR" },
      },

      // ===========================
      // BACKWARD COMPATIBILITY: productsjasa routes
      // ===========================
      {
        path: "productsjasa",
        redirect: (to) => ({
          name: "Merchant - Jasa Index",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "productsjasa/create",
        redirect: (to) => ({
          name: "Merchant - Jasa Create",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "productsjasa/createjasa",
        redirect: (to) => ({
          name: "Merchant - Jasa Create",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "productsjasa/:id",
        redirect: (to) => ({
          name: "Merchant - Jasa Detail",
          params: { merchantSlug: to.params.merchantSlug, id: to.params.id },
        }),
      },
      {
        path: "productsjasa/:id/edit",
        redirect: (to) => ({
          name: "Merchant - Jasa Edit",
          params: { merchantSlug: to.params.merchantSlug, id: to.params.id },
        }),
      },

      // ===========================
      // ✅ JASA (UMKM JASA)
      // ===========================
      {
        path: "jasas",
        name: "Merchant - Jasa Index",
        component: () => import("@/views/merchant/productsjasa/Indexjasa.vue"),
        meta: { title: "Jasa UMKM | SUMILIR" },
      },
      // Handle /jasas/index agar tidak dianggap sebagai :id = "index"
      {
        path: "jasas/index",
        redirect: (to) => ({
          name: "Merchant - Jasa Index",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "jasas/create",
        name: "Merchant - Jasa Create",
        component: () => import("@/views/merchant/productsjasa/Createjasa.vue"),
        meta: { title: "Buat Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/createjasa",
        component: () => import("@/views/merchant/productsjasa/Createjasa.vue"),
        meta: { title: "Buat Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/:id",
        name: "Merchant - Jasa Detail",
        component: () => import("@/views/merchant/productsjasa/Detailjasa.vue"),
        meta: { title: "Detail Jasa UMKM | SUMILIR" },
      },
      {
        path: "jasas/:id/edit",
        name: "Merchant - Jasa Edit",
        component: () => import("@/views/merchant/productsjasa/Editjasa.vue"),
        meta: { title: "Edit Jasa UMKM | SUMILIR" },
      },

      // ===========================
      // BACKWARD COMPATIBILITY: productsjasa routes
      // ===========================
      {
        path: "productsjasa",
        redirect: (to) => ({
          name: "Merchant - Jasa Index",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "productsjasa/create",
        redirect: (to) => ({
          name: "Merchant - Jasa Create",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "productsjasa/createjasa",
        redirect: (to) => ({
          name: "Merchant - Jasa Create",
          params: { merchantSlug: to.params.merchantSlug },
        }),
      },
      {
        path: "productsjasa/:id",
        redirect: (to) => ({
          name: "Merchant - Jasa Detail",
          params: { merchantSlug: to.params.merchantSlug, id: to.params.id },
        }),
      },
      {
        path: "productsjasa/:id/edit",
        redirect: (to) => ({
          name: "Merchant - Jasa Edit",
          params: { merchantSlug: to.params.merchantSlug, id: to.params.id },
        }),
      },

      {
        path: "community",
        name: "Merchant - Community",
        component: () => import("@/views/merchant/community/Index.vue"),
        meta: {
          title: "Community",
        },
      },
      {
        path: "vouchers",
        name: "Merchant - Voucher",
        component: () => import("@/views/merchant/vouchers/Index.vue"),
        meta: {
          title: "Voucher",
        },
      },
      {
        path: "vouchers/create",
        name: "Merchant - Buat Voucher",
        component: () => import("@/views/merchant/vouchers/Create.vue"),
        meta: {
          title: "Buat Voucher UMKM",
        },
      },
      {
        path: "vouchers/:id/edit",
        name: "Merchant - Voucher Edit",
        component: () => import("@/views/merchant/vouchers/Edit.vue"),
        meta: {
          title: "Edit Voucher UMKM",
        },
      },
      // {
      //   path: "events",
      //   name: "Merchant - Events",
      //   component: () => import("@/views/merchant/events/Index.vue"),
      //   meta: {
      //     title: "Events",
      //   },
      // },

      // {
      //   path: "orders",
      //   name: "Merchant - Orders",
      //   component: () => import("@/views/merchant/orders/Index.vue"),
      //   meta: {
      //     title: "Orders",
      //   },
      // },
      {
        path: "profile",
        name: "Merchant - Profile",
        component: () => import("@/views/merchant/profile/MerchantInfo.vue"),
        meta: {
          title: "Merchant Profile | SUMILIR",
        },
      },
      {
        path: "profile/edit",
        name: "Merchant - Profile Edit",
        component: () => import("@/views/merchant/profile/MerchantEdit.vue"),
        meta: {
          title: "Edit Merchant Profile | SUMILIR",
        },
      },
      {
        path: "productsjasa",
        name: "Merchant - Products Jasa",
        component: () => import("@/views/merchant/productsjasa/Indexjasa.vue"),
        meta: { title: "Products Jasa | SUMILIR" },
      },
    ],
  },

  // // Halaman Unauthorized
  // {
  //   path: "/unauthorized",
  //   name: "Unauthorized",
  //   component: () => import("@/views/errors/Unauthorized.vue"),
  //   meta: { title: "Unauthorized" },
  // },

  // 🆕 MERCHANT PROFILE ROUTES (NO AUTH FOR TESTING)
  {
    path: "/merchant-profile",
    children: [
      {
        path: "",
        name: "Merchant Profile - Index",
        component: () => import("@/views/merchant/profile/MerchantInfo.vue"),
        meta: {
          title: "Profil Toko | SUMILIR",
          // requiresAuth: true,  // ← Commented out for testing
          // roles: ["umkm-owner"]
        },
      },
      {
        path: "edit",
        name: "Merchant Profile - Edit",
        component: () => import("@/views/merchant/profile/MerchantEdit.vue"),
        meta: {
          title: "Edit Toko | SUMILIR",
          // requiresAuth: true,  // ← Commented out for testing
          // roles: ["umkm-owner"]
        },
      },
    ],
  },

  // My Order History (dari kodemu)
  {
    path: "/my-order",
    component: MyOrderLayout, // ← dari kodemu
    meta: {
      requiresAuth: true,
      roles: ["customer"], // ← dari kodemu
    },
    children: [
      {
        path: "",
        name: "MyOrder",
        component: () => import("@/views/CustomerOrder/MyOrderView.vue"),
        meta: { title: "My Order | SUMILIR" }, // ← dari kodemu
      },
      {
        path: "give-review/:orderId?",
        name: "GiveReview",
        component: () => import("@/views/CustomerOrder/GiveReviewView.vue"),
        meta: { title: "Beri Nilai | SUMILIR" }, // ← dari kodemu
      },
      {
        path: "review",
        name: "Review",
        component: () => import("@/views/CustomerOrder/ReviewView.vue"),
        meta: { title: "Lihat Penilaian | SUMILIR" }, // ← dari kodemu
      },
      {
        path: "review/edit-review",
        name: "EditReview",
        component: () => import("@/views/CustomerOrder/EditReviewView.vue"),
        meta: { title: "Edit Penilaian | SUMILIR" }, // ← dari kodemu
      },
    ],
  },

  // Profile management (dari kodemu)

  // Fallback
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    // ⬅️ untuk back/forward browser
    if (savedPosition) {
      return savedPosition;
    }

    // ⬅️ default: selalu ke atas
    return {
      top: 0,
      left: 0,
      behavior: "smooth", // opsional
    };
  },

  scrollBehavior(to, from, savedPosition) {
    // ⬅️ untuk back/forward browser
    if (savedPosition) {
      return savedPosition;
    }

    // ⬅️ default: selalu ke atas
    return {
      top: 0,
      left: 0,
      behavior: "smooth", // opsional
    };
  },
});

// Track navigation to prevent excessive calls
let lastNavigationPath = null;
let authInitialized = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // Basic SEO for all routes (can be overridden by page-level dynamic SEO)
  try {
    const { setMeta } = await import("@/router/seo");
    setMeta({
      title: to.meta.title || "SUMILIR",
      description: to.meta.description || "",
    });
  } catch (e) {
    document.title = to.meta.title || "SUMILIR";
  }

  if (!authInitialized) {
    authInitialized = true;
    await authStore.initAuth();
  }

  // ✅ ADD: Skip if navigating to same path
  if (to.path === lastNavigationPath) {
    next();
    return;
  }

  lastNavigationPath = to.path;

  // ✅ 1. Jika route butuh auth tapi user belum login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    authStore.requireLoginToast();

    return next({
      path: "/login",
      query: { redirect: to.fullPath }, // optional tapi recommended
    });
  }

  // 2. Deny specific roles (even if other role checks would pass)
  const denyRoles = to.meta.denyRoles || [];
  if (denyRoles.length && authStore.isAuthenticated) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    const isDenied = denyRoles.some((role) =>
      userRoles.includes(String(role).toLowerCase())
    );

    if (isDenied) {
      return next("/");
    }
  }

  // 3. halaman guest tapi user sudah login
  // 3. halaman guest tapi user sudah login
  if (to.meta.guest && authStore.isAuthenticated) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    if (userRoles.includes("admin") || userRoles.includes("umkm-owner")) {
      const merchant = authStore.activeMerchant;

      if (merchant) {
        return next(`/merchant-center/${merchant.slug}`);
      }
      return next("/");
    } else if (userRoles.includes("customer")) {
      return next("/");
    } else {
      return next("/");
    }
  }

  // 4. Role-based access control
  // 4. Role-based access control
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
      return next("/");
    }
  }

  // Require approved merchant untuk /merchant-center
  // Require approved merchant untuk /merchant-center
  if (to.path.startsWith("/merchant-center")) {
    const merchantSlugParam = to.params.merchantSlug
      ? String(to.params.merchantSlug)
      : null;

    if (!merchantSlugParam) {
      return next("/merchant-register");
    }

    const merchant = authStore.getMerchantBySlug(merchantSlugParam);

    if (!merchant) {
      return next("/merchant-register");
    }

    if (merchant.status !== "approved") {
      return next("/merchant-register");
    }
  }

  next();
});

export default router;
