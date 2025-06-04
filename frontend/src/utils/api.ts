import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
});

// TEMP: Mock response for /horses/:id
api.interceptors.response.use((response) => {
  if (
    response.config.url?.match(/\/horses\/\w+/) &&
    response.config.method === "get"
  ) {
    const id = response.config.url.split("/").pop();
    return {
      ...response,
      data: {
        _id: id,
        tokenId: 1,
        name: "Soda Pop",
        purchasePrice: 12000,
        status: "racing",
        totalShares: 1000,
        sharesSold: 340,
        purchaseDate: new Date().toISOString(),
      },
    };
  }
  return response;
});

export default api;
