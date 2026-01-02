# JW Schedule Meetings - Multi-Page Structure

## 📁 File Structure

```
/
├── index.html              # Home page with dashboard
├── people.html             # People management
├── midweek.html            # Create cycles
├── view-cycle.html         # View cycle's Thursdays
├── edit-thursday.html      # Edit meeting details
├── assignments.html        # Assignments overview
├── print.html              # Print schedule
├── assignment-slips.html   # Print assignment slips
├── styles.css              # Global styles
├── wrangler.toml           # Cloudflare config
├── js/
│   ├── shared.js           # Shared utilities
│   ├── people.js           # People page logic
│   ├── midweek.js          # Midweek page logic
│   ├── view-cycle.js       # View cycle logic
│   ├── edit-thursday.js    # Edit Thursday logic
│   └── assignments.js      # Assignments logic
└── functions/
    └── api/
        └── _middleware.js  # Backend API
```

## ✨ Benefits of Multi-Page Structure

1. **Easy to add pages** - Just create new .html + .js file
2. **Better organization** - Each feature is separate
3. **Easier maintenance** - Find and edit specific pages
4. **Clear navigation** - Each page has its own URL
5. **Like PHP structure** - Familiar if coming from PHP

## 🆕 Adding New Pages

1. Create new HTML file (e.g., `reports.html`)
2. Copy navigation from existing page
3. Create matching JS file (e.g., `js/reports.js`)
4. Add link to navigation menu
5. Done!

## 📝 Notes

- All pages share `js/shared.js` for common utilities
- All pages use same `styles.css` for consistent design
- API calls go to `/api/*` (handled by functions/_middleware.js)
- Print pages are standalone (no nav needed)

