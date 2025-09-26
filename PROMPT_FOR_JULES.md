# Prompt para Jules - Silksong Checklist Project

## 📋 Context Overview
You're working on an interactive checklist web application for **Hollow Knight: Silksong**. This is a static web app that helps players track their progress collecting items, abilities, and completing objectives in the game.

## 🏗️ Project Structure
```
/
├── index.html              # Main entry point
├── package.json           # Node scripts and config
├── src/
│   ├── js/
│   │   ├── main.js        # App initialization & core logic
│   │   ├── ui.js          # UI rendering & interactions
│   │   ├── progress.js    # Progress calculation logic
│   │   ├── storage.js     # localStorage management
│   │   ├── dataLoader.js  # JSON data loading & validation
│   │   └── i18n.js        # Internationalization (EN/ES)
│   └── i18n/
│       ├── en.json        # English translations
│       └── es.json        # Spanish translations
├── data/
│   └── silksong_items.json # Main data file (124 items)
├── assets/
│   └── images/            # Item icons, location images
├── scripts/
│   ├── build.js           # Production build script
│   ├── package.js         # Deployment packaging
│   ├── dev_server.js      # Development server
│   └── validate_data.js   # Data validation
└── dist/                  # Built files for deployment
```

## 🎯 Current Features
- ✅ Interactive checklist with 124 items across 11 categories
- ✅ Progress tracking with localStorage persistence
- ✅ Weighted progress system (different items have different weights)
- ✅ Search/filter functionality
- ✅ Multi-language support (EN/ES)
- ✅ Responsive design with collapsible sections
- ✅ Image zoom modal for location maps
- ✅ Global progress bar and item counter

## 📊 Data Structure
Items in `silksong_items.json` have this structure:
```json
{
  "id": "unique-item-id",
  "category": "ability|tool|ancient_mask|silk_spool|etc",
  "name": {"en": "English Name", "es": "Spanish Name"},
  "weight": 1,  // 0.25 for mask shards, 0.5 for silk spools, 1 for others
  "location_text": "Description of where to find it",
  "location_img": "path/to/location/image.jpg",
  "numId": 123,  // Sequential ID for ordering
  "image": "path/to/item/icon.png"
}
```

## ⚠️ Known Issues
1. **Section counters broken**: Per-category progress counters (done/total and %) are currently hidden with `display:none` because the counting logic has bugs
2. **Toggle function**: Sometimes fails for new items not in localStorage
3. **Item ordering**: JSON items are not sorted by numId, causing potential display issues

## 🔧 Development Commands
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production (outputs to /dist)
- `npm run deploy` - Build + create deployment package
- `npm run validate:data` - Validate JSON data integrity

## 🎨 Tech Stack
- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Build**: Custom Node.js scripts (no bundler)
- **Storage**: localStorage for progress persistence
- **Hosting**: Static files (works on any web server)

## 🚀 Deployment
- **GitHub**: https://github.com/navarret3/checklistsilksong
- **Live site**: User has it deployed on their .com domain
- **Process**: Build locally → upload /dist contents to web server

## 🎯 Current Priority Issues
1. **Fix section counters**: The `updateCategoryCounts()` function in `ui.js` needs debugging
2. **Improve toggle reliability**: Ensure all items can be checked/unchecked properly
3. **Performance**: App loads 100+ images, could benefit from optimization

## 💡 Potential Improvements
- Add item search by location/requirements
- Implement progress export/import
- Add completion statistics
- Optimize image loading (lazy loading)
- Add dark/light theme toggle
- Mobile UX improvements

## 🔍 Key Files to Understand
1. **`src/js/main.js`**: App initialization, event handlers
2. **`src/js/ui.js`**: DOM manipulation, rendering logic
3. **`src/js/progress.js`**: Progress calculation functions
4. **`data/silksong_items.json`**: All checklist data
5. **`index.html`**: Main HTML structure

## 📝 Code Style
- ES6 modules with import/export
- Functional programming approach
- Minimal dependencies (only dev dependencies for formatting)
- Clean, readable code with meaningful function names
- Progressive enhancement principles

---

**Your task**: Help improve this Silksong checklist application. Focus on fixing the broken section counters, improving reliability, and suggesting/implementing enhancements that would make the user experience better.

Please analyze the codebase and suggest specific improvements or fixes you can implement.