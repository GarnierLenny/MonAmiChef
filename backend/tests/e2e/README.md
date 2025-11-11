# E2E Test Suite for MonAmiChef Backend

## Test Coverage

### Phase 0 - Baseline E2E Tests (Before NestJS Migration)

These tests establish a baseline to ensure the NestJS migration preserves all functionality.

**Completed:**
- ✅ HealthController (8 tests) - Basic health, metrics, stats
- ✅ AuthController (11 tests) - Session status, guest conversion
- ✅ RecipeController (20 tests) - Create, get, save, unsave recipes

**In Progress:**
- MealPlanController - Weekly meal planning
- GroceryListController - Shopping list management
- UserHealthController - Health metrics tracking
- ChatController - AI chat and transcription

## Running Tests

```bash
# Run all e2e tests
yarn test:e2e

# Run specific test file
yarn test:e2e health.e2e.test

# Run with coverage
yarn test:coverage
```

## Test Database

Tests use a local Supabase instance. Ensure it's running:

```bash
yarn supabase:start
yarn db:push
```
