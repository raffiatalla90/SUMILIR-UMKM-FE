// src/services/cart.service.js
import api from "@/libs/axios";

export function fetchCart() {
  return api.get("/api/cart");
}

export function fetchCartCount() {
  return api.get("/api/cart/count");
}

export function addToCart(payload) {
  return api.post("/api/cart/items", payload);
}

export function updateCartItemQuantity(id, payload) {
  return api.patch(`/api/cart/items/${id}`, payload);
}

export function updateCartItemVariant(id, payload) {
  return api.patch(`/api/cart/items/${id}/variant`, payload);
}

export function removeCartItem(id) {
  return api.delete(`/api/cart/items/${id}`);
}

export function clearCart(id) {
  return api.delete(`/api/cart/${id}`);
}
