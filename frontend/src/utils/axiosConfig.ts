import axios from "axios";
import { getToken } from "./authToken";

axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: \`Bearer \${token}\`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
