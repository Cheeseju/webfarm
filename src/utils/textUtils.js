// src/utils/textUtils.js

export const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase() // 1. Chuyển thành chữ thường
    .normalize("NFD") // 2. Chuẩn hóa Unicode (tách dấu ra khỏi chữ)
    .replace(/[\u0300-\u036f]/g, "") // 3. Xóa các ký tự dấu
    .replace(/đ/g, "d"); // 4. Chuyển 'đ' thành 'd'
};