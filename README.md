# ShopLux E-Commerce Platform

A modern, full-featured e-commerce application built with Next.js 14, Tailwind CSS, and MongoDB. This platform offers a seamless shopping experience for users and comprehensive management tools for shippers.

## 🚀 Key Features

### 🛍️ Client Features

- **User Authentication**: Secure Login and Registration system using NextAuth.js.
- **Product Discovery**:
  - Browse products by categories (Fashion, Electronics, etc.).
  - Advanced search functionality with instant path search.
  - Detailed product pages with image galleries and variants.
- **Shopping Experience**:
  - **Shopping Cart**: Real-time cart management with quantity adjustments.
  - **Checkout**: streamlined checkout process with integrated payment handling.
- **Order Management**:
  - **Dashboard**: View order history and status.
  - **Order Tracking**: Visual timeline for tracking order progress (Placed -> Prepared -> Out for Delivery -> Delivered).
  - **Profile Management**: Manage personal details and security settings.
- **Reviews**: Ability to review purchased products after delivery.

### 🚚 Shipper/Admin Features

- **Shipper Dashboard**: Dedicated interface for managing shipping statuses.
- **Order Fulfillment**: Tools to update order status from 'Pending' to 'Delivered'.
- **Product Management**: Interface to add new products (`/add-product`) including image uploads.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: MongoDB
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: React Hooks & Context
- **UI Components**: Custom reusable components (Navbar, Footer, Loaders, Models)

## 📂 Project Structure

```bash
e-commerce/
├── app/
│   ├── api/            # Backend API routes
│   ├── auth/           # Authentication pages
│   ├── checkout/       # Checkout flow
│   ├── dashboard/      # User dashboard (Orders & Profile)
│   ├── product/        # Product detailed views
│   ├── products/       # Category listings
│   ├── track/          # Order tracking system
│   ├── shipper/        # Shipper management interface
│   ├── add-product/    # Admin product creation
│   └── ...
├── components/         # Reusable UI components
├── models/             # Mongoose database models
└── public/             # Static assets
```

## 🚦 Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   # Add other necessary keys (Stripe, Cloudinary, etc.)
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


