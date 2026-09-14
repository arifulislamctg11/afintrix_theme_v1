/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · SIGN IN

   Builds the brand panel of the split-hero sign-in and marks the body so
   afx1_login.css can take effect.

   frappe's own login markup is left completely alone. Every code path on that
   page — password, email link, forgot password, LDAP, social logins, the
   signup switch — is wired to those elements, so the panel is *added* beside
   them rather than the template being replaced.
   ========================================================================== */

(function () {
	const LOGO = "/assets/afintrix_theme_v1/images/afintrix-symbol.png";

	function is_login_page() {
		return !!document.querySelector(".for-login, .for-email-login, .for-forgot");
	}

	function build_brand_panel() {
		const aside = document.createElement("aside");
		aside.className = "afx-login-brand";
		aside.innerHTML = `
			<div class="afx-login-brand-mark">
				<img src="${LOGO}" alt="">
				<span>Afintrix</span>
			</div>

			<div class="afx-login-pitch">
				<div class="afx-login-eyebrow">Advisory Analytics ERP</div>
				<h1>Every figure, one command deck.</h1>
				<p>
					Accounting, inventory, people and reporting for Afintrix Advisory
					Analytics &mdash; in one place, behind one sign-in.
				</p>
				<svg viewBox="0 0 300 74" width="300" height="74" aria-hidden="true">
					<polyline
						points="2,58 34,50 66,54 98,42 130,46 162,34 194,38 226,26 258,30 294,14"
						fill="none" stroke="#e4c27e" stroke-width="2"
						stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>
					<circle cx="294" cy="14" r="3.5" fill="#e4c27e"/>
					<line x1="2" y1="66" x2="298" y2="66" stroke="rgba(255,255,255,.24)"/>
				</svg>
			</div>

			<div class="afx-login-foot">
				&copy; ${new Date().getFullYear()} Afintrix Advisory Analytics &middot; afintrix.com
			</div>`;
		return aside;
	}

	function build_links() {
		const links = document.createElement("div");
		links.className = "afx-login-links";
		links.innerHTML = `
			<span>Afintrix ERP</span>
			<i></i>
			<a href="/help">Help Center</a>
			<i></i>
			<a href="/privacy">Privacy</a>`;
		return links;
	}

	function init() {
		if (!is_login_page() || document.querySelector(".afx-login-brand")) return;

		document.body.classList.add("afx-login");
		document.body.insertBefore(build_brand_panel(), document.body.firstChild);

		// The form column is whatever wrapper frappe put the cards in.
		const deck =
			document.querySelector("main") ||
			document.querySelector(".page-content") ||
			document.body;
		deck.appendChild(build_links());
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
