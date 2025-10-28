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

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
