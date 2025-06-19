# Commit Checklist

## Pre-Commit Requirements

Before creating any commit, ensure ALL of the following steps are completed:

### 1. ✅ Testing
- [ ] Run `npm test` and ensure all tests pass
- [ ] Verify test coverage meets minimum thresholds (60%)
- [ ] Add new tests for any new functionality
- [ ] Update existing tests if functionality changed

### 2. ✅ Documentation
- [ ] Update CLAUDE.md with any new features or changes
- [ ] Update function/component comments if needed
- [ ] Verify README accuracy (if applicable)
- [ ] Document any breaking changes

### 3. ✅ Code Quality
- [ ] Ensure code follows existing patterns and conventions
- [ ] Remove any console.logs or debug code
- [ ] Check for proper error handling
- [ ] Verify no unused imports or variables

### 4. ✅ Functionality
- [ ] Test the app in web browser (`npm run web`)
- [ ] Verify core features still work (meal planning, optimization)
- [ ] Check for any broken UI or interactions
- [ ] Ensure responsive design is maintained

### 5. ✅ Git Best Practices
- [ ] Write descriptive commit message
- [ ] Include Claude Code attribution
- [ ] Reference relevant issues or features
- [ ] Keep commits atomic (one logical change per commit)

## Commit Message Format

```
<type>: <description>

<detailed explanation if needed>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

## Example Commit Messages

```bash
feat: Add automatic portion optimization with slider controls

Implement core macro optimization algorithm that automatically adjusts 
food portions when user modifies quantities via sliders. Includes 
real-time calculation updates and constraint satisfaction.

- Add CalculationService.optimizePortions() algorithm
- Implement slider-based portion control in MealPlanningScreen
- Add comprehensive test suite for calculation logic
- Update progress bars with target-centered visualization

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Emergency Bypass

If tests are failing due to external dependencies or environment issues:
1. Document the issue in commit message
2. Create separate issue to track test fix
3. Only bypass for critical fixes or infrastructure issues

## Post-Commit Actions

After successful commit:
- [ ] Verify commit appears in git log
- [ ] Test app still works after commit
- [ ] Update project status if major milestone reached