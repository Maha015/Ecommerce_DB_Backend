import express from "express";
import cors from "cors";
import morgan from "morgan";

// Import routes
import analyticsRoutes from "./routes/analytics.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// =====================
// REGISTER ROUTES
// =====================
console.log('🔌 Registering API routes...');

console.log('  📍 Registering /api/orders');
app.use("/api/orders", orderRoutes);

console.log('  📍 Registering /api/users');
app.use("/api/users", userRoutes);

console.log('  📍 Registering /api/agents');
app.use("/api/agents", agentRoutes);

console.log('  📍 Registering /api/analytics');
app.use("/api/analytics", analyticsRoutes);

console.log('✅ All routes registered successfully\n');

// Root endpoint
app.get("/", (req, res) => res.send("Ecommerce Delivery API running"));

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    error: err.message || "Server Error" 
  });
});

export default app;