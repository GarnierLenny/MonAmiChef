# 🎨 MonAmiChef Frontend

A modern React application built with TypeScript, Vite, and Tailwind CSS that provides an intuitive interface for AI-powered meal planning and recipe discovery.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

```bash
yarn dev              # Start development server with hot reload
yarn build            # Build for production
yarn build:dev        # Build for development mode
yarn lint             # Run ESLint for code quality
yarn preview          # Preview production build locally
```

## 🏗️ Architecture

### Tech Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Primitive components for complex interactions
- **Supabase** - Authentication and database client

### Project Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable components
│   │   ├── ui/       # shadcn/ui base components
│   │   └── ...       # Custom components
│   ├── pages/        # Page components
│   ├── lib/          # Utilities and configurations
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx       # Main app component with routing
│   └── main.tsx      # App entry point
├── index.html        # HTML template
├── tailwind.config.js # Tailwind configuration
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite configuration
```

### Key Components

#### Pages
- **ChatPage** - Main AI chat interface
- **NutritionView** - Nutrition tracking and analysis
- **Auth Components** - Login, signup, and profile management

#### UI Components
- Built with **shadcn/ui** for consistency and accessibility
- Custom variants using **Tailwind CSS**
- Responsive design optimized for mobile and desktop

### State Management
- **React State** - Local component state and context
- **Zustand** - Global state management for complex interactions
- **Supabase Client** - Authentication state and real-time data

## 🔐 Authentication

The app supports two authentication modes:
- **Guest Mode** - Try features without creating an account
- **User Accounts** - Full features with Supabase authentication

Authentication state is managed through Supabase client with automatic session handling.

## 🎨 Styling

### Tailwind CSS
- Utility-first approach for rapid development
- Custom configuration in `tailwind.config.js`
- Dark/light theme support

### Component Library
- **shadcn/ui** - Accessible, customizable components
- **Radix UI** - Unstyled primitives for complex components
- Consistent design system with CSS variables

## 🌐 API Integration

The frontend communicates with the backend API for:
- **Chat Messages** - AI conversation handling
- **User Data** - Profile and preferences
- **Meal Planning** - Recipe and nutrition data

API client configuration in `src/lib/api.ts`

## 🧪 Development Guidelines

### Code Style
- **ESLint** configuration for consistent code quality
- **TypeScript** strict mode for type safety
- **Prettier** formatting (configure in your editor)

### Component Patterns
- Functional components with hooks
- Props interfaces for type safety
- Custom hooks for reusable logic
- Responsive design first

### Performance
- **Vite** for fast development and optimized builds
- Code splitting with React lazy loading
- Optimized images and assets

## 🚀 Deployment

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

The build artifacts will be generated in the `dist/` directory, ready for deployment to any static hosting service.

## 🛠️ Troubleshooting

### Common Issues

**Dev server won't start**
- Ensure Node.js 18+ is installed
- Check if port 5173 is available
- Clear `node_modules` and reinstall dependencies

**Build errors**
- Run `yarn lint` to check for code issues
- Verify all TypeScript types are correct
- Check for missing dependencies

**Authentication issues**
- Verify Supabase configuration in environment variables
- Check network connectivity to Supabase

---

Happy coding! 🎉
