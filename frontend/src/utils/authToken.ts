// File: frontend/src/utils/authToken.ts
export const TOKEN_KEY = "sodapop_jwt";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log("Token from getToken():", token);
  return token;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
