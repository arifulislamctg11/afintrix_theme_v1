/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · WHITE LABEL

   Strips the "ERPNext" and "Frappe" product names out of the desk chrome.
   Three surfaces, three treatments:

   1. Workspace titles are data — install.py rewrites them once.
   2. The apps grid on /desk and the module rail are rendered from bootinfo,
      so the titles in frappe.boot are rewritten before the desk draws.
   3. Anything else — menu items, dialogs, captions frappe bakes into markup —
      is caught by a text sweep that also runs on later DOM additions.

   Renaming rather than hiding: the workspaces and apps still have to be
   reachable, they just carry the client's names.
   ========================================================================== */

(function () {
	const APP_TITLES = {
		frappe: "Platform",
		erpnext: "Afintrix ERP",
		hrms: "People",
		afintrix_theme_v1: "Afintrix Theme",
	};

	const TEXT_REPLACEMENTS = [
		[/\bFrappe Framework\b/g, "Platform"],
		[/\bFrappe HR\b/g, "People"],
		[/\bERPNext Settings\b/g, "Afintrix Settings"],
		[/\bERPNext\b/g, "Afintrix ERP"],
		[/\bFrappe Technologies Pvt\.? ?Ltd\.?/g, "Afintrix Advisory Analytics"],
		[/\bFrappe\b/g, "Afintrix"],
	];

	function relabel(text) {
		return TEXT_REPLACEMENTS.reduce((out, [rx, to]) => out.replace(rx, to), text);
	}

	// afx1_shell.js builds the module rail from workspace *names*, which keep
	// the product wording even after install.py rewrites their titles, so it
	// needs the same map. Published early: the rail may be built before the
	// DOM sweep below ever runs.
	if (window.frappe) frappe.afx_relabel = relabel;

	/* ---------------------------- boot data ---------------------------- */

	/* The apps grid and the module rail both read these arrays, so rewriting
	   them here covers every tile without touching frappe's render code. */
	function relabel_boot() {
		(frappe.boot.app_data || []).forEach((app) => {
			const named = APP_TITLES[app.app_name];
			app.app_title = named || relabel(app.app_title || "");
		});

		(frappe.boot.allowed_workspaces || []).forEach((ws) => {
			// `name` stays put — it is the route. Only the display text changes.
			if (ws.title) ws.title = relabel(ws.title);
			if (ws.label) ws.label = relabel(ws.label);
		});
	}

	/* ------------------------------ about ------------------------------ */

	function install_about_dialog() {
		if (!frappe.ui || !frappe.ui.toolbar) return;

		frappe.ui.toolbar.show_about = function () {
			const version = (frappe.boot.versions || {}).afintrix_theme_v1 || "";
			const dialog = new frappe.ui.Dialog({
				title: __("About"),
				fields: [
					{
						fieldtype: "HTML",
						fieldname: "about",
						options: `
							<div class="afx-about">
								<img class="afx-about-logo"
									src="/assets/afintrix_theme_v1/images/afintrix-logo.png"
									alt="Afintrix Advisory Analytics">
								<p class="afx-about-line">${__("Advisory Analytics ERP")}</p>
								${version ? `<p class="afx-about-meta">Desk ${frappe.utils.escape_html(version)}</p>` : ""}
								<p class="afx-about-meta">
									<a href="https://afintrix.com" target="_blank" rel="noopener">afintrix.com</a>
								</p>
								<p class="afx-about-meta">
									&copy; ${new Date().getFullYear()} Afintrix Advisory Analytics
								</p>
							</div>`,
					},
				],
			});
			dialog.show();
		};
	}

	/* ---------------------------- dom sweep ---------------------------- */

	const SKIP = new Set(["INPUT", "TEXTAREA", "SCRIPT", "STYLE", "CODE", "PRE"]);

	// Links out to the product websites (same hosts install.py strips from the
	// help menu). Any that still reach the page, e.g. inside workspace or
	// dashboard text, are turned into plain text so nothing leaves the site.
	const PRODUCT_LINK = /(^|\.|\/\/)(erpnext\.com|frappe\.io|frappeframework\.com|frappecloud\.com|frappe\.school|discuss\.frappe\.io)\b|github\.com\/frappe\b/i;

	function unlink_products(root) {
		const links = root.matches && root.matches("a[href]") ? [root] : [];
		root.querySelectorAll("a[href]").forEach((a) => links.push(a));
		links.forEach((a) => {
			if (!PRODUCT_LINK.test(a.getAttribute("href") || "")) return;
			const span = document.createElement("span");
			span.textContent = a.textContent;
			a.replaceWith(span);
		});
	}
	const NAMES = /ERPNext|Frappe/;
	const ATTRS = ["title", "aria-label", "placeholder"];

	function sweep(root) {
		if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
		unlink_products(root);

		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				if (!NAMES.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
				if (SKIP.has(node.parentElement && node.parentElement.tagName))
					return NodeFilter.FILTER_REJECT;
				return NodeFilter.FILTER_ACCEPT;
			},
		});

		const pending = [];
		let node;
		while ((node = walker.nextNode())) pending.push(node);
		pending.forEach((n) => {
			const next = relabel(n.nodeValue);
			if (next !== n.nodeValue) n.nodeValue = next;
		});

		// tooltips and aria labels carry the names too
		const scope = [root, ...root.querySelectorAll("[title],[aria-label],[placeholder]")];
		scope.forEach((el) => {
			if (!el.getAttribute) return;
			ATTRS.forEach((attr) => {
				const value = el.getAttribute(attr);
				if (value && NAMES.test(value)) {
					const next = relabel(value);
					if (next !== value) el.setAttribute(attr, next);
				}
			});
		});
	}

	function watch_dom() {
		let queued = null;
		new MutationObserver((records) => {
			if (!queued) queued = new Set();
			records.forEach((r) => r.addedNodes.forEach((n) => queued.add(n)));
			if (queued.scheduled) return;
			queued.scheduled = true;
			requestAnimationFrame(() => {
				const batch = queued;
				queued = null;
				batch.forEach(sweep);
			});
		}).observe(document.documentElement, { childList: true, subtree: true });
	}

	/* --------------------------- wiring it up --------------------------- */

	function boot() {
		// This runs from <head>, so frappe.boot and <body> both have to be
		// waited for — observing a null body silently kills the sweep.
		if (!window.frappe || !frappe.boot || !document.body) {
			return setTimeout(boot, 40);
		}
		frappe.afx_relabel = relabel;
		relabel_boot();
		install_about_dialog();
		sweep(document.body);
		watch_dom();
	}

	boot();
})();
