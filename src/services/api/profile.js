import axios from "@/libs/axios";

const getProfile = async () => {
  const response = await axios.get("api/profile");
  return response.data;
};

const updateProfile = async (payload) => {
  const response = await axios.post("api/profile/update", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const changePassword = async (payload) => {
  const response = await axios.post("/profile/change-password", payload);
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
};
