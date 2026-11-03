/**
 * Format angka menjadi format Rupiah Indonesia (cth: Rp 50.000)
 * @param {number|string} amount 
 * @param {boolean} withPrefix 
 * @returns {string}
 */
export const formatCurrency = (amount, withPrefix = true) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('id-ID');
  return withPrefix ? `Rp ${formatted}` : formatted;
};

/**
 * Membersihkan input teks agar hanya berupa angka bulat
 * @param {string} text 
 * @returns {number}
 */
export const parseCleanNumber = (text) => {
  if (!text) return 0;
  const cleaned = text.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
};
