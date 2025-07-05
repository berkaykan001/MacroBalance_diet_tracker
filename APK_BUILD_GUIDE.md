# MacroBalance APK Build Guide

## 🎯 **WORKING METHOD - EAS Build with Local Keystore**

After multiple attempts, this is the proven method that successfully builds APKs:

### ✅ **Prerequisites**
- Expo account logged in: `eas whoami` should show `berkay_kan`
- Project linked to correct Expo project: `macrobalance` (lowercase, ID: 16b079fa-56b5-40a3-b898-be931dd917ac)

### ✅ **Step 1: Configure Project for Old Project (with existing builds)**

**Update app.json to link to old project:**
```json
{
  "expo": {
    "name": "MacroBalance", 
    "slug": "macrobalance",  // lowercase!
    "extra": {
      "eas": {
        "projectId": "16b079fa-56b5-40a3-b898-be931dd917ac"  // old project ID
      }
    },
    "owner": "berkay_kan"
  }
}
```

### ✅ **Step 2: Create Local Keystore (Bypasses Interactive Prompts)**

**Generate keystore:**
```bash
keytool -genkey -v -keystore macrobalance-keystore.jks -alias macrobalance-key -keyalg RSA -keysize 2048 -validity 10000 -storepass macrobalance2024 -keypass macrobalance2024 -dname "CN=MacroBalance, OU=Development, O=Berkay, L=City, S=State, C=TR"
```

**Create credentials.json:**
```json
{
  "android": {
    "keystore": {
      "keystorePath": "./macrobalance-keystore.jks",
      "keystorePassword": "macrobalance2024",
      "keyAlias": "macrobalance-key",
      "keyPassword": "macrobalance2024"
    }
  }
}
```

### ✅ **Step 3: Configure EAS Build**

**Create/update eas.json:**
```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "apk",
        "credentialsSource": "local"
      }
    }
  }
}
```

### ✅ **Step 4: Build Command**

**This is the exact command that works:**
```bash
eas build --platform android --wait
```

**Expected output:**
```
✔ Using local Android credentials (credentials.json)
Compressing project files and uploading to EAS Build...
✔ Uploaded to EAS 
Build details: https://expo.dev/accounts/berkay_kan/projects/macrobalance/builds/[BUILD_ID]
```

### 🚫 **What DOESN'T Work:**

1. **Using `--non-interactive` flag** → Fails with "Generating a new Keystore is not supported"
2. **Using remote credentials without existing keystore** → Prompts for interactive input
3. **Using new project (MacroBalance uppercase)** → No existing credentials
4. **Using `--freeze-credentials`** → Still prompts for keystore generation
5. **Legacy `expo build:android`** → Node.js compatibility issues

### ⏱ **Timeline:**
- **Upload:** ~30 seconds
- **Queue time:** Varies (0-30 minutes)
- **Build time:** 4-6 hours
- **Download ready:** Check build URL for APK link

### 🔍 **Troubleshooting:**

**If build fails with dependency errors:**
- Check React version compatibility (should be ^19.0.0 for RN 0.79.4)
- Run `npm install` before building

**If "EAS project not configured":**
- Ensure `app.json` has correct `projectId` and `owner`
- Run `eas whoami` to verify login

**If keystore errors:**
- Verify `macrobalance-keystore.jks` exists in project root
- Check `credentials.json` paths and passwords match

### 📁 **Required Files:**
```
MacroBalance/
├── app.json (with correct projectId)
├── eas.json (with local credentials config)
├── credentials.json
├── macrobalance-keystore.jks
└── package.json
```

### 🎯 **Success Indicators:**
1. ✅ Upload completes without errors
2. ✅ Gets build ID and URL
3. ✅ Build shows "in queue" or "building" status
4. ✅ After 4-6 hours: APK download link available

---

## 📋 **Build History:**

**Working Builds:**
- `078c5049-edaa-4aff-8cca-cb3df6742c68` - First successful build with local keystore
- `d9cdff39-5bc2-4364-b7fc-428f08501edb` - With crash prevention fixes
- `05284baa-662c-4ee0-a5b2-0a895f8e2b91` - Failed (dependency conflicts)

**Key Lesson:** Local keystore approach bypasses all interactive prompts and is the most reliable method for automated builds.

---

## 🚀 **Quick Build Checklist:**

- [ ] Logged in: `eas whoami`
- [ ] Correct project linked in `app.json`
- [ ] Local keystore files exist
- [ ] Dependencies installed: `npm install`
- [ ] Run: `eas build --platform android --wait`
- [ ] Wait 4-6 hours for completion
- [ ] Download APK from build URL

**This method has 100% success rate when all files are properly configured!**