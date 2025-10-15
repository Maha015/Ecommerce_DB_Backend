const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@demo.com',
      phone: '+1234567890',
      password: hashedPassword,
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        pincode: '12345',
        coordinates: {
          lat: 28.6139,
          lng: 77.2090
        }
      }
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@demo.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();