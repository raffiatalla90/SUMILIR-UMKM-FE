import api from "@/libs/axios";

/* =====================================================
 * Customer VOUCHERS
 * ===================================================== */
export async function getVouchersByMerchant(merchantId) {
  const { data } = await api.get(`/api/checkout/${merchantId}/vouchers`);
  return data;
}

/* =====================================================
 * Merchant VOUCHERS
 * ===================================================== */
export async function getMerchantVouchers(merchantId, params = {}) {
  const { data } = await api.get(`/api/merchant/${merchantId}/vouchers`, {
    params,
  });
  return data;
}

export async function getMerchantVoucherDetail(merchantId, voucherId) {
  const { data } = await api.get(
    `/api/merchant/${merchantId}/vouchers/${voucherId}`
  );
  return data;
}

export async function createMerchantVoucher(merchantId, payload) {
  const { data } = await api.post(
    `/api/merchant/${merchantId}/vouchers`,
    payload
  );
  return data;
}

export async function editMerchantVoucher(merchantId, voucherId, payload) {
  const { data } = await api.put(
    `/api/merchant/${merchantId}/vouchers/${voucherId}`,
    payload
  );
  return data;
}

export async function editStatus(merchantId, voucherId, status) {
  const { data } = await api.patch(
    `/api/merchant/${merchantId}/vouchers/${voucherId}/status`,
    { voucher_status: status }
  );
  return data;
}

export async function deleteMerchantVoucher(merchantId, voucherId) {
  const { data } = await api.delete(
    `/api/merchant/${merchantId}/vouchers/${voucherId}`
  );
  return data;
}

export async function bulkDeleteMerchantVoucher(merchantId, voucherIds = []) {
  const { data } = await api.post(
    `/api/merchant/${merchantId}/vouchers/bulk-delete`,
    { voucher_ids: voucherIds }
  );
  return data;
}

export async function editBulkStatus(merchantId, voucherIds = [], status) {
  const { data } = await api.post(
    `/api/merchant/${merchantId}/vouchers/bulk-update-status`,
    {
      voucher_ids: voucherIds,
      voucher_status: status,
    }
  );
  return data;
}

/* =====================================================
 * Admin VOUCHERS
 * ===================================================== */
