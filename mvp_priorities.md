# MonAmiChef MVP Priorities - September 2025

> **Critical Insight**: The existing ChatController already provides sophisticated AI recipe generation via Gemini 2.5 Flash. The September milestone should focus on building the "meal planning engine" that connects this existing AI capability to actual meal planning workflows.

## 🎯 Current State Analysis

### ✅ Already Implemented
- **AI Recipe Generation** - ChatController with Gemini integration
- **Recipe CRUD** - RecipeController with save/history functionality
- **Authentication** - Guest + Supabase auth working
- **Database Foundation** - Recipe, Profile, Conversation models

### ❌ Missing for MVP Launch
- **Meal Planning Database** - No meal plan tables
- **Ingredient Parsing** - Required for grocery lists
- **Shopping List Generation** - Core value proposition
- **Meal Plan UI** - Bridge between recipes and planning

## 📋 Updated September MVP Milestone

**Due Date:** September 30, 2025
**Total Issues:** 10 (7 original + 3 moved from other milestones)

---

## Phase 1: Core Meal Planning Engine 🚀
*Week 1 - Foundation*

### 1. #25 - 🗄️ Backend: Meal Plan Database Schema & Models
**Priority:** CRITICAL | **Lines:** ~150 | **Days:** 2

**Why First:** Foundation for everything else, no dependencies

**Database Tables:**
```sql
meal_plans: { id, user_id, week_start_date, created_at, updated_at }
meal_plan_items: { id, meal_plan_id, day, meal_slot, recipe_id, created_at }
```

**Success Criteria:**
- [ ] Prisma schema updated with meal planning tables
- [ ] Migration runs successfully in dev/prod
- [ ] TypeScript types generated and aligned
- [ ] Foreign keys and constraints properly set

---

### 2. #29 - 🧮 Backend: Ingredient Parsing & Aggregation Engine
**Priority:** CRITICAL | **Lines:** ~200 | **Days:** 2
**Moved from Future → September MVP**

**Why Critical:** Required for grocery list generation (core value prop)

**Core Features:**
```typescript
// Parse ingredients from recipes
"2 cups diced tomatoes" → { amount: 2, unit: "cups", ingredient: "tomatoes", modifier: "diced" }

// Aggregate across recipes
["2 tomatoes", "3 tomatoes"] → "5 tomatoes"
["1 cup milk", "500ml milk"] → "1.5 cups milk" (unit normalization)
```

**Success Criteria:**
- [ ] Ingredient parsing with regex/NLP
- [ ] Unit normalization (cups ↔ ml, lbs ↔ kg)
- [ ] Smart aggregation logic
- [ ] Category classification (produce, dairy, meat)

---

### 3. #26 - 🔌 Backend: Meal Plan API Endpoints
**Priority:** HIGH | **Lines:** ~200 | **Days:** 2
**Depends On:** #25

**API Design:**
```typescript
GET    /meal-plans              // List user meal plans
POST   /meal-plans              // Create new plan
GET    /meal-plans/:id          // Get plan with items
PUT    /meal-plans/:id          // Update plan
DELETE /meal-plans/:id          // Delete plan
POST   /meal-plans/:id/items    // Add recipe to slot
DELETE /meal-plans/:id/items/:itemId // Remove recipe
```

**Success Criteria:**
- [ ] All CRUD operations working
- [ ] Proper authentication & ownership checks
- [ ] TSOA documentation generated
- [ ] Integration tests passing

---

### 4. #30 - 🔌 Backend: Grocery List Generation API
**Priority:** HIGH | **Lines:** ~180 | **Days:** 2
**Moved from Future → September MVP**
**Depends On:** #26, #29

**Core Algorithm:**
```typescript
GET /meal-plans/:id/grocery-list
→ Parse all recipe ingredients
→ Aggregate & normalize units
→ Categorize by type
→ Return structured grocery list
```

**Success Criteria:**
- [ ] Ingredient aggregation working
- [ ] Category grouping (produce, dairy, etc.)
- [ ] Export formats (JSON, text, CSV)
- [ ] Unit conversion accuracy

---

## Phase 2: Essential UI & User Flow 🎨
*Week 2 - Core Experience*

### 5. #33 - 🎨 Frontend: Polished Authentication UI/UX
**Priority:** HIGH | **Lines:** ~250 | **Days:** 2
**Moved Earlier** (was planned for Week 3)

**Why Earlier:** Need real user sessions for testing meal planning flow

