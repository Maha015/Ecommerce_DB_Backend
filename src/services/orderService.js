import api from "./api";

export const fetchOrders = () => api.get("/orders");
export const createOrder = (order) => api.post("/orders", order);
