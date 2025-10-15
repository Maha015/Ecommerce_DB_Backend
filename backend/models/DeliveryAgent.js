// backend/models/DeliveryAgent.js
import mongoose from 'mongoose';

const deliveryAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['available', 'busy', 'offline'], 
    default: 'offline' 
  },
  vehicleType: { type: String },
  vehicleNumber: { type: String },
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DeliveryAgent', deliveryAgentSchema);