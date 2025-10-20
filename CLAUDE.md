# MacroBalance - Macro Calculator Mobile App

## 🚨 IMPORTANT DEVELOPMENT RULES

**READ THESE RULES BEFORE EVERY SESSION:**

1. **NEVER commit or push changes** until explicitly asked by the user
2. **NEVER build the app** until explicitly asked by the user
3. **ALWAYS update current_bugs.md** whenever fixing bugs or encountering new issues
4. **Project Status**: Development is COMPLETE - we are in DEBUGGING PHASE only
5. **Keep this file up to date**: There isnt much left to do, but if there is new information that might be important to be known, include them here.

## Project Overview

MacroBalance is a React Native mobile application that calculates exact food portions (in grams) needed to meet specific macro targets for each meal. The app features automatic optimization - when a user adjusts one food's portion, all other portions automatically recalculate to maintain macro targets.

### Core Value Proposition
- **Input**: Macro targets (protein, carbs, fat) + selected foods
- **Output**: Exact portion sizes in grams for each food
- **Magic**: Real-time automatic optimization when any portion is adjusted

## Technical Stack

- **Framework**: React Native with Expo SDK 54
- **Runtime**: Expo Go / APK builds
- **State Management**: React Context API (FoodContext, MealContext, SettingsContext, WeightContext, PresetContext)
- **Storage**: AsyncStorage (local persistence)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Testing**: Jest + React Native Testing Library
- **Animations**: React Native Reanimated 4
- **Dependencies**:
  - `react-native-reanimated`: ~4.1.1
  - `react-native-worklets`: ^0.6.1 (required by Reanimated 4)
  - `@react-navigation/bottom-tabs`: ^7.3.16
  - `@react-navigation/stack`: ^7.4.1
  - `@react-native-community/slider`: 5.0.1

## Data Models

### Food Model
```javascript
{
  id: string,
  name: string,
  category: string,
  nutritionPer100g: {
    calories, protein, carbs, fiber, sugar, fat,
    omega3, saturatedFat, monounsaturatedFat, polyunsaturatedFat, transFat,
    addedSugars, naturalSugars,
    iron, calcium, zinc, magnesium, sodium, potassium,
    vitaminB6, vitaminB12, vitaminC, vitaminD
  },
  userAdded: boolean,
  createdAt: string
}
```

### Meal Model
```javascript
{
  id: string,
  name: string,
  macroTargets: { protein, carbs, minFiber, maxSugar, fat },
  userCustom: boolean,
  personalizedGenerated: boolean,
  createdAt: string
}
```

### MealPlan Model
```javascript
{
  id: string,
  mealId: string,
  selectedFoods: [{ foodId, portionGrams }],
  calculatedMacros: { protein, carbs, fiber, sugar, fat, calories, ... },
  isCheatMeal: boolean,
  createdAt: string
}
```

## Project Structure

```
MacroBalance_diet_tracker/
├── src/
│   ├── components/           # UI components
│   │   ├── charts/          # Chart components (trends, heatmap, progress)
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── notifications/   # Dialogs and alerts
│   │   └── *.js            # Modals, buttons, controls
│   ├── screens/             # Screen components
│   │   ├── Home/           # Dashboard screen
│   │   ├── MealPlanning/   # Main macro calculator interface
│   │   ├── FoodManagement/ # Food CRUD operations
│   │   ├── DishCreator/    # Custom dish creation
│   │   ├── Settings/       # App settings
│   │   ├── WeightTracking/ # Weight history and entry
│   │   └── Onboarding/     # User onboarding flow
│   ├── context/            # React Context providers
│   │   ├── FoodContext.js  # Food database management
│   │   ├── MealContext.js  # Meal plans, daily summaries
│   │   ├── SettingsContext.js # User profile, preferences
│   │   ├── WeightContext.js   # Weight tracking
│   │   └── PresetContext.js   # Meal presets
│   ├── services/           # Business logic
│   │   ├── calculationService.js      # Macro optimization engine
│   │   ├── MacroCalculationService.js # User profile macros
│   │   ├── MacroAdjustmentService.js  # Macro adjustments
│   │   ├── WeightTrackingService.js   # Weight analytics
│   │   ├── WeeklyCheckService.js      # Weekly reminders
│   │   └── TimeService.js             # Time management
│   ├── hooks/              # Custom React hooks
│   ├── data/               # Static data
│   │   └── defaultFoods.js # 186 pre-populated foods
│   └── navigation/         # Navigation config
├── __tests__/              # Jest test suite
├── assets/                 # Images, fonts
├── babel.config.js         # Babel config
├── app.json               # Expo config
├── eas.json               # EAS Build config
├── CLAUDE.md              # This file (read at session start)
└── current_bugs.md        # Active bug tracking (update always!)
```

## Key Features (All Implemented)

### Core Functionality
- ✅ **Automatic Macro Optimization**: Slider-based portion control with real-time recalculation
- ✅ **Food Database**: 186 foods with complete nutritional profiles
- ✅ **Meal Planning**: Create and track meal plans with macro targets
- ✅ **Dashboard**: Daily progress, macro trends, consistency tracking
- ✅ **Weight Tracking**: Track weight, view trends, get insights
- ✅ **User Onboarding**: Personalized macro calculation based on user profile
- ✅ **Cheat Meals/Days**: Flexible diet management
- ✅ **Dish Creator**: Create custom dishes from multiple foods
- ✅ **Meal Presets**: Save and load favorite meal configurations
- ✅ **Data Lifecycle**: Automatic cleanup of old meal plans (7+ days → daily summaries)

