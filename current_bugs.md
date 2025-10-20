# Current Bugs & Issues Tracker

**Last Updated**: 2025-01-20

## 🚨 CRITICAL - Active Bugs

*No critical bugs at this time*

---

## ⚠️ HIGH PRIORITY - Active Bugs

*No high priority bugs at this time*

---

## 📋 MEDIUM PRIORITY - Active Bugs

*No medium priority bugs at this time*

---

## 🔧 LOW PRIORITY - Active Bugs

*No low priority bugs at this time*

---

## ✅ RESOLVED - Recent Fixes

### Session 2025-01-20: Reanimated 4 Compatibility & Onboarding Issues

#### Bug #3: CustomEvent Not Available in React Native
- **Status**: ✅ RESOLVED
- **Severity**: CRITICAL (Blocked onboarding completion)
- **Reported**: 2025-01-20
- **Error Message**:
  ```
  Error updating user profile: ReferenceError: Property 'CustomEvent' doesn't exist
  Call Stack: updateUserProfile (src\context\SettingsContext.js)
  ```
- **Trigger**: Occurred when user clicked "Continue" button after entering basic information (gender, age, etc.) in onboarding
- **Root Cause**:
  - Lines 194-199 in SettingsContext.js tried to use `window.dispatchEvent(new CustomEvent(...))`
  - CustomEvent is a browser API not available in React Native
  - The code was wrapped in `if (typeof window !== 'undefined')` check, but `window` exists in React Native as a global object
  - This caused the check to pass, then fail when trying to instantiate CustomEvent
- **Solution**:
  - Removed the web-specific event dispatching code (lines 194-199)
  - Not needed in React Native - Context API already handles state updates and component re-renders
  - Components consuming SettingsContext will automatically update when `dispatch()` is called
- **Files Changed**:
  - `src/context/SettingsContext.js`: Removed CustomEvent code (lines 194-199)
- **Commit**: Not yet committed (waiting for user permission)
- **Verified**: ⏳ Awaiting user testing

---

### Session 2025-01-20: Reanimated 4 Compatibility Issues

#### Bug #1: Babel Bundling Error - Cannot Find Worklets Plugin
- **Status**: ✅ RESOLVED
- **Severity**: CRITICAL (App wouldn't bundle)
- **Error Message**:
  ```
  ERROR index.js: [BABEL]: Cannot find module 'react-native-worklets/plugin'
  Require stack:
  - .../node_modules/react-native-reanimated/plugin/index.js
  ```
- **Root Cause**:
  - Had `react-native-worklets-core` (by Margelo) installed
  - But Reanimated 4 requires `react-native-worklets` (by Software Mansion)
  - These are two completely different packages serving different ecosystems
- **Solution**:
  - Installed correct package: `npm install react-native-worklets`
  - Version: `react-native-worklets@^0.6.1`
- **Files Changed**:
  - `package.json`: Added react-native-worklets dependency
  - `package-lock.json`: Updated lockfile
- **Commit**: `6027d5c` - "fix: Resolve bundling and runtime errors for Reanimated 4 compatibility"
- **Verified**: ✅ App bundles successfully, no Babel errors

#### Bug #2: Runtime Crash - TimeService Not Found
- **Status**: ✅ RESOLVED
- **Severity**: CRITICAL (App crashed on launch)
- **Error Message**:
  ```
  ERROR [ReferenceError: Property 'TimeService' doesn't exist]
  Call Stack: MealProvider (src\context\MealContext.js)
  ```
- **Root Cause**:
  - `MealContext.js` line 261 used `TimeService.setDayResetHour(dayResetHour)`
  - But TimeService was never imported at the top of the file
- **Solution**:
  - Added import: `import TimeService from '../services/TimeService';`
  - Location: `src/context/MealContext.js` line 4
- **Files Changed**:
  - `src/context/MealContext.js`: Added TimeService import
- **Commit**: `6027d5c` - "fix: Resolve bundling and runtime errors for Reanimated 4 compatibility"
- **Verified**: ✅ App launches successfully, no runtime errors

---

## 📝 Bug Template (Copy for New Bugs)

```markdown
#### Bug #X: [Short Description]
- **Status**: 🔴 ACTIVE / 🟡 IN PROGRESS / ✅ RESOLVED
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Reported**: [Date]
- **Error Message**:
  ```
  [Exact error message from logs]
  ```
- **Root Cause**:
  - [What caused the bug]
- **Solution**:
  - [How it was fixed]
- **Files Changed**:
  - [List of files modified]
- **Commit**: [commit hash] - "[commit message]"
- **Verified**: [How you confirmed it's fixed]
```

---

## 🎯 Bug Tracking Guidelines

1. **When you encounter a bug**: Add it to the appropriate priority section immediately
2. **When investigating**: Update status to 🟡 IN PROGRESS
3. **When fixed**: Move to ✅ RESOLVED section with full details
4. **Include**: Error messages, root cause, solution, files changed, commit hash
5. **Verify**: Always test the fix before marking as resolved
6. **Document**: Keep this file updated throughout every debugging session

---

## 🔍 Common Bug Categories

### Import/Dependency Errors
- Missing imports (TimeService, etc.)
- Wrong package installed (worklets-core vs worklets)
- Circular dependencies

### Runtime Crashes
- Undefined property access
- AsyncStorage null values
- Date parsing errors
- Context provider issues

### Bundling/Build Errors
- Babel configuration issues
- Metro cache problems
- Missing peer dependencies

### UI/UX Issues
- Layout problems
- Navigation errors
- State synchronization issues

---

## 📊 Session Summary

### Session 2025-01-20
- **Bugs Fixed**: 3
- **Critical Fixes**: 3
- **Files Modified**: 4 (package.json, package-lock.json, MealContext.js, SettingsContext.js)
- **Commits**: 2 (`6027d5c`, `29ef588`, + pending)
- **Status**: All critical bugs resolved, awaiting user verification
