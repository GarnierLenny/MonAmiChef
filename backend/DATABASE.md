# Database Management Scripts

This document explains the available database management scripts in `package.json`.

## 🗄️ Prisma Scripts

### Core Operations
- `npm run db:generate` - Generate Prisma client from schema
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:pull` - Pull database schema into Prisma schema
- `npm run db:validate` - Validate Prisma schema
- `npm run db:format` - Format Prisma schema file
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Migration Scripts
- `npm run db:migrate` - Create and apply new migration (development)
- `npm run db:migrate:deploy` - Apply pending migrations (production)
- `npm run db:migrate:reset` - Reset database and apply all migrations

### Seeding
- `npm run db:seed` - Run database seed script to populate test data

## 🚀 Supabase Scripts

### Local Development
- `npm run supabase:start` - Start local Supabase services
- `npm run supabase:stop` - Stop local Supabase services
- `npm run supabase:status` - Check status of local services
- `npm run supabase:reset` - Reset local Supabase database

### Schema & Deployment
- `npm run supabase:diff` - Generate SQL diff for schema changes
- `npm run supabase:link` - Link to remote Supabase project
- `npm run supabase:gen-types` - Generate TypeScript types from database

## 🔧 Development Workflows

### Combined Development Scripts
- `npm run dev:db` - Start Supabase + Push schema (quick setup)
- `npm run dev:reset` - Reset Supabase + Push schema (fresh start)  
- `npm run dev:fresh` - Stop, restart Supabase + Push schema (clean slate)

## 📋 Common Workflows

### 1. First Time Setup
```bash
npm run supabase:start    # Start local Supabase
npm run db:push          # Apply schema to database
npm run db:seed          # Add sample data
```

### 2. Daily Development
```bash
npm run dev:db           # Quick start: Supabase + schema
```

### 3. Schema Changes
```bash
# Edit prisma/schema.prisma
npm run db:push          # Apply changes to dev database
npm run db:validate      # Verify schema is valid
```

### 4. Fresh Start (Reset Everything)
```bash
npm run dev:fresh        # Clean restart with schema
npm run db:seed          # Add sample data
```

### 5. Production Deployment
```bash
npm run db:migrate       # Create migration from schema changes
npm run db:migrate:deploy # Apply migrations to production
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev:db` |
| View database | `npm run db:studio` |
| Reset everything | `npm run dev:fresh` |
| Add test data | `npm run db:seed` |
| Check schema | `npm run db:validate` |
| Generate types | `npm run supabase:gen-types` |

## 🔍 Troubleshooting

### Schema Issues
```bash
npm run db:validate      # Check for schema errors
npm run db:format        # Fix formatting issues
```

### Database Connection Issues  
```bash
npm run supabase:status  # Check if Supabase is running
npm run supabase:start   # Start if not running
```

### Migration Problems
```bash
npm run db:push          # Skip migrations (development)
npm run dev:reset        # Nuclear option: reset everything
```

## 📝 Notes

- **Development**: Use `db:push` for rapid iteration
- **Production**: Always use `db:migrate:deploy` for safety
- **Schema Separation**: Only manages `public` schema, Supabase handles `auth`
- **Seeding**: Run `db:seed` to populate with sample data for testing