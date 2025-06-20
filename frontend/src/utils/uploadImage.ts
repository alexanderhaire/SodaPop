import axios from "axios";

export const uploadImage = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("/api/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
