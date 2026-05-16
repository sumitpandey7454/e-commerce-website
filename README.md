🛒 SmartShop – Full Stack MERN E-Commerce Platform
<div align="center">
🚀 Modern Role-Based E-Commerce Application
Built with MERN Stack + Vite












💡 SmartShop is a complete full-stack e-commerce platform featuring role-based authentication for Admin, Seller, and Buyer users with secure payment flow, product management, and responsive UI.
</div>
📌 Features
👤 Authentication & Authorization
Secure JWT Authentication
Role-Based Access Control
Protected Routes
Login / Register System
Password Encryption using bcrypt
Persistent User Sessions
🛍️ Buyer Features
Browse Products
Search & Filter Products
Product Details Page
Add to Cart
Wishlist Functionality
Checkout System
Order Tracking
User Profile Management
Order History
🏪 Seller Features
Seller Dashboard
Add / Edit / Delete Products
Product Inventory Management
Upload Product Images
Manage Orders
Sales Monitoring
Category Management
⚙️ Admin Features
Admin Dashboard
Manage Users
Manage Sellers & Buyers
Manage Products
Platform Analytics
Order Management
User Role Control
Secure Admin Routes
🧰 Tech Stack
Frontend
React.js
Vite
React Router DOM
Context API
Axios
Tailwind CSS / CSS3
Backend
Node.js
Express.js
MongoDB Atlas
Mongoose
JWT Authentication
bcrypt.js
Multer / Cloudinary (for image uploads)
🗄️ Database

This project uses MongoDB Atlas as the cloud database service.

Collections:
Users
Products
Orders
Categories
Cart
Reviews
Wishlist
🔐 Role-Based Architecture
Role	Permissions
Admin	Full platform control
Seller	Manage own products & orders
Buyer	Purchase products & manage cart
📁 Project Structure
SmartShop/
│
├── client/                 # Frontend React Vite App
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── services/
│
├── server/                 # Backend Node Express API
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── config/
│
├── package.json
└── README.md
⚡ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/yourusername/smartshop.git
2️⃣ Navigate to Project
cd smartshop
🔥 Frontend Setup
cd client
npm install
npm run dev

Frontend will run on:

http://localhost:5173
🚀 Backend Setup
cd server
npm install
npm run server

Backend will run on:

http://localhost:5000
🌍 Environment Variables

Create a .env file inside the server folder.

PORT=5000

MONGO_URI=your_mongodb_atlas_connection

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
📸 Screenshots
🏠 Home Page
Modern UI
Featured Products
Categories
Responsive Design
🛒 Cart System
Dynamic Cart
Quantity Updates
Total Price Calculation
📊 Admin Dashboard
Analytics
User Management
Product Monitoring
🏪 Seller Dashboard
Product Upload
Inventory Control
Order Handling
🔒 Security Features
JWT Authentication
Protected APIs
Password Hashing
Secure Middleware
Role-Based Authorization
Input Validation
📱 Responsive Design

SmartShop is fully responsive and optimized for:

Desktop
Tablet
Mobile Devices
🚀 Future Enhancements
Payment Gateway Integration
Real-Time Notifications
AI Product Recommendations
Multi-Vendor Chat System
Product Reviews & Ratings
Coupon System
Dark Mode
PWA Support
👨‍💻 Developer
Sumit Pandey
Full Stack Developer
MERN Stack
Java & Spring Boot
REST APIs
MongoDB Atlas
React Ecosystem
⭐ Support

If you like this project:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
🚀 Contribute improvements
📄 License


<div align="center">
💙 SmartShop
Smart Shopping Experience with MERN Stack
</div>
