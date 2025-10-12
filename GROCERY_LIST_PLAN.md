# Grocery List Implementation Plan

**Issue:** #63 - Grocery List: Dedicated Page with Backend Persistence
**Architecture:** Dedicated page (shopping cart pattern), not modal
**Estimated Time:** 3-4 days
**Lines of Code:** ~600 lines total

---

## 🎯 Goal

Create a persistent grocery list feature where users can:
1. Add meals from meal planner to grocery list
2. View aggregated ingredients grouped by category
3. Add custom items (paper towels, coffee, etc.)
4. Check off items while shopping
5. List persists across sessions and devices

---

## 📋 Implementation Phases

### Phase 1: Backend Foundation (4-6 hours)

#### Step 1.1: Database Schema
**File:** `backend/prisma/schema.prisma`

```prisma
model GroceryList {
  id              String              @id @default(uuid())
  userId          String              @unique
  meals           GroceryMeal[]
  customItems     CustomGroceryItem[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  user Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GroceryMeal {
  id             String   @id @default(uuid())
  listId         String
  mealPlanItemId String
  day            String
  mealSlot       String
  addedAt        DateTime @default(now())

  list GroceryList @relation(fields: [listId], references: [id], onDelete: Cascade)

  @@unique([listId, mealPlanItemId])
  @@index([listId])
}

model CustomGroceryItem {
  id         String   @id @default(uuid())
  listId     String
  name       String
  quantity   String?
  category   String?
  checked    Boolean  @default(false)
  createdAt  DateTime @default(now())

  list GroceryList @relation(fields: [listId], references: [id], onDelete: Cascade)

  @@index([listId])
}
```

**Commands:**
```bash
cd backend
yarn db:generate
yarn db:migrate  # Name: add_grocery_list
```

**Verification:** Check Prisma Studio to see new tables

---

#### Step 1.2: TypeScript Types
**File:** `backend/src/types/groceryList.ts` (~30 lines)

```typescript
export interface GroceryListResponse {
  id: string;
  meals: GroceryMealResponse[];
  customItems: CustomGroceryItemResponse[];
  aggregatedIngredients: CategoryIngredients[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroceryMealResponse {
  id: string;
  mealPlanItemId: string;
  day: string;
  mealSlot: string;
  recipe: {
    id: string;
    title: string;
    ingredients: string[];
  };
  addedAt: Date;
}

export interface CustomGroceryItemResponse {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  createdAt: Date;
}

export interface CategoryIngredients {
  category: string;
  items: AggregatedIngredient[];
}

export interface AggregatedIngredient {
  name: string;
  quantity: string;
  recipeIds: string[];
  recipes: string[]; // Recipe titles
}

export interface AddMealsRequest {
  mealPlanItemIds: string[];
}

export interface AddCustomItemRequest {
  name: string;
  quantity?: string;
  category?: string;
}

export interface UpdateCustomItemRequest {
  name?: string;
  quantity?: string;
  category?: string;
  checked?: boolean;
}
```

---

#### Step 1.3: Service Layer
**File:** `backend/src/services/GroceryListService.ts` (~150 lines)

Key functions:
- `getOrCreateGroceryList(userId)` - Singleton pattern
- `addMeals(userId, mealPlanItemIds)` - Add meals to list
- `removeMeal(userId, mealPlanItemId)` - Remove meal
- `addCustomItem(userId, item)` - Add custom item
- `updateCustomItem(userId, itemId, updates)` - Update custom item
- `deleteCustomItem(userId, itemId)` - Delete custom item
- `clearGroceryList(userId)` - Remove all items
- `aggregateIngredients(meals)` - Group and combine ingredients
- `categorizeIngredient(name)` - Auto-detect category

**Key Logic:**
```typescript
// Ingredient aggregation example
aggregateIngredients(meals) {
  // 1. Extract all ingredients from all recipes
  // 2. Parse quantities (2 tomatoes, 1 cup milk, etc.)
  // 3. Combine duplicates (2 tomatoes + 3 tomatoes = 5 tomatoes)
  // 4. Group by category (produce, dairy, proteins, etc.)
  // 5. Sort categories and items alphabetically
}

// Category detection
categorizeIngredient(name) {
  const categories = {
    produce: ['tomato', 'lettuce', 'onion', 'carrot', ...],
    dairy: ['milk', 'cheese', 'yogurt', 'butter', ...],
    protein: ['chicken', 'beef', 'fish', 'egg', ...],
    grains: ['rice', 'pasta', 'bread', 'flour', ...],
    // etc.
  };

  // Match ingredient name to category
  return detectCategory(name, categories) || 'other';
}
```

