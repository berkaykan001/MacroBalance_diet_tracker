# MacroBalance - Macro Calculator Mobile App

## Project Overview

MacroBalance is a React Native mobile application designed to help users calculate the exact portions (in grams) of foods needed to meet specific macro targets for each meal. The app solves the common problem of knowing what macros you need but not knowing how much of each food to eat to achieve those targets.

## Core Problem Statement

Users know:
- Their macro targets for each meal (protein, carbs, fat)
- What foods they want to eat
- The nutritional content of foods

Users need:
- Exact portion sizes (in grams) to meet their macro targets
- Interactive adjustment of portions with automatic recalculation
- Meal-based macro planning with customizable targets

## Technical Stack

- **Framework**: React Native with Expo
- **Development**: Expo Go for testing
- **State Management**: React Hooks (useState, useContext)
- **Storage**: AsyncStorage for local data persistence
- **Navigation**: React Navigation
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git with frequent commits

## Data Models

### Food Model
```javascript
{
  id: string,
  name: string,
  category: string, // "protein", "carbs", "fats", "vegetables", etc.
  nutritionPer100g: {
    calories: number,
    protein: number,
    carbs: number,
    fiber: number,
    sugar: number,
    fat: number,
    // Micronutrients (optional for now)
    vitaminD: number,
    magnesium: number,
    // ... other micros
  },
  userAdded: boolean,
  createdAt: string,
  lastUsed: string
}
```

### Meal Model
```javascript
{
  id: string,
  name: string, // "Breakfast", "Lunch", "Post-Workout", etc.
  macroTargets: {
    protein: number,
    carbs: number,
    minFiber: number,
    maxSugar: number,
    fat: number
  },
  userCustom: boolean,
  createdAt: string
}
```

### MealPlan Model
```javascript
{
  id: string,
  mealId: string,
  selectedFoods: [
    {
      foodId: string,
      portionGrams: number
    }
  ],
  calculatedMacros: {
    protein: number,
    carbs: number,
    fiber: number,
    sugar: number,
    fat: number,
    calories: number
  },
  createdAt: string
}
```

## Core Features

### Phase 1: Foundation
1. **Food Database Management**
   - Pre-populated with common foods
   - Add/edit/delete custom foods
   - Search functionality with real-time filtering
   - Category-based organization

2. **Meal Configuration**
   - Pre-defined meal types (Breakfast, Lunch, Dinner, Post-Workout)
   - Custom meal creation with macro targets
   - Edit existing meals

### Phase 2: Core Functionality
3. **Macro Calculator Engine**
   - Multi-variable optimization algorithm
   - Real-time calculation of portions
   - Constraint satisfaction for macro targets

4. **Interactive Meal Planning**
   - Select meal type
   - Choose foods from searchable database
   - Interactive sliders for portion adjustment
   - Automatic recalculation of other portions
   - Visual feedback for macro achievement

### Phase 3: Enhanced UX
5. **Advanced Search & Filtering**
   - Real-time search with auto-complete
   - Filter by categories
   - Recent/frequently used foods
   - Favorites system

6. **Progress Visualization**
   - Macro target progress bars
   - Color-coded feedback (green=target met, red=over, yellow=under)
   - Nutritional breakdown charts

### Phase 4: Future Enhancements
7. **User Profiles**
   - Personal macro calculation based on age, height, weight, activity level
   - Multiple user support
   - Goal-based recommendations (cutting, bulking, maintenance)

8. **Cloud Sync & Sharing**
   - User account system
   - Sync across devices
   - Share food database entries
   - Community features

## User Stories

### Primary User Flows

1. **As a user, I want to plan my breakfast macros**
   - Select "Breakfast" meal
   - See my macro targets (e.g., 30g protein, 45g carbs, 15g fat)
   - Search and select foods (e.g., oats, whey protein, banana)
   - Adjust portions with sliders until macros are met
   - Save meal plan for reference

2. **As a user, I want to add a new food to my database**
   - Navigate to food management
   - Add new food with nutritional information
   - Categorize the food
   - Use it immediately in meal planning

3. **As a user, I want to customize my meal targets**
   - Edit existing meal (e.g., Post-Workout)
   - Adjust macro targets based on my current goals
   - Save changes for future use

## UI/UX Requirements

### Design Principles
- **Modern & Elegant**: Clean, minimalist design with smooth animations
- **Tech-Forward**: Dark theme with accent colors, gradient elements
- **Intuitive**: Clear navigation, logical information hierarchy
- **Responsive**: Optimized for various screen sizes

### Key Screens
1. **Home/Dashboard**: Quick access to recent meals, daily overview
2. **Meal Planning**: Main calculator interface with sliders
3. **Food Search**: Searchable database with filters
4. **Food Management**: Add/edit foods
5. **Meal Configuration**: Customize meal targets
6. **Settings**: App preferences, user profile

### Interaction Patterns
- **Sliders**: Primary interaction for portion adjustment
- **Cards**: Food items, meal summaries
- **Progress Bars**: Macro target achievement
- **Search**: Real-time filtering with suggestions
- **Swipe Gestures**: Quick actions (delete, favorite)

## Algorithm Design

### Macro Calculation Engine
The core challenge is solving a system of equations where:
- Each food contributes macros proportional to its weight
- Total macros must meet targets
- User adjusts one food, others auto-adjust

**Approach**: Proportional redistribution algorithm
1. User adjusts Food A portion
2. Calculate remaining macro needs
3. Redistribute remaining needs among other foods proportionally
4. Apply constraints (minimum portions, food availability)

## Testing Strategy

### Unit Tests
- Food data validation
- Macro calculation accuracy
- Search algorithm correctness
- Storage operations

### Integration Tests
- Complete meal planning workflow
- Food database CRUD operations
- Settings persistence
- Navigation flows

### E2E Tests
- User onboarding flow
- Complete meal planning session
- Food management workflow
- Cross-platform compatibility

### Performance Tests
- Search performance with large food database
- Calculation speed with multiple foods
- Memory usage optimization
- Battery impact assessment

## Development Workflow

### Git Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/**: Individual features
- **hotfix/**: Critical fixes

### Commit Standards
- Frequent commits with descriptive messages
- Test before every commit
- Follow conventional commit format
- Include ticket/issue references

### Code Quality
- ESLint + Prettier for consistent formatting
- TypeScript for better development experience (future)
- Component documentation
- Performance monitoring

## Common Commands

```bash
# Development
npm start                 # Start Expo dev server
npm run android          # Run on Android emulator/device
npm run ios              # Run on iOS simulator (macOS only)
npm run web              # Run in web browser

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix auto-fixable lint issues
npm run format           # Run Prettier

# Build
npm run build            # Build for production
expo build:android       # Build Android APK
expo build:ios           # Build iOS IPA
```

## File Structure

```
MacroBalance/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components
│   │   ├── food/           # Food-related components
│   │   └── meal/           # Meal-related components
│   ├── screens/            # Screen components
│   │   ├── Home/
│   │   ├── MealPlanning/
│   │   ├── FoodManagement/
│   │   └── Settings/
│   ├── services/           # Business logic
│   │   ├── foodService.js
│   │   ├── mealService.js
│   │   └── calculationService.js
│   ├── utils/              # Helper functions
│   │   ├── storage.js
│   │   ├── calculations.js
│   │   └── validation.js
│   ├── data/               # Static data
│   │   └── defaultFoods.json
│   ├── context/            # React Context
│   │   ├── FoodContext.js
│   │   └── MealContext.js
│   └── navigation/         # Navigation configuration
│       └── AppNavigator.js
├── assets/                 # Images, fonts, etc.
├── __tests__/              # Test files
└── docs/                   # Additional documentation
```

## Future Considerations

### Scalability
- Move to Redux for complex state management
- Implement caching strategies
- Consider SQLite for large datasets
- API integration for food database updates

### Monetization (Future)
- Premium features (advanced analytics, unlimited custom foods)
- Nutrition coaching integrations
- Meal plan export/sharing

### Accessibility
- Screen reader support
- High contrast mode
- Font size adjustments
- Voice control integration

## Success Metrics

### MVP Success
- Users can successfully plan a meal with macro targets
- Calculation accuracy >99%
- App loads in <3 seconds
- No critical bugs in core functionality

### Long-term Success
- Daily active users retention >60%
- Average session duration >5 minutes
- User-generated food database growth
- Positive app store ratings >4.5/5

---

## Notes for Claude Code Development

- Always test calculations with real food data
- Prioritize user experience over complex features
- Use MCP tools for researching React Native best practices
- Test on actual devices via Expo Go frequently
- Consider performance implications of real-time calculations
- Plan for offline functionality from the start