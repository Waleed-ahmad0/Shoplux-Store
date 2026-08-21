# ShopLux E-Commerce Platform

![Tests](https://github.com/Waleed-ahmad0/Shoplux-Store/actions/workflows/test.yml/badge.svg)


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

/Admin Features

- **Product Management**: Interface to add new products (`/add-product`) including image uploads.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: MongoDB
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: React Hooks & Context
- **UI Components**: Custom reusable components (Navbar, Footer, Loaders, Models)

## 🛡️ Security

This project went through a deliberate authorization and data-integrity hardening pass. Key findings and fixes included:

- **Price and stock integrity**: Order totals and Stripe payment amounts are computed entirely server-side from the database — never trusted from the client — preventing price tampering at checkout.
- **Ownership enforcement**: Every order, cart, and profile action verifies the requesting user actually owns the resource being modified, not just that they're logged in.
- **Payment reliability**: A Stripe webhook independently confirms and records orders server-side, so a dropped connection after payment doesn't result in a charge with no corresponding order.
- **Data exposure**: API responses were audited to ensure only necessary fields are returned — no password hashes or full raw documents leak through any endpoint.

Covered by an automated test suite (see below) encoding the specific issues found, so they can't silently regress.

## 🧪 Testing

```bash
npx vitest run
```

Tests run automatically on every push via GitHub Actions (badge above). Coverage focuses on the two highest-risk areas: price-tampering resistance and order ownership enforcement.

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
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_public_stripe_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_Secret
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