**Features:**
- Modal-based auth with smooth transitions
- Real-time form validation
- Password strength indicators
- Mobile-optimized forms

**Success Criteria:**
- [ ] Login/register flow working
- [ ] Form validation with good UX
- [ ] Mobile responsive
- [ ] Error handling clear and helpful

---

### 6. #27 - 🎨 Frontend: Desktop Meal Plan Grid Component
**Priority:** HIGH | **Lines:** ~250 | **Days:** 3
**Depends On:** #26

**Core Feature:** 7×3 grid (7 days × 3 meals) connecting recipes to planning

**Components:**
```
MealPlanGrid/
├── index.tsx              // Main 7x3 grid
├── MealSlot.tsx          // Individual meal slot
├── RecipeSelector.tsx    // Modal to add recipes
├── WeekNavigation.tsx    // Week picker
```

**Success Criteria:**
- [ ] Grid renders correctly on desktop
- [ ] Can add/remove recipes from slots
- [ ] Data persists to backend via APIs
- [ ] Loading states and error handling

---

### 7. #31 - 📝 Frontend: Grocery List Generator & Editor
**Priority:** HIGH | **Lines:** ~200 | **Days:** 2
**Moved from Future → September MVP**
**Depends On:** #27, #30

**Bridge UI:** Connect meal planning → grocery list generation

**Features:**
```typescript
// From meal plan grid
<Button onClick={generateGroceryList}>Generate Grocery List</Button>

// Editable grocery list
<GroceryListEditor
  items={groceryItems}
  onEdit={handleEdit}
  onExport={handleExport}
/>
```

**Success Criteria:**
- [ ] Generate button in meal plan UI
- [ ] Editable grocery list with categories
- [ ] Export options (PDF, text, copy)
- [ ] Mobile-friendly interface

---

## Phase 3: Polish & Mobile Experience 📱
*Week 3 - Enhancement*

### 8. #32 - 🔒 Backend: Enhanced Profile Management System
**Priority:** MEDIUM | **Lines:** ~180 | **Days:** 2

**Enhanced Profile Schema:**
```sql
profiles {
  + dietary_preferences: json
  + allergies: text[]
  + default_servings: integer
  + email_notifications: boolean
}
```

**Success Criteria:**
- [ ] Extended profile model with meal planning preferences
- [ ] Avatar upload functionality
- [ ] Email verification workflow
- [ ] Password reset functionality

---

### 9. #34 - 👤 Frontend: Profile Management Interface
**Priority:** MEDIUM | **Lines:** ~200 | **Days:** 2
**Depends On:** #32, #33

**Profile Sections:**
1. Basic Info (name, email, avatar)
2. Dietary Preferences (vegetarian, vegan, etc.)
3. Allergies & Restrictions
4. Cooking Preferences (default servings)
5. Notifications
6. Account Management

**Success Criteria:**
- [ ] All profile fields editable
- [ ] Avatar upload working
- [ ] Dietary preferences save correctly
- [ ] Mobile responsive layout

---

### 10. #28 - 📱 Frontend: Mobile Meal Plan View
**Priority:** MEDIUM | **Lines:** ~180 | **Days:** 2
**Depends On:** #27

**Mobile-First:** Carousel/accordion approach for small screens

**Features:**
- Swipeable day cards
- Collapsible meal sections
- Touch-friendly interactions (44px+ targets)
- Mobile recipe picker

**Success Criteria:**
- [ ] Smooth carousel navigation
- [ ] Touch-friendly interactions
- [ ] Readable on small screens (375px+)
- [ ] Performance optimized

---

## 🚀 New Issues Created

### #39 - 🤖 LLM Meal Plan Orchestrator
**Priority:** HIGH | **Lines:** ~150 | **Epic:** Bridge existing AI to meal planning

**Concept:** Connect existing ChatController AI to meal planning workflow

**Features:**
```typescript
// New endpoint that bridges chat → meal plan
POST /meal-plans/ai-generate
{
  "preferences": "vegetarian, 4 servings, Italian cuisine",
  "week_start": "2025-09-15",
  "dietary_restrictions": ["gluten-free"]
}

// Response: Generated meal plan with AI recipes
{
  "meal_plan_id": "uuid",
  "recipes_generated": 21, // 7 days × 3 meals
  "grocery_list_preview": [...]
}
```

---

### #40 - 🔗 Recipe-to-Meal-Plan Bridge
**Priority:** MEDIUM | **Lines:** ~100 | **Epic:** Integration

**Concept:** Allow users to add existing saved recipes to meal plans

**Features:**
- "Add to Meal Plan" button on recipe cards
- Quick meal slot selector modal
- Recipe suggestion based on dietary preferences

---

### #41 - ✅ Meal Plan Validation & Constraints
**Priority:** LOW | **Lines:** ~120 | **Epic:** Data Quality

**Concept:** Validate meal plans against user preferences and constraints

**Features:**
- Dietary restriction validation (no meat for vegetarians)
- Allergy checking across all planned recipes
- Nutritional balance warnings
- Serving size consistency

---

## 📊 Success Metrics for MVP Launch

### Week 1 Checkpoint: "Walking Skeleton"
- [ ] User can create meal plan in database
- [ ] Ingredients can be parsed and aggregated
- [ ] Basic grocery list generated from meal plan

### Week 2 Checkpoint: "Functional MVP"
- [ ] User can sign in → plan meals → generate grocery list
- [ ] Desktop meal planning grid working
- [ ] End-to-end flow complete

### Week 3 Checkpoint: "Launch Ready"
- [ ] Profile management working
- [ ] Mobile experience optimized
- [ ] All major bugs fixed

### Launch Success Criteria
- [ ] Users can complete full meal planning workflow
- [ ] Grocery list generation provides clear value
- [ ] Mobile experience is usable
- [ ] Performance is acceptable (< 2s page loads)
- [ ] Error rates < 5%

---

## 🔥 Critical Success Path (Updated)

### **Complete Flow with New Issues:**
```
#25 → #29 → #26 → #39 → #30 → #33 → #27 → #40 → #31 → #32 → #34 → #28 → #41
```

### **Breakdown by Week:**

**Week 1 - Foundation & Engine:**
`#25 → #29 → #26 → #39 → #30`
- Database Schema → Ingredient Parsing → Meal Plan APIs → AI Orchestrator → Grocery List API

**Week 2 - Core User Experience:**
`#33 → #27 → #40 → #31`
- Authentication UI → Desktop Grid → Recipe Bridge → Grocery List UI

**Week 3 - Polish & Enhancement:**
`#32 → #34 → #28 → #41`
- Profile Backend → Profile UI → Mobile View → Validation

### **Minimum Viable Launch Requirements:**
**Essential (Must Have):** `#25 → #29 → #26 → #39 → #33 → #27 → #31`
**Enhanced (Should Have):** `+ #30 → #40`
**Polish (Nice to Have):** `+ #32 → #34 → #28 → #41`

### **Key Dependencies:**
- **#39** (LLM Orchestrator) depends on **#25** (Database) and **#26** (APIs)
- **#40** (Recipe Bridge) depends on **#27** (Desktop Grid) and **#39** (AI integration)
- **#31** (Grocery List UI) depends on **#30** (Grocery API) and **#27** (Meal Grid)

This creates the complete user journey: **AI Chat → Structured Meal Plan → Manual Recipe Addition → Grocery List Export**

---

## 🎯 Key Architecture Decisions

### 1. **Leverage Existing AI Investment**
The ChatController + Gemini integration already works. Build meal planning as a "structured chat workflow" rather than starting from scratch.

### 2. **Backend-First Approach**
Get the meal planning engine working before polishing UI. This reduces risk of building beautiful interfaces for broken functionality.

### 3. **Progressive Enhancement**
- Week 1: Basic meal planning works
- Week 2: Good desktop experience
- Week 3: Great mobile experience

### 4. **Focus on Core Value Loop**
Chat → Generate Recipes → Plan Meals → Generate Grocery Lists

This creates immediate, tangible value for users and differentiates from basic meal planning apps.

---

## 🚨 Risk Mitigation

### **High Risk: Ingredient Parsing Complexity**
- **Mitigation:** Start with simple regex, iterate based on real user data
- **Fallback:** Manual ingredient entry if parsing fails

### **Medium Risk: Recipe-Meal Plan Integration**
- **Mitigation:** Build simple bridge first, enhance based on usage
- **Fallback:** Users can manually add recipes to meal plans

### **Low Risk: Mobile Performance**
- **Mitigation:** Test on real devices early, optimize critical paths
- **Fallback:** Desktop-first launch if mobile isn't ready

---

*Last Updated: September 13, 2025*
*Next Review: After Week 1 completion*