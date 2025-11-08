# 🍛 Sambhar Soul - Food Ordering PWA

A modern, full-featured Progressive Web App for food ordering with real-time notifications, location-based delivery, and comprehensive admin management.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.14-orange)
![Supabase](https://img.shields.io/badge/Supabase-2.39-green)

---

## ✨ Features

### 🛒 Customer Features
- **Browse Menu**: View all available food items with images and prices
- **Smart Cart**: Add items to cart with quantity management
- **Phone Authentication**: Secure login via Firebase phone OTP
- **Location Detection**: Automatic location detection for delivery
- **Real-time Tracking**: Track order status from preparation to delivery
- **Push Notifications**: Get notified about order status changes
- **Add-ons**: Enhance meals with extras (Nariyal Chutney, Sambhar)
- **Order History**: View all past orders
- **PWA Support**: Install as app on mobile devices

### 👨‍💼 Admin Features
- **Order Management**: View and manage all orders in real-time
- **Status Updates**: Update order status with automatic customer notifications
- **Menu Management**: Add, edit, and manage menu items
- **Shop Settings**: Control shop hours and availability
- **Earnings Analytics**: Track revenue and order statistics
- **Push Notifications**: Get instant alerts for new orders
- **Delivery Management**: Assign riders and track deliveries

### 🔔 Push Notifications
- **For Admins**: New order alerts, payment confirmations
- **For Users**: Order confirmed, preparing, ready, completed
- **Background Support**: Receive notifications even when app is closed
- **Foreground Toasts**: In-app notifications when active

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15.3** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Framer Motion** - Animations

### Backend & Services
- **Firebase Authentication** - Phone OTP authentication
- **Firebase Cloud Messaging** - Push notifications
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Firebase Admin SDK** - Server-side operations

### Features
- **PWA** - Progressive Web App capabilities
- **Real-time Updates** - Live order tracking
- **Geolocation** - Location-based delivery
- **Responsive Design** - Mobile-first approach

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Supabase account

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/sambhar-soul.git
cd sambhar-soul
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Setup database**

Run the SQL migration in Supabase:
```bash
# Copy contents of db/migrations/add_fcm_tokens.sql
# Run in Supabase SQL Editor
```

Or use the schema file:
```bash
# Run supabase-schema.sql in Supabase SQL Editor
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sambhar-soul.git
git push -u origin main
```

2. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy!

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions**

---

## 📱 Usage

### For Customers

1. **Browse Menu**: Open the app and view available items
2. **Add to Cart**: Click on items to add to cart
3. **Login**: Enter phone number for OTP verification
4. **Checkout**: Review cart and proceed to checkout
5. **Add Extras**: Select add-ons (Nariyal Chutney, Sambhar)
6. **Confirm Location**: Verify delivery address
7. **Place Order**: Confirm and place order
8. **Track Order**: Monitor order status in real-time
9. **Enable Notifications**: Get updates about your order

### For Admins

1. **Login**: Go to `/admin/login` and enter credentials
2. **View Orders**: See all orders on dashboard
3. **Update Status**: Change order status (Pending → Confirmed → Preparing → Ready → Delivered)
4. **Manage Menu**: Add/edit menu items in Food Management tab
5. **Shop Settings**: Control shop hours and availability
6. **View Analytics**: Check earnings and statistics
7. **Enable Notifications**: Get alerts for new orders

---

## 🗂️ Project Structure

```
sambhar-soul/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── checkout/          # Checkout page
│   │   ├── orders/            # Orders page
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── auth-flow.tsx     # Authentication
│   │   ├── notification-*.tsx # Notification components
│   │   └── ...
│   ├── contexts/              # React contexts
│   │   ├── auth-context.tsx
│   │   └── admin-auth-context.tsx
│   ├── hooks/                 # Custom hooks
│   │   └── use-notifications.ts
│   └── lib/                   # Utilities
│       ├── firebase.ts        # Firebase config
│       ├── firebase-admin.ts  # Firebase Admin
│       ├── notifications.ts   # Notification utilities
│       ├── supabase.ts        # Supabase client
│       └── ...
├── public/                    # Static assets
│   ├── logo.png
│   ├── nc.png                # Nariyal Chutney image
│   ├── sambhar.png           # Sambhar image
│   └── firebase-messaging-sw.js
├── db/                        # Database migrations
│   └── migrations/
├── .env.local                 # Environment variables
├── package.json
└── README.md
```

---

## 🔔 Push Notifications Setup

### Quick Setup

1. **Get VAPID Key**
   - Firebase Console → Cloud Messaging → Web Push certificates
   - Generate key pair

2. **Add to Environment**
   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
   ```

3. **Run Database Migration**
   - Execute `db/migrations/add_fcm_tokens.sql` in Supabase

4. **Enable in App**
   - Open admin dashboard or orders page
   - Click "Enable Notifications"
   - Allow browser permission

**See [NOTIFICATIONS_README.md](NOTIFICATIONS_README.md) for detailed guide**

---

## 🎨 Features in Detail

### Add-ons System
- Nariyal Chutney (₹10)
- Sambhar (₹10)
- Badge-style layout with images
- Quantity controls
- Automatic price calculation

### Location-Based Delivery
- Automatic location detection
- Distance calculation
- Dynamic delivery charges
- Google Maps integration

### Real-time Order Tracking
- Live status updates
- Progress indicators
- Estimated delivery time
- Rider information

### Admin Dashboard
- Order management
- Menu management
- Shop settings
- Earnings analytics
- Real-time notifications

---

## 🔒 Security

- **Authentication**: Firebase phone OTP
- **Database**: Supabase with Row Level Security (RLS)
- **API Routes**: Server-side validation
- **Environment Variables**: Secure credential management
- **HTTPS**: Required for PWA and notifications

---

## 🧪 Testing

### Local Testing
```bash
npm run dev
```

### Build Testing
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

---

## 📊 Database Schema

### Main Tables
- `users` - Customer and admin accounts
- `menu_items` - Food items
- `orders` - Order records
- `order_items` - Order line items
- `shop_settings` - Shop configuration
- `fcm_tokens` - Push notification tokens

**See [supabase-schema.sql](supabase-schema.sql) for complete schema**

---

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run type-check`

**Authentication Issues**
- Verify Firebase configuration
- Check authorized domains in Firebase Console

**Notification Issues**
- Ensure VAPID key is set
- Check service worker registration
- Verify HTTPS is enabled

**Database Issues**
- Run database migrations
- Check RLS policies
- Verify Supabase credentials

**See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help**

---

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Vercel deployment instructions
- [NOTIFICATIONS_README.md](NOTIFICATIONS_README.md) - Push notifications guide
- [ADDONS_UPDATED.md](ADDONS_UPDATED.md) - Add-ons feature documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- Firebase for authentication and messaging
- Supabase for the database and real-time features

---

## 📞 Support

For issues and questions:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review documentation files
- Open an issue on GitHub

---

**Built with ❤️ for food lovers**

🍛 Sambhar Soul - Bringing delicious South Indian food to your doorstep!
