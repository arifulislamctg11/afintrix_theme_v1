/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · DESKTOP APPS GRID

   The /desk apps grid renders ERPNext's own bundled desktop SVGs
   (/assets/erpnext/icons/desktop_icons/solid/*.svg) and app-logo cubes
   (frappe-framework-logo.svg, frappe-hr-logo.svg) as <img> tags. Those are
   the most ERPNext-looking part of the desk. This swaps each for the same
   clean Lucide line icon the sidebar rail uses, so the grid reads as one
   system with the rest of the theme.
   ========================================================================== */

(function () {
	// keyed by the desktop-icon svg basename (reliable even when the tile has
	// no title, e.g. items nested inside a folder). Mirrors the workspace
	// icons the sidebar rail shows.
	const ICON_MAP = {
		"frappe-framework-logo": "blocks",
		"frappe-hr-logo": "users",
		invoicing: "wallet",
		payments: "receipt-text",
		financial_reports: "sheet",
		accounting: "landmark",
		assets: "archive",
		buying: "shopping-cart",
		manufacturing: "building-2",
		projects: "folder-kanban",
		quality: "shield-check",
		selling: "store",
		stock: "package",
		subcontracting: "combine",
		erpnext_settings: "sliders-horizontal",
		crm: "handshake",
		support: "headset",
		website: "globe",
		users: "users",
		integrations: "plug",
		home: "house",
		build: "hammer",
		getting_started: "compass",
	};

	// fallback by tile title when the svg name is unknown
	const TITLE_MAP = {
		accounting: "landmark",
		platform: "blocks",
		framework: "blocks",
		people: "users",
		"afintrix settings": "sliders-horizontal",
		tenure: "user",
		leaves: "tree-palm",
		payroll: "wallet",
		recruitment: "users",
	};

	function lucide_for(container) {
		const img = container.querySelector("img.app-icon");
		if (img) {
			const key = (img.getAttribute("src") || "")
				.split("/")
				.pop()
				.replace(/\.svg$/, "")
				.toLowerCase();
			if (ICON_MAP[key]) return ICON_MAP[key];
		}
		const title = (
			container.closest(".desktop-icon")?.querySelector(".icon-title")?.textContent || ""
		)
			.trim()
			.toLowerCase();
		return TITLE_MAP[title] || ICON_MAP[title] || "layout-grid";
	}

	function retheme() {
		if (!window.frappe || !frappe.utils || !frappe.utils.icon) return;

		document.querySelectorAll(".desktop-wrapper .icon-container").forEach((ic) => {
			if (ic.dataset.afxIcon) return;
			// a folder tile wraps nested .desktop-icon children; leave its own
			// box alone (its nested icons are rethemed by this same loop)
			if (ic.classList.contains("folder-icon")) {
				ic.dataset.afxIcon = "folder";
				return;
			}
			if (!ic.querySelector("img.app-icon")) return;

			const name = lucide_for(ic);
			ic.innerHTML = frappe.utils.icon(name, "lg");
			ic.dataset.afxIcon = name;
		});
	}

	function boot() {
		if (!document.querySelector(".desktop-wrapper")) return;
		retheme();
		const wrap = document.querySelector(".desktop-container") || document.body;
		let queued = false;
		new MutationObserver(() => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => {
				queued = false;
				retheme();
			});
		}).observe(wrap, { childList: true, subtree: true });
	}

	// the desktop grid is a route; re-run on load and route changes
	$(document).ready(function () {
		setTimeout(boot, 120);
		if (window.frappe && frappe.router) {
			frappe.router.on("change", () => setTimeout(boot, 150));
		}
	});
})();
