import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const authAPI = {
  login: (email: string, name?: string) =>
    api.post("/auth/login", { email, name }),
};

export const projectsAPI = {
  list: () => api.get("/projects"),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post("/projects", data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const deploymentsAPI = {
  list: () => api.get("/deployments"),
  create: (data: any) => api.post("/deployments", data),
  get: (id: string) => api.get(`/deployments/${id}`),
  listByProject: (projectId: string) =>
    api.get(`/deployments/project/${projectId}`),
  cancel: (id: string) => api.post(`/deployments/${id}/cancel`),
};

export default api;
