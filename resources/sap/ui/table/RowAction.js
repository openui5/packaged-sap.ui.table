/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.table.RowAction
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './TableUtils', './library', 'sap/ui/core/Icon', 'sap/ui/unified/Menu', 'sap/ui/core/Popup', './RowActionItem'],
function(jQuery, Control, TableUtils, library, Icon, Menu, Popup, RowActionItem) {
	"use strict";

	/**
	 * Constructor for a new RowAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowAction</code> control allows to display multiple action items which can be selected by the user.
	 * If more action items are available as the available space allows to display an overflow mechanism is provided.
	 * This control must only be used in the context of the <code>sap.ui.table.Table</code> control to define row actions.
	 * @extends sap.ui.core.Control
	 * @version 1.48.8
	 *
	 * @constructor
	 * @public
	 * @since 1.45.0
	 * @alias sap.ui.table.RowAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RowAction = Control.extend("sap.ui.table.RowAction", /** @lends sap.ui.table.RowAction.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {
			/**
			 * Whether the control should be visible on the screen. If set to <code>false</code>, the control is hidden.
			 */
			visible : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "items",
		aggregations : {
			/**
			 * The action items which should be displayed.
			 */
			items : {type : "sap.ui.table.RowActionItem", multiple : true},

			/*
			 * Hidden aggregation for the internally used icon controls.
			 */
			_icons : {type : "sap.ui.core.Icon", multiple : true, visibility: "hidden"},

			/*
			 * Hidden aggregation for the internally used menu control.
			 */
			_menu : {type : "sap.ui.unified.Menu", multiple : false, visibility: "hidden"}
		},
		events : {
		}

	}});

	RowAction.prototype.init = function() {
		var fnSetTooltip = function(vTooltip) {
			this.setAggregation("tooltip", vTooltip, true);
			this.setSrc(this.getSrc()); //Updates the title property
			return this;
		};

		var fnOnKeyUp = function(oEvent) {
			this._bKeyboard = oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER;
			Icon.prototype.onkeyup.apply(this, arguments);
		};

		var that = this;
		var oIcon = new Icon(this.getId() + "-icon0", {decorative: false, press: function(oEvent){that._handlePress(oEvent, true);}});
		oIcon.addStyleClass("sapUiTableActionIcon");
		oIcon.setTooltip = fnSetTooltip;
		oIcon.onkeyup = fnOnKeyUp;
		this.addAggregation("_icons", oIcon);
		oIcon = new Icon(this.getId() + "-icon1", {decorative: false, press: function(oEvent){that._handlePress(oEvent, false);}});
		oIcon.addStyleClass("sapUiTableActionIcon");
		oIcon.setTooltip = fnSetTooltip;
		oIcon.onkeyup = fnOnKeyUp;
		this.addAggregation("_icons", oIcon);

		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");

		this._iLen = 0;
		this._iCount = 2;
		this._aActions = ["", ""];
		this._iLastCloseTime = 0;
	};

	RowAction.prototype.onAfterRendering = function() {
		this._updateIcons();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible, true);
		this.$().toggleClass("sapUiTableActionHidden", !bVisible);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.setTooltip = function(vTooltip) {
		this.setAggregation("tooltip", vTooltip, true);
		var sTooltip = this.getTooltip_AsString();
		if (!sTooltip) {
			this.$().removeAttr("title");
		} else {
			this.$().attr("title", sTooltip);
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.insertItem = function(oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex, true);
		this._updateIcons(true);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.addItem = function(oItem) {
		this.addAggregation("items", oItem, true);
		this._updateIcons(true);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.removeItem = function(vItem) {
		var oRemovedItem = this.removeAggregation("items", vItem, true);
		this._updateIcons(true);
		return oRemovedItem;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.removeAllItems = function() {
		var aRemovedItems = this.removeAllAggregation("items", true);
		this._updateIcons(true);
		return aRemovedItems;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.destroyItems = function() {
		this.destroyAggregation("items", true);
		this._updateIcons(true);
		return this;
	};

	/*
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	RowAction.prototype.getAccessibilityInfo = function() {
		var $Parent = this.$().parent();
		var bActive = this.getVisible() && this._iLen > 0 && this._iCount > 0
						&& !$Parent.hasClass("sapUiTableRowHidden") && !$Parent.hasClass("sapUiTableGroupHeader") && !$Parent.hasClass("sapUiAnalyticalTableSum");

		var sText;
		if (bActive) {
			sText = this._oResBundle.getText(this._iLen == 1 ? "TBL_ROW_ACTION_SINGLE_ACTION" : "TBL_ROW_ACTION_MULTIPLE_ACTION", [this._iLen]);
		} else {
			sText = this._oResBundle.getText("TBL_ROW_ACTION_NO_ACTION");
		}

		return {
			focusable: bActive,
			enabled: bActive,
			description: sText
		};
	};

	/**
	 * Returns the items which are currently visible.
	 * @param {boolean} bForce Whether the list of visible items needs to be determined or cache can be used.
	 * @returns {sap.ui.table.RowActionItem[]} Returns the items which are currently visible
	 * @private
	 */
	RowAction.prototype._getVisibleItems = function(bForce) {
		if (!this._aVisibleItems || bForce) {
			this._aVisibleItems = [];
			this._iLen = 0;

			var aItems = this.getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getVisible()) {
					this._aVisibleItems.push(aItems[i]);
					this._iLen++;
				}
			}
		}
		return this._aVisibleItems;
	};

	/**
	 * Returns the table row this control belongs to.
	 * @returns {sap.ui.table.Row} Returns the table row this control belongs to
	 * @private
	 */
	RowAction.prototype._getRow = function() {
		return this.getParent();
	};

	/**
	 * Returns how many icons should be used to visualize the items.
	 * @returns {int} Returns how many icons should be used to visualize the items
	 */
	RowAction.prototype._getCount = function() {
		return this._iCount;
	};

	/**
	 * Sets how many icons should be used to visualize the items.
	 * @param {int} iCount Can either be 0, 1 or 2
	 * @private
	 */
	RowAction.prototype._setCount = function(iCount) {
		if (iCount < 0) {
			this._iCount = 0;
		} else if (iCount >= 0) {
			this._iCount = Math.min(iCount, 2);
		}
		this._updateIcons();
	};

	/**
	 * Enables or disables the fixed column layout.
	 * If enabled, the control tries to keep the position of the icons stable.
	 * @see #_updateIcons
	 * @param {boolean} bFixed Whether fixed column layout should be applied.
	 * @private
	 */
	RowAction.prototype._setFixedLayout = function(bFixed) {
		this._bFixedLayout = !!bFixed;
		this._updateIcons();
	};

	/**
	 * Sets the given ID in the ariaLabelledBy association of the inner icons.
	 * @param {string} sLabelId ID to be set in the ariaLabelledBy association of the inner icons
	 * @private
	 */
	RowAction.prototype._setIconLabel = function(sLabelId) {
		var aIcons = this.getAggregation("_icons");
		for (var i = 0; i < aIcons.length; i++) {
			aIcons[i].removeAllAriaLabelledBy();
			if (sLabelId) {
				aIcons[i].addAriaLabelledBy(sLabelId);
			}
		}
	};

	/**
	 * Press Event handler for the inner icons.
	 * @param {sap.ui.base.Event} oEvent The press event of the icon
	 * @param {boolean} bFirst Whether the first or second icon was pressed
	 * @private
	 */
	RowAction.prototype._handlePress = function(oEvent, bFirst) {
		var iIdx = bFirst ? 0 : 1;
		var oIcon = this.getAggregation("_icons")[iIdx];
		var sAction = this._aActions[iIdx];
		var bKeyboard = oIcon._bKeyboard;
		oIcon._bKeyboard = false;

		if (sAction == "action") {
			this._getVisibleItems()[iIdx]._doFirePress();
		} else if (sAction == "action_fixed") {
			this._getVisibleItems()[0]._doFirePress();
		} else if (sAction == "menu") {
			var oMenu = this.getAggregation("_menu");
			if (!oMenu) {
				oMenu = new Menu();
				this.setAggregation("_menu", oMenu, true);
				oMenu.getPopup().attachClosed(function(){
					this._iLastCloseTime = Date.now();
				}, this);
			}
			oMenu.removeAllItems();

			if (Date.now() - this._iLastCloseTime < 500) {
				//Skip menu opening when the menu was closed directly before
				return;
			}

			var aItems = this.getItems();
			for (var i = bFirst ? 0 : 1; i < aItems.length; i++) {
				oMenu.addItem(aItems[i]._getMenuItem());
			}

			oMenu.open(!!bKeyboard, oIcon, Popup.Dock.EndTop, Popup.Dock.EndBottom, oIcon);
		}
	};

	/**
	 * Updates the icons and texts of the inner icons depending on the state of the items.
	 * Must be called on any change in the items aggregation or change within the items.
	 * @param {boolean} bForce Whether the list of visible items needs to be determined or cache can be used.
	 * @private
	 */
	RowAction.prototype._updateIcons = function(bForce) {
		var aItems = this._getVisibleItems(bForce);
		var aIcons = this.getAggregation("_icons");
		var $Icons = this.$().children();

		function setMenuAriaOfIcon(iIdx) {
			aIcons[0].$()[iIdx == 0 ? "attr" : "removeAttr"]("aria-haspopup", iIdx == 0 ? "true" : undefined);
			aIcons[1].$()[iIdx == 1 ? "attr" : "removeAttr"]("aria-haspopup", iIdx == 1 ? "true" : undefined);
		}

		if (this._bFixedLayout && this._iLen == 1 && this._iCount == 2) {
			var aAllItems = this.getItems();
			if (aAllItems.length > 1 && aItems[0] === aAllItems[1]) {
				aItems[0]._syncIcon(aIcons[1]);
				jQuery($Icons.get(0)).toggleClass("sapUiTableActionHidden", true);
				jQuery($Icons.get(1)).toggleClass("sapUiTableActionHidden", false);
				setMenuAriaOfIcon(-1);
				this._aActions = ["", "action_fixed"];
				return;
			}
		}

		if (this._iLen == 0 || this._iCount == 0) {
			$Icons.toggleClass("sapUiTableActionHidden", true);
			setMenuAriaOfIcon(-1);
			this._aActions = ["", ""];
		} else if (this._iLen == 1 && this._iCount > 0) {
			aItems[0]._syncIcon(aIcons[0]);
			jQuery($Icons.get(0)).toggleClass("sapUiTableActionHidden", false);
			jQuery($Icons.get(1)).toggleClass("sapUiTableActionHidden", true);
			setMenuAriaOfIcon(-1);
			this._aActions = ["action", ""];
		} else if (this._iLen == 2 && this._iCount == 2) {
			aItems[0]._syncIcon(aIcons[0]);
			aItems[1]._syncIcon(aIcons[1]);
			$Icons.toggleClass("sapUiTableActionHidden", false);
			setMenuAriaOfIcon(-1);
			this._aActions = ["action", "action"];
		} else if (this._iLen > 2 && this._iCount == 2) {
			aItems[0]._syncIcon(aIcons[0]);
			aIcons[1].setSrc("sap-icon://overflow");
			aIcons[1].setTooltip(this._oResBundle.getText("TBL_ROW_ACTION_MORE"));
			$Icons.toggleClass("sapUiTableActionHidden", false);
			setMenuAriaOfIcon(1);
			this._aActions = ["action", "menu"];
		} else { // this._iLen > 2 && this._iCount == 1
			aIcons[0].setSrc("sap-icon://overflow");
			aIcons[0].setTooltip(this._oResBundle.getText("TBL_ROW_ACTION_MORE"));
			jQuery($Icons.get(0)).toggleClass("sapUiTableActionHidden", false);
			jQuery($Icons.get(1)).toggleClass("sapUiTableActionHidden", true);
			setMenuAriaOfIcon(0);
			this._aActions = ["menu", ""];
		}
	};

	return RowAction;

});
