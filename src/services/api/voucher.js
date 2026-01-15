import api from "@/libs/axios";

/* =====================================================
 * Customer VOUCHERS
 * ===================================================== */
export async function getVouchersByMerchant(merchantSlug) {
  const { data } = await api.get(`/api/checkout/${merchantSlug}/vouchers`);
  return data;
}

/* =====================================================
 * Merchant VOUCHERS
 * ===================================================== */
export async function getMerchantVouchers(merchantSlug, params = {}) {
  const { data } = await api.get(`/api/merchant/${merchantSlug}/vouchers`, {
    params,
  });
  return data;
}

export async function getMerchantVoucherDetail(merchantSlug, voucherId) {
  const { data } = await api.get(
    `/api/merchant/${merchantSlug}/vouchers/${voucherId}`
  );
  return data;
}

export async function createMerchantVoucher(merchantSlug, payload) {
  const { data } = await api.post(
    `/api/merchant/${merchantSlug}/vouchers`,
    payload
  );
  return data;
}

export async function editMerchantVoucher(merchantSlug, voucherId, payload) {
  const { data } = await api.put(
    `/api/merchant/${merchantSlug}/vouchers/${voucherId}`,
    payload
  );
  return data;
}

export async function editStatus(merchantSlug, voucherId, status) {
  const { data } = await api.patch(
    `/api/merchant/${merchantSlug}/vouchers/${voucherId}/status`,
    { voucher_status: status }
  );
  return data;
}

export async function deleteMerchantVoucher(merchantSlug, voucherId) {
  const { data } = await api.delete(
    `/api/merchant/${merchantSlug}/vouchers/${voucherId}`
  );
  return data;
}

export async function bulkDeleteMerchantVoucher(merchantSlug, voucherIds = []) {
  const { data } = await api.post(
    `/api/merchant/${merchantSlug}/vouchers/bulk-delete`,
    { voucher_ids: voucherIds }
  );
  return data;
}

export async function editBulkStatus(merchantSlug, voucherIds = [], status) {
  const { data } = await api.post(
    `/api/merchant/${merchantSlug}/vouchers/bulk-update-status`,
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
