import frappe

ASSETS = "/assets/afintrix_theme_v1/images"

SYMBOL = f"{ASSETS}/afintrix-symbol.png"
LOGO = f"{ASSETS}/afintrix-logo.png"
FAVICON = f"{ASSETS}/afintrix-favicon.png"

# Website Settings fields frappe reads for desk and login branding.
BRANDING = {
	"app_name": "Afintrix",
	"app_logo": SYMBOL,
	"favicon": FAVICON,
	"splash_image": SYMBOL,
	"banner_image": LOGO,
}


def disable_onboarding():
	"""Turn off frappe's onboarding for good.

	`System Settings.enable_onboarding` is the single gate for all three
	onboarding surfaces: the "Getting Started" panel in the sidebar
	(frappe/desk/desktop.py::get_onboarding_data), the onboarding widget box on
	workspaces (same module, get_onboarding_widget), and guided form tours
	(frappe/desk/doctype/form_tour). frappe's setup wizard sets it back to 1 on
	completion, which is why the panel kept reappearing — so we re-assert it on
	install and on every migrate rather than flipping it once by hand.
	"""
	# Always re-assert 0 — the setup wizard sets it back to 1 on completion, and
	# after_migrate runs this again. afx1_tours.js is the client-side backstop
	# for the window where the flag may briefly be 1.
	if frappe.db.get_single_value("System Settings", "enable_onboarding") != 0:
		frappe.db.set_single_value("System Settings", "enable_onboarding", 0)


def apply_branding():
	"""Point frappe's logo, favicon and splash at the Afintrix brand assets.

	These are the supported levers — the desk logo, the login page mark, the
	browser tab icon and the loading splash all read from Website Settings, so
	setting them here covers every surface the theme's own CSS cannot reach.
	The images are derived from the client's brand master; see
	`public/images/README.md`.
	"""
	settings = frappe.get_single("Website Settings")
	changed = False

	for field, value in BRANDING.items():
		if settings.get(field) != value:
			settings.set(field, value)
			changed = True

	if changed:
		settings.flags.ignore_permissions = True
		settings.save()


# Workspace titles that ship with the product names in them. The record name
# is left alone — it is the route — so only the displayed title changes.
WORKSPACE_TITLES = {
	"ERPNext Settings": "Afintrix Settings",
	"ERPNext Integrations": "Integrations",
}


def rename_workspaces():
	"""Take "ERPNext" and "Frappe" out of workspace titles.

	Titles are data, so they cannot be fixed from the theme's CSS or JS the way
	the rest of the white label is; afx1_whitelabel.js handles the surfaces
	that are rendered from bootinfo instead.
	"""
	for name, title in WORKSPACE_TITLES.items():
		if not frappe.db.exists("Workspace", name):
			continue
		if frappe.db.get_value("Workspace", name, "title") != title:
			frappe.db.set_value("Workspace", name, "title", title, update_modified=False)


# Help-menu entries that leave the site for a product website. Matched on the
# route rather than the label, because labels are translated.
PRODUCT_LINK_HOSTS = (
	"erpnext.com",
	"frappe.io",
	"frappeframework.com",
	"frappecloud.com",
	"frappe.school",
	"discuss.frappe",
	"github.com/frappe",
)

FOOTER_POWERED = (
	'<a href="https://afintrix.com" target="_blank" rel="noopener" '
	'class="text-muted">Afintrix Advisory Analytics</a>'
)


def hide_product_links():
	"""Stop the desk linking out to the ERPNext / Frappe product sites.

	Two places do it:

	* Navbar Settings' Help dropdown ships Documentation, User Forum, Frappe
	  School, Report an Issue and Frappe Support. The rows are hidden rather
	  than deleted, so the change survives a migrate and can be undone by
	  unticking `hidden`. About, Keyboard Shortcuts and System Health stay —
	  they are local, and About is already rebranded by afx1_whitelabel.js.
	* Website Settings' `footer_powered`, which overrides the "Built on
	  Frappe" / "ERPNext" line on every portal page including login.
	"""
	navbar = frappe.get_single("Navbar Settings")
	changed = False

	for item in navbar.help_dropdown:
		route = (item.route or "") + (item.action or "")
		if any(host in route for host in PRODUCT_LINK_HOSTS) and not item.hidden:
			item.hidden = 1
			changed = True

	if changed:
		navbar.flags.ignore_permissions = True
		navbar.save()

	if frappe.db.get_single_value("Website Settings", "footer_powered") != FOOTER_POWERED:
		frappe.db.set_single_value("Website Settings", "footer_powered", FOOTER_POWERED)


def setup():
	disable_onboarding()
	apply_branding()
	rename_workspaces()
	hide_product_links()
	frappe.clear_cache()


def after_install():
	setup()


def after_migrate():
	setup()
