import axios from "@/libs/axios";

const getMerchantProfile = async (merchantId) => {
  const response = await axios.get(`api/merchants/${merchantId}/profile`);
  return response.data;
};

const updateMerchantProfile = async (merchantId, payload) => {
  const response = await axios.post(
    `api/merchants/${merchantId}/update`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export default {
  getMerchantProfile,
  updateMerchantProfile,
};
