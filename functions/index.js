const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Hàm để VÔ HIỆU HÓA hoặc KÍCH HOẠT người dùng trong Firebase Authentication
exports.toggleUserStatus = functions.https.onCall(async (data, context) => {
  // 1. Kiểm tra xem người gọi hàm có phải là admin không
  const claims = context.auth.token;
  if (claims.role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Chỉ có admin mới có thể thực hiện hành động này.",
    );
  }

  // 2. Lấy UID và trạng thái cần cập nhật
  const {uid, disabled} = data;
  if (!uid) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "UID của người dùng là bắt buộc.",
    );
  }

  try {
    // 3. Cập nhật người dùng trong Firebase Authentication
    await admin.auth().updateUser(uid, {disabled: disabled});
    // **SỬA LỖI MAX-LEN TẠI ĐÂY**
    return {
      message: `Đã ${disabled ? "vô hiệu hóa" : "kích hoạt"} ` +
               `người dùng ${uid} thành công.`,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Hàm để XÓA người dùng khỏi Firebase Authentication
exports.deleteUserAuth = functions.https.onCall(async (data, context) => {
  // 1. Kiểm tra quyền admin
  const claims = context.auth.token;
  if (claims.role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Chỉ có admin mới có thể thực hiện hành động này.",
    );
  }

  const {uid} = data;
  if (!uid) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "UID của người dùng là bắt buộc.",
    );
  }

  try {
    // 2. Xóa người dùng khỏi Firebase Authentication
    await admin.auth().deleteUser(uid);
    return {message: `Đã xóa người dùng ${uid} khỏi hệ thống xác thực.`};
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
