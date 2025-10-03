# Blockdoku PWA - Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Development Workflow](#development-workflow)
4. [Build & Deploy Workflow](#build--deploy-workflow)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Common Mistakes](#common-mistakes)

---

## Overview

### The Golden Rule
**⚠️ NEVER EDIT FILES IN `/docs` - THEY ARE AUTO-GENERATED!**

### Architecture

```
Source Code (/src) → Build Process (Vite) → Deployment (/docs) → GitHub Pages
```

- **`/src/`** - Source of truth, all development happens here
- **`/docs/`** - Auto-generated build output, served by GitHub Pages
- **`/public/`** - Static assets copied during build

---

## Directory Structure

```
blockdoku_pwa/
├── src/                          # 🟢 SOURCE CODE (EDIT HERE)
│   ├── index.html                # Main game page
│   ├── settings.html             # Settings page
│   ├── gamesettings.html         # Game settings page
│   ├── splash.html               # Splash screen
│   ├── lastgame.html             # Last game recap
│   ├── js/                       # JavaScript modules
│   │   ├── app.js                # Main application
│   │   ├── core/                 # Core game logic
│   │   ├── ui/                   # UI components
│   │   ├── game/                 # Game mechanics
│   │   └── ...
│   └── css/                      # Stylesheets
│       ├── main.css
│       └── themes/
│
├── docs/                         # 🔴 BUILD OUTPUT (DO NOT EDIT)
│   ├── index.html                # ⚠️ AUTO-GENERATED
│   ├── settings.html             # ⚠️ AUTO-GENERATED
│   ├── gamesettings.html         # ⚠️ AUTO-GENERATED
│   ├── assets/                   # ⚠️ AUTO-GENERATED
│   │   ├── main-[hash].js        # Bundled & minified JS
│   │   ├── main-[hash].css       # Bundled & minified CSS
│   │   └── ...
│   ├── manifest.webmanifest      # PWA manifest
│   └── sw.js                     # Service worker
│
├── public/                       # Static assets (copied to /docs)
│   ├── icons/
│   ├── css/themes/
│   └── favicon.ico
│
├── tests/                        # Test files
├── vite.config.js                # Build configuration
├── package.json                  # Dependencies & scripts
├── .gitattributes                # Mark /docs as generated
├── .cursorrules                  # Cursor AI rules
└── DEPLOYMENT.md                 # This file
```

---

## Development Workflow

### 1. Setup (First Time)

```bash
# Clone repository
git clone https://github.com/chasemp/blockdoku.git
cd blockdoku_pwa

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Daily Development

```bash
# Start dev server (serves from /src)
npm run dev

# Opens at: http://localhost:3456
# Auto-reloads on file changes
```

### 3. Making Changes

1. **Edit files in `/src` directory only**
2. Changes appear immediately in dev server (hot reload)
3. Test in browser at `localhost:3456`

**Example:**
```bash
# ✅ CORRECT
vim src/index.html
vim src/js/app.js
vim src/css/main.css

# ❌ WRONG - Don't edit built files!
vim docs/index.html
vim docs/assets/main-abc123.js
```

---

## Build & Deploy Workflow

### Step 1: Build

```bash
# Generate production build
npm run build
```

**What happens:**
1. Vite reads source files from `/src`
2. Bundles and minifies JavaScript
3. Processes and minifies CSS
4. Generates hashed filenames for cache busting
5. Copies public assets
6. Outputs everything to `/docs`
7. Pre/post build hooks generate build metadata

**Output in `/docs`:**
- `index.html`, `settings.html`, etc. with injected asset links
- `assets/main-[hash].js` - Bundled JavaScript
- `assets/main-[hash].css` - Bundled CSS
- `manifest.webmanifest` - PWA manifest
- `sw.js` - Service worker
- All public assets (icons, themes, etc.)

### Step 2: Test Production Build Locally

```bash
# Preview built version
npm run preview

# Opens at: http://localhost:4173 (or similar)
```

**Important:** Always test the preview before deploying!
- Tests the actual production build
- Catches build-time issues
- Verifies asset paths work correctly

### Step 3: Review Changes

```bash
# See what changed in /docs
git status
git diff docs/

# Check if /src changes are included
git diff src/
```

### Step 4: Commit & Deploy

```bash
# Stage source changes
git add src/

# Stage built files
git add docs/

# Commit with descriptive message
git commit -m "feat: add game settings page

- Added new gamesettings.html page
- Updated navigation in settings.html
- Built to /docs for deployment"

# Push to GitHub
git push origin main
```

**What happens on push:**
- GitHub Pages automatically serves from `/docs` directory
- Changes go live within 1-2 minutes
- Check: https://blockdoku.523.life

---

## Testing

### Local Testing

```bash
# Development
npm run dev              # Test at localhost:3456

# Production build
npm run build            # Generate /docs
npm run preview          # Test at localhost:4173
```

### Test Suite

```bash
# Unit tests
npm test

# Behavioral tests
npm run test:behavioral

# E2E tests (Playwright)
npm run test:e2e

# Regression tests
npm run test:regression
```

### Manual Testing Checklist

Before deploying:
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test on mobile device
- [ ] Test offline mode (PWA)
- [ ] Test all navigation links
- [ ] Test game functionality
- [ ] Verify no console errors
- [ ] Test theme switching
- [ ] Verify settings persist

---

## Troubleshooting

### Issue: Live site doesn't match local source

**Cause:** `/docs` is out of date

**Solution:**
```bash
# Rebuild
npm run build

# Check changes
git diff docs/

# Commit and push
git add docs/
git commit -m "build: update production assets"
git push
```

### Issue: Changes not appearing after deploy

**Causes & Solutions:**

1. **Browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Clear browser cache
   - Open in incognito/private mode

2. **Service Worker cache:**
   - Open DevTools → Application → Service Workers
   - Click "Unregister"
   - Refresh page

3. **GitHub Pages cache:**
   - Wait 2-3 minutes for propagation
   - Check GitHub Pages build status

4. **CDN cache (if using custom domain):**
   - May take longer to propagate
   - Check with: `curl -I https://blockdoku.523.life`

### Issue: Build fails

```bash
# Check for errors
npm run build

# Common fixes:
npm install          # Update dependencies
npm cache clean -f   # Clear npm cache
rm -rf node_modules  # Nuclear option
npm install          # Reinstall
```

### Issue: Files missing after build

**Check:**
1. Files exist in `/src`?
2. Files referenced in `vite.config.js`?
3. Check build output for errors

### Issue: Asset paths broken

**Cause:** Incorrect `base` configuration in `vite.config.js`

**Solution:** Ensure `base: './'` for GitHub Pages root deployment

---

## Common Mistakes

### ❌ Mistake #1: Editing /docs files directly

```bash
# WRONG
vim docs/index.html
git add docs/index.html
git commit -m "fix: update page"
```

**Why wrong:** Next build will overwrite your changes!

**Correct approach:**
```bash
# RIGHT
vim src/index.html        # Edit source
npm run build             # Rebuild
git add src/ docs/        # Commit both
git commit -m "fix: update page"
```

### ❌ Mistake #2: Forgetting to build before commit

```bash
# WRONG
vim src/index.html
git add src/
git commit -m "fix"
git push
# Live site still shows old version!
```

**Correct approach:**
```bash
# RIGHT
vim src/index.html
npm run build             # Generate /docs
git add src/ docs/
git commit -m "fix"
git push
```

### ❌ Mistake #3: Not testing production build

```bash
# WRONG
npm run dev              # Test in dev
git add src/ docs/
git push                 # Hope it works!
```

**Correct approach:**
```bash
# RIGHT
npm run dev              # Test in dev
npm run build            # Build production
npm run preview          # Test production build
git add src/ docs/
git push
```

### ❌ Mistake #4: Inconsistent paths

```html
<!-- WRONG in src/ files -->
<a href="src/settings.html">Settings</a>
<script src="../js/app.js"></script>

<!-- RIGHT in src/ files -->
<a href="settings.html">Settings</a>
<script type="module" src="js/app.js"></script>
```

**Why:** Build process handles module resolution; use paths relative to `/src`

### ❌ Mistake #5: Committing without reviewing

```bash
# WRONG
npm run build
git add .
git commit -m "stuff"
git push
```

**Correct approach:**
```bash
# RIGHT
npm run build
git status               # See what changed
git diff docs/           # Review built files
git diff src/            # Review source changes
git add src/ docs/
git commit -m "feat: descriptive message"
git push
```

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server → localhost:3456
npm run build            # Build /src → /docs
npm run preview          # Preview build → localhost:4173

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests

# Deployment
git add src/ docs/       # Stage changes
git commit -m "message"  # Commit
git push                 # Deploy to GitHub Pages
```

### File Locations

| What | Where | Edit? |
|------|-------|-------|
| HTML pages | `/src/*.html` | ✅ Yes |
| JavaScript | `/src/js/**/*.js` | ✅ Yes |
| CSS | `/src/css/**/*.css` | ✅ Yes |
| Static assets | `/public/**` | ✅ Yes |
| Built HTML | `/docs/*.html` | ❌ Never |
| Built JS/CSS | `/docs/assets/**` | ❌ Never |
| Config | `vite.config.js` | ✅ Carefully |

### URLs

| Environment | URL | Serves From |
|-------------|-----|-------------|
| Development | http://localhost:3456 | `/src` |
| Preview | http://localhost:4173 | `/docs` |
| Production | https://blockdoku.523.life | `/docs` (via GitHub Pages) |

---

## GitHub Pages Configuration

### Current Setup

- **Repository:** `chasemp/blockdoku`
- **Branch:** `main`
- **Directory:** `/docs`
- **Custom Domain:** `blockdoku.523.life`
- **CNAME:** Configured in repository settings

### Changing Configuration

⚠️ **Only change if you know what you're doing!**

1. Go to: https://github.com/chasemp/blockdoku/settings/pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/docs`
5. Save

---

## Advanced Topics

### Modifying Build Process

Edit `vite.config.js`:

```javascript
export default defineConfig({
  root: 'src',              // Dev server root
  publicDir: '../public',   // Static assets
  base: './',               // URL base path
  build: {
    outDir: '../docs',      // Output directory
    emptyOutDir: true,      // Clear before build
    // ... more options
  }
})
```

### Adding New Pages

1. Create in `/src`:
   ```bash
   vim src/newpage.html
   ```

2. Add to Vite config:
   ```javascript
   rollupOptions: {
     input: {
       // ... existing pages
       newpage: resolve(__dirname, 'src/newpage.html')
     }
   }
   ```

3. Build and test:
   ```bash
   npm run build
   npm run preview
   ```

### Understanding Build Output

```
/docs/
├── index.html                    # Entry point
├── settings.html                 # Settings page
├── assets/
│   ├── main-[hash].js            # App code + dependencies
│   ├── main-[hash].css           # Styles
│   ├── wood-[hash].js            # Code-split chunk
│   └── wood-[hash].css           # Code-split styles
├── icons/                        # From /public
├── css/themes/                   # From /public
├── manifest.webmanifest          # PWA manifest
└── sw.js                         # Service worker
```

**Hash in filenames:** Cache busting - changes when content changes

---

## Best Practices

### ✅ DO

- Edit only files in `/src`
- Build before every commit
- Test production build locally
- Review diffs before pushing
- Write descriptive commit messages
- Keep `/src` as source of truth
- Run tests before deploying

### ❌ DON'T

- Edit files in `/docs`
- Commit without building
- Push without testing
- Ignore build errors
- Skip preview step
- Mix source and build edits
- Deploy broken builds

---

## Emergency Procedures

### Rollback Deployment

```bash
# Find last good commit
git log --oneline

# Revert to that commit
git revert <commit-hash>

# Or reset (destructive!)
git reset --hard <commit-hash>
git push --force  # ⚠️ Use with caution
```

### Rebuild Everything

```bash
# Clean slate
rm -rf docs/
rm -rf node_modules/
npm install
npm run build
```

### Fix Corrupted /docs

```bash
# Remove /docs
rm -rf docs/

# Rebuild from source
npm run build

# Verify
npm run preview

# Commit
git add docs/
git commit -m "build: regenerate docs from source"
git push
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review open issues/PRs
- Check for dependency updates
- Run full test suite

**Monthly:**
- Update dependencies: `npm update`
- Review and update docs
- Check analytics/error logs

**As Needed:**
- Rebuild when source changes
- Test after major changes
- Update deployment docs

---

## Support

### Getting Help

1. Check this document first
2. Review `PWA_LESSONS_LEARNED.md`
3. Check `.cursorrules` file
4. Search closed issues on GitHub
5. Ask in pull request comments

### Reporting Issues

Include:
- What you were trying to do
- What command you ran
- Error messages (full output)
- Environment (OS, Node version, etc.)
- Steps to reproduce

---

## Version History

- **v2.0** (2025-01-03): New `/src` → `/docs` workflow
- **v1.x**: Old root-level build (deprecated)

---

**Last Updated:** January 3, 2025  
**Maintainer:** Chase Pettet  
**Repository:** https://github.com/chasemp/blockdoku

