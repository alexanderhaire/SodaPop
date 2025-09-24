import axios from "./axiosConfig";

// TEMP: Mock response for /items/:id
axios.interceptors.response.use((response) => {
  if (
    response.config.url?.match(/\/items\/\w+/) &&
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

export default axios;
