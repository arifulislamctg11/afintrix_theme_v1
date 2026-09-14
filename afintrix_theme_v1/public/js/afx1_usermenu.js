/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · USER MENU

   v16's sidebar avatar is a plain link — `route_to_user()` — not a dropdown,
   and the only Logout in the stock desk lived in the apps-grid navbar that
   afx1_desktop.css removes. So the avatar in the top bar gets a real menu,
   with Logout in it.

   Everything here calls frappe's own APIs; nothing reimplements session
   handling.
   ========================================================================== */

(function () {
	const MENU_CLASS = "afx-user-menu";

	function items() {
		return [
			{
				label: __("My Profile"),
				icon: "user",
				action: () => frappe.ui.toolbar.route_to_user(),
			},
			{
				label: __("My Settings"),
				icon: "setting-gear",
				action: () => frappe.set_route("Form", "User", frappe.session.user),
			},
			{
				label: __("Session Defaults"),
				icon: "list",
				action: () => frappe.ui.toolbar.setup_session_defaults(),
			},
			{ separator: true },
			{
				label: __("Keyboard Shortcuts"),
				icon: "command",
				action: (e) => frappe.ui.toolbar.show_shortcuts(e),
			},
			{
				label: __("About"),
				icon: "info",
				action: () => frappe.ui.toolbar.show_about(),
			},
			{ separator: true },
			{
				label: __("Reload"),
				icon: "refresh",
				action: () => frappe.ui.toolbar.clear_cache(),
			},
			{
				label: __("Log out"),
				icon: "logout",
				danger: true,
				action: () => frappe.app.logout(),
			},
		];
	}

	function build_menu() {
		const menu = document.createElement("div");
		menu.className = MENU_CLASS;

		const head = document.createElement("div");
		head.className = "afx-user-menu-head";
		head.innerHTML = `
			<span class="afx-user-menu-name"></span>
			<span class="afx-user-menu-email"></span>`;
		head.querySelector(".afx-user-menu-name").textContent =
			frappe.session.user_fullname || frappe.session.user;
		head.querySelector(".afx-user-menu-email").textContent = frappe.session.user_email || "";
		menu.appendChild(head);

		items().forEach((item) => {
			if (item.separator) {
				const hr = document.createElement("div");
				hr.className = "afx-user-menu-sep";
				menu.appendChild(hr);
				return;
			}

			const button = document.createElement("button");
			button.type = "button";
			button.className = "afx-user-menu-item" + (item.danger ? " danger" : "");
			button.innerHTML = frappe.utils.icon(item.icon, "sm");
			const label = document.createElement("span");
			label.textContent = item.label;
			button.appendChild(label);

			button.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				close();
				item.action(e);
			});

			menu.appendChild(button);
		});

		return menu;
	}

	function close() {
		document.documentElement.classList.remove("afx-user-menu-open");
	}

	function install() {
		const host = document.querySelector(".afx-topbar .dropdown-navbar-user");
		if (!host || host.querySelector("." + MENU_CLASS)) return;

		// the native anchor routes to the profile on click; the menu takes over
		const anchor = host.querySelector("a");
		if (anchor) {
			anchor.removeAttribute("onclick");
			anchor.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				document.documentElement.classList.toggle("afx-user-menu-open");
			});
		}

		host.appendChild(build_menu());
	}

	function boot() {
		if (!window.frappe || !frappe.session || !document.querySelector(".afx-topbar")) {
			return setTimeout(boot, 60);
		}

		install();

		document.addEventListener("click", (e) => {
			if (!e.target.closest(".afx-topbar .dropdown-navbar-user")) close();
		});
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") close();
		});

		// the top bar is rebuilt when frappe re-renders the sidebar
		new MutationObserver(() => install()).observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	boot();
})();
