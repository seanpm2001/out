/** global: Craft, Garnish, $ */

/**
 * Create Element
 *
 * @param {string} tag
 * @param {Object} attributes
 * @param {string|array} children
 * @returns {HTMLElement}
 */
const h = function (tag = "div", attributes = {}, children = []) {
	const elem = document.createElement(tag);

	for (let [key, value] of Object.entries(attributes)) {
		if (!value) continue;

		if (typeof value === "function") {
			if (key === "ref") value(elem);
			else elem.addEventListener(key, value);
			continue;
		}

		if (key === "style")
			value = value.replace(/[\t\r\n]/g, " ").trim();

		elem.setAttribute(key, value);
	}

	if (!Array.isArray(children))
		children = [children];

	children.forEach(child => {
		if (!child) return;

		try {
			elem.appendChild(child);
		} catch (_) {
			elem.appendChild(document.createTextNode(child));
		}
	});

	return elem;
};

/**
 * Create Craft Form Input
 *
 * @param config
 * @returns {HTMLElement}
 */
const f = function (config) {
	return h("div", { class: "field" }, [
		h("div", { class: "heading" }, [
			h("label", { for: config.id }, config.label),
			config.hasOwnProperty("instructions")
				? h("div", { class: "instructions" }, h("p", {}, config.instructions))
				: null
		]),
		h("div", { class: "input" }, [
			h(config.tag, { id: config.id, ...config.attr }, config.children || null)
		]),
	]);
};

// window.Out = {
//
// 	// Properties
// 	// =====================================================================
//
// 	fieldMap: {},
// 	integrations: [],
//
// 	fields: {},
// 	activeFieldId: null,
//
// 	modal: null,
//
// 	headingInput: null,
// 	twigInput: null,
// 	escapeInput: null,
// 	enabledInput: null,
//
// 	fieldSettings: null,
//
// 	// Functions
// 	// =====================================================================
//
// 	init (fieldMap, integrations) {
// 		this.fieldMap = fieldMap;
// 		this.integrations = integrations;
//
// 		this.fieldSettings = document.getElementById("fieldSettings");
// 		this.fields = JSON.parse(this.fieldSettings.value);
// 		if (Array.isArray(this.fields)) this.fields = {};
//
// 		const btns = document.getElementById("outFields").getElementsByTagName("button");
// 		for (let i = 0, l = btns.length; i < l; ++i)
// 			btns[i].addEventListener("click", this.edit.bind(this));
//
// 		this.modal = new Garnish.Modal(
// 			h("div", { class: "modal out--modal" }, [
// 				h("div", { class: "body" }, [
// 					f({
// 						label: "Enabled",
// 						id: "out_enabled",
// 						tag: "input",
// 						attr: {
// 							type: "checkbox",
// 							checked: false,
// 							ref: el => { this.enabledInput = el; }
// 						},
// 					}),
// 					f({
// 						label: "Column Heading",
// 						id: "out_columnHeading",
// 						tag: "input",
// 						attr: {
// 							class: "text fullwidth",
// 							ref: el => { this.headingInput = el; }
// 						},
// 					}),
// 					f({
// 						label: "Twig",
// 						id: "out_twig",
// 						tag: "textarea",
// 						attr: {
// 							rows: 5,
// 							class: "text fullwidth",
// 							ref: el => { this.twigInput = el; }
// 						},
// 						instructions: [
// 							"Code to be executed in place of the fields output. You have access to the ",
// 							h("code", {}, "element"),
// 							" variable as well as all global & Craft variables.",
// 						],
// 					}),
// 					f({
// 						label: "Escape Value",
// 						id: "out_escape",
// 						tag: "input",
// 						attr: {
// 							type: "checkbox",
// 							checked: true,
// 							ref: el => { this.escapeInput = el; }
// 						},
// 						instructions: "If checked the output of the column will be escaped",
// 					})
// 				]),
// 				h("div", { class: "footer" }, [
// 					h("div", { class: "buttons right" }, [
// 						h("button", {
// 							class: "btn",
// 							click: this.cancel.bind(this),
// 						}, "Cancel"),
// 						h("button", {
// 							class: "btn submit",
// 							click: this.update.bind(this),
// 						}, "Update"),
// 					]),
// 				]),
// 			]),
// 			{ autoShow: false }
// 		);
// 	},
//
// 	edit (e) {
// 		e.preventDefault();
// 		this.setValues(e.target);
// 		this.modal.show();
// 	},
//
// 	// Actions
// 	// =====================================================================
//
// 	setValues (field) {
// 		const fieldKey = field.dataset.key;
//
// 		this.activeFieldId = fieldKey;
//
// 		if (this.fields.hasOwnProperty(fieldKey)) {
// 			const p = this.fields[fieldKey];
//
// 			this.enabledInput.checked = p.enabled;
// 			this.headingInput.value = p.heading;
// 			this.twigInput.value = p.twig;
// 			this.escapeInput.checked = p.escape;
//
// 			return;
// 		}
//
// 		const f = this.fieldMap[fieldKey];
//
// 		this.enabledInput.checked = false;
// 		this.headingInput.value = f.name;
// 		this.twigInput.value = `{{ element.${f.handle} }}`;
// 		this.escapeInput.checked = true;
// 	},
//
// 	update () {
// 		this.fields[this.activeFieldId] = {
// 			enabled: this.enabledInput.checked,
// 			heading: this.headingInput.value,
// 			twig: this.twigInput.value,
// 			escape: this.escapeInput.checked,
// 		};
//
// 		this.fieldSettings.value = JSON.stringify(this.fields);
//
// 		this.modal.hide();
// 	},
//
// 	cancel () {
// 		this.modal.hide();
// 	},
//
// };

class Out {

	// Properties
	// =========================================================================

	activeType = "";

	constructor () {
		this.initElementTypeSwitcher();
	}

	// Initializers
	// =========================================================================

	initElementTypeSwitcher () {
		const elementType = document.getElementById("elementType")
			, typeSource = document.querySelectorAll("[data-source-type]")
			, sourcesByType = {};

		for (let i = 0, l = typeSource.length; i < l; ++i)
		{
			const f = typeSource[i];
			const t = f.dataset.sourceType;

			const comment = document.createComment(t)
				, input = f;

			input.removeAttribute("style");

			sourcesByType[t] = { comment, input };

			if (elementType.value !== t)
				input.parentNode.replaceChild(comment, input);
		}

		this.activeType = sourcesByType[elementType.value];

		elementType.addEventListener("change", e => {
			this.activeType.input.parentNode.replaceChild(
				this.activeType.comment,
				this.activeType.input
			);

			this.activeType = sourcesByType[e.target.value];

			this.activeType.comment.parentNode.replaceChild(
				this.activeType.input,
				this.activeType.comment
			);

			// TODO: Update available fields
		});
	}

}

window.Out = Out;