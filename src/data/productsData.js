// src/data/productsData.js - Complete product data structure

// Helper function to generate random ratings and reviews
const generateRandomRating = () => (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
const generateRandomReviews = () => Math.floor(Math.random() * 5000) + 100; // 100 to 5100

// Helper function to generate product IDs
const generateId = (category, index) => `${category.toLowerCase()}_${String(index).padStart(3, '0')}`;

// Electronics Category Products
const electronicsProducts = Array.from({ length: 100 }, (_, index) => {
  const products = [
    {
      name: "iPhone 15 Pro Max",
      image: "https://via.placeholder.com/300x300?text=iPhone+15+Pro+Max",
      description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system",
      price: 134900,
      category: "Electronics",
      subcategory: "Smartphones",
      uses: "Communication, photography, gaming, productivity",
      specifications: [
        "6.7-inch Super Retina XDR display",
        "A17 Pro chip with 6-core GPU",
        "48MP Main camera system",
        "256GB storage",
        "iOS 17"
      ]
    },
    {
      name: "MacBook Air M2",
      image: "https://via.placeholder.com/300x300?text=MacBook+Air+M2",
      description: "Ultra-thin laptop with M2 chip, perfect for work and creativity",
      price: 114900,
      category: "Electronics",
      subcategory: "Laptops",
      uses: "Work, programming, content creation, entertainment",
      specifications: [
        "13.6-inch Liquid Retina display",
        "Apple M2 chip",
        "8GB unified memory",
        "256GB SSD storage",
        "Up to 18 hours battery life"
      ]
    },
    {
      name: "Sony WH-1000XM5",
      image: "https://via.placeholder.com/300x300?text=Sony+WH-1000XM5",
      description: "Industry-leading noise canceling wireless headphones",
      price: 29990,
      category: "Electronics",
      subcategory: "Audio",
      uses: "Music listening, calls, noise cancellation, travel",
      specifications: [
        "30mm driver units",
        "Active Noise Canceling",
        "30-hour battery life",
        "Quick Charge (3 min = 3 hours)",
        "Bluetooth 5.2"
      ]
    },
    {
      name: "iPad Pro 12.9-inch",
      image: "https://via.placeholder.com/300x300?text=iPad+Pro+12.9",
      description: "Most advanced iPad with M2 chip and Liquid Retina XDR display",
      price: 112900,
      category: "Electronics",
      subcategory: "Tablets",
      uses: "Digital art, productivity, entertainment, note-taking",
      specifications: [
        "12.9-inch Liquid Retina XDR display",
        "Apple M2 chip",
        "128GB storage",
        "12MP Wide and Ultra Wide cameras",
        "USB-C with Thunderbolt"
      ]
    },
    {
      name: "Apple Watch Series 9",
      image: "https://via.placeholder.com/300x300?text=Apple+Watch+S9",
      description: "Advanced smartwatch with health monitoring and fitness tracking",
      price: 41900,
      category: "Electronics",
      subcategory: "Wearables",
      uses: "Fitness tracking, health monitoring, notifications, apps",
      specifications: [
        "45mm Retina display",
        "S9 SiP chip",
        "Blood Oxygen monitoring",
        "ECG capability",
        "Water resistant to 50 meters"
      ]
    }
  ];

  const baseProduct = products[index % products.length];
  const productNumber = Math.floor(index / products.length) + 1;

  return {
    id: generateId("electronics", index + 1),
    ...baseProduct,
    name: productNumber > 1 ? `${baseProduct.name} (Model ${productNumber})` : baseProduct.name,
    price: baseProduct.price + (Math.random() * 10000 - 5000),
    rating: parseFloat(generateRandomRating()),
    reviews: generateRandomReviews()
  };
});

// Gadgets Category Products
const gadgetsProducts = Array.from({ length: 100 }, (_, index) => {
  const products = [
    {
      name: "DJI Mini 3 Drone",
      image: "https://via.placeholder.com/300x300?text=DJI+Mini+3",
      description: "Ultra-lightweight drone with 4K camera and intelligent flight modes",
      price: 46900,
      category: "Gadgets",
      subcategory: "Drones",
      uses: "Aerial photography, videography, recreational flying, content creation",
      specifications: [
        "4K/30fps video recording",
        "31-minute max flight time",
        "10km video transmission range",
        "3-axis mechanical gimbal",
        "Under 250g weight"
      ]
    },
    {
      name: "Nintendo Switch OLED",
      image: "https://via.placeholder.com/300x300?text=Nintendo+Switch+OLED",
      description: "Handheld gaming console with vibrant OLED screen",
      price: 37980,
      category: "Gadgets",
      subcategory: "Gaming",
      uses: "Gaming, entertainment, portable gaming, multiplayer games",
      specifications: [
        "7-inch OLED touchscreen",
        "64GB internal storage",
        "Enhanced audio",
        "Wide adjustable stand",
        "Dock with wired LAN port"
      ]
    },
    {
      name: "GoPro HERO12 Black",
      image: "https://via.placeholder.com/300x300?text=GoPro+HERO12",
      description: "Waterproof action camera with 5.3K video and advanced stabilization",
      price: 43500,
      category: "Gadgets",
      subcategory: "Cameras",
      uses: "Action sports, underwater filming, travel photography, content creation",
      specifications: [
        "5.3K60 video recording",
        "27MP photo resolution",
        "HyperSmooth 6.0 stabilization",
        "Waterproof to 10m",
        "Voice control"
      ]
    },
    {
      name: "Fitbit Charge 6",
      image: "https://via.placeholder.com/300x300?text=Fitbit+Charge+6",
      description: "Advanced fitness tracker with built-in GPS and health insights",
      price: 17999,
      category: "Gadgets",
      subcategory: "Fitness",
      uses: "Fitness tracking, sleep monitoring, heart rate tracking, GPS workouts",
      specifications: [
        "Built-in GPS",
        "24/7 heart rate monitoring",
        "Sleep score tracking",
        "7+ day battery life",
        "Water resistant to 50m"
      ]
    },
    {
      name: "Anker PowerCore 26800",
      image: "https://via.placeholder.com/300x300?text=Anker+PowerCore",
      description: "High-capacity portable charger with fast charging technology",
      price: 4999,
      category: "Gadgets",
      subcategory: "Accessories",
      uses: "Charging devices, travel power backup, emergency charging",
      specifications: [
        "26,800mAh capacity",
        "18W fast charging",
        "3 USB-A ports",
        "MultiProtect safety system",
        "LED power indicator"
      ]
    }
  ];

  const baseProduct = products[index % products.length];
  const productNumber = Math.floor(index / products.length) + 1;

  return {
    id: generateId("gadgets", index + 1),
    ...baseProduct,
    name: productNumber > 1 ? `${baseProduct.name} (Version ${productNumber})` : baseProduct.name,
    price: Math.max(1000, baseProduct.price + (Math.random() * 5000 - 2500)),
    rating: parseFloat(generateRandomRating()),
    reviews: generateRandomReviews()
  };
});

// Furniture Category Products
const furnitureProducts = Array.from({ length: 100 }, (_, index) => {
  const products = [
    {
      name: "Ergonomic Office Chair",
      image: "https://via.placeholder.com/300x300?text=Office+Chair",
      description: "Premium ergonomic office chair with lumbar support and adjustable features",
      price: 25999,
      category: "Furniture",
      subcategory: "Office",
      uses: "Office work, study, computer tasks, ergonomic seating",
      specifications: [
        "Adjustable lumbar support",
        "Memory foam cushioning",
        "360-degree swivel",
        "Height adjustable",
        "Breathable mesh backrest"
      ]
    },
    {
      name: "Queen Size Bed Frame",
      image: "https://via.placeholder.com/300x300?text=Queen+Bed",
      description: "Solid wood queen size bed frame with headboard and storage",
      price: 32500,
      category: "Furniture",
      subcategory: "Bedroom",
      uses: "Sleeping, bedroom furniture, storage, room decoration",
      specifications: [
        "Solid wood construction",
        "Built-in storage drawers",
        "Padded headboard",
        "Queen size (60x80 inches)",
        "Easy assembly"
      ]
    },
    {
      name: "L-Shaped Sofa Set",
      image: "https://via.placeholder.com/300x300?text=L+Shaped+Sofa",
      description: "Comfortable L-shaped sofa set perfect for living rooms",
      price: 48999,
      category: "Furniture",
      subcategory: "Living Room",
      uses: "Seating, relaxation, entertainment, guest accommodation",
      specifications: [
        "Premium fabric upholstery",
        "High-density foam cushions",
        "Hardwood frame",
        "Seats 5-6 people",
        "Removable covers"
      ]
    },
    {
      name: "Dining Table Set",
      image: "https://via.placeholder.com/300x300?text=Dining+Table",
      description: "6-seater wooden dining table set with matching chairs",
      price: 28750,
      category: "Furniture",
      subcategory: "Dining",
      uses: "Dining, family meals, entertaining guests, kitchen furniture",
      specifications: [
        "Solid wood table top",
        "6 matching chairs",
        "Scratch resistant finish",
        "72x36 inches table size",
        "Easy to clean"
      ]
    },
    {
      name: "Wardrobe with Mirror",
      image: "https://via.placeholder.com/300x300?text=Wardrobe",
      description: "Spacious 4-door wardrobe with mirror and organized compartments",
      price: 35999,
      category: "Furniture",
      subcategory: "Storage",
      uses: "Clothing storage, bedroom organization, mirror for dressing",
      specifications: [
        "4-door design",
        "Full-length mirror",
        "Multiple compartments",
        "Hanging rods included",
        "Engineered wood construction"
      ]
    }
  ];

  const baseProduct = products[index % products.length];
  const productNumber = Math.floor(index / products.length) + 1;

  return {
    id: generateId("furniture", index + 1),
    ...baseProduct,
    name: productNumber > 1 ? `${baseProduct.name} (Style ${productNumber})` : baseProduct.name,
    price: Math.max(5000, baseProduct.price + (Math.random() * 10000 - 5000)),
    rating: parseFloat(generateRandomRating()),
    reviews: generateRandomReviews()
  };
});

// Pharmacy Category Products
const pharmacyProducts = Array.from({ length: 100 }, (_, index) => {
  const products = [
    {
      name: "Multivitamin Tablets",
      image: "https://via.placeholder.com/300x300?text=Multivitamin",
      description: "Complete multivitamin supplement with essential vitamins and minerals",
      price: 899,
      category: "Pharmacy",
      subcategory: "Supplements",
      uses: "Daily nutrition, immune support, energy boost, overall health",
      specifications: [
        "30 tablets per bottle",
        "Contains 21 essential vitamins",
        "Added minerals and antioxidants",
        "Suitable for adults",
        "No artificial colors"
      ]
    },
    {
      name: "Digital Thermometer",
      image: "https://via.placeholder.com/300x300?text=Thermometer",
      description: "Fast and accurate digital thermometer for fever monitoring",
      price: 299,
      category: "Pharmacy",
      subcategory: "Medical Devices",
      uses: "Temperature monitoring, fever detection, health tracking",
      specifications: [
        "Digital LCD display",
        "60-second fast reading",
        "Memory for last reading",
        "Fever alarm",
        "Auto shut-off"
      ]
    },
    {
      name: "First Aid Kit",
      image: "https://via.placeholder.com/300x300?text=First+Aid+Kit",
      description: "Complete first aid kit for home, office, and travel emergencies",
      price: 1499,
      category: "Pharmacy",
      subcategory: "Emergency Care",
      uses: "Emergency treatment, wound care, basic medical assistance",
      specifications: [
        "100+ piece kit",
        "Bandages and gauze",
        "Antiseptic wipes",
        "Emergency medications",
        "Portable carrying case"
      ]
    },
    {
      name: "Protein Powder",
      image: "https://via.placeholder.com/300x300?text=Protein+Powder",
      description: "Whey protein powder for muscle building and recovery",
      price: 2499,
      category: "Pharmacy",
      subcategory: "Sports Nutrition",
      uses: "Muscle building, post-workout recovery, protein supplementation",
      specifications: [
        "25g protein per serving",
        "30 servings per container",
        "Multiple flavor options",
        "Fast-absorbing whey protein",
        "Added BCAAs"
      ]
    },
    {
      name: "Blood Pressure Monitor",
      image: "https://via.placeholder.com/300x300?text=BP+Monitor",
      description: "Automatic digital blood pressure monitor for home use",
      price: 3299,
      category: "Pharmacy",
      subcategory: "Monitoring Devices",
      uses: "Blood pressure monitoring, health tracking, hypertension management",
      specifications: [
        "Automatic inflation",
        "Large LCD display",
        "Memory for 120 readings",
        "Irregular heartbeat detection",
        "WHO classification indicator"
      ]
    }
  ];

  const baseProduct = products[index % products.length];
  const productNumber = Math.floor(index / products.length) + 1;

  return {
    id: generateId("pharmacy", index + 1),
    ...baseProduct,
    name: productNumber > 1 ? `${baseProduct.name} (Pack ${productNumber})` : baseProduct.name,
    price: Math.max(99, baseProduct.price + (Math.random() * 500 - 250)),
    rating: parseFloat(generateRandomRating()),
    reviews: generateRandomReviews()
  };
});

// Main product data structure
export const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest gadgets and electronic devices",
    icon: "📱",
    products: electronicsProducts
  },
  {
    id: "gadgets",
    name: "Gadgets",
    description: "Cool gadgets and innovative devices",
    icon: "🎮",
    products: gadgetsProducts
  },
  {
    id: "furniture",
    name: "Furniture",
    description: "Home and office furniture",
    icon: "🪑",
    products: furnitureProducts
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    description: "Health and wellness products",
    icon: "💊",
    products: pharmacyProducts
  }
];

// Helper functions for data manipulation
export const getAllProducts = () => {
  return categories.reduce((allProducts, category) => {
    return [...allProducts, ...category.products];
  }, []);
};

export const getProductById = (productId) => {
  const allProducts = getAllProducts();
  return allProducts.find((product) => product.id === productId);
};

export const getProductsByCategory = (categoryId) => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.products : [];
};

export const searchProducts = (query) => {
  const allProducts = getAllProducts();
  const lowercaseQuery = query.toLowerCase();

  return allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getProductsByPriceRange = (minPrice, maxPrice) => {
  const allProducts = getAllProducts();
  return allProducts.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );
};

// ✅ Fixed: assign to variable before default export
const productData = {
  categories,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getProductsByPriceRange
};

export default productData;
