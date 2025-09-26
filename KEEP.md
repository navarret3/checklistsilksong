This repository is being reduced to the minimal files required to run the Silksong Checklist as a static site.

Retained (after cleanup):
- index.html
- manifest.webmanifest
- robots.txt
- sitemap.xml
- privacy.html
- assets/ (only images actually referenced and required icons)
- src/js (core runtime scripts)
- src/i18n (locale JSON)
- data/silksong_items.json (primary dataset)
- package.json / lock (for build pipeline generating icons & sitemap)

Removed: specification, planning, bootstrap scripts, unused datasets, placeholder or enrichment scripts, spec-kit artifacts.

This file documents why non-obvious files were removed and can be deleted later if not needed.