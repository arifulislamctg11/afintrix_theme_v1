/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · SHELL SCRIPT

   Two additions to the v16 desk, both purely additive:

   1. A 64px dark module rail on the far left, built from
      frappe.boot.allowed_workspaces. The native contextual sidebar keeps
      carrying the current workspace's links, which is what Sapphire's
      236px panel is.

   2. A sticky top bar above the page head. Rather than rebuild search,
      notifications and the user menu, it *moves* frappe's own nodes into
      it, so every handler frappe bound to them keeps working. The sidebar
      re-renders on some route changes, so the move is re-applied whenever
      those nodes reappear in their original home.
   ========================================================================== */

(function () {
	const RAIL_CLASS = "afx-rail";
	const BAR_CLASS = "afx-topbar";

	// The client's brand symbol is blue-on-transparent, so it sits on a white
	// tile rather than directly on the dark rail. See public/images/README.md.
	const BRAND_MARK =
		`<img src="/assets/afintrix_theme_v1/images/afintrix-symbol.png" alt="Afintrix">`;

	// The sidebar header subtitle is the owning app's title — "ERPNext",
	// "Frappe", "HRMS" — which breaks the white label. Rewrite it to the brand
	// strapline. Guarded so the sidebar MutationObserver cannot loop on it.
	const BRAND_STRAPLINE = "Advisory Analytics";

	function brand_sidebar_header() {
		const subtitle = document.querySelector(".body-sidebar .sidebar-header .header-subtitle");
		if (subtitle && subtitle.textContent.trim() !== BRAND_STRAPLINE) {
			subtitle.textContent = BRAND_STRAPLINE;
		}
	}

	function slug(name) {
		return frappe.router.slug(name);
	}

	/* ------------------------------- rail ------------------------------- */

	function top_level_workspaces() {
		const seen = new Set();
		return (frappe.boot.allowed_workspaces || []).filter((ws) => {
			if (ws.parent_page) return false;
			if (seen.has(ws.name)) return false;
			seen.add(ws.name);
			return true;
		});
	}

	function build_rail() {
		if (document.querySelector("." + RAIL_CLASS)) return;

		const rail = document.createElement("div");
		rail.className = RAIL_CLASS;

		const brand = document.createElement("a");
		brand.className = "afx-rail-brand";
		brand.href = "/desk/home";
		brand.setAttribute("aria-label", "Afintrix");
		brand.innerHTML =
			`<span class="afx-rail-brand-tile">${BRAND_MARK}</span>` +
			`<span class="afx-rail-brand-name">Afintrix</span>`;
		rail.appendChild(brand);

		const items = document.createElement("div");
		items.className = "afx-rail-items";
		rail.appendChild(items);

		top_level_workspaces().forEach((ws) => {
			const a = document.createElement("a");
			a.className = "afx-rail-item";
			a.href = "/desk/" + slug(ws.name);
			a.dataset.workspace = slug(ws.name);
			// the route keeps the real workspace name; only the label is branded
			const label = (frappe.afx_relabel || ((t) => t))(ws.name);
			a.setAttribute("aria-label", label);
			a.innerHTML =
				frappe.utils.icon(ws.icon || "folder-normal", "md") +
				`<span class="afx-rail-label">${frappe.utils.escape_html(label)}</span>`;
			a.addEventListener("click", () => {
				// the anchor still navigates; this only pops the submenu open
				// against the icon that was clicked
				open_flyout_across_route(a);
			});

			items.appendChild(a);
		});

		document.body.insertBefore(rail, document.body.firstChild);
	}

	function mark_active_rail_item() {
		const rail = document.querySelector("." + RAIL_CLASS);
		if (!rail) return;

		const route = frappe.get_route() || [];
		let current = "";
		if (route[0] === "Workspaces" && route[1]) {
			current = slug(route[1]);
		} else {
			// on a list or form, follow the workspace the sidebar is showing
			const title = frappe.app.sidebar && frappe.app.sidebar.sidebar_title;
			if (title) current = slug(title);
		}

		rail.querySelectorAll(".afx-rail-item").forEach((el) => {
			el.classList.toggle("active", el.dataset.workspace === current);
		});
	}

	/* ------------------------------ flyout ------------------------------ */

	/* The contextual panel is a popover hanging off the rail rather than a
	   docked column. It stays frappe's own .body-sidebar — the items inside are
	   rendered by frappe for the current workspace, so the submenu is always
	   the right one — this just decides where it sits and when it shows. */

	const OPEN_CLASS = "afx-flyout-open";
	let anchor_el = null;
	let keep_open_once = false;

	function position_flyout(el) {
		const rail_item = el || anchor_el;
		if (!rail_item) return;

		const box = rail_item.getBoundingClientRect();
		// line the popover up with the icon, then keep it on screen
		const top = Math.max(8, Math.min(box.top, window.innerHeight - 180));
		document.documentElement.style.setProperty("--afx-flyout-top", `${Math.round(top)}px`);
	}

	function flyout_open() {
		return document.documentElement.classList.contains(OPEN_CLASS);
	}

	function open_flyout(el) {
		if (el) anchor_el = el;
		position_flyout(anchor_el);
		document.documentElement.classList.add(OPEN_CLASS);
	}

	/* Opening from the rail navigates too, so the upcoming route change must
	   not be mistaken for the user picking a submenu item. */
	function open_flyout_across_route(el) {
		keep_open_once = true;
		open_flyout(el);
	}

	function close_flyout() {
		document.documentElement.classList.remove(OPEN_CLASS);
	}

	function toggle_flyout(el) {
		if (flyout_open() && (!el || el === anchor_el)) {
			close_flyout();
		} else {
			open_flyout(el);
		}
	}

	function active_rail_item() {
		return document.querySelector(`.${RAIL_CLASS} .afx-rail-item.active`);
	}

	function wire_flyout_dismissal() {
		document.addEventListener("click", (e) => {
			if (e.target.closest(".body-sidebar")) return;
			if (e.target.closest(`.${RAIL_CLASS}, .afx-sidebar-toggle`)) return;
			if (flyout_open()) close_flyout();
		});

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && flyout_open()) close_flyout();
		});

		window.addEventListener("resize", () => {
			if (flyout_open()) position_flyout();
		});
	}

	/* ------------------------------ top bar ------------------------------ */

	function build_topbar() {
		const main = document.querySelector(".main-section");
		if (!main || main.querySelector("." + BAR_CLASS)) return;

		const bar = document.createElement("div");
		bar.className = BAR_CLASS;
		bar.innerHTML = `
			<div class="afx-topbar-left">
				<button class="afx-topbar-btn afx-sidebar-toggle" aria-label="${__("Toggle Sidebar")}">
					${frappe.utils.icon("menu", "sm")}
				</button>
			</div>
			<div class="afx-topbar-right">
				<button class="afx-topbar-btn afx-theme-toggle" aria-label="${__("Switch Theme")}">
					${frappe.utils.icon("moon", "sm")}
				</button>
			</div>`;

		main.insertBefore(bar, main.firstChild);

		bar.querySelector(".afx-sidebar-toggle").addEventListener("click", () => {
			toggle_flyout(anchor_el || active_rail_item());
		});

		bar.querySelector(".afx-theme-toggle").addEventListener("click", () => {
			new frappe.ui.ThemeSwitcher().show();
		});
	}

	/* Move frappe's own search / notification / user nodes into the bar.
	   Called again whenever the sidebar re-renders them in their old home. */
	function relocate_into_topbar() {
		const bar = document.querySelector("." + BAR_CLASS);
		if (!bar) return;

		const right = bar.querySelector(".afx-topbar-right");

		// search + notifications travel together: the notification dropdown is
		// positioned against .standard-items-sections, so move the whole block.
		const sections = document.querySelector(".body-sidebar .standard-items-sections");
		if (sections) {
			bar.insertBefore(sections, right);
		}

		const user = document.querySelector(".body-sidebar .dropdown-navbar-user");
		if (user) {
			right.appendChild(user);
		}
	}

	/* --------------------------- wiring it up --------------------------- */

	function refresh() {
		build_rail();
		build_topbar();
		relocate_into_topbar();
		mark_active_rail_item();
		brand_sidebar_header();
		if (flyout_open()) position_flyout();
	}

	function watch_sidebar() {
		const container = document.querySelector(".body-sidebar-container");
		if (!container) return;

		let queued = false;
		new MutationObserver(() => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => {
				queued = false;
				relocate_into_topbar();
				mark_active_rail_item();
				brand_sidebar_header();
			});
		}).observe(container, { childList: true, subtree: true });
	}

	/* Reveal the desk (see the anti-flash gate in afx1_shell.css) once the rail,
	   top bar and relabelling of the first paint are in place. One rAF lets the
	   sibling scripts' synchronous sweeps land in the same frame. */
	function mark_ready() {
		requestAnimationFrame(() => {
			document.documentElement.classList.add("afx-ready");
		});
	}

	function boot() {
		if (!window.frappe || !frappe.router || !document.querySelector(".body-sidebar")) {
			return setTimeout(boot, 60);
		}
		refresh();
		mark_ready();
		watch_sidebar();
		wire_flyout_dismissal();
		frappe.router.on("change", () => {
			if (keep_open_once) {
				keep_open_once = false;
			} else if (flyout_open()) {
				close_flyout();
			}
			setTimeout(refresh, 0);
		});
	}

	// Fail-safe: never leave the desk hidden if boot() cannot complete (matches
	// the 2.5s CSS keyframe fallback).
	setTimeout(mark_ready, 2500);

	$(document).ready(boot);
})();
