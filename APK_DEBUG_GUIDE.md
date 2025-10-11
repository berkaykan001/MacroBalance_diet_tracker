# MacroBalance APK Debug Guide

## 🐛 **How to Get Debug Logs from APK**

When your APK crashes or has issues, use these methods to capture the debug logs.

---

## ✅ **Method 1: ADB Logcat (RECOMMENDED)**

This is the most reliable method to capture React Native app logs.

### **Prerequisites:**
1. **Install ADB (Android Debug Bridge)**
   - Download: https://developer.android.com/studio/releases/platform-tools
   - Extract to folder (e.g., `C:\platform-tools`)
   - Add to PATH or navigate to folder in PowerShell

2. **Enable USB Debugging on Android Device**
   - Go to Settings → About Phone → Tap "Build Number" 7 times
   - Go to Settings → Developer Options → Enable "USB Debugging"
   - Connect device via USB

3. **Verify Connection**
   ```powershell
   .\adb devices
   ```
   Should show your device listed.

---

### **🎯 Quick Commands (Copy & Paste)**

#### **Clear logs and start fresh:**
```powershell
.\adb logcat -c
.\adb logcat -s ReactNativeJS:V AndroidRuntime:E
```

#### **Filter only React Native/Expo logs:**
```powershell
.\adb logcat -s ReactNativeJS:V ExpoModulesCore:V Expo:V AndroidRuntime:E
```

#### **Save logs to file:**
```powershell
.\adb logcat -s ReactNativeJS:V AndroidRuntime:E > crash_log.txt
```

#### **PowerShell filter (alternative):**
```powershell
.\adb logcat | Select-String -Pattern "ReactNativeJS|ExpoModulesCore|FATAL|Expo"
```

---

### **📋 Log Filter Explanation:**

- **ReactNativeJS** - Your JavaScript errors and console logs
- **ExpoModulesCore** - Expo-specific errors
- **Expo** - General Expo framework logs
- **AndroidRuntime:E** - Fatal crashes and exceptions

---

### **🔍 Step-by-Step Debugging:**

1. **Clear old logs:**
   ```powershell
   .\adb logcat -c
   ```

2. **Start logging:**
   ```powershell
   .\adb logcat -s ReactNativeJS:V AndroidRuntime:E
   ```

3. **Install and open your APK** (while logcat is running)

4. **Reproduce the crash/bug**

5. **Read the error output** - it will show exactly where and why the crash happened

---

### **📝 Example Error Output:**

```
10-11 20:30:55.431  3981  4021 E ReactNativeJS: ReferenceError: Property 'document' doesn't exist
10-11 20:30:55.431  3981  4021 E ReactNativeJS: This error is located at:
10-11 20:30:55.431  3981  4021 E ReactNativeJS:     at AppContent (address at index.android.bundle:1:845363)
```

This tells you:
- **Error type:** `ReferenceError: Property 'document' doesn't exist`
- **Location:** `AppContent` component
- **File reference:** `index.android.bundle:1:845363`

---

## 🔧 **Method 2: Built-in Debug Screen (If App Opens)**

If your app opens but has issues:

1. **Open the app**
2. **Go to Settings → Debug Logs (🐛)**
3. **View crash logs and debug logs**
4. **Use "Share" button to export logs**

---

## 🛠 **Method 3: Development Build Logs**

Build and run with live logging:

```bash
npx expo run:android --variant debug
```

This will:
- Build the APK with debug symbols
- Install on connected device
- Show live logs in terminal

---

## 🚨 **Common Errors & Solutions:**

### **Error: `adb: command not found`**
**Solution:** Install Android SDK Platform Tools and add to PATH

### **Error: `device not found`**
**Solution:**
- Check USB cable connection
- Enable USB Debugging on phone
- Accept "Allow USB Debugging" prompt on phone

### **Error: `unauthorized`**
**Solution:**
- Disconnect and reconnect USB
- Accept the authorization prompt on phone
- Run `adb devices` again

### **Too many logs / can't find error:**
**Solution:** Use the filtered command:
```powershell
.\adb logcat -s ReactNativeJS:V AndroidRuntime:E
```

---

## 📊 **What to Look For in Logs:**

1. **JavaScript Errors:**
   - `ReferenceError`
   - `TypeError`
   - `SyntaxError`
   - Stack traces showing file:line numbers

2. **Native Crashes:**
   - `FATAL EXCEPTION`
   - `Process: com.berkaykan.macrobalance`
   - Native stack traces

3. **Expo/React Native Errors:**
   - `ExpoModulesCore`
   - Component lifecycle errors
   - Bridge communication failures

---

## 💾 **Saving & Sharing Logs:**

### **Save to file:**
```powershell
.\adb logcat -s ReactNativeJS:V AndroidRuntime:E > debug_log_$(Get-Date -Format 'yyyy-MM-dd_HH-mm').txt
```

This creates a timestamped log file like: `debug_log_2025-10-11_20-30.txt`

### **Share with developer:**
1. Save logs to file (command above)
2. Open the file in Notepad
3. Copy relevant error sections
4. Share via email/chat

---

## 🎯 **Quick Reference Card:**

| Task | Command |
|------|---------|
| Check device connected | `.\adb devices` |
| Clear logs | `.\adb logcat -c` |
| View React Native logs | `.\adb logcat -s ReactNativeJS:V AndroidRuntime:E` |
| Save to file | `.\adb logcat -s ReactNativeJS:V AndroidRuntime:E > log.txt` |
| Kill ADB server | `.\adb kill-server` |
| Restart ADB server | `.\adb start-server` |

---

## 🔄 **Workflow for Each Debug Session:**

1. Connect phone via USB
2. Enable USB Debugging
3. Open PowerShell in `platform-tools` folder
4. Run: `.\adb devices` (verify connection)
5. Run: `.\adb logcat -c` (clear old logs)
6. Run: `.\adb logcat -s ReactNativeJS:V AndroidRuntime:E` (start logging)
7. Install and open APK
8. Reproduce issue
9. Read error in terminal
10. (Optional) Save to file for reference

---

## 📱 **Device-Specific Notes:**

- **Samsung:** May need to install Samsung USB drivers
- **Xiaomi/Redmi:** Enable "Install via USB" in Developer Options
- **Huawei:** Enable "Allow ADB debugging in charging only mode"
- **OnePlus:** USB Debugging may reset after reboot

---

**Last Updated:** October 2025
**Tested With:** React Native 0.79.4, Expo SDK 53, Android 12+
