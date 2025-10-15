import express from "express";
import { 
  getDeliveryAgents, 
  createDeliveryAgent, 
  updateDeliveryAgent, 
  deleteDeliveryAgent, 
  getAgentStats 
} from "../controllers/userController.js";

const router = express.Router();

// Get all delivery agents (Admin only)
router.get("/", getDeliveryAgents);

// Create a new delivery agent (Admin only)
router.post("/", createDeliveryAgent);

// Update a delivery agent (Admin only)
router.put("/:id", updateDeliveryAgent);

// Delete/deactivate a delivery agent (Admin only)
router.delete("/:id", deleteDeliveryAgent);

// Get delivery agent statistics (Admin or the agent)
router.get("/:id/stats", getAgentStats);

export default router;
