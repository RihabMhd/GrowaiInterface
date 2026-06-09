import api from "../api/axios";

export const getTeamData = async () => {
  const response = await api.get("/team");
  return response.data;
};

export const addTeamMember = async (memberData) => {
  const response = await api.post("/team/members", memberData);
  return response.data;
};

export const updateTeamMember = async (id, memberData) => {
  const response = await api.put(`/team/members/${id}`, memberData);
  return response.data;
};

export const saveTeamSettings = async (settingsData) => {
  const response = await api.post("/team/settings", settingsData);
  return response.data;
};

export const deleteTeamMember = async (id) => {
  const response = await api.delete(`/team/members/${id}`);
  return response.data;
};

export const impersonateUser = async (id) => {
  const response = await api.post(`/team/impersonate/${id}`);
  return response.data;
};