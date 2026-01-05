import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import CommunityView from "@/views/CommunityView.vue";
import CommunityDetailView from "@/views/CommunityDetailView.vue";
import ProfileView from "@/views/ProfileView.vue";
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
    meta: { title: "API Test | SUMILIR" },
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
        meta: { title: "Beranda | SUMILIR" },
      },
      {
        path: "product-toko",
        name: "Product Toko",
        component: () => import("@/views/customer/ProductTokoHome.vue"),
        meta: { title: "Semua Produk Toko | SUMILIR" },
      },
      {
        path: "product-kuliner",
        name: "Product Kuliner",
        component: () => import("@/views/customer/ProductKulinerHome.vue"),
        meta: { title: "Semua Produk Kuliner | SUMILIR" },
      },
      {
        path: "merchant/:slug",
        name: "Merchant Detail",
        component: () => import("@/views/customer/ProductTokoHome.vue"),
        meta: { title: "Detail Toko | SUMILIR" },
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
        path: "keranjang",
        path: "cart",
        name: "Keranjang",
        component: () => import("@/views/customer/Cart.vue"),
        meta: {
          requiresAuth: true,
          roles: ["customer"],
          title: "Keranjang | SUMILIR",
        },
      },
      {
        path: "product-payment",
        name: "Pembayaran Produk",
        component: () => import("@/views/customer/PembayaranProduct.vue"),
        meta: {
          // requiresAuth: true,
          // roles: ["customer"],
          title: "Pembayaran | SUMILIR",
        },
      },
      {
        path: "search/:keyword?",
        name: "Search Page",
        component: () => import("@/views/customer/SearchPage.vue"),
        meta: { title: "Cari | SUMILIR" },
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
    name: "Admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
    beforeEnter: adminGuard,
    children: [
      {
        path: "",
        redirect: { name: "Admin Dashboard" },
      },
      {
        path: "dashboard",
        name: "Admin Dashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: { title: "Admin Dashboard | SUMILIR" },
      },
      // EVENTS
      {
        path: "events",
        name: "Admin - Events",
        component: () => import("@/views/admin/events/Index.vue"),
        children: [
          {
            path: "",
            name: "Admin - Events List",
            component: () => import("@/views/admin/events/List.vue"),
          },
          {
            path: "create",
            name: "Admin - Create Event",
            component: () => import("@/views/admin/events/Create.vue"),
          },
          {
            path: ":id",
            name: "Admin - Event Detail",
            component: () => import("@/views/admin/events/Detail.vue"),
          },
          {
            path: ":id/edit",
            name: "Admin - Edit Event",
            component: () => import("@/views/admin/events/Edit.vue"),
          },
        ],
      },
      // PRODUCTS
      {
        path: "products",
        name: "Admin - Product",
        component: () => import("@/views/admin/products/Index.vue"),
        meta: { title: "Products | Admin SUMILIR" },
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
      // VOUCHERS (View All)
      {
        path: "vouchers",
        name: "Admin - Vouchers",
        component: () => import("@/views/admin/vouchers/Index.vue"),
        meta: { title: "All Vouchers | Admin SUMILIR" },
      },
      // USERS
      {
        path: "users",
        name: "Admin - Users",
        component: () => import("@/views/admin/users/Index.vue"),
        meta: { title: "User Management | Admin SUMILIR" },
        children: [
          {
            path: "",
            redirect: { name: "Admin - Customers List" },
          },

          // Customer Route

          {
            path: "customer",
            name: "Admin - Customers List",
            component: () => import("@/views/admin/users/customers/Index.vue"),
            meta: { title: "Customer List | Admin SUMILIR" },
          },
          {
            path: "customers/create",
            name: "Admin - Customer Create",
            component: () => import("@/views/admin/users/customers/Create.vue"),
          },
          {
            path: "customers/:id",
            name: "Admin - Customer Detail",
            component: () => import("@/views/admin/users/customers/Detail.vue"),
            meta: { title: "Customer Detail | Admin SUMILIR" },
          },

          // Merchant Route

          {
            path: "merchants",
            name: "Admin - Merchants List",
            component: () => import("@/views/admin/users/merchants/Index.vue"),
            meta: { title: "Merchant List | Admin SUMILIR" },
          },
          {
            path: "merchants/:id",
            name: "Admin - Merchant Detail",
            component: () => import("@/views/admin/users/merchants/Detail.vue"),
            meta: { title: "Merchant Detail | Admin SUMILIR" },
          },
          {
            path: "merchants/create",
            name: "Admin - Merchant Create",
            component: () => import("@/views/admin/users/merchants/Create.vue"),
            meta: { title: "Tambah Merchant | Admin SUMILIR" },
          },
        ],
      },
    ],
  },

  // Halaman merchant
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
        path: "products/:slug",
        name: "Merchant - Product Detail",
        component: () => import("@/views/merchant/products/Detail.vue"),
        meta: {
          title: "Product Detail UMKM | SUMILIR",
        },
      },
      {
        path: "products/:slug/edit",
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
    ],
  },

  // // Halaman Unauthorized
  // {
  //   path: "/unauthorized",
  //   name: "Unauthorized",
  //   component: () => import("@/views/errors/Unauthorized.vue"),
  //   meta: { title: "Unauthorized | SUMILIR" },
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
  {
    path: "/profile",
    component: () => import("@/views/ProfileLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Profile",
        component: () => import("@/views/ProfileView.vue"),
        meta: { title: "Profile | SUMILIR" }, // ← dari kodemu
      },
      {
        path: "edit",
        name: "EditProfile",
        component: () => import("@/views/EditProfileView.vue"),
        meta: { title: "Edit Profile | SUMILIR" }, // ← dari kodemu
      },
      {
        path: "change-password",
        name: "ChangePassword",
        component: () => import("@/views/ChangePasswordView.vue"),
        meta: { title: "Ubah Kata Sandi | SUMILIR" }, // ← dari kodemu
      },
    ],
  },


  // Fallback
  { path: "/:pathMatch(.*)*", redirect: "/" },

  // {
  //   path: "/community",
  //   name: "community",
  //   component: CommunityView,
  // },
  // {
  //   path: "/community/:slug",
  //   name: "community-detail",
  //   component: CommunityDetailView,
  //   props: true,
  // },
  // { path: "/:pathMatch(.*)*", redirect: "/" },
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
});

