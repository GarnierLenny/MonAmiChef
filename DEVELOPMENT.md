# MonAmiChef Development Guide

This guide provides additional development information for working with MonAmiChef, complementing the main [CLAUDE.md](./CLAUDE.md) file.

## Quick Start

1. **Backend Setup**:
   ```bash
   cd backend
   yarn install
   yarn start  # Builds and starts with hot reload
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   yarn install
   yarn dev    # Start development server
   ```

## Issue Management

### GitHub Issues Organization

Issues are organized by priority and epic:

#### Core MVP (Priority: High)
- **Epic**: Core MVP
- **Labels**: `mvp-core`, `enhancement`
- Features essential for launch: Recipe saving, meal planner, grocery lists, auth, subscriptions

#### MVP+ Features (Priority: Medium)  
- **Epic**: MVP+
- **Labels**: `mvp-plus`, `enhancement`
- Retention features: Nutrition tracking, explore page, social auth

#### Post-MVP Differentiators (Priority: Low)
- **Epic**: Differentiators  
- **Labels**: `post-mvp`, `enhancement`
- Unique features: AI photo analysis, voice assistant, family sharing

### Development Workflow

1. **Feature Development**:
   - Pick issues from Core MVP first
   - Create feature branch from `main`
   - Follow existing code conventions
   - Test thoroughly before PR

2. **Code Review**:
   - All PRs require review
   - Test both backend and frontend changes
   - Verify mobile responsiveness
   - Check for security vulnerabilities

3. **Deployment**:
   - Backend: Build generates TSOA routes and Prisma client
   - Frontend: Vite build with TypeScript compilation
   - Database: Prisma migrations for schema changes

## Architecture Decisions

### Database Design
- **Supabase Auth**: Handles authentication, sessions, user management
- **Custom Schema**: Application-specific tables in `public` schema
- **Prisma ORM**: Type-safe database access with code generation

### API Design  
- **TSOA Framework**: Decorator-based route generation
- **OpenAPI Spec**: Auto-generated from TypeScript interfaces
- **Authentication**: Bearer tokens + guest cookie system
- **Error Handling**: Consistent error responses across endpoints

### Frontend Architecture
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking throughout
- **Tailwind CSS**: Utility-first styling with custom components
- **State Management**: React state + Zustand for complex state
- **Routing**: React Router DOM with protected routes

## Feature Implementation Guidelines

### Adding New Features

1. **Database Changes**:
   ```bash
   # Update schema.prisma
   npx prisma generate
   npx prisma migrate dev --name feature-name
   ```

2. **Backend Implementation**:
   ```bash
   # Add controller with TSOA decorators
   # Update middleware if needed
   yarn build  # Regenerates routes and types
   ```

3. **Frontend Implementation**:
   ```bash
   # Create components following existing patterns
   # Add routing if needed
   # Update state management
   yarn build  # Type check and build
   ```

### Testing Strategy

- **Unit Tests**: Backend business logic and API endpoints
- **Integration Tests**: Database interactions and auth flows  
- **Component Tests**: React component behavior
- **E2E Tests**: Critical user paths (registration, meal planning, etc.)

### Performance Considerations

- **Frontend**: Code splitting for large features, lazy loading for routes
- **Backend**: Database query optimization, caching for frequently accessed data
- **Images**: Supabase Storage with CDN for recipe photos
- **Mobile**: Responsive design with mobile-first approach

## Security Guidelines

### Backend Security
- Input validation on all endpoints
- SQL injection prevention via Prisma
- Rate limiting on public endpoints  
- Secure cookie configuration
- Environment variable protection

### Frontend Security
- XSS prevention in user content
- Secure token storage  
- HTTPS enforcement in production
- Content Security Policy headers

### Authentication Flow
- Guest users: Cookie-based temporary accounts
- Registered users: Supabase JWT tokens
- Account conversion: Guest → Full user migration
- Session management: Automatic refresh and cleanup

## AI Integration

### Google GenAI Usage
- **Chat Interface**: Streaming responses for recipe generation
- **Content Generation**: Recipe suggestions and meal planning
- **Future Features**: Photo analysis, voice processing

### API Guidelines
- Rate limiting for AI endpoints
- Error handling for AI service failures
- Cost monitoring and optimization
- Response caching where appropriate

## Mobile Considerations

### Responsive Design
- Mobile-first CSS approach
- Touch-friendly interface elements
- Optimized for common screen sizes
- Progressive Web App features (future)

### Performance
- Lazy loading for images
- Optimized bundle sizes
- Efficient state updates
- Offline capability planning

## Deployment & DevOps

### Environment Configuration
- **Development**: Local with hot reload
- **Staging**: Preview deployments for testing
- **Production**: Optimized builds with monitoring

### Database Management
- **Migrations**: Version-controlled schema changes
- **Backups**: Regular automated backups
- **Monitoring**: Performance and error tracking

### Monitoring & Analytics
- **Error Tracking**: Frontend and backend error logging
- **Performance**: Core Web Vitals and API response times
- **Usage Analytics**: Feature adoption and user behavior
- **Business Metrics**: Subscription conversion and retention

## Contributing

### Code Style
- **TypeScript**: Strict mode with comprehensive typing
- **ESLint**: Consistent code formatting and best practices
- **Prettier**: Automated code formatting
- **Naming**: Descriptive variable and function names

### Git Workflow
- **Branches**: Feature branches from `main`
- **Commits**: Clear, descriptive commit messages
- **PRs**: Include context and testing notes
- **Releases**: Tagged releases with changelog

### Documentation
- **Code Comments**: Explain complex business logic
- **API Documentation**: Auto-generated OpenAPI specs
- **README Updates**: Keep setup instructions current
- **Architecture Decisions**: Document major technical choices

---

*This document should be updated as the project evolves and new patterns emerge.*