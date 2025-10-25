# 🍳 MonAmiChef

A modern, AI-powered meal planning application that helps you discover recipes, plan meals, and manage your culinary adventures with intelligent conversation.

## ✨ Features

- **AI Chat Assistant**: Get personalized recipe recommendations and cooking advice
- **Speech-to-Text**: Voice input with real-time waveform visualization (supports English, French, and more)
- **Smart Meal Planning**: Plan your meals with AI-powered suggestions
- **Recipe Discovery**: Explore a vast collection of recipes tailored to your preferences
- **Nutrition Tracking**: Monitor nutritional information for your meals
- **Guest Mode**: Try the app without creating an account
- **User Profiles**: Save your preferences and meal history

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful components
- **Supabase Auth** for authentication

### Backend
- **Node.js** with Express and TypeScript
- **TSOA** for type-safe API routes and OpenAPI generation
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **Google Gemini AI** for chat and speech-to-text functionality
- **Web Audio API** for real-time voice visualization

## 🏗️ Project Structure

```
MonAmiChef/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
├── README.md          # This file
└── CLAUDE.md          # Development guidelines
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MonAmiChef
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && yarn install

   # Backend
   cd ../backend && yarn install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Configure your database and Supabase credentials

4. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && yarn start

   # Terminal 2 - Frontend
   cd frontend && yarn dev
   ```

## 📚 Documentation

- **Frontend**: See [frontend/README.md](./frontend/README.md) for React app details
- **Backend**: See [backend/README.md](./backend/README.md) for API documentation
- **Development**: See [CLAUDE.md](./CLAUDE.md) for development guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Keep pull requests under 300 lines
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ for food lovers everywhere