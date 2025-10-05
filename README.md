# E-Procurement Vendor Portal

A modern, responsive web application for vendors to participate in government/corporate procurement processes. Built with Next.js 15, TypeScript, and modern UI/UX design principles.

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Registration** - Multi-step vendor registration with email verification
- **Login System** - JWT-based authentication with remember me functionality  
- **Password Security** - Strong password validation and secure storage
- **Session Management** - Automatic token refresh and logout handling

### 📱 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Glassmorphism Effects** - Modern glass-like UI with backdrop blur
- **Dark/Light Themes** - User preference-based theme switching
- **Micro-animations** - Smooth transitions using Framer Motion
- **Accessibility** - WCAG compliant with keyboard navigation

### 📊 Vendor Dashboard
- **Tender Listings** - Browse and filter available procurement opportunities
- **Bid Submission** - Submit competitive bids with document uploads
- **Bid Tracking** - Monitor bid status and procurement progress
- **Profile Management** - Update company information and certifications

### 🔧 Technical Features
- **Progressive Web App (PWA)** - Offline capability and app-like experience
- **Real-time Updates** - WebSocket integration for live notifications
- **File Uploads** - Secure document upload with validation
- **Form Validation** - Client and server-side validation
- **Error Handling** - User-friendly error messages and recovery

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

### Backend Integration
- **API**: REST API with TypeScript interfaces
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: Configurable upload handling
- **WebSockets**: Real-time notification support

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Mock API**: Express.js development server
- **PWA**: Next-PWA plugin

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yuditriaji/eproc-vendor-portal.git
   cd eproc-vendor-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:3000
   NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

4. **Start the development servers**
   
   **Frontend (runs on port 3001):**
   ```bash
   npm run dev
   ```
   
   **Mock API Server (runs on port 3000):**
   ```bash
   node mock-api-server.js
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

### Test Credentials
- **Email**: `vendor@eproc.local`
- **Password**: `vendor123`

## 📁 Project Structure

```
eproc-vendor-portal/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/               # Next.js 15 App Router
│   │   ├── vendor/        # Vendor-specific pages
│   │   │   ├── login/     # Login page
│   │   │   ├── register/  # Registration page
│   │   │   └── dashboard/ # Dashboard page
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # Reusable components
│   │   ├── FileUpload.tsx # File upload component
│   │   └── ReduxProvider.tsx # Redux provider
│   ├── store/             # Redux store configuration
│   │   ├── api/           # RTK Query APIs
│   │   ├── slices/        # Redux slices
│   │   └── index.ts       # Store setup
│   ├── styles/            # Additional styles
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── middleware.ts      # Next.js middleware
├── mock-api-server.js     # Development API server
├── tailwind.config.ts     # Tailwind configuration
├── next.config.mjs        # Next.js configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Indigo (#6366F1)  
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: Bold, hierarchical scaling
- **Body**: Regular weight, optimized line height

### Components
- **Glassmorphism Cards**: Translucent backgrounds with backdrop blur
- **Gradient Buttons**: Smooth hover transitions
- **Form Fields**: Consistent styling with validation states
- **Loading States**: Skeleton loaders and spinners

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_WS_URL=your-websocket-url
NEXT_PUBLIC_UPLOAD_URL=your-upload-url
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=your-app-url

# External Services
RECAPTCHA_SITE_KEY=your-recaptcha-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret
```

### API Integration
The application expects a REST API with the following endpoints:

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration  
- `GET /api/v1/auth/me` - Get user profile
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/tenders` - List tenders
- `GET /api/v1/tenders/:id` - Get tender details

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Mock API Server
A complete mock API server is included for development:

```bash
node mock-api-server.js
```

Features:
- Authentication endpoints
- Tender management
- File upload simulation
- CORS configuration
- Request logging

## 📱 PWA Features

The application is configured as a Progressive Web App with:
- **Offline Support**: Service worker caching
- **Install Prompt**: Add to homescreen functionality
- **App Manifest**: Native app-like appearance
- **Background Sync**: Queue actions when offline

## 🔒 Security

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options  
- Referrer Policy
- XSS Protection

### Authentication
- JWT tokens with expiration
- Secure cookie handling
- CSRF protection
- Rate limiting on sensitive endpoints

### Input Validation
- Client-side validation with Zod
- Server-side sanitization
- File upload restrictions
- XSS prevention

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Traditional Hosting
```bash
npm run build
npm start
```

## 📈 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js optimized images
- **Font Loading**: Preloaded web fonts
- **Bundle Analysis**: Built-in bundle analyzer
- **Lazy Loading**: Components loaded on demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use conventional commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺 Roadmap

### Upcoming Features
- [ ] Multi-language support (i18n)
- [ ] Advanced filtering and search
- [ ] Real-time chat with procurement officers
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and caching
- [ ] Automated testing suite
- [ ] CI/CD pipeline setup

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced UI/UX with glassmorphism
- **v1.2.0** - PWA support and offline capabilities

---

**Built with ❤️ by [Yudi Tri Aji](https://github.com/yuditriaji)**
