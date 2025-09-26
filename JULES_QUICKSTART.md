# Quick Start Guide for Jules

## 🚀 Getting Started
1. **Clone the repo**: `git clone https://github.com/navarret3/checklistsilksong.git`
2. **Install deps**: `npm install`
3. **Start dev server**: `npm run dev`
4. **Open**: http://localhost:5173

## 🐛 Priority Bugs to Fix

### 1. Section Counters Not Working
**File**: `src/js/ui.js` (line ~120)
**Issue**: `updateCategoryCounts()` function is disabled, per-section progress shows wrong values
**Expected**: Each category header should show "X/Y (Z%)" correctly

### 2. Toggle Function Reliability  
**File**: `src/js/progress.js`
**Issue**: `toggle()` fails when item ID not in localStorage
**Current fix**: Added fallback to initialize missing IDs, but needs testing

### 3. Item Display Order
**File**: `data/silksong_items.json`
**Issue**: Items not sorted by `numId`, categories appear in wrong order
**Fix needed**: Sort items by `numId` or adjust grouping logic

## 🔧 Quick Test Scenarios
1. **Section counters**: Click items in different categories, check if header badges update
2. **New session**: Clear localStorage, reload, try clicking items
3. **Search**: Type in search box, check if filtering works
4. **Mobile**: Test responsive design on narrow screens

## 📁 Key Files Overview
- **`src/js/ui.js`**: Main UI logic (BROKEN: updateCategoryCounts)
- **`src/js/progress.js`**: Progress calculations (FIXED: toggle function)
- **`src/js/main.js`**: App initialization (calls updateCategoryCounts)
- **`data/silksong_items.json`**: All 124 items data

## 🎯 Success Criteria
✅ Section headers show correct "done/total (percentage)"
✅ All items can be clicked to toggle completion
✅ Progress persists across browser sessions
✅ Search/filter works properly
✅ Mobile responsive design works

---
**Start here**: Focus on fixing `updateCategoryCounts()` in `ui.js` first, then test the toggle functionality.