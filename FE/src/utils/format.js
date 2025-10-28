export const fmtDate = (iso) => {
  if(!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};