---

#### Step 1.4: TSOA Controller
**File:** `backend/src/controllers/GroceryListController.ts` (~120 lines)

```typescript
@Route("grocery-list")
@Tags("GroceryList")
export class GroceryListController extends Controller {

  @Get("/")
  @Security("jwt")
  public async getGroceryList(@Request() request: any): Promise<GroceryListResponse> {
    const userId = request.user.id;
    return groceryListService.getOrCreateGroceryList(userId);
  }

  @Post("/meals")
  @Security("jwt")
  public async addMeals(
    @Request() request: any,
    @Body() body: AddMealsRequest
  ): Promise<GroceryListResponse> {
    const userId = request.user.id;
    return groceryListService.addMeals(userId, body.mealPlanItemIds);
  }

  @Delete("/meals/{mealPlanItemId}")
  @Security("jwt")
  public async removeMeal(
    @Request() request: any,
    @Path() mealPlanItemId: string
  ): Promise<void> {
    const userId = request.user.id;
    await groceryListService.removeMeal(userId, mealPlanItemId);
    this.setStatus(204);
  }

  @Post("/items")
  @Security("jwt")
  public async addCustomItem(
    @Request() request: any,
    @Body() body: AddCustomItemRequest
  ): Promise<CustomGroceryItemResponse> {
    const userId = request.user.id;
    return groceryListService.addCustomItem(userId, body);
  }

  @Patch("/items/{itemId}")
  @Security("jwt")
  public async updateCustomItem(
    @Request() request: any,
    @Path() itemId: string,
    @Body() body: UpdateCustomItemRequest
  ): Promise<CustomGroceryItemResponse> {
    const userId = request.user.id;
    return groceryListService.updateCustomItem(userId, itemId, body);
  }

  @Delete("/items/{itemId}")
  @Security("jwt")
  public async deleteCustomItem(
    @Request() request: any,
    @Path() itemId: string
  ): Promise<void> {
    const userId = request.user.id;
    await groceryListService.deleteCustomItem(userId, itemId);
    this.setStatus(204);
  }

  @Delete("/")
  @Security("jwt")
  public async clearGroceryList(@Request() request: any): Promise<void> {
    const userId = request.user.id;
    await groceryListService.clearGroceryList(userId);
    this.setStatus(204);
  }
}
```

**Commands:**
```bash
cd backend
yarn build  # Regenerate TSOA routes
```

**Testing:**
- Open `http://localhost:3001/docs`
- Test each endpoint with Swagger UI
- Verify responses match TypeScript types

---

### Phase 2: Frontend API Client (1 hour)

#### Step 2.1: API Client
**File:** `frontend/src/lib/api/groceryListApi.ts` (~60 lines)

```typescript
import { apiClient } from './apiClient';

export interface GroceryList {
  id: string;
  meals: GroceryMeal[];
  customItems: CustomGroceryItem[];
  aggregatedIngredients: CategoryIngredients[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroceryMeal {
  id: string;
  mealPlanItemId: string;
  day: string;
  mealSlot: string;
  recipe: {
    id: string;
    title: string;
    ingredients: string[];
  };
  addedAt: Date;
}

export interface CustomGroceryItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  createdAt: Date;
}

export interface CategoryIngredients {
  category: string;
  items: AggregatedIngredient[];
}

export interface AggregatedIngredient {
  name: string;
  quantity: string;
  recipeIds: string[];
  recipes: string[];
}

export const groceryListApi = {
  async getGroceryList(): Promise<GroceryList> {
    return apiClient.get('/grocery-list');
  },

  async addMeals(mealPlanItemIds: string[]): Promise<GroceryList> {
    return apiClient.post('/grocery-list/meals', { mealPlanItemIds });
  },

  async removeMeal(mealPlanItemId: string): Promise<void> {
    return apiClient.delete(`/grocery-list/meals/${mealPlanItemId}`);
  },

  async addCustomItem(
    name: string,
    quantity?: string,
    category?: string
  ): Promise<CustomGroceryItem> {
    return apiClient.post('/grocery-list/items', { name, quantity, category });
  },

  async updateCustomItem(
    itemId: string,
    updates: {
      name?: string;
      quantity?: string;
      category?: string;
      checked?: boolean;
    }
  ): Promise<CustomGroceryItem> {
    return apiClient.patch(`/grocery-list/items/${itemId}`, updates);
  },

  async deleteCustomItem(itemId: string): Promise<void> {
    return apiClient.delete(`/grocery-list/items/${itemId}`);
  },

  async clearGroceryList(): Promise<void> {
    return apiClient.delete('/grocery-list');
  },
};
```

---

### Phase 3: Frontend Page Components (6-8 hours)

#### Step 3.1: Main Page Component
**File:** `frontend/src/pages/GroceryListPage.tsx` (~200 lines)

Key features:
- Load grocery list on mount
- Display meals section
- Display aggregated ingredients by category
- Display custom items section
- Add custom item input
- Loading/error states
- Empty state with CTA

**Structure:**
```tsx
export default function GroceryListPage() {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      setIsLoading(true);
      const list = await groceryListApi.getGroceryList();
      setGroceryList(list);
    } catch (err) {
      setError('Failed to load grocery list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMeal = async (mealPlanItemId: string) => {
    await groceryListApi.removeMeal(mealPlanItemId);
    await loadGroceryList();
  };

  const handleAddCustomItem = async (name: string, quantity?: string) => {
    await groceryListApi.addCustomItem(name, quantity);
    await loadGroceryList();
  };

  return (
    <div className="grocery-list-page">
      <Header onClearAll={handleClearAll} />

      {groceryList?.meals.length > 0 && (
        <MealsSection
          meals={groceryList.meals}
          onRemoveMeal={handleRemoveMeal}
        />
      )}

      {groceryList?.aggregatedIngredients.length > 0 && (
        <IngredientsSection
          categories={groceryList.aggregatedIngredients}
          checkedIngredients={checkedIngredients}
          onToggleCheck={handleToggleIngredient}
        />
      )}

      <CustomItemsSection
        items={groceryList?.customItems || []}
        onAddItem={handleAddCustomItem}
        onDeleteItem={handleDeleteCustomItem}
      />
    </div>
  );
}
```

---

#### Step 3.2: Meal Card Component
**File:** `frontend/src/components/grocery-list/MealCard.tsx` (~40 lines)

```tsx
interface MealCardProps {
  meal: GroceryMeal;
  onRemove: () => void;
}

export const MealCard = ({ meal, onRemove }: MealCardProps) => {
  return (
    <div className="meal-card">
      <div className="meal-info">
        <h3>{meal.recipe.title}</h3>
        <p className="text-sm text-gray-500">
          {meal.day} • {meal.mealSlot}
        </p>
      </div>
      <Button variant="ghost" onClick={onRemove}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
```

---

#### Step 3.3: Ingredients Section Component
**File:** `frontend/src/components/grocery-list/IngredientsSection.tsx` (~80 lines)

```tsx
interface IngredientsSectionProps {
  categories: CategoryIngredients[];
  checkedIngredients: Set<string>;
  onToggleCheck: (ingredientKey: string) => void;
}

export const IngredientsSection = ({
  categories,
  checkedIngredients,
  onToggleCheck,
}: IngredientsSectionProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.category))
  );

  return (
    <div className="ingredients-section">
      <h2>Ingredients</h2>
      {categories.map((category) => (
        <CategoryGroup
          key={category.category}
          category={category}
          isExpanded={expandedCategories.has(category.category)}
          onToggleExpand={() => toggleCategory(category.category)}
          checkedIngredients={checkedIngredients}
          onToggleCheck={onToggleCheck}
        />
      ))}
    </div>
  );
};
```

---

#### Step 3.4: Custom Items Input Component
**File:** `frontend/src/components/grocery-list/CustomItemInput.tsx` (~50 lines)

