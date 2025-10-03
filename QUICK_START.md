# Blockdoku PWA - Quick Start Guide

**For:** Developers new to this codebase  
**Updated:** October 3, 2025

---

## 🚀 5-Minute Setup

```bash
# Clone & install
git clone https://github.com/chasemp/blockdoku.git
cd blockdoku_pwa
npm install

# Start developing
npm run dev
# → Opens at http://localhost:3456
```

---

## ✏️ Daily Workflow

```bash
# 1. Edit source files (only edit /src!)
vim src/index.html

# 2. See changes instantly
# (dev server auto-reloads)

# 3. Commit when ready
git add src/
git commit -m "Your changes"
# ← Pre-commit hook runs tests + builds /docs automatically!

# 4. Push to deploy
git push
# → Live at blockdoku.523.life in ~2 minutes
```

**That's it!** The hook handles testing, building, and staging.

---

## 📁 Where is Everything?

| Directory | Purpose | Action |
|-----------|---------|--------|
| `/src/` | Source code | ✅ **EDIT HERE** |
| `/docs/` | Built output | ❌ **NEVER EDIT** (auto-generated) |
| `/public/` | Static assets | ✅ Edit if needed |
| `/tests/` | Test files | ✅ Add tests here |
| `/project-docs/` | Documentation | ✅ Edit docs here |

---

## 🔑 Golden Rules

### 1. NEVER edit `/docs` files
They're auto-generated. Edit `/src` instead.

### 2. Commit triggers build
Every commit automatically:
- ✅ Runs 20 regression tests
- ✅ Builds `/src` → `/docs`
- ✅ Stages `/docs` changes

### 3. Working directory stays clean
After commit, `git status` should show nothing.
If it doesn't, something's wrong!

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run pre-commit tests manually
node scripts/pre-commit-tests.js

# E2E tests
npm run test:e2e

# Test production build locally
npm run build
npm run preview  # → http://localhost:4173
```

---

## 🐛 Quick Troubleshooting

### Dev server won't start
```bash
# Check if port is in use
lsof -i :3456
# Kill it if needed, then retry
npm run dev
```

### Commit blocked by tests
```bash
# See what's failing
node scripts/pre-commit-tests.js

# Fix the issue, then commit again
```

### Live site doesn't match code
```bash
# Verify /docs is up to date
git status

# If not, build manually
npm run build
git add docs/
git commit -m "Update /docs"
git push
```

### Git complains about /docs permissions
```bash
# Make /docs writable
chmod -R u+w docs/

# Retry your git operation
```

---

## 📚 Learn More

### Local Documentation
- **Quick Reference:** This file (for daily workflow)
- **Deployment Guide:** `DEPLOYMENT_FINAL.md` (full deployment workflow)
- **Lessons Learned:** `PWA_LESSONS_LEARNED.md` (what we learned building this)
- **Project Docs:** `project-docs/README.md` (feature documentation)

### PWA Best Practices (peadoubleueh repository)
For comprehensive PWA development guidance, see:
- 📖 **[PWA Development Workflow](https://github.com/chasemp/peadoubleueh/blob/main/PWA_DEVELOPMENT_WORKFLOW.md)**
- 🏗️ **[Deployment Architecture](https://github.com/chasemp/peadoubleueh/blob/main/DEPLOYMENT_ARCHITECTURE.md)**
- 💡 **[Development Lessons](https://github.com/chasemp/peadoubleueh/blob/main/PWA_DEVELOPMENT_LESSONS.md)**
- 🎯 **[Quick Reference](https://github.com/chasemp/peadoubleueh/blob/main/PWA_QUICK_REFERENCE.md)**
- 📦 **[PWA Template](https://github.com/chasemp/peadoubleueh/tree/main/src/pwa-template)** (starter template)

---

## ✅ Success Checklist

Your setup is correct if:
- ✅ `npm run dev` shows changes instantly
- ✅ Commits run tests automatically
- ✅ `git status` is clean after commits
- ✅ `git push` succeeds without conflicts
- ✅ Live site updates within 2 minutes

---

**Questions?** Check `DEPLOYMENT_FINAL.md` for complete details.

**Last Updated:** October 3, 2025

