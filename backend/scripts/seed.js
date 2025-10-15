const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DeliveryAgent = require('../models/DeliveryAgent');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('dotenv').config();

// Sample data for seeding
const seedUsers = async () => {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@demo.com',
      phone: '9876543210',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        coordinates: { lat: 13.0827, lng: 80.2707 }
      }
    },
    {
      name: 'John Customer',
      email: 'customer@demo.com',
      phone: '9876543211',
      password: await bcrypt.hash('customer123', 12),
      role: 'customer',
      address: {
        street: '456 Customer Lane',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600002',
        coordinates: { lat: 13.0878, lng: 80.2785 }
      }
    },
    {
      name: 'Delivery Agent',
      email: 'delivery@demo.com',
      phone: '9876543212',
      password: await bcrypt.hash('delivery123', 12),
      role: 'delivery_agent',
      address: {
        street: '789 Delivery Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600003',
        coordinates: { lat: 13.0458, lng: 80.2209 }
      }
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah@demo.com',
      phone: '9876543213',
      password: await bcrypt.hash('customer123', 12),
      role: 'customer',
      address: {
        street: '321 Wilson Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600004',
        coordinates: { lat: 13.0358, lng: 80.2567 }
      }
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    }
  }
};

const seedDeliveryAgents = async () => {
  console.log('🚚 Seeding delivery agents...');
  
  const deliveryUser = await User.findOne({ email: 'delivery@demo.com' });
  if (!deliveryUser) {
    console.log('❌ Delivery user not found');
    return;
  }

  const existingAgent = await DeliveryAgent.findOne({ user: deliveryUser._id });
  if (!existingAgent) {
    await DeliveryAgent.create({
      user: deliveryUser._id,
      vehicleType: 'bike',
      vehicleNumber: 'TN01AB1234',
      licenseNumber: 'TN0120230001',
      isAvailable: true,
      currentLocation: {
        lat: 13.0458,
        lng: 80.2209,
        lastUpdated: new Date()
      },
      deliveryZones: ['600001', '600002', '600003', '600004', '600005'],
      stats: {
        totalDeliveries: 150,
        totalEarnings: 15000,
        averageRating: 4.5,
        completionRate: 95
      },
      status: 'active'
    });
    console.log('✅ Created delivery agent profile');
  }
};

const seedProducts = async () => {
  console.log('📦 Seeding products...');
  
  const products = [
    {
      name: 'Samsung Galaxy Smartphone',
      description: 'Latest Samsung Galaxy smartphone with advanced features',
      sku: 'SAMSUNG-GALAXY-001',
      category: 'electronics',
      subcategory: 'smartphones',
      brand: 'Samsung',
      price: 22000,  // Added price field
      images: [{
        url: 'https://via.placeholder.com/300x300.png?text=Samsung+Phone',
        alt: 'Samsung Galaxy Smartphone',
        isPrimary: true
      }],
      inventory: { stock: 50, trackInventory: true },
      availability: { isActive: true, isInStock: true }
    },
    {
      name: 'Nike Running Shoes',
      description: 'Comfortable running shoes for daily workouts',
      sku: 'NIKE-SHOES-001',
      category: 'shoes',
      subcategory: 'running',
      brand: 'Nike',
      price: 7200,
      images: [{
        url: 'https://via.placeholder.com/300x300.png?text=Nike+Shoes',
        alt: 'Nike Running Shoes',
        isPrimary: true
      }],
      inventory: { stock: 30, trackInventory: true },
      availability: { isActive: true, isInStock: true }
    },
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      sku: 'HEADPHONES-001',
      category: 'electronics',
      subcategory: 'audio',
      brand: 'Sony',
      price: 4500,
      images: [{
        url: 'https://via.placeholder.com/300x300.png?text=Headphones',
        alt: 'Wireless Headphones',
        isPrimary: true
      }],
      inventory: { stock: 25, trackInventory: true },
      availability: { isActive: true, isInStock: true }
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt available in multiple colors',
      sku: 'COTTON-TSHIRT-001',
      category: 'clothing',
      subcategory: 'casual',
      brand: 'H&M',
      price: 650,
      images: [{
        url: 'https://via.placeholder.com/300x300.png?text=T-Shirt',
        alt: 'Cotton T-Shirt',
        isPrimary: true
      }],
      inventory: { stock: 100, trackInventory: true },
      availability: { isActive: true, isInStock: true }
    },
    {
      name: 'Organic Green Tea',
      description: 'Premium organic green tea leaves - 100g pack',
      sku: 'GREEN-TEA-001',
      category: 'food',
      subcategory: 'beverages',
      brand: 'Twinings',
      price: 280,
      images: [{
        url: 'https://via.placeholder.com/300x300.png?text=Green+Tea',
        alt: 'Organic Green Tea',
        isPrimary: true
      }],
      inventory: { stock: 200, trackInventory: true },
      availability: { isActive: true, isInStock: true }
    }
  ];

  for (const productData of products) {
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (!existingProduct) {
      await Product.create(productData);
      console.log(`✅ Created product: ${productData.name}`);
    }
  }
};

const seedOrders = async () => {
  console.log('📋 Seeding sample orders...');

  const customer = await User.findOne({ email: 'customer@demo.com' });
  const deliveryAgent = await User.findOne({ email: 'delivery@demo.com' });
  const products = await Product.find().limit(3);

  if (!customer || !deliveryAgent || products.length < 3) {
    console.log('❌ Not enough data to create orders');
    return;
  }

  // Safely get product prices
  const total1 = products[0].pricing?.sellingPrice || 0;
  const total2 = products[1].pricing?.sellingPrice || 0;
  const total3 = products[2].pricing?.sellingPrice || 0;

  const orders = [
    {
      customer: customer._id,
      customerPhone: customer.phone,
      items: [
        {
          name: products[0].name,
          category: products[0].category,
          price: total1,
          quantity: 1,
          image: products[0].images[0]?.url
        }
      ],
      subtotal: total1,
      deliveryFee: 20,
      taxes: 0,
      total: total1 + 20,
      status: 'delivered',
      deliveryAddress: customer.address,
      deliveryAgent: deliveryAgent._id,
      actualDeliveryTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      paymentMethod: 'cash', // must match enum
      paymentStatus: 'paid',
      rating: {
        overall: 5,
        review: 'Excellent delivery service!',
        ratedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    },
    {
      customer: customer._id,
      customerPhone: customer.phone,
      items: [
        {
          name: products[1].name,
          category: products[1].category,
          price: total2,
          quantity: 1,
          image: products[1].images[0]?.url
        },
        {
          name: products[2].name,
          category: products[2].category,
          price: total3,
          quantity: 2,
          image: products[2].images[0]?.url
        }
      ],
      subtotal: total2 + total3 * 2,
      deliveryFee: 20,
      taxes: 0,
      total: total2 + total3 * 2 + 20,
      status: 'in_transit',
      deliveryAddress: customer.address,
      deliveryAgent: deliveryAgent._id,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      paymentMethod: 'cash', // must match enum
      paymentStatus: 'pending'
    }
  ];

  for (const orderData of orders) {
    const existingOrder = await Order.findOne({
      customer: orderData.customer,
      total: orderData.total,
      status: orderData.status
    });

    if (!existingOrder) {
      await Order.create(orderData);
      console.log(`✅ Created order with total: ₹${orderData.total}`);
    }
  }
};


const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    await seedUsers();
    await seedDeliveryAgents();
    await seedProducts();
    await seedOrders();

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📧 Demo Login Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Customer: customer@demo.com / customer123');
    console.log('Delivery Agent: delivery@demo.com / delivery123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
