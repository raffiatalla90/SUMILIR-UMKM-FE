import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  // ============================
  // 🟦 AUTH PAGES (LOGIN, REGISTER, DLL)
  // ============================
  {
    path: "/auth",
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

  // ============================
  // 🟧 MERCHANT CENTER
  // ============================
  {
    path: "/merchant-center",
    name: "Merchant Center",
    component: () => import("@/layouts/MerchantLayout.vue"),
    meta: {
      guest: true,
      // requiresAuth: true,
      // roles: ["umkm-owner"],
    },
    children: [
      { path: "", redirect: { name: "Merchant - Dashboard" } },
      {
        path: "dashboard",
        name: "Merchant - Dashboard",
        component: () => import("@/views/merchant/products/Index.vue"),
        meta: { title: "Merchant Center | SUMILIR" },
      },
      {
        path: "products",
        name: "Merchant - Product UMKM",
        component: () => import("@/views/merchant/products/Index.vue"),
        meta: { title: "Product UMKM | SUMILIR" },
      },
      {
        path: "products/:id",
        name: "Merchant - Product Detail",
        component: () => import("@/views/merchant/products/Detail.vue"),
        meta: { title: "Product Detail UMKM | SUMILIR" },
      },
      {
        path: "products/create",
        name: "Merchant - Buat Product",
        component: () => import("@/views/merchant/products/Create.vue"),
        meta: { title: "Buat Product UMKM | SUMILIR" },
      },
      {
        path: "products/:id/edit",
        name: "Merchant - Product Edit",
        component: () => import("@/views/merchant/products/Edit.vue"),
        meta: { title: "Edit Product UMKM | SUMILIR" },
      },
    ],
  },

  // ============================
  // 🟩 APP ROUTES (DARI ROUTER AWAL)
  // ============================
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/customer/Home.vue"),
  },
  {
    path: "/pesanan",
    name: "Pesanan",
    component: () => import("@/views/customer/Pesanan.vue"),
  },
  {
    path: "/peta-umkm",
    name: "PetaUmkm",
    component: () => import("@/views/customer/PetaUmkm.vue"),
  },
  {
    path: "/chat",
    name: "Chat",
    component: () => import("@/views/customer/Chat.vue"),
  },
  {
    path: "/user",
    name: "User",
    component: () => import("@/views/customer/User.vue"),
  },

  // Detail Jasa
  {
    path: "/jasa/:id",
    name: "JasaDetail",
    component: () => import("@/views/customer/JasaDetail.vue"),
    props: true,
  },

  // Pembayaran
  {
    path: "/pembayaran",
    name: "Pembayaran",
    component: () => import("@/views/customer/Pembayaran.vue"),
  },

  // Jasa Teknisi (Setelah Pembayaran)
  {
    path: "/jasa-teknisi",
    name: "JasaTeknisi",
    component: () => import("@/views/customer/JasaTeknisi.vue"),
  },

  // Merchant Register (akses non-auth)
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

  // NOT FOUND → arahkan ke login
  { path: "/:pathMatch(.*)*", redirect: "/auth/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ============================
// 🛡 NAVIGATION GUARD
// ============================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  document.title = to.meta.title || "SUMILIR";

  // Jika butuh login
  if (to.meta.requiresAuth && !authStore.isAuthenticated)
    return next("/auth/login");

  // Cek role
  const requiredRoles = to.meta.roles || [];
  if (requiredRoles.length) {
    const userRoles = (authStore.user?.roles || [])
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());

    const abilities = (
      authStore.user?.abilities || authStore.abilities || []
    ).map((a) => a.toLowerCase());

    const allowed = requiredRoles.some(
      (rr) =>
        userRoles.includes(rr.toLowerCase()) ||
        abilities.includes(`role:${rr.toLowerCase()}`)
    );

    if (!allowed) return next("/");
  }

  if (to.meta.guest && authStore.isAuthenticated) return next("/");
  next();
});

export default router;
