# Reshine International Website

This repository contains a multi-page, responsive, accessible corporate website for **Reshine International Private Limited**.

## Folder structure
```
reshine-website/
├─ index.html              # Homepage
├─ about.html              # About page
├─ services.html           # Services page
├─ industries.html         # Industries page
├─ ports.html              # Ports & Locations page
├─ resources.html          # Resource Center
├─ testimonials.html       # Testimonials page
├─ faq.html               # FAQ page
├─ contact.html           # Contact page
├─ quote.html             # Quick Quote page
├─ 404.html              # Error page
├─ styles.css            # Shared styles
├─ scripts.js            # Shared JavaScript
├─ README.md             # This file
├─ MULTI_PAGE_STRUCTURE.md  # Multi-page documentation
└─ images/
   ├─ hero-cargo-ship.jpg
   ├─ service-customs-docs.jpg
   ├─ service-docs.jpg
   ├─ service-freight-team.jpg
   ├─ service-compliance.jpg
   ├─ service-warehousing.jpg
   ├─ service-door2door.jpg
   └─ reshine-international-pvt-ltd-logo.png
```

## How to deploy
### GitHub Pages
1. Create a new repository (e.g. `reshine-website`) and push the files from this folder to the `main` branch.
2. In repository **Settings → Pages**, select the `main` branch and root (`/`) folder as the source.
3. Save. Your site will be published at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

### Cloudflare Pages
1. Create a new project on Cloudflare Pages and connect your GitHub repository.
2. Set the build command to blank (no build) and the output directory to `/` (root).
3. Deploy. Configure your custom domain `reshineinternational.in` in Cloudflare dashboard.

## Images
Images are placeholders. Suggested Unsplash/Pexels search keywords:
- hero-cargo-ship.jpg -> "cargo ship port"
- service-customs-docs.jpg -> "customs documents"
- service-docs.jpg -> "logistics documents"
- service-freight-team.jpg -> "logistics team"
- service-compliance.jpg -> "compliance consultancy"
- service-warehousing.jpg -> "warehouse logistics"
- service-door2door.jpg -> "door to door delivery"
- logo-placeholder.svg -> simple vector or initials

## Notes
- No external libraries used — pure HTML/CSS/JS.
- Accessibility: ARIA attributes and semantic HTML included.
- SEO: Meta title and description set on all pages.
- Multi-page structure with consistent navigation across all pages.
- See `MULTI_PAGE_STRUCTURE.md` for detailed documentation on the page structure and navigation system.

