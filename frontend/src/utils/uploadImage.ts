import axios from "./axiosConfig";

export const uploadImage = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);

  console.log("Sending upload request with token:", token);

  const response = await axios.post("/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
