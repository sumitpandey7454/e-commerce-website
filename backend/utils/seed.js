const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const User    = require('../models/User');
const Product = require('../models/Product');
const Message = require('../models/Message');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([User.deleteMany(), Product.deleteMany(), Message.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    const hashedPass = await bcrypt.hash('password123', 12);

    // ── Create Users ──────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Super Admin', email: 'admin@shopverse.in',
      password: hashedPass, role: 'admin', isActive: true,
    });

    const seller1 = await User.create({
      name: 'TechStore India', email: 'seller1@shopverse.in',
      password: hashedPass, role: 'seller', isActive: true,
      storeName: 'TechStore India', storeDesc: 'Best electronics at best prices',
    });

    const seller2 = await User.create({
      name: 'FashionHub', email: 'seller2@shopverse.in',
      password: hashedPass, role: 'seller', isActive: true,
      storeName: 'FashionHub', storeDesc: 'Trendy fashion for everyone',
    });

    const buyer1 = await User.create({
      name: 'Rahul Mehta', email: 'buyer1@shopverse.in',
      password: hashedPass, role: 'buyer', isActive: true,
    });

    const buyer2 = await User.create({
      name: 'Priya Sharma', email: 'buyer2@shopverse.in',
      password: hashedPass, role: 'buyer', isActive: true,
    });

    console.log('👥 Users created');

    // ── Create Products ───────────────────────────────────────────────────────
    const products = await Product.insertMany([
      // Electronics
      { name:'Sony WH-1000XM5 Wireless Headphones', description:'Industry-leading noise cancelling headphones with 30-hour battery. Multipoint connection. Quick Charge: 3 min charge for 3 hours playback.', price:24990, originalPrice:34990, category:'electronics', brand:'Sony', stock:45, seller:seller1._id, rating:4.7, numReviews:2341, numSales:876, featured:true, status:'active', tags:['wireless','headphones','noise-cancelling','sony'] },
      { name:'Samsung 65" QLED 4K Smart TV', description:'Quantum Dot technology for brilliant color. 4K AI upscaling. Smart TV with built-in streaming apps.', price:89990, originalPrice:129990, category:'electronics', brand:'Samsung', stock:12, seller:seller1._id, rating:4.5, numReviews:891, numSales:234, featured:true, status:'active', tags:['tv','samsung','qled','4k'] },
      { name:'Apple AirPods Pro (2nd Gen)', description:'Active Noise Cancellation for immersive sound. Transparency mode to hear the world. Adaptive Audio. Up to 30 hours total battery.', price:19990, originalPrice:26900, category:'electronics', brand:'Apple', stock:67, seller:seller1._id, rating:4.8, numReviews:5621, numSales:2341, featured:true, status:'active', tags:['airpods','apple','wireless','earphones'] },
      { name:'Logitech MX Master 3S Wireless Mouse', description:'Ultra-fast MagSpeed electromagnetic scrolling. 8K DPI. Works on glass surfaces. Ergonomic design.', price:7995, originalPrice:9995, category:'electronics', brand:'Logitech', stock:89, seller:seller1._id, rating:4.6, numReviews:1203, numSales:567, status:'active', tags:['mouse','wireless','logitech','productivity'] },
      { name:'Lenovo IdeaPad Slim 5 Laptop', description:'Intel Core i5 12th Gen. 16GB RAM. 512GB SSD. 15.6" FHD IPS display. 10-hour battery life.', price:54990, originalPrice:69990, category:'electronics', brand:'Lenovo', stock:23, seller:seller1._id, rating:4.4, numReviews:743, numSales:189, featured:true, status:'active', tags:['laptop','lenovo','i5','student'] },

      // Fashion
      { name:'Men\'s Classic Slim Fit Chinos', description:'Premium cotton blend chinos in a modern slim fit. Machine washable. Available in multiple colors.', price:1499, originalPrice:2999, category:'fashion', brand:'FashionHub', stock:150, seller:seller2._id, rating:4.2, numReviews:456, numSales:1203, status:'active', tags:['chinos','men','slim-fit','cotton'] },
      { name:'Women\'s Floral Wrap Dress', description:'Beautiful floral print midi dress with wrap silhouette. Perfect for casual and semi-formal occasions.', price:1299, originalPrice:2499, category:'fashion', brand:'FashionHub', stock:87, seller:seller2._id, rating:4.5, numReviews:789, numSales:654, featured:true, status:'active', tags:['dress','women','floral','midi'] },
      { name:'Unisex Oversized Hoodie', description:'Super soft 320 GSM fleece hoodie. Unisex fit. Kangaroo pocket. Ribbed cuffs and hem. Pre-shrunk.', price:999, originalPrice:1799, category:'fashion', brand:'FashionHub', stock:234, seller:seller2._id, rating:4.3, numReviews:1567, numSales:2341, status:'active', tags:['hoodie','unisex','oversized','fleece'] },

      // Shoes
      { name:'Nike Air Max 270 Running Shoes', description:'Lightweight and breathable mesh upper. Max Air heel unit for all-day comfort. Rubber outsole for durability.', price:8995, originalPrice:11995, category:'shoes', brand:'Nike', stock:56, seller:seller2._id, rating:4.6, numReviews:2103, numSales:987, featured:true, status:'active', tags:['nike','running','airmax','sports'] },
      { name:'Woodland Men\'s Leather Boots', description:'Genuine leather upper. Waterproof construction. Anti-skid rubber sole. Perfect for trekking and casual wear.', price:3499, originalPrice:5999, category:'shoes', brand:'Woodland', stock:34, seller:seller2._id, rating:4.4, numReviews:678, numSales:345, status:'active', tags:['boots','leather','woodland','trekking'] },

      // Books
      { name:'Atomic Habits by James Clear', description:'Transform your life with tiny changes. The definitive guide to breaking bad habits and building good ones. International bestseller.', price:349, originalPrice:599, category:'books', brand:'Penguin', stock:500, seller:seller1._id, rating:4.9, numReviews:8901, numSales:5678, featured:true, status:'active', tags:['habits','self-help','bestseller','james-clear'] },
      { name:'The Psychology of Money', description:'Timeless lessons on wealth, greed, and happiness. Morgan Housel explores the strange ways people think about money.', price:299, originalPrice:499, category:'books', brand:'Jaico', stock:350, seller:seller1._id, rating:4.8, numReviews:5432, numSales:3456, status:'active', tags:['money','finance','psychology','investing'] },

      // Home & Kitchen
      { name:'Instant Pot Duo 7-in-1 Electric Pressure Cooker', description:'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker and warmer in one appliance.', price:6999, originalPrice:9999, category:'home-kitchen', brand:'Instant Pot', stock:45, seller:seller1._id, rating:4.7, numReviews:3421, numSales:1234, featured:true, status:'active', tags:['pressure-cooker','kitchen','instant-pot','cooking'] },
      { name:'Philips Air Fryer XXL', description:'Rapid Air Technology cooks with little to no oil. 7.3L XXL capacity. Digital display. Dishwasher-safe parts.', price:12999, originalPrice:17999, category:'home-kitchen', brand:'Philips', stock:28, seller:seller1._id, rating:4.5, numReviews:1876, numSales:876, status:'active', tags:['air-fryer','philips','healthy','kitchen'] },

      // Sports
      { name:'Yonex Badminton Racket - Astrox 88D', description:'Attack-specialized racket for advanced players. Rotational Generator System. Isometric frame for larger sweet spot.', price:8990, originalPrice:11990, category:'sports', brand:'Yonex', stock:23, seller:seller2._id, rating:4.8, numReviews:567, numSales:234, status:'active', tags:['badminton','yonex','racket','sports'] },

      // Beauty
      { name:'Minimalist 10% Niacinamide Face Serum', description:'Reduces blemishes and skin congestion. Controls sebum production. Suitable for all skin types. Dermatologically tested.', price:399, originalPrice:699, category:'beauty', brand:'Minimalist', stock:300, seller:seller2._id, rating:4.6, numReviews:4321, numSales:5678, featured:true, status:'active', tags:['serum','niacinamide','skincare','minimalist'] },
    ]);

    console.log(`📦 ${products.length} Products created`);

    // ── Sample Messages ───────────────────────────────────────────────────────
    await Message.insertMany([
      { name:'Sanjay Gupta', email:'sanjay@gmail.com', message:'I have an issue with my recent order. The product arrived damaged. Please help me with the return process.', read:false },
      { name:'Meena Reddy',  email:'meena@gmail.com',  message:'How can I become a seller on ShopVerse? What documents are required?', read:false },
      { name:'Arjun Patel',  email:'',                 message:'Excellent service! My order arrived within 24 hours. Will definitely shop again.', read:true },
    ]);

    console.log('💬 Sample messages created');
    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Admin:  admin@shopverse.in   / password123');
    console.log('   Seller: seller1@shopverse.in / password123');
    console.log('   Seller: seller2@shopverse.in / password123');
    console.log('   Buyer:  buyer1@shopverse.in  / password123');
    console.log('   Buyer:  buyer2@shopverse.in  / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();