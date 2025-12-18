import { ref } from "vue";
import api from "@/libs/axios";

// Simple chat composable for buyer <-> merchant consultations
export function useChat() {
  const conversations = ref([]);
  const messages = ref([]);
  const activeConversation = ref(null);
  const loading = ref(false);

  async function fetchConversations(params = {}) {
    loading.value = true;
    try {
      const { data } = await api.get("/chats", { params });
      conversations.value = data.data || data;
      return conversations.value;
    } finally {
      loading.value = false;
    }
  }

  // Start or get a conversation for a jasa (buyer side)
  async function startConversation(jasaId) {
    const { data } = await api.post("/chats/start", { jasa_id: jasaId });
    const convo = data.data || data;
    activeConversation.value = convo;
    return convo;
  }

  async function loadConversation(conversationId) {
    loading.value = true;
    try {
      const { data } = await api.get(`/chats/${conversationId}`);
      const payload = data.data || data;
      activeConversation.value = payload.conversation || payload;
      messages.value = payload.messages || [];
      return { conversation: activeConversation.value, messages: messages.value };
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(conversationId, body) {
    const { data } = await api.post(`/chats/${conversationId}/messages`, { body });
    const msg = data.data || data;
    messages.value.push(msg);
    return msg;
  }

  async function makeOffer(conversationId, offerPrice, note = "") {
    const { data } = await api.post(`/chats/${conversationId}/offers`, {
      offer_price: offerPrice,
      body: note || null,
    });
    const msg = data.data || data;
    messages.value.push(msg);
    return msg;
  }

  async function respondOffer(conversationId, messageId, accept = true) {
    const url = accept
      ? `/chats/${conversationId}/offers/${messageId}/accept`
      : `/chats/${conversationId}/offers/${messageId}/reject`;
    const { data } = await api.post(url);
    const updated = data.data || data;
    // Update local messages array
    const idx = messages.value.findIndex((m) => m.id === updated.id);
    if (idx !== -1) messages.value[idx] = updated;
    return updated;
  }

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    fetchConversations,
    startConversation,
    loadConversation,
    sendMessage,
    makeOffer,
    respondOffer,
  };
}
