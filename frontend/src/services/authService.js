import api from "../api/axios";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await api.put("/auth/password", passwordData);
  return response.data;
};

export const toggle2FA = async () => {
  const response = await api.post("/auth/2fa/toggle");
  return response.data;
};