```tsx
interface CustomItemInputProps {
  onAddItem: (name: string, quantity?: string) => Promise<void>;
}

export const CustomItemInput = ({ onAddItem }: CustomItemInputProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsAdding(true);
    try {
      await onAddItem(name, quantity || undefined);
      setName('');
      setQuantity('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="custom-item-input">
      <Input
        placeholder="Add item (e.g., Paper towels)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Qty (optional)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <Button type="submit" disabled={!name.trim() || isAdding}>
        Add
      </Button>
    </form>
  );
};
```

---

#### Step 3.5: Navigation Integration

**File:** `frontend/src/App.tsx`
```tsx
// Add route
<Route path="/grocery-list" element={<GroceryListPage />} />
```

**File:** `frontend/src/components/Sidebar.tsx`
```tsx
// Add navigation item
<SidebarItem
  icon={ShoppingCart}
  label="Grocery List"
  path="/grocery-list"
/>
```

---

#### Step 3.6: Meal Plan Integration

**File:** `frontend/src/pages/MealPlanPage.tsx`

Add button to add selected meals:

```tsx
// Add button in mobile/desktop layout when meals are selected
{selectedMeals.size > 0 && (
  <Button onClick={handleAddToGroceryList}>
    <ShoppingCart className="w-4 h-4" />
    Add {selectedMeals.size} to Grocery List
  </Button>
)}

const handleAddToGroceryList = async () => {
  try {
    // Convert selected meal keys to meal plan item IDs
    const mealPlanItemIds = Array.from(selectedMeals).map(mealKey => {
      const [day, slot] = mealKey.split('-');
      const item = findMealPlanItem(currentBackendPlan, day, slot as MealSlot);
      return item?.id;
    }).filter(Boolean);

    await groceryListApi.addMeals(mealPlanItemIds);

    toast.success(`${selectedMeals.size} meals added to grocery list`);
    setSelectedMeals(new Set());

    // Optional: Navigate to grocery list
    navigate('/grocery-list');
  } catch (err) {
    toast.error('Failed to add meals to grocery list');
  }
};
```

---

### Phase 4: Translations & Polish (2 hours)

#### Step 4.1: Add Translations

**File:** `frontend/src/lib/locales/en.json`
```json
{
  "groceryList": {
    "title": "Grocery List",
    "mealsSection": "From Your Meal Plan",
    "ingredientsSection": "Ingredients",
    "customItemsSection": "Additional Items",
    "addCustomItem": "Add custom item",
    "addToGroceryList": "Add to Grocery List",
    "mealsAdded": "{{count}} meals added to grocery list",
    "removeMeal": "Remove meal",
    "clearAll": "Clear all",
    "emptyState": "Your grocery list is empty",
    "emptyStateCta": "Add meals from your meal plan",
    "categories": {
      "produce": "Produce",
      "dairy": "Dairy",
      "protein": "Proteins",
      "grains": "Grains",
      "spices": "Spices & Seasonings",
      "other": "Other"
    }
  }
}
```

**File:** `frontend/src/lib/locales/fr.json`
```json
{
  "groceryList": {
    "title": "Liste d'Épicerie",
    "mealsSection": "De Votre Plan de Repas",
    "ingredientsSection": "Ingrédients",
    "customItemsSection": "Articles Supplémentaires",
    "addCustomItem": "Ajouter un article personnalisé",
    "addToGroceryList": "Ajouter à la liste d'épicerie",
    "mealsAdded": "{{count}} repas ajoutés à la liste",
    "removeMeal": "Retirer le repas",
    "clearAll": "Tout effacer",
    "emptyState": "Votre liste d'épicerie est vide",
    "emptyStateCta": "Ajoutez des repas de votre plan de repas",
    "categories": {
      "produce": "Fruits et Légumes",
      "dairy": "Produits Laitiers",
      "protein": "Protéines",
      "grains": "Céréales",
      "spices": "Épices et Assaisonnements",
      "other": "Autre"
    }
  }
}
```

---

#### Step 4.2: Mobile Responsive Design

Ensure all components work on mobile:
- Stack meals vertically
- Collapsible categories
- Touch-friendly checkboxes
- Bottom-fixed input for custom items
- Responsive font sizes and spacing

---

#### Step 4.3: Loading & Error States

