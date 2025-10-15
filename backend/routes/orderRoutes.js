// routes/orderRoutes.js
import express from "express";
import { getOrders, createOrder } from "../controllers/orderController.js";

const router = express.Router();

// GET all orders
router.get("/", getOrders);

// POST a new order
router.post("/", createOrder);

// You can add more routes later, e.g. updating order status
// router.put("/:id/status", updateOrderStatus);

export default router;
