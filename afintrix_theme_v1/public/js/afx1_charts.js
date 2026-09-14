/* ==========================================================================
   AFINTRIX THEME V1 — SAPPHIRE · CHART COLOURS

   frappe-charts writes its series colours inline, so CSS cannot restyle them
   without an !important rule per dataset index. Handing the palette to the
   chart at construction is cleaner and works for every chart type.

   frappe.Chart is assigned by the lazily-loaded chart bundle, so the property
   is intercepted rather than wrapped once: whenever the bundle assigns it, the
   setter stores the real class and hands callers a subclass that fills in the
   palette.

   The order is the Afintrix data semantics from the design system:
   income/actual brand · expense/comparison neutral · profit green ·
   pending gold · then teal and purple for further series.
   ========================================================================== */

(function () {
	const CATEGORICAL = [
		"#1E39D6", // brand — income / actual
		"#9AA4B6", // neutral — expense / comparison
		"#0E7A4C", // green — profit
		"#D5AA55", // gold — pending
		"#2F7D8C", // teal
		"#6E45B8", // purple
		"#C22A20", // red — loss
	];

	/* Ordered buckets (ageing, funnels, anything part-of-whole) read better as
	   one ramp than as unrelated hues, with gold marking the last bucket. */
	const RAMP = ["#1E39D6", "#4A63E3", "#7F92EE", "#B6C2F7", "#D5AA55"];

	const RAMP_TYPES = new Set(["pie", "donut", "percentage"]);

	const DARK = {
		"#1E39D6": "#6E86F2",
		"#9AA4B6": "#697488",
		"#0E7A4C": "#48B98A",
		"#D5AA55": "#E2BE79",
		"#2F7D8C": "#5AA9BB",
		"#6E45B8": "#A484E0",
		"#C22A20": "#E8776B",
		"#4A63E3": "#5A6FD1",
		"#7F92EE": "#4456A5",
		"#B6C2F7": "#32407C",
	};

	function is_dark() {
		return document.documentElement.getAttribute("data-theme") === "dark";
	}

	function palette_for(options) {
		const base = RAMP_TYPES.has(options && options.type) ? RAMP : CATEGORICAL;
		return is_dark() ? base.map((c) => DARK[c] || c) : base.slice();
	}

	function with_palette(options) {
		const opts = Object.assign({}, options || {});
		opts.colors = palette_for(opts);

		// frappe-charts reads axis/tooltip chrome from here; keep it quiet so
		// the card, not the chart, carries the visual weight.
		opts.axisOptions = Object.assign({ xAxisMode: "tick", yAxisMode: "span" }, opts.axisOptions);
		opts.barOptions = Object.assign({ spaceRatio: 0.6 }, opts.barOptions);
		opts.lineOptions = Object.assign({ hideDots: 0, dotSize: 4 }, opts.lineOptions);
		return opts;
	}

	function wrap(NativeChart) {
		if (!NativeChart || NativeChart.__afx_wrapped) return NativeChart;

		class AfintrixChart extends NativeChart {
			constructor(parent, options) {
				super(parent, with_palette(options));
			}
		}
		AfintrixChart.__afx_wrapped = true;
		return AfintrixChart;
	}

	function install() {
		let current = wrap(window.frappe.Chart);

		Object.defineProperty(window.frappe, "Chart", {
			configurable: true,
			get() {
				return current;
			},
			set(value) {
				current = wrap(value);
			},
		});
	}

	function boot() {
		if (!window.frappe) return setTimeout(boot, 40);
		install();
	}

	boot();
})();