### Advanced Features
- ✅ **Macro Trend Charts**: 7-day and 30-day visualization
- ✅ **Consistency Heatmap**: Visual habit tracking
- ✅ **Weekly Weight Check**: Smart notifications
- ✅ **Macro Adjustments**: Automatic macro recalculation based on weight progress
- ✅ **Custom Day Reset Hour**: Configurable "day" start time (default 4 AM)
- ✅ **Sub-macros & Micronutrients**: Track fiber, omega-3, vitamins, minerals

## Important Context Providers

### MealContext
- Manages meals, meal plans, daily summaries
- Handles data lifecycle (converts old plans to summaries)
- Provides dashboard helper functions
- **Key Methods**: `createMealPlan`, `getDailyProgress`, `getTodaysSummary`
- **Important**: Uses `TimeService` for day reset logic

### FoodContext
- Manages food database with 186 default foods
- Search, filter, CRUD operations
- **Key Methods**: `searchFoods`, `addFood`, `updateFood`, `deleteFood`

### SettingsContext
- User profile, personalized targets, app preferences
- Macro calculation based on TDEE
- **Key Methods**: `updateUserProfile`, `generatePersonalizedTargets`

### WeightContext
- Weight entries, trends, progress analytics
- **Key Methods**: `addWeight`, `getWeightTrend`, `getWeightProgress`

## Critical Dependencies

### TimeService
- **Location**: `src/services/TimeService.js`
- **Purpose**: Manages custom day reset hour (default 4 AM)
- **Used by**: MealContext, HomeScreen, WeeklyCheckService
- **Important**: Singleton instance - must be imported correctly
- **Common Issue**: Missing import causes "Property 'TimeService' doesn't exist" error

### React Native Reanimated 4
- **Package**: `react-native-reanimated` ~4.1.1
- **Required Peer Dependency**: `react-native-worklets` (NOT `react-native-worklets-core`)
- **Babel Plugin**: `react-native-reanimated/plugin` (in babel.config.js)
- **Common Issue**: Wrong worklets package causes bundling errors

## Common Commands

```bash
# Development
npm start                   # Start Expo dev server
npx expo start --tunnel     # Start with tunnel (for mobile testing)
npx expo start --clear      # Clear cache and start

# Testing
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Debugging
# Check Expo Go logs for runtime errors
# Check Metro bundler logs for bundling errors
# Use React DevTools for component inspection
```

## Recent Critical Fixes

### Session 2025-01-20: Reanimated 4 Compatibility
**Problem 1**: Babel bundling error - "Cannot find module 'react-native-worklets/plugin'"
- **Cause**: Had `react-native-worklets-core` (by Margelo) instead of `react-native-worklets` (by Software Mansion)
- **Fix**: Installed correct package `react-native-worklets@^0.6.1`

**Problem 2**: Runtime crash - "Property 'TimeService' doesn't exist"
- **Cause**: MealContext used `TimeService` but didn't import it
- **Fix**: Added `import TimeService from '../services/TimeService'` to MealContext.js line 4

**Commit**: `6027d5c` - "fix: Resolve bundling and runtime errors for Reanimated 4 compatibility"

## Debugging Workflow

1. **Start Session**: Read CLAUDE.md and current_bugs.md
2. **Encounter Bug**: Add to current_bugs.md immediately
3. **Fix Bug**: Update current_bugs.md with solution
4. **Test Fix**: Verify app works before marking bug as resolved
5. **Document**: Keep current_bugs.md updated throughout session
6. **WAIT for user**: Do NOT commit/push until user explicitly asks

## Common Bug Patterns

### Import Errors
- Missing service imports (especially TimeService)
- Wrong package imports (worklets-core vs worklets)

### Context Errors
- Using context before provider is mounted
- Missing context imports
- Circular dependencies between contexts

### Runtime Crashes
- Undefined property access (use optional chaining)
- AsyncStorage null values (always check before JSON.parse)
- Date parsing issues (always validate date strings)

### Bundling Errors
- Missing dependencies in package.json
- Babel plugin misconfiguration
- Metro cache issues (fix with --clear flag)

## Key Algorithms

### Macro Optimization (`calculationService.js`)
```javascript
// When user adjusts one food's portion:
1. Calculate current total macros
2. Calculate deviation from targets
3. Distribute deviation across other foods proportionally
4. Apply constraints (10g-500g range)
5. Return optimized portions
```

### Data Lifecycle (`MealContext.js`)
```javascript
// Automatic cleanup (runs daily):
1. Meal plans < 7 days old: Keep as-is
2. Meal plans > 7 days old: Convert to daily summaries
3. Daily summaries < 90 days old: Keep
4. Daily summaries > 90 days old: Delete
```

## Notes for Claude

- Project is COMPLETE - only debugging and bug fixes
- Always update current_bugs.md when working on issues
- Never commit/push without explicit user permission
- Never build without explicit user permission
- All core features are implemented and working
- Focus on fixing bugs, not adding features (unless explicitly asked)
- Check current_bugs.md at start of every session for context
