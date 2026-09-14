# Afintrix Theme V1 — "Sapphire"

An ERPNext / Frappe **v16** desk theme. It restyles the desk to the Afintrix
Sapphire design, applies the Afintrix brand assets, and white-labels the
product naming.

Everything is delivered as a normal Frappe app. It does not patch or fork
frappe or erpnext — it layers CSS, a little JS, and a handful of settings on
top, so it survives upgrades of both.

---

## 1. Requirements

| | |
| --- | --- |
| Frappe | v16 |
| ERPNext | v15+ (optional, but the theme is designed around it) |
| Node | **24 or newer** — `bench build` fails on older versions |
| Python | 3.11+ |

Check node before you start:

```bash
node --version      # must be v24+
```

If your bench uses nvm and the default is older:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24
```

---

## 2. Install

Unzip the delivery somewhere outside your bench, then from the **bench
directory**:

```bash
cd ~/frappe-bench

# 1. add the app to the bench
bench get-app /path/to/afintrix_theme_v1

# 2. install it on your site
bench --site yoursite.local install-app afintrix_theme_v1

# 3. build the assets (node 24 must be active)
bench build --app afintrix_theme_v1

# 4. pick up the new hooks
bench --site yoursite.local clear-cache
```

Then **restart the web process** so the new `hooks.py` is read:

- development: restart `bench start`
- production: `bench restart` (or `sudo supervisorctl restart all`)

Reload the desk. You should see the dark module rail on the left, the Afintrix
mark at the top of it, and a blue-and-white sign-in page at `/login`.

> **If nothing changes**, it is almost always step 4 — frappe caches the app
> hook list, so a new `app_include_css` entry does not reach the browser until
> the cache is cleared *and* the web process has restarted.

---

## 3. Verify

```bash
bench --site yoursite.local list-apps        # afintrix_theme_v1 is listed
```

In the browser:

- `/login` — brand-blue panel on the left, sign-in card on the right
- the desk — labelled module rail; clicking a module pops its submenu beside it
- the avatar, top right — a menu ending in **Log out**

---

## 4. What it changes on your site

The theme is mostly CSS, but installing it also writes a few settings. These
are applied on install **and re-applied on every `bench migrate`**, because
frappe's own setup wizard resets some of them.

| Setting | New value | Why |
| --- | --- | --- |
| System Settings → Enable Onboarding | off | removes the "Getting Started" panel, the workspace onboarding box and guided tours |
| Website Settings → App Name / Logo / Favicon / Splash / Banner | Afintrix assets | desk logo, login mark, browser tab icon, loading splash |
| Website Settings → Footer Powered | Afintrix line | replaces "Built on Frappe" / "ERPNext" on portal pages |
| Navbar Settings → Help dropdown | 5 rows hidden | Documentation, User Forum, Frappe School, Report an Issue, Frappe Support — all link to product sites |
| Workspace titles | `ERPNext Settings` → `Afintrix Settings` | title only; the record name and route are untouched |

Nothing is deleted. Every one of these is reversible from the UI.

### Undoing them

- **Onboarding** — remove `after_install` / `after_migrate` from `hooks.py`,
  then tick *Enable Onboarding* in System Settings.
- **Help links** — untick `hidden` on the rows in Navbar Settings.
- **Branding** — clear the fields in Website Settings.
- **Workspace titles** — edit the Workspace record.

---

## 5. Uninstall

```bash
bench --site yoursite.local uninstall-app afintrix_theme_v1
bench --site yoursite.local clear-cache
bench build
```

Then restart the web process. The settings above stay as they are — revert the
ones you care about using the list in section 4.

---

## 6. Rebranding it

The brand assets live in `afintrix_theme_v1/public/images/`. To swap them for a
different brand, replace those three files and rebuild:

```bash
bench build --app afintrix_theme_v1
```

They are generated from the client's master artwork by
`scripts/make_brand_assets.py` — see `public/images/README.md` for what is
derived from what.

Colours are all in `public/css/afx1_tokens.css`, at the top:

```css
--afx-brand: #1e39d6;      /* Afintrix blue */
--afx-gold:  #d5aa55;      /* Afintrix gold */
--afx-rail:  #0f1637;      /* module rail */
```

Change those and rebuild; the whole desk follows, light and dark.

---

## 7. After you edit the theme

Any change to a file in `public/css` or `public/js`:

```bash
bench build --app afintrix_theme_v1
```

A plain browser reload is enough — the assets are content-hashed, so there is
no stale-cache problem and no need for a hard refresh.

Changes to `hooks.py` or `install.py` additionally need
`bench --site yoursite.local clear-cache` **and** a web restart.

---

## 8. Troubleshooting

**`bench build` fails with "The engine node is incompatible"**
Node is older than 24. Activate a newer one, then rebuild.

**The desk looks unstyled after install**
The hooks cache. Run `clear-cache` and restart the web process.

**The sign-in page is unstyled**
The login styling ships in the *web* bundle. Confirm `bench build` produced
`afintrix_v1_web.bundle.*` under `public/dist/`.

**A second site on the same bench is unaffected**
That is expected — the theme only applies to sites it is installed on.

---

## 9. What's inside

```
afintrix_theme_v1/
├── hooks.py                     asset bundles + install hooks
├── install.py                   settings applied on install / migrate
├── public/
│   ├── css/afx1_tokens.css      brand + neutral palette (start here)
│   ├── css/afx1_shell.css       module rail, submenu flyout, top bar
│   ├── css/afx1_page.css        page head, breadcrumbs, tabs
│   ├── css/afx1_controls.css    buttons, inputs, dropdowns, modals
│   ├── css/afx1_list.css        list view + report tables
│   ├── css/afx1_form.css        form sections, grids, timeline
│   ├── css/afx1_charts.css      chart cards + number cards
│   ├── css/afx1_login.css       sign-in page
│   ├── css/afx1_dark.css        dark theme
│   ├── js/afx1_shell.js         rail, top bar, submenu flyout
│   ├── js/afx1_charts.js        chart colour palette
│   ├── js/afx1_whitelabel.js    removes ERPNext / Frappe naming
│   ├── js/afx1_usermenu.js      avatar menu incl. Log out
│   ├── js/afx1_login.js         sign-in brand panel
│   └── images/                  logo, symbol, favicon
└── scripts/make_brand_assets.py regenerates the images from brand artwork
```

`README.md` in the same folder documents the implementation in more depth,
including the frappe quirks each piece works around.
