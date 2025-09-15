# 🚀 MonAmiChef Backend

A robust Node.js API built with TypeScript, Express, and TSOA that powers the MonAmiChef meal planning application with AI chat functionality and comprehensive data management.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Yarn package manager
- Supabase account

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start development server
yarn start
```

The API will be available at `http://localhost:3000`

## 📦 Available Scripts

```bash
yarn start            # Build and start with hot reload
yarn build            # Generate Prisma client, TSOA routes/spec, and TypeScript compilation
yarn tsoa:gen         # Generate TSOA routes and OpenAPI spec only
yarn dev              # Start development server without build
```

## 🏗️ Architecture

### Tech Stack
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **TSOA** - TypeScript decorators for API routes and OpenAPI generation
- **Prisma** - Modern database ORM
- **PostgreSQL** - Relational database
- **Supabase** - Authentication and real-time features
- **Google GenAI** - AI chat functionality

### Project Structure

```
backend/
├── src/
│   ├── controllers/    # TSOA controllers with route decorators
│   ├── middlewares/    # Express middleware (auth, CORS, etc.)
│   ├── services/       # Business logic and external API integrations
│   ├── models/         # Database models and types
│   ├── utils/          # Helper functions and utilities
│   └── app.ts          # Express app configuration
├── prisma/
│   ├── schema.prisma   # Database schema definition
│   └── migrations/     # Database migration files
├── build/              # Compiled JavaScript and generated files
│   ├── routes.ts       # Auto-generated TSOA routes
│   └── swagger.json    # Auto-generated OpenAPI specification
├── tsconfig.json       # TypeScript configuration
└── tsoa.json          # TSOA configuration
```

## 📊 Database Schema

### Supabase Integration
The application uses both **Supabase auth schema** and a **custom public schema**:

#### Auth Schema (Supabase)
- `auth.users` - User authentication data
- `auth.sessions` - User sessions

#### Public Schema (Custom)
- **Conversation** - Chat conversations linked to users or guests
- **ChatMessage** - Individual messages with JSON history
- **Profile** - User profiles linked to Supabase auth users
- **Guest** - Anonymous users before account conversion

### Key Relationships
```sql
User (auth.users) -> Profile
Profile -> Conversation
Guest -> Conversation
Conversation -> ChatMessage[]
```

## 🔌 API Architecture

### TSOA Framework
The API uses **TSOA decorators** for type-safe route definition:

```typescript
@Route("api/conversations")
@Tags("Conversations")
export class ConversationController extends Controller {
  @Get()
  @Security("jwt")
  public async getConversations(): Promise<Conversation[]> {
    // Implementation
  }
}
```

### Auto-Generated Documentation
- **OpenAPI Spec**: Generated at `/build/swagger.json`
- **Route Registration**: Automatically generated in `/build/routes.ts`
- **Type Safety**: Full TypeScript integration between routes and models

### Authentication
Two authentication methods supported:
- **JWT Bearer Tokens** - For authenticated users via Supabase
- **Guest Cookies** - For anonymous users

Middleware configuration in `src/middlewares/auth.ts`

## 🤖 AI Integration

### Google GenAI
- **Streaming Responses** - Real-time AI chat with chunked responses
- **Context Management** - Conversation history and context preservation
- **Recipe Generation** - AI-powered meal suggestions and recipes
- **Nutrition Analysis** - Intelligent nutritional information extraction

Configuration in `src/services/ai.ts`

## 🌐 API Endpoints

### Core Endpoints
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/{id}/messages` - Send chat message
- `GET /api/conversations/{id}/messages` - Get conversation history

### Authentication Endpoints
- `POST /api/auth/guest` - Create guest session
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Documentation
- `GET /docs` - Swagger UI documentation
- `GET /api-docs/swagger.json` - OpenAPI specification

## 🔐 Security & Middleware

### CORS Configuration
```typescript
// Production domains only
origin: [
  'https://monamichef.vercel.app',
  'https://mon-ami-chef.vercel.app'
],
credentials: true
```

### Authentication Middleware
- **Supabase JWT verification** for authenticated routes
- **Guest cookie validation** for anonymous access
- **Route-level security** with TSOA decorators

### Environment Variables
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
GOOGLE_AI_API_KEY=...
```

## 🚀 Development Workflow

### Making API Changes
1. **Update Controllers** - Add/modify TSOA decorated methods
2. **Run Build** - `yarn build` to regenerate routes and specs
3. **Test Endpoints** - Use generated Swagger UI at `/docs`

### Database Changes
1. **Update Schema** - Modify `prisma/schema.prisma`
2. **Generate Migration** - `npx prisma migrate dev --name description`
3. **Generate Client** - `npx prisma generate` (included in build)

### Adding New Features
1. **Controller** - Define routes with TSOA decorators
2. **Service** - Implement business logic
3. **Models** - Update Prisma schema if needed
4. **Middleware** - Add authentication/validation as needed

## 🧪 Testing & Quality

### Code Quality
- **TypeScript strict mode** for type safety
- **ESLint configuration** for consistent code style
- **Prisma type generation** for database type safety

### API Testing
- **Swagger UI** - Interactive API documentation at `/docs`
- **OpenAPI Spec** - Machine-readable API definition
- **Type-safe requests** - Full TypeScript integration

## 🚀 Deployment

### Build Process
```bash
# Generate all required files
yarn build

# This runs:
# 1. npx prisma generate    (database client)
# 2. npx tsoa routes        (API routes)
# 3. npx tsoa spec          (OpenAPI spec)
# 4. npx tsc               (TypeScript compilation)
```

### Environment Setup
- Configure database connection
- Set up Supabase credentials
- Configure Google AI API key
- Set production CORS origins

### Production Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] CORS origins set for production domains
- [ ] API keys and secrets secured
- [ ] Health check endpoint responding

## 🛠️ Troubleshooting

### Common Issues

**Build failures**
- Ensure Prisma schema is valid: `npx prisma validate`
- Check TSOA controller decorators are correct
- Verify TypeScript types are properly defined

**Database connection errors**
- Verify DATABASE_URL format and credentials
- Check database server accessibility
- Run `npx prisma migrate dev` to apply pending migrations

**Authentication issues**
- Verify Supabase configuration and API keys
- Check JWT token format and expiration
- Validate guest cookie creation and parsing

**CORS errors**
- Update allowed origins in middleware configuration
- Ensure credentials are properly configured
- Check preflight request handling

---

Built with ❤️ for seamless meal planning experiences