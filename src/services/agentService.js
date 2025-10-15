import api from "./api";

export const fetchAgents = () => api.get("/agents");
