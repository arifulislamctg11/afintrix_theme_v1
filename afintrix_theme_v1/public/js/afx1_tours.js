/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · TOUR SUPPRESSION

   frappe's desk starts a guided "onboarding tour" popover on load when
   System Settings.enable_onboarding is on (frappe/public/js/frappe/desk.js
   ::setup_tours -> frappe.ui.init_onboarding_tour). install.py turns that
   flag off, but frappe's setup wizard flips it back to 1 the moment it is
   completed, so the flag alone is not a reliable gate.

   This neutralises the tour from the client instead, independent of the flag
   and of which site the theme is running on:

     * empty frappe.boot.onboarding_tours so setup_tours() never queues one, and
     * no-op frappe.ui.init_onboarding_tour so nothing can start one even if it
       is queued (desk.js waits ~1s after boot before calling it).

   User-initiated form tours are left untouched — this only stops the
   automatic one. Nothing here removes functionality the client asked to keep.
   ========================================================================== */

(function () {
	function suppress() {
		if (!window.frappe) return;
		try {
			if (frappe.boot) frappe.boot.onboarding_tours = [];
		} catch (e) {}
		try {
			frappe.ui = frappe.ui || {};
			frappe.ui.init_onboarding_tour = function () {};
		} catch (e) {}
	}

	// Run now (bootinfo is already on the page when app scripts execute) and
	// again across the window desk.js uses before it would start the tour.
	suppress();
	$(document).ready(suppress);
	[0, 300, 900, 1500, 2500].forEach(function (t) {
		setTimeout(suppress, t);
	});
})();