- Skeleton loaders for initial load
- Loading spinners for actions
- Toast notifications for success/errors
- Empty state with illustration and CTA

---

### Phase 5: Testing & Refinement (2-3 hours)

#### Manual Testing Checklist

**Backend:**
- [ ] Create grocery list via API
- [ ] Add meals → verify in database
- [ ] Add custom item → verify in database
- [ ] Remove meal → verify ingredients update
- [ ] Delete custom item → verify removed
- [ ] Clear all → verify empty
- [ ] Test ingredient aggregation (duplicates combined)
- [ ] Test category detection (tomato → produce)

**Frontend:**
- [ ] Navigate to Grocery List page
- [ ] See empty state initially
- [ ] Go to meal plan, select 3 meals
- [ ] Click "Add to Grocery List"
- [ ] Navigate to grocery list, see 3 meals
- [ ] See aggregated ingredients grouped by category
- [ ] Check/uncheck ingredients (local state)
- [ ] Add custom item "Paper towels"
- [ ] Edit custom item quantity
- [ ] Delete custom item
- [ ] Remove 1 meal → ingredients update
- [ ] Refresh page → everything persists
- [ ] Clear all → empty state
- [ ] Test on mobile device

**Integration:**
- [ ] Guest user → see auth prompt
- [ ] Authenticated user → full functionality
- [ ] Multiple browser tabs → sync on reload
- [ ] Network error → graceful error handling

---

## 📊 Progress Tracking

Use TodoWrite tool to track progress:

```
Phase 1: Backend Foundation
├─ ✅ Database schema + migration
├─ ✅ TypeScript types
├─ ✅ Service layer
├─ ✅ TSOA controller
└─ ✅ API testing

Phase 2: Frontend API Client
└─ ✅ groceryListApi.ts

Phase 3: Frontend Components
├─ ✅ GroceryListPage
├─ ✅ MealCard component
├─ ✅ IngredientsSection component
├─ ✅ CustomItemInput component
├─ ✅ Navigation integration
└─ ✅ Meal plan integration

Phase 4: Polish
├─ ✅ Translations (EN + FR)
├─ ✅ Mobile responsive
├─ ✅ Loading states
└─ ✅ Error handling

Phase 5: Testing
├─ ✅ Backend API tests
├─ ✅ Frontend manual tests
└─ ✅ Integration tests
```

---

## 🚀 Deployment Steps

1. **Backend:**
   ```bash
   cd backend
   yarn build
   yarn db:migrate  # Run on production
   ```

2. **Frontend:**
   ```bash
   cd frontend
   yarn build
   ```

3. **Database Migration:**
   - Ensure production database is backed up
   - Run migration: `yarn db:migrate`
   - Verify new tables exist

4. **Smoke Test:**
   - Create grocery list
   - Add meals
   - Add custom items
   - Verify persistence

---

## 🐛 Common Issues & Solutions

**Issue:** Ingredients not aggregating correctly
**Solution:** Check ingredient parsing logic in service layer

**Issue:** Duplicate meals in grocery list
**Solution:** Verify `@@unique([listId, mealPlanItemId])` constraint

**Issue:** Custom items not persisting
**Solution:** Check API calls in network tab, verify backend saves to DB

**Issue:** Categories showing "Other" for everything
**Solution:** Expand category keyword list in `categorizeIngredient()`

**Issue:** Mobile layout broken
**Solution:** Test with responsive design tools, adjust breakpoints

---

## 📝 Notes

- **Keep it simple for MVP:** Focus on core functionality, skip advanced features
- **Test incrementally:** Test each phase before moving to next
- **Mobile-first:** Design for mobile, enhance for desktop
- **Performance:** Lazy load recipes, cache ingredients
- **Accessibility:** Keyboard navigation, ARIA labels, screen reader support

---

## ✅ Definition of Done

- [ ] All acceptance criteria met (see issue #63)
- [ ] Backend tests passing
- [ ] Frontend works on mobile and desktop
- [ ] Translations complete (EN + FR)
- [ ] No console errors
- [ ] Code reviewed and documented
- [ ] Database migration applied
- [ ] Feature deployed to staging
- [ ] Manual testing completed
- [ ] Issue #63 closed

---

**Ready to start? Let's build this! 🚀**
