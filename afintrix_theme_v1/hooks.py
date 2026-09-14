app_name = "afintrix_theme_v1"
app_title = "Afintrix Theme V1"
app_publisher = "Afintrix Advisory Analytics"
app_description = "Afintrix ERP desk theme (Sapphire)"
app_email = "philthe3rd@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "afintrix_theme_v1",
# 		"logo": "/assets/afintrix_theme_v1/logo.png",
# 		"title": "Afintrix Theme V1",
# 		"route": "/afintrix_theme_v1",
# 		"has_permission": "afintrix_theme_v1.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# Content-hashed by esbuild, so a rebuild always reaches the browser.
app_include_css = ["afintrix_v1.bundle.css"]
app_include_js = ["afintrix_v1.bundle.js"]

# Fallback when Website Settings.app_logo is empty — install.py sets that field
# to the same asset, and frappe prefers it over this hook.
app_logo_url = "/assets/afintrix_theme_v1/images/afintrix-symbol.png"

# Portal + login. Everything in this bundle is scoped so it cannot leak onto
# other website pages — see public/css/afx1_login.css.
web_include_css = ["afintrix_v1_web.bundle.css"]
web_include_js = ["afintrix_v1_web.bundle.js"]



# include js, css files in header of web template
# web_include_css = "/assets/afintrix_theme_v1/css/afintrix_theme_v1.css"
# web_include_js = "/assets/afintrix_theme_v1/js/afintrix_theme_v1.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "afintrix_theme_v1/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "afintrix_theme_v1/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "afintrix_theme_v1.utils.jinja_methods",
# 	"filters": "afintrix_theme_v1.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "afintrix_theme_v1.install.before_install"
after_install = "afintrix_theme_v1.install.after_install"

# Onboarding is re-enabled by frappe's setup wizard, so re-assert it off on
# every migrate as well as on install.
after_migrate = "afintrix_theme_v1.install.after_migrate"

# Uninstallation
# ------------

# before_uninstall = "afintrix_theme_v1.uninstall.before_uninstall"
# after_uninstall = "afintrix_theme_v1.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "afintrix_theme_v1.utils.before_app_install"
# after_app_install = "afintrix_theme_v1.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "afintrix_theme_v1.utils.before_app_uninstall"
# after_app_uninstall = "afintrix_theme_v1.utils.after_app_uninstall"

# Build
# ------------------
# To hook into the build process

# after_build = "afintrix_theme_v1.build.after_build"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "afintrix_theme_v1.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"afintrix_theme_v1.tasks.all"
# 	],
# 	"daily": [
# 		"afintrix_theme_v1.tasks.daily"
# 	],
# 	"hourly": [
# 		"afintrix_theme_v1.tasks.hourly"
# 	],
# 	"weekly": [
# 		"afintrix_theme_v1.tasks.weekly"
# 	],
# 	"monthly": [
# 		"afintrix_theme_v1.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "afintrix_theme_v1.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "afintrix_theme_v1.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "afintrix_theme_v1.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "afintrix_theme_v1.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["afintrix_theme_v1.utils.before_request"]
# after_request = ["afintrix_theme_v1.utils.after_request"]

# Job Events
# ----------
# before_job = ["afintrix_theme_v1.utils.before_job"]
# after_job = ["afintrix_theme_v1.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"afintrix_theme_v1.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

