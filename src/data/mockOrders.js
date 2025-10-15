export const mockOrders = [
  {
    id: 'ORD001',
    customerId: 1,
    customerName: 'John Smith',
    customerPhone: '+91 98765 43210',
    customerAddress: '123 MG Road, Bangalore, Karnataka 560001',
    items: [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        category: 'Electronics',
        price: 159900,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150'
      },
      {
        id: 2,
        name: 'AirPods Pro (2nd Gen)',
        brand: 'Apple',
        category: 'Electronics',
        price: 24900,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=150'
      }
    ],
    totalAmount: 184800,
    orderDate: '2024-09-15',
    expectedDelivery: '2024-09-18',
    status: 'delivered',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    trackingId: 'TRK123456789',
    deliveryAgentId: 3,
    deliveryAgentName: 'Raj Kumar',
    deliveryAgentPhone: '+91 98765 43212'
  },
  {
    id: 'ORD002',
    customerId: 1,
    customerName: 'John Smith',
    customerPhone: '+91 98765 43210',
    customerAddress: '123 MG Road, Bangalore, Karnataka 560001',
    items: [
      {
        id: 3,
        name: 'Samsung Galaxy Watch 6',
        brand: 'Samsung',
        category: 'Electronics',
        price: 32999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150'
      },
      {
        id: 4,
        name: 'Nike Air Max 270',
        brand: 'Nike',
        category: 'Fashion',
        price: 12995,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150'
      }
    ],
    totalAmount: 45994,
    orderDate: '2024-09-16',
    expectedDelivery: '2024-09-19',
    status: 'in_transit',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    trackingId: 'TRK123456790',
    deliveryAgentId: 3,
    deliveryAgentName: 'Raj Kumar',
    deliveryAgentPhone: '+91 98765 43212'
  },
  {
    id: 'ORD003',
    customerId: 1,
    customerName: 'John Smith',
    customerPhone: '+91 98765 43210',
    customerAddress: '123 MG Road, Bangalore, Karnataka 560001',
    items: [
      {
        id: 5,
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: 'Electronics',
        price: 114900,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150'
      }
    ],
    totalAmount: 114900,
    orderDate: '2024-09-17',
    expectedDelivery: '2024-09-20',
    status: 'preparing',
    paymentMethod: 'Debit Card',
    paymentStatus: 'paid',
    trackingId: 'TRK123456791',
    deliveryAgentId: null,
    deliveryAgentName: null,
    deliveryAgentPhone: null
  },
  {
    id: 'ORD004',
    customerId: 2,
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43213',
    customerAddress: '456 Brigade Road, Bangalore, Karnataka 560025',
    items: [
      {
        id: 6,
        name: 'Sony WH-1000XM5 Headphones',
        brand: 'Sony',
        category: 'Electronics',
        price: 29990,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150'
      },
      {
        id: 7,
        name: 'Kindle Paperwhite',
        brand: 'Amazon',
        category: 'Electronics',
        price: 14999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ],
    totalAmount: 44989,
    orderDate: '2024-09-16',
    expectedDelivery: '2024-09-19',
    status: 'picked_up',
    paymentMethod: 'Net Banking',
    paymentStatus: 'paid',
    trackingId: 'TRK123456792',
    deliveryAgentId: 4,
    deliveryAgentName: 'Amit Singh',
    deliveryAgentPhone: '+91 98765 43214'
  },
  {
    id: 'ORD005',
    customerId: 3,
    customerName: 'Rahul Gupta',
    customerPhone: '+91 98765 43215',
    customerAddress: '789 Koramangala, Bangalore, Karnataka 560034',
    items: [
      {
        id: 8,
        name: 'OnePlus 11 5G',
        brand: 'OnePlus',
        category: 'Electronics',
        price: 56999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'
      },
      {
        id: 9,
        name: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        category: 'Fashion',
        price: 16999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=150'
      }
    ],
    totalAmount: 73998,
    orderDate: '2024-09-17',
    expectedDelivery: '2024-09-20',
    status: 'confirmed',
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    trackingId: 'TRK123456793',
    deliveryAgentId: 5,
    deliveryAgentName: 'Suresh Kumar',
    deliveryAgentPhone: '+91 98765 43216'
  }
];