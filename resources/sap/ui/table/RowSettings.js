/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.table.RowSettings
sap.ui.define([
	'sap/ui/core/Element', './TableUtils', './library', 'sap/ui/core/library'
], function(Element, TableUtils, library, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	/**
	 * Constructor for new RowSettings.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowSettings</code> control allows you to configure a row.
	 * You can only use this control in the context of the <code>sap.ui.table.Table</code> control to define row settings.
	 * @extends sap.ui.core.Element
	 * @version 1.52.32
	 *
	 * @constructor
	 * @public
	 * @since 1.48.0
	 * @alias sap.ui.table.RowSettings
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RowSettings = Element.extend("sap.ui.table.RowSettings", /** @lends sap.ui.table.RowSettings.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {

				/**
				 * The highlight state of the rows.
				 * If the highlight is set to {@link sap.ui.core.MessageType.None} (default), no highlights are visible.
				 * @since 1.48.0
				 */
				highlight : {type : "sap.ui.core.MessageType", group : "Appearance", defaultValue : "None"}
			}
		}
	});

	/**
	 * Initializes the row settings.
	 */
	RowSettings.prototype.init = function() {
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowSettings.prototype.setHighlight = function(sHighlight) {
		var oRow;
		var oHighlightElement;

		this.setProperty("highlight", sHighlight, true);

		oRow = this._getRow();
		if (oRow == null) {
			return this;
		}

		oHighlightElement = oRow.getDomRef("highlight");
		if (oHighlightElement == null) {
			return this;
		}

		// Remove the currently set highlight class.
		for (var sMessageType in MessageType) {
			oHighlightElement.classList.remove("sapUiTableRowHighlight" + sMessageType);
		}

		// Set the new highlight class.
		oHighlightElement.classList.add(this._getHighlightCSSClassName());

		// Update the accessibility information.
		var oTable = oRow.getParent();
		var oAccessibilityExtension = oTable != null ? oTable._getAccExtension() : null;

		if (oAccessibilityExtension != null) {
			oAccessibilityExtension.updateAriaStateOfRowHighlight(this);
		}

		return this;
	};

	/**
	 * Gets the css class name representation for the current highlight state.
	 *
	 * @returns {string} CSS class name representation of the highlight.
	 * @private
	 */
	RowSettings.prototype._getHighlightCSSClassName = function() {
		var sHighlight = this.getHighlight();

		if (sHighlight == null) {
			sHighlight = MessageType.None;
		}

		return "sapUiTableRowHighlight" + sHighlight;
	};

	/**
	 * Gets the text representation of the current highlight state.
	 *
	 * @returns {string} Text representation of the highlight.
	 * @private
	 */
	RowSettings.prototype._getHighlightText = function() {
		var sHighlight = this.getHighlight();

		if (sHighlight == null || sHighlight === MessageType.None) {
			return "";
		}

		return this._oResBundle.getText("TBL_ROW_STATE_" + sHighlight.toUpperCase());
	};

	/**
	 * Gets the instance of the row these settings belong to.
	 *
	 * @returns {sap.ui.table.Row|null} Row instance these settings belong to, or <code>null</code> if they are not associated with a row.
	 * @private
	 */
	RowSettings.prototype._getRow = function() {
		var oRow = this.getParent();

		if (TableUtils.isInstanceOf(oRow, "sap/ui/table/Row")) {
			return oRow;
		} else {
			return null;
		}
	};

	return RowSettings;
});
