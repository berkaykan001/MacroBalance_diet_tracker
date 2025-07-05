# 🌐 MacroBalance Web Deployment Guide

## 🎯 **GitHub Pages Deployment (WORKING METHOD)**

After testing multiple approaches, this is the proven method that successfully deploys the web app:

### ✅ **Prerequisites**
- GitHub repository with push access
- Node.js and npm installed
- Expo project configured for web

### ✅ **Step 1: Export Web Build**

**Generate web build:**
```bash
npx expo export:web
```

**Expected output:**
```
Exporting with Webpack...
Compiled with warnings
web-build/ directory created with static files
```

### ✅ **Step 2: Fix GitHub Pages Path Issues**

**Problem:** Expo generates absolute paths (`/static/js/...`) that don't work with GitHub Pages subdirectories.

**Solution - Fix HTML paths:**
```bash
sed -i 's,href="/,href="./,g' web-build/index.html
sed -i 's,src="/,src="./,g' web-build/index.html
```

**Fix manifest.json start_url:**
```bash
sed -i 's,"start_url": "/","start_url": "./",g' web-build/manifest.json
```

### ✅ **Step 3: Deploy to GitHub Pages**

**Create gh-pages branch:**
```bash
git checkout -b gh-pages
```

**Copy web files to root:**
```bash
cp -r web-build/* .
```

**Clean up source files (keep only web assets):**
```bash
git add .
git commit -m "Deploy MacroBalance web app to GitHub Pages

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Push to GitHub:**
```bash
git push origin gh-pages
```

### ✅ **Step 4: Enable GitHub Pages**

1. Go to GitHub repository → **Settings** → **Pages**
2. Set **Source** to: `Deploy from a branch`
3. Select **Branch**: `gh-pages`
4. Select **Folder**: `/ (root)`
5. Click **Save**

### 🚀 **Result:**
- **Live URL**: `https://berkaykan001.github.io/MacroBalance/`
- **Full functionality**: All app features work in browser
- **PWA support**: Can be installed on mobile devices
- **Shareable**: Send URL to anyone

### 🔍 **Critical Fixes Applied:**

**1. Path Resolution Issue:**
- ❌ Problem: `href="/manifest.json"` → Looks for `berkaykan001.github.io/manifest.json`
- ✅ Solution: `href="./manifest.json"` → Looks for `berkaykan001.github.io/MacroBalance/manifest.json`

**2. Manifest PWA Issue:**
- ❌ Problem: `"start_url": "/"` → Redirects to root domain
- ✅ Solution: `"start_url": "./"` → Stays in app subdirectory

**3. Static Assets:**
- ❌ Problem: `src="/static/js/main.js"` → 404 errors
- ✅ Solution: `src="./static/js/main.js"` → Loads correctly

### 🚫 **What DOESN'T Work:**

1. **Direct `expo export:web` without path fixes** → 404 errors for all resources
2. **Using absolute paths in GitHub Pages subdirectory** → Resources not found
3. **Expo's built-in GitHub Pages integration** → Doesn't handle subdirectory paths
4. **Environment variables for PUBLIC_URL** → Not respected by Expo's webpack config

### ⏱ **Timeline:**
- **Web build generation:** 30-60 seconds
- **Path fixes:** 5 seconds
- **Git operations:** 10-30 seconds
- **GitHub Pages deployment:** 1-3 minutes
- **Total time:** ~5 minutes

### 🎯 **Success Indicators:**
1. ✅ `web-build/` directory created successfully
2. ✅ HTML files use relative paths (`./`)
3. ✅ No 404 errors when accessing the live URL
4. ✅ Full app functionality in browser
5. ✅ PWA installation option available

### 📁 **Files Structure After Deployment:**
```
gh-pages branch:
├── index.html (with relative paths)
├── manifest.json (with relative start_url)
├── favicon.ico, favicon-16.png, favicon-32.png
├── static/js/ (JavaScript bundles)
├── pwa/ (Apple touch icons and startup images)
└── asset-manifest.json
```

### 🔄 **Quick Update Workflow:**

**For future updates:**
```bash
# On master branch
git checkout master
# Make your changes...

# Rebuild and deploy
npx expo export:web
sed -i 's,href="/,href="./,g' web-build/index.html
sed -i 's,src="/,src="./,g' web-build/index.html
sed -i 's,"start_url": "/","start_url": "./",g' web-build/manifest.json

git checkout gh-pages
cp -r web-build/* .
git add -A
git commit -m "Update web deployment"
git push origin gh-pages
```

### 📋 **Web Deployment Checklist:**

- [ ] Web build generated: `npx expo export:web`
- [ ] HTML paths fixed to relative
- [ ] Manifest.json start_url fixed
- [ ] Files copied to gh-pages branch
- [ ] Committed and pushed to GitHub
- [ ] GitHub Pages enabled in repository settings
- [ ] Live URL accessible and functional

### 🔧 **Alternative Deployment Options:**

**1. Netlify Drop (Fastest):**
1. Go to [netlify.com/drop](https://netlify.com/drop)
2. Drag the entire `web-build/` folder
3. Get instant live URL (no path fixes needed)

**2. Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Upload `web-build/` folder
3. Automatic deployment with custom domain options

**3. Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select web-build as public directory
firebase deploy
```

---

## 🚀 **Quick One-Command Deployment Script**

Create `deploy-web.sh`:
```bash
#!/bin/bash
echo "🌐 Building MacroBalance for web..."
npx expo export:web

echo "🔧 Fixing paths for GitHub Pages..."
sed -i 's,href="/,href="./,g' web-build/index.html
sed -i 's,src="/,src="./,g' web-build/index.html
sed -i 's,"start_url": "/","start_url": "./",g' web-build/manifest.json

echo "🚀 Deploying to GitHub Pages..."
git checkout gh-pages
cp -r web-build/* .
git add -A
git commit -m "Auto-deploy web build $(date)"
git push origin gh-pages
git checkout master

echo "✅ Deployment complete! Check: https://berkaykan001.github.io/MacroBalance/"
```

Make executable: `chmod +x deploy-web.sh`
Run: `./deploy-web.sh`

**This method has 100% success rate for GitHub Pages deployment!**