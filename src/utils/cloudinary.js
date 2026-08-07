import axios from "axios";
import {
  compressImageBeforeUpload,
  getCachedUploadUrl,
  setCachedUploadUrl,
  getOptimizedCloudinaryUrl,
} from "./cloudinaryUtils";

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file, uploadType = "product") => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration missing in environment variables.");
  }

  if (!file) return null;

  // 1. Upload Protection: Deduplication Check
  const cachedUrl = await getCachedUploadUrl(file);
  if (cachedUrl) {
    console.log("Reusing existing Cloudinary asset (deduplicated upload):", cachedUrl);
    return cachedUrl;
  }

  // 2. Browser-side Compression Before Upload
  const compressedFile = await compressImageBeforeUpload(file, uploadType);

  const data = new FormData();
  data.append("file", compressedFile);
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const res = await axios.post(uploadUrl, data);
  const secureUrl = res.data.secure_url;

  // 3. Cache the uploaded URL for future deduplication
  await setCachedUploadUrl(file, secureUrl);

  return secureUrl;
};

export { getOptimizedCloudinaryUrl };
export default uploadToCloudinary;

