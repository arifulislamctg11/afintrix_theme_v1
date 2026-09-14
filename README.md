# Afintrix Theme V1 — "Sapphire"

An ERPNext / Frappe v16 desk theme implementing the Sapphire design
(`ERP Frappe Final Design/version - 2`).

Sapphire was chosen over the other two candidates because its architecture is
already Frappe's: a module rail plus a contextual sidebar, a page head with
breadcrumb + actions, list rows, form sections. It is delivered as a token
retint plus targeted component overrides rather than a rebuilt shell, so it
survives Frappe upgrades.

## What it does

**Tokens** (`public/css/afx1_tokens.css`) retint Frappe's espresso primitives —
`--gray-*`, `--blue-*`, `--ink-*`, `--surface-*`, `--outline-*`, radii, shadows,
type — to the Sapphire palette. Brand `#1E39D6` and gold `#D5AA55` are fixed by
the Afintrix brief. Most of the restyle happens here; the component files only
handle what tokens cannot reach.

**Shell** (`afx1_shell.css` + `public/js/afx1_shell.js`) adds the two pieces
v16 does not have:

- a 64px dark module rail, built from `frappe.boot.allowed_workspaces`, inserted
  as `body`'s first flex child;
- a sticky top bar prepended to `.main-section`, into which frappe's own search,
  notification and user-menu nodes are **moved** (not re-implemented), so every
  handler frappe bound to them keeps working.

The native `.body-sidebar` becomes Sapphire's 236px contextual panel. Collapsing
it hides it entirely and leaves the rail, which is Sapphire's `nav-collapsed`.

The sidebar re-renders on some route changes, so a `MutationObserver` re-applies
the move whenever those nodes reappear in their original home.

**Components**: `afx1_page.css` (page head, breadcrumbs, tabs, indicator pills),
`afx1_controls.css` (buttons, inputs, dropdowns, modals), `afx1_list.css` (list
and datatable), `afx1_form.css` (sections, grids, timeline), `afx1_workspace.css`
(number cards, shortcuts, link groups), `afx1_dark.css` (the dark tier).

## Building

Assets ship as content-hashed esbuild bundles, so a plain reload picks up a
rebuild — no hard refresh, no fresh browser profile.

```bash
export NVM_DIR=$HOME/.nvm; . $NVM_DIR/nvm.sh; nvm use default   # node >= 24
bench build --app afintrix_theme_v1
```

The bundle entry must stay `.scss`: frappe's postcss plugin copies a `.css`
entry to a temp directory before resolving `@import`, which breaks relative
sibling paths. Imports are written without the `.css` extension so sass inlines
them rather than emitting a runtime `@import`.

Editing `hooks.py` needs `bench --site <site> clear-cache` **and** a web-process
reload before the new `app_include_*` entries reach the browser.

## Onboarding

`install.py` turns off `System Settings.enable_onboarding` on install and on
every migrate. That one flag gates all three onboarding surfaces — the "Getting
Started" panel in the sidebar, the onboarding widget box on workspaces, and
guided form tours. frappe's setup wizard sets it back to 1 when it completes,
which is why the panel kept coming back; re-asserting it from `after_migrate`
is what makes the removal stick.

To bring onboarding back, drop the two hooks from `hooks.py` and set the field
in System Settings.

## Branding

The client's brand files live in `Fiverr Clients/Philip/Afintrix Theme/Brand details/`.
`scripts/make_brand_assets.py` derives the three desk assets in
`public/images/` from them — see `public/images/README.md` for what comes from
where and why. Regenerate rather than hand-editing:

```bash
~/frappe-bench/env/bin/python scripts/make_brand_assets.py <brand-details-dir> \
    apps/afintrix_theme_v1/afintrix_theme_v1/public/images
```

`install.py` wires them up on install and on every migrate, pointing Website
Settings' `app_name`, `app_logo`, `favicon`, `splash_image` and `banner_image`
at the assets. That covers the desk logo, login mark, browser tab icon and
loading splash. `hooks.py` also sets `app_logo_url` as a fallback for when
Website Settings is empty — frappe prefers the Website Settings field.

Two brand decisions worth knowing:

- The rail tile is **white**, not brand blue. The symbol is blue with a gold
  swoosh, so on Sapphire's dark navy rail a blue tile would swallow it.
- `afx1_shell.js` rewrites the sidebar header subtitle to "Advisory Analytics".
  frappe puts the owning app's title there — "ERPNext", "Frappe", "HRMS" —
  which breaks the white label. Drop `brand_sidebar_header()` to get the app
  names back.

## Navigation: rail + flyout submenu

The rail is a **216px labelled column**, not an icon strip: each module shows
its icon and its name. Width lives in `--afx-rail-w`, which the flyout offsets
against, so changing one moves the other.

Watch out for one frappe rule here: `.icon` carries `margin: 0 auto`, which in
a flex row swallows the free space and shunts the label to the far edge. The
rail resets it explicitly, and `.afx-rail-label` takes `flex: 1 1 auto`.

The contextual panel is **not docked**. Clicking a module in the rail
navigates to that workspace *and* pops its submenu out beside the icon; the
content area keeps the full width the rest of the time.

- `afx1_shell.js` sets `--afx-flyout-top` from the clicked icon's position and
  toggles `.afx-flyout-open` on `<html>`; `afx1_shell.css` turns frappe's
  `.body-sidebar-container` into a fixed, out-of-flow popover.
- The panel is still frappe's own `.body-sidebar`, so the items in it are
  whatever frappe rendered for the current workspace — the submenu can never
  drift out of sync with the page.
- It closes on **route change**, click-outside and Escape. Route change is the
  signal rather than a click on `.item-anchor`: nested and programmatic clicks
  slipped past the click handler. A rail click routes too, so it sets a
  `keep_open_once` flag that the router handler consumes.
- The top bar's hamburger toggles it against the active rail icon.

Two specificity traps worth knowing if you touch this:

- frappe adds `.expanded` to `.body-sidebar-container`, and
  `.body-sidebar-container.expanded .body-sidebar` outranks a plain
  `html.afx-flyout-open .body-sidebar`, so the open state has to match that
  depth or the popover stays at `opacity: 0` while reporting correct geometry.
- `.body-sidebar-placeholder` must stay `display: none`; it is how frappe
  reserves the docked column's width, which would otherwise indent the content.

The stock header block at the top of the panel — workspace icon, title and
"Advisory Analytics" subtitle with its chevron — is removed; it was the most
ERPNext-looking piece of the shell.

## Sign in

`public/css/afx1_login.css` + `public/js/afx1_login.js` build the split-hero
sign-in: a brand-blue panel on the left, the form card on the light deck.

The panel carries design 2's brand blue `#1E39D6` rather than the rail ink the
mockup used, so the page reads as this theme rather than a darker one. Text
tokens are chosen for contrast on that blue â white for the headline, a muted
periwinkle `#CBD4FA` at ~5.4:1 for body copy, and the lifted gold `#E4C27E`
at ~4.7:1 for the eyebrow and sparkline. They ship in the **web** bundle (`web_include_css` /
`web_include_js`), which frappe includes on every portal page, so:

- all CSS is scoped under `.afx-login`, a class the script adds to `<body>`
  only when frappe has actually rendered the login sections;
- the Sapphire tokens are restated in that file — the desk bundle that
  normally defines them is not loaded outside `/app`.

frappe's own login markup is untouched. Password, email link, forgot password,
LDAP and social logins are all wired to those elements, so the brand panel is
*added* beside them rather than the template being overridden.

One gotcha: `login.bundle.css` loads after this bundle and styles the submit
button at `.for-login .page-card .page-card-actions .btn-login`, so the brand
button rule has to outrank that chain rather than merely match it.

## White label

`public/js/afx1_whitelabel.js` takes "ERPNext" and "Frappe" out of the desk:

- **bootinfo** — `app_data` and `allowed_workspaces` titles are rewritten
  before the desk draws, which covers the apps grid and the module rail. The
  workspace `name` is left alone; it is the route.
- **the About dialog** — `frappe.ui.toolbar.show_about` is replaced outright
  with an Afintrix one.
- **everything else** — a text and attribute sweep, re-run on DOM additions,
  for names frappe bakes into markup.
- **workspace titles** are data, so `install.py::rename_workspaces` rewrites
  them once (title only, never the record name).

The script publishes its map as `frappe.afx_relabel` because `afx1_shell.js`
builds the module rail from workspace *names* and needs the same wording.

`public/css/afx1_desktop.css` removes the apps grid's own navbar. That bar is
stock Frappe chrome — search, notifications, avatar and the site menu —
duplicating the Sapphire top bar directly above it; everything it offers is
already in the top bar and the user menu.

## Charts, number cards and report tables

**Series colours** come from `public/js/afx1_charts.js`, not CSS. frappe-charts
writes them inline, so restyling from a stylesheet would need an `!important`
rule per dataset index and per chart type; handing the palette to the chart at
construction is cleaner and covers every type.

`frappe.Chart` is assigned by a lazily-loaded bundle, so the script does not
wrap it once — it installs a property setter, and whatever the bundle assigns
gets wrapped on the way in.

The order is the design system's data semantics, not an arbitrary palette:

| # | colour | meaning |
| --- | --- | --- |
| 1 | `#1E39D6` brand | income / actual |
| 2 | `#9AA4B6` neutral | expense / comparison |
| 3 | `#0E7A4C` green | profit |
| 4 | `#D5AA55` gold | pending |
| 5-7 | teal, purple, red | further series / loss |

Pie, donut and percentage charts get a blue ramp with gold on the last bucket
instead — ordered buckets read better as one ramp than as unrelated hues. Dark
mode swaps in the lifted variants.

**Card shells and chrome** are in `public/css/afx1_charts.css`: the 50px header
rule with a Montserrat title and grey caption, 16px body, 9.5px tabular axis
text, hairline gridlines, `--afx-rail` tooltips, and the number-card treatment
(12px grey label, 25px Montserrat figure, coloured delta line).

**Report tables** are at the end of `public/css/afx1_list.css`: frappe-datatable
dressed as the design's `table.t` — 38px sunk header with uppercase labels,
hairline rows, tabular figures ranged right in ink, brand-washed focus cell,
and a double-rule total row.

Known limitation: frappe-charts sizes bars as a fraction of the slot and
exposes no maximum width, so a chart with a single category draws one very wide
bar. `spaceRatio` is set to 0.6, which gives the design's slimmer bars once
there are several categories.

## Outbound product links and the user menu

`install.py::hide_product_links` stops the desk pointing at the ERPNext /
Frappe product sites:

- **Navbar Settings → Help dropdown** ships Documentation
  (`docs.erpnext.com`), User Forum (`discuss.frappe.io`), Frappe School,
  Report an Issue (`github.com/frappe/erpnext`) and Frappe Support. Those rows
  are set `hidden = 1` — matched on the **route**, not the label, because
  labels are translated. Hidden rather than deleted, so it survives a migrate
  and is undone by unticking the box. About, Keyboard Shortcuts and System
  Health stay; they are local.
- **Website Settings → `footer_powered`** replaces the "Built on Frappe" /
  "ERPNext" line that frappe and erpnext each render on every portal page,
  login included.

`public/js/afx1_usermenu.js` adds the avatar dropdown. v16's sidebar avatar is
a plain `route_to_user()` link, not a menu, and the only **Log out** in the
stock desk lived in the apps-grid navbar that `afx1_desktop.css` removes — so
without this there is no way to sign out. About and Keyboard Shortcuts sit here
for the same reason. Every entry calls frappe's own API; `frappe.app.logout()`
raises frappe's confirm dialog before ending the session.

## Notes / not yet done

- Dashboard chart series still use frappe's default colours; those come from the
  Dashboard Chart records, not CSS.
- The form sidebar is left borderless (frappe's default) rather than given a
  Sapphire panel.
- The list-view "inspector" panel from the Vantage design was not carried over.