// Track navigation to prevent excessive calls
let lastNavigationPath = null;
let authInitialized = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  document.title = to.meta.title || "SUMILIR";

  if (!authInitialized) {
    authInitialized = true;
    await authStore.initAuth();
  }

  // Skip if navigating to same path
  if (to.path === lastNavigationPath) {
    next();
    return;
  }

  lastNavigationPath = to.path;

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.warn("⚠️ Not authenticated, redirecting to /login");
    return next("/login");
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    if (userRoles.includes("admin") || userRoles.includes("umkm-owner")) {
      const merchant = authStore.activeMerchant;

      if (merchant) {
        return next(`/merchant-center/${merchant.id}`);
      }
      return next("/");
    } else if (userRoles.includes("customer")) {
      return next("/");
    } else {
      return next("/");
    }
  }

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

  if (to.path.startsWith("/merchant-center")) {
    const merchantIdParam = to.params.merchantId
      ? Number(to.params.merchantId)
      : null;

    // Wajib ada merchantId di URL
    if (!merchantIdParam || Number.isNaN(merchantIdParam)) {
      console.warn(
        "merchantId kosong/tidak valid, redirect ke /merchant-register"
      );
      return next("/merchant-register");
    }

    const merchant = authStore.getMerchantById(merchantIdParam);

    // Jika tidak ditemukan di store (karena belum approved), blok akses
    if (!merchant) {
      console.warn(
        "Merchant tidak ditemukan/ belum approved, redirect ke /merchant-register"
      );
      return next("/merchant-register");
    }

    // Jika status bukan approved, blok akses
    if (merchant.status !== "approved") {
      console.warn("Merchant belum approved, redirect ke /merchant-register");
      return next("/merchant-register");
    }
  }

  next();
});

export default router;
