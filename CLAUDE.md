# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

MonAmiChef is a full-stack meal planning application with AI chat functionality:

- **Frontend** (`/frontend`): React + TypeScript + Vite application with Tailwind CSS and shadcn/ui components
- **Backend** (`/backend`): Node.js + Express + TypeScript API with Prisma ORM and TSOA for API documentation
- **Database**: PostgreSQL with Supabase for authentication and data storage

## Development Commands

### Frontend (Vite + React)
```bash
cd frontend
yarn dev              # Start development server
yarn build            # Build for production  
yarn build:dev        # Build for development mode
yarn lint             # Run ESLint
yarn preview          # Preview production build
```

### Backend (Node.js + Express)
```bash
cd backend
yarn start            # Build and start with hot reload
yarn build            # Generate Prisma client, TSOA routes/spec, and TypeScript compilation
yarn tsoa:gen         # Generate TSOA routes and OpenAPI spec only
```

## Architecture Overview

### Frontend Architecture
- **React Router**: Client-side routing with routes in `App.tsx`
- **Supabase Auth**: Authentication with session management
- **Component Structure**: 
  - UI components in `/components/ui` (shadcn/ui based)
  - Page components in `/pages`
  - Main views as components (ChatPage, NutritionView, etc.)
- **State Management**: React state + Zustand for complex state
- **Styling**: Tailwind CSS with custom component variants

### Backend Architecture  
- **TSOA Framework**: TypeScript decorators for API routes and OpenAPI spec generation
- **Controllers**: Located in `/src/controllers` with TSOA decorators
- **Middleware**: Authentication middleware in `/src/middlewares`
- **Database**: Prisma ORM with PostgreSQL, schema includes both `auth` and `public` schemas
- **Authentication**: Custom guest system + Supabase auth integration

### Database Schema
- **Auth Schema**: Supabase auth tables (users, sessions, etc.)
- **Public Schema**: Application tables (Conversation, ChatMessage, Profile, Guest)
- **Key Models**:
  - `Conversation`: Chat conversations linked to users or guests
  - `ChatMessage`: Individual messages with JSON history
  - `Profile`: User profiles linked to Supabase auth users
  - `Guest`: Anonymous users before conversion to full accounts

### API Architecture
- **TSOA Configuration**: Routes auto-generated from controller decorators
- **OpenAPI Spec**: Generated at `/backend/build/swagger.json`
- **Authentication**: Bearer token + guest cookie-based authentication
- **CORS**: Configured for production domains with credentials support

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, React Router DOM
- **Backend**: Express, TypeScript, TSOA, Prisma, Supabase JS
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Supabase Authentication
- **AI**: Google GenAI integration for chat functionality
- **Styling**: Tailwind CSS with shadcn/ui component system

## Development Workflow

1. Backend API changes: Modify controllers → Run `yarn build` to regenerate routes/specs
2. Database changes: Update Prisma schema → Run `npx prisma generate` → Run `npx prisma migrate dev`
3. Frontend changes: Standard React development with hot reload via Vite

## Important Notes

- The app supports both authenticated users and anonymous guests
- Chat functionality uses streaming responses with AI integration
- CORS is configured for specific production domains
- API routes are auto-generated via TSOA decorators
- Database uses both Supabase auth schema and custom public schema

## Pull Request Guidelines

- **Keep MRs Small**: Any new MR created by Claude should remain under 300 lines of changes
- **Change Monitoring**: Claude must check the diff size before creating an MR and notify the user when a branch has more than 300 lines changed
- **Large Changes**: If changes exceed 300 lines, Claude should ask for approval or suggest breaking the work into smaller, focused MRs