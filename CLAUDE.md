# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MonAmiChef is a full-stack meal planning application with AI chat functionality for personalized cooking assistance and meal recommendations.

## Project Structure

```
MonAmiChef/
├── frontend/          # React + TypeScript + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components (shadcn/ui based)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
│   └── public/            # Static assets
├── backend/           # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/   # TSOA API controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── services/      # Business logic services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── build/             # Compiled JavaScript output
└── .github/           # GitHub Actions and workflows
```

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

# Database commands
yarn db:generate      # Generate Prisma client
yarn db:migrate       # Run database migrations
yarn db:push          # Push schema changes to database
yarn db:studio        # Open Prisma Studio
yarn db:seed          # Seed database with initial data

# Testing commands
yarn test             # Run all tests
yarn test:unit        # Run unit tests
yarn test:integration # Run integration tests
yarn test:coverage    # Run tests with coverage report

# Supabase local development
yarn supabase:start   # Start local Supabase instance
yarn supabase:stop    # Stop local Supabase instance
yarn supabase:status  # Check Supabase status
yarn supabase:reset   # Reset local database

# Development workflow helpers
yarn dev:db           # Start Supabase and push schema
yarn dev:reset        # Reset Supabase and push schema
yarn dev:fresh        # Fresh start: stop, start, push schema
```

## Architecture Overview

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: React Router DOM 7.6+ for client-side navigation
- **Authentication**: Supabase Auth with session management and guest system
- **State Management**:
  - React hooks for local component state
  - Zustand for global application state
  - Custom hooks for shared logic
- **UI Framework**:
  - shadcn/ui components based on Radix UI primitives
  - Tailwind CSS 4.x for styling with custom design tokens
  - Lucide React for icons
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: Native fetch with custom hooks for API communication
- **Development**: ESLint for code quality, Vite for bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript for type safety
- **API Documentation**: TSOA for automatic OpenAPI spec generation and route validation
- **Database**:
  - PostgreSQL as the primary database
  - Prisma ORM for type-safe database access
  - Supabase for hosted database and authentication
- **Authentication**:
  - Supabase Auth for user management
  - Custom guest system for anonymous users
  - JWT tokens and cookie-based sessions
- **AI Integration**: Google Generative AI for chat functionality
- **Middleware**: Custom authentication, CORS, and error handling
- **Testing**: Jest framework with unit and integration test support

### Database Schema Design

#### Auth Schema (Supabase managed)
- User authentication and session management
- Handled entirely by Supabase Auth

#### Public Schema (Application tables)
- **Profile**: User profiles linked to Supabase auth users
- **Guest**: Anonymous users before account conversion
- **Conversation**: Chat conversations linked to users or guests
- **ChatMessage**: Individual messages with JSON chat history

### API Architecture
- **Route Generation**: TSOA automatically generates routes from controller decorators
- **OpenAPI Specification**: Auto-generated at `/backend/build/swagger.json`
- **Authentication Flow**:
  - Bearer token authentication for registered users
  - Cookie-based guest authentication for anonymous users
  - Automatic guest-to-user conversion on registration
- **CORS**: Configured for specific production domains with credentials support
- **Validation**: Request/response validation via TSOA decorators and Zod schemas

## Key Technologies

### Frontend Tech Stack
- **React 18.3+**: Modern React with hooks and concurrent features
- **TypeScript 5.5+**: Type safety and enhanced developer experience
- **Vite 5.4+**: Fast build tool and development server
- **Tailwind CSS 4.x**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built components based on Radix UI
- **React Router DOM 7.6+**: Client-side routing
- **React Hook Form**: Performance form library with validation
- **Zod**: TypeScript-first schema validation
- **Zustand**: Lightweight state management
- **Lucide React**: Beautiful icon library

### Backend Tech Stack
- **Node.js 20+**: JavaScript runtime
- **Express 4.21+**: Web application framework
- **TypeScript 5.8+**: Type safety for backend code
- **TSOA 6.6+**: OpenAPI specification and route generation
- **Prisma 6.15+**: Type-safe database toolkit and ORM
- **Supabase**: Backend-as-a-Service for auth and database hosting
- **Google Generative AI**: AI chat functionality
- **Jest**: Testing framework
- **PostgreSQL**: Relational database

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (via ESLint integration)
- **tsx**: TypeScript execution for development

## Development Workflow

### Standard Development Process
1. **Start Development Environment**:
   ```bash
   # Terminal 1: Start backend
   cd backend && yarn supabase:start && yarn start

   # Terminal 2: Start frontend
   cd frontend && yarn dev
   ```

2. **Making Changes**:
   - **Frontend**: Hot reload automatically applies changes
   - **Backend API**: Modify controllers → Run `yarn build` to regenerate routes/specs
   - **Database**: Update Prisma schema → Run `yarn db:generate` → Run `yarn db:migrate`

3. **Code Quality Checks**:
   ```bash
   # Frontend
   cd frontend && yarn lint

   # Backend
   cd backend && yarn test
   ```

### Common Workflows

#### Adding New API Endpoints
1. Create/modify controller in `/backend/src/controllers/`
2. Add TSOA decorators for route definition
3. Run `yarn build` to regenerate routes and OpenAPI spec
4. Test endpoint using generated Swagger UI at `/docs`

#### Database Schema Changes
1. Modify `/backend/prisma/schema.prisma`
2. Run `yarn db:generate` to update Prisma client
3. Run `yarn db:migrate` to create and apply migration
4. Update TypeScript types if needed

#### Adding Frontend Components
1. Create component in appropriate `/frontend/src/` directory
2. Follow existing patterns for styling (Tailwind + shadcn/ui)
3. Add proper TypeScript types
4. Import and use in parent components

## Important Development Notes

### Authentication System
- Supports both authenticated users and anonymous guests
- Guest sessions automatically convert to user accounts on registration
- All API endpoints handle both authentication methods

### AI Chat Integration
- Uses Google Generative AI for conversational responses
- Streaming responses for real-time chat experience
- Chat history stored in database for persistence

### Database Considerations
- Uses both Supabase auth schema (managed) and custom public schema
- All tables properly reference Supabase auth users when needed
- Supports local development with Supabase CLI

### API Design
- All routes auto-generated via TSOA decorators
- OpenAPI spec available at `/docs` endpoint
- Type-safe request/response validation
- CORS configured for production domains

### Performance Considerations
- Frontend uses code splitting and lazy loading
- Database queries optimized with Prisma
- API responses include proper caching headers
- Images and assets optimized for web delivery

## Pull Request Guidelines

### Size and Scope
- **Keep MRs Small**: Any new MR created by Claude should remain under 300 lines of changes
- **Change Monitoring**: Claude must check the diff size before creating an MR and notify the user when a branch has more than 300 lines changed
- **Large Changes**: If changes exceed 300 lines, Claude should ask for approval or suggest breaking the work into smaller, focused MRs
- **Single Responsibility**: Each PR should focus on one feature, bug fix, or refactoring task

### Before Creating a PR
1. **Run Quality Checks**:
   ```bash
   # Frontend
   cd frontend && yarn lint

   # Backend
   cd backend && yarn test && yarn build
   ```
2. **Test Functionality**: Ensure all new features work as expected
3. **Check Database Migrations**: Verify schema changes are properly migrated
4. **Review Dependencies**: Ensure no unnecessary packages were added

### PR Description Template
- **Summary**: Brief description of what was changed and why
- **Type of Change**: Feature, Bug Fix, Refactoring, Documentation
- **Testing**: How the changes were tested
- **Database Changes**: Any schema modifications or migrations
- **Breaking Changes**: Note any API or interface changes

## Environment Configuration

### Required Environment Variables

#### Frontend (.env)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

#### Backend (.env)
```bash
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_API_KEY=your_google_genai_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Local Development Setup
1. **Clone Repository**: `git clone <repo-url>`
2. **Install Dependencies**:
   ```bash
   cd frontend && yarn install
   cd ../backend && yarn install
   ```
3. **Setup Environment**: Copy `.env.example` files and configure variables
4. **Start Supabase**: `cd backend && yarn supabase:start`
5. **Setup Database**: `yarn db:push && yarn db:seed`
6. **Start Services**:
   ```bash
   # Terminal 1: Backend
   cd backend && yarn start

   # Terminal 2: Frontend
   cd frontend && yarn dev
   ```

## Troubleshooting Common Issues

### Database Issues
- **Migration Failures**: Run `yarn db:reset` to reset local database
- **Schema Sync Issues**: Use `yarn dev:fresh` to restart with clean database
- **Connection Problems**: Check Supabase status with `yarn supabase:status`

### Build Issues
- **TSOA Route Generation**: Run `yarn tsoa:gen` to regenerate routes
- **Type Errors**: Run `yarn db:generate` to update Prisma types
- **Frontend Build**: Clear Vite cache and restart development server

### Authentication Issues
- **Guest System**: Ensure cookies are enabled in browser
- **Supabase Auth**: Check environment variables and Supabase project settings
- **CORS Errors**: Verify API base URL and CORS configuration

## Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper generic types for reusable components
- Avoid `any` type - use `unknown` for truly unknown types

### React Components
- Use functional components with hooks
- Implement proper prop typing with TypeScript
- Follow naming conventions (PascalCase for components)
- Use React.memo() for performance optimization when needed

### API Development
- Use TSOA decorators for all endpoints
- Implement proper error handling and status codes
- Add request/response validation
- Include comprehensive JSDoc comments

### Database
- Use descriptive table and column names
- Include proper foreign key relationships
- Add database constraints where appropriate
- Write efficient queries using Prisma's query optimization