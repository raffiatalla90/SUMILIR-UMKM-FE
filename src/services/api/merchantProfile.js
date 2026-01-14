import axios from "@/libs/axios";

const getMerchantProfile = async (merchantSlug) => {
  const response = await axios.get(`/api/merchant/${merchantSlug}/profile`);
  return response.data;
};

const updateMerchantProfile = async (merchantSlug, payload) => {
  const response = await axios.post(
    `/api/merchant/${merchantSlug}/update`,
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
