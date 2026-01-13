import axios from "@/libs/axios";

export async function getMyAddress() {
  const response = await axios.get("api/profile/address");
  return response.data;
}

export async function upsertMyAddress(payload) {
  const response = await axios.post("api/profile/address", payload);
  return response.data;
}
