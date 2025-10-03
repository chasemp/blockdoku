# Blockdoku PWA - Quick Start

## 🚀 Daily Development

```bash
# Start development server
npm run dev
# → Opens at http://localhost:3456
# → Serves from /src
# → Hot reload on file changes
```

**Edit files in `/src`** - changes appear immediately, no building needed!

---

## 📦 Deploy Changes

```bash
# 1. Build
npm run build
# Builds /src → /docs (~1 second)

# 2. Test
npm run preview
# Opens at http://localhost:4173

# 3. Commit & Deploy
git add src/ docs/
git commit -m "feat: your awesome changes"
git push
# → Live at https://blockdoku.523.life in ~2 minutes
```

---

## ⚠️ Critical Rules

### ✅ DO
- Edit files in `/src` only
- Run dev server for testing: `npm run dev`
- Build before committing: `npm run build`
- Test built version: `npm run preview`
- Commit both `/src` and `/docs`

### ❌ DON'T
- Edit files in `/docs` (auto-generated!)
- Commit without building
- Push without testing preview
- Edit root HTML files (old/stale)

---

## 🗂️ File Locations

| What | Where | Edit? |
|------|-------|-------|
| HTML pages | `/src/*.html` | ✅ Yes |
| JavaScript | `/src/js/**/*.js` | ✅ Yes |
| CSS | `/src/css/**/*.css` | ✅ Yes |
| Built files | `/docs/**` | ❌ Never |

---

## 🔗 URLs

| Environment | URL | Source |
|-------------|-----|--------|
| Development | http://localhost:3456 | `/src` |
| Preview | http://localhost:4173 | `/docs` |
| Production | https://blockdoku.523.life | `/docs` |

---

## 🆘 Common Tasks

### Add a new page
```bash
# 1. Create in /src
vim src/newpage.html

# 2. Add to vite.config.js
# Edit rollupOptions.input to include newpage

# 3. Build & test
npm run build
npm run preview
```

### Fix a bug
```bash
# 1. Edit source
vim src/js/app.js

# 2. Test in dev (no building!)
npm run dev
# Changes appear immediately

# 3. When done, build & deploy
npm run build
npm run preview
git add src/ docs/
git commit -m "fix: your bug fix"
git push
```

### Change styling
```bash
# 1. Edit CSS
vim src/css/main.css

# 2. See changes immediately
# Dev server auto-reloads

# 3. Deploy when ready
npm run build
git add src/ docs/
git commit -m "style: improved layout"
git push
```

---

## 🐛 Troubleshooting

### Dev server not starting?
```bash
# Kill existing server
pkill -f "vite"

# Restart
npm run dev
```

### Build fails?
```bash
# Check for errors
npm run build

# Clear cache
rm -rf node_modules/.vite
npm run build
```

### Changes not showing on live site?
```bash
# Did you build?
npm run build

# Did you commit /docs?
git status
git add docs/
git commit -m "build: update production assets"
git push
```

### Need to start fresh?
```bash
# Clean everything
rm -rf docs/ node_modules/
npm install
npm run build
```

---

## 📚 More Info

- Full workflow: See `DEPLOYMENT.md`
- Lessons learned: See `PWA_LESSONS_LEARNED.md`
- Cursor AI rules: See `.cursorrules`

---

**Last Updated:** January 3, 2025  
**Version:** 2.0 (new /src → /docs workflow)

