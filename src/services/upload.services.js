import axios from 'axios';

const uploadImage = async (file) => {
    if (!file) {
        return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'uploadcaytrong');

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dozixirtn/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("Lỗi khi tải file lên Cloudinary:", error);
        throw new Error("Tải file thất bại!");
    }
};

export { uploadImage };