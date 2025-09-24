import axios from "./axiosConfig";
import { getToken } from "./authToken";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  console.log("Sending upload request with token:", token);

  const headers: Record<string, string> = {
    "Content-Type": "multipart/form-data",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post("upload", formData, {
    headers,
  });

  return response.data;
};
