/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.table.Row.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/model/Context', './TableUtils'],
	function(jQuery, Element, Context, TableUtils) {
	"use strict";


	/**
	 * Constructor for a new Row.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The row.
	 * @extends sap.ui.core.Element
	 * @version 1.56.16
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Row
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Row = Element.extend("sap.ui.table.Row", /** @lends sap.ui.table.Row.prototype */ { metadata : {

		library : "sap.ui.table",
		defaultAggregation : "cells",
		aggregations : {

			/**
			 * The controls for the cells.
			 */
			cells : {type : "sap.ui.core.Control", multiple : true, singularName : "cell"},

			/*
			 * Hidden aggregation for row actions
			 */
			_rowAction : {type : "sap.ui.table.RowAction", multiple: false, visibility: "hidden"},

			/*
			 * Hidden aggregation for the settings.
			 */
			_settings : {type : "sap.ui.table.RowSettings", multiple: false, visibility: "hidden"}
		}
	}});

	Row.prototype.init = function() {
		this.initDomRefs();
	};

	Row.prototype.exit = function() {
		this.initDomRefs();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control
	 */
	Row.prototype.getFocusInfo = function() {
		var oTable = this.getParent();
		return oTable ? oTable.getFocusInfo() : Element.prototype.getFocusInfo.apply(this, arguments);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control
	 */
	Row.prototype.applyFocusInfo = function(mFocusInfo) {
		var oTable = this.getParent();
		if (oTable) {
			oTable.applyFocusInfo(mFocusInfo);
		} else {
			Element.prototype.applyFocusInfo.apply(this, arguments);
		}
		return this;
	};

	/**
	 * @private
	 */
	Row.prototype.addStyleClass = function(sStyleClass) {
		jQuery(this.getDomRefs(false, true)).addClass(sStyleClass);
	};

	/**
	 * @private
	 */
	Row.prototype.removeStyleClass = function(sStyleClass) {
		jQuery(this.getDomRefs(false, true)).removeClass(sStyleClass);
	};

	/**
	 * @private
	 */
	Row.prototype.initDomRefs = function() {
		this._mDomRefs = {};
	};

	/**
	 * Returns the index of the row in the table or -1 if not added to a table. This
	 * function considers the scroll position of the table and also takes fixed rows and
	 * fixed bottom rows into account.
	 *
	 * @returns {int} index of the row (considers scroll position and fixed rows)
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Row.prototype.getIndex = function() {
		var oTable = this.getParent();
		if (oTable) {
			// get the index of the row in the aggregation
			var iRowIndex = oTable.indexOfRow(this);

			// check for fixed rows. In this case the index of the context is the same like the index of the row in the aggregation
			var iNumberOfFixedRows = oTable.getFixedRowCount();
			if (iNumberOfFixedRows > 0 && iRowIndex < iNumberOfFixedRows) {
				return iRowIndex;
			}

			// check for fixed bottom rows
			var iNumberOfFixedBottomRows = oTable.getFixedBottomRowCount();
			var iVisibleRowCount = oTable.getVisibleRowCount();
			if (iNumberOfFixedBottomRows > 0 && iRowIndex >= iVisibleRowCount - iNumberOfFixedBottomRows) {
				var iTotalRowCount = oTable._getTotalRowCount();
				if (iTotalRowCount >= iVisibleRowCount) {
					return iTotalRowCount - (iVisibleRowCount - iRowIndex);
				} else {
					return iRowIndex;
				}
			}

			return oTable._getFirstRenderedRowIndex() + iRowIndex;
		}
		return -1;
	};

	/**
	 * The basic {@link sap.ui.core.Element#getDomRef} only returns the main DOM reference. A row consists of multiple DOM elements, which are
	 * returned by this function, either as native DOM references or as jQuery objects. The first time this function is called the references are
	 * cached, and in subsequent calls retrieved from the cache. In case the DOM has changed, the cache has to be invalidated manually with
	 * {@link sap.ui.table.Row#initDomRefs}.
	 *
	 * @param {boolean} [bJQuery=false] If set to <code>true</code>, jQuery objects are returned, otherwise native DOM references.
	 * @param {boolean} [bCollection=false] If set to <code>true</code>, the DOM references will be returned as an array, otherwise as an object.
	 * @returns {Object|Array} An object (or array, if <code>bCollection</code> is true) containing jQuery objects, or native references to the DOM
	 *                         elements of the row.
	 * @see sap.ui.core.Element#getDomRef
	 * @see sap.ui.table.Row#initDomRefs
	 * @private
	 */
	Row.prototype.getDomRefs = function (bJQuery, bCollection) {
		var sKey = (bJQuery === true) ? "jQuery" : "dom",
			fnAccess = (bJQuery === true) ? jQuery.sap.byId : jQuery.sap.domById,
			mDomRefs = this._mDomRefs;

		if (!mDomRefs[sKey]) {
			mDomRefs[sKey] = {};
			var oTable = this.getParent();
			if (oTable) {
				var iRowIndex = oTable.indexOfRow(this);
				// row selector domRef
				mDomRefs[sKey].rowSelector = fnAccess(oTable.getId() + "-rowsel" + iRowIndex);
				// row action domRef
				mDomRefs[sKey].rowAction = fnAccess(oTable.getId() + "-rowact" + iRowIndex);
			}

			// row domRef
			mDomRefs[sKey].rowScrollPart = fnAccess(this.getId());
			// row domRef (the fixed part)
			mDomRefs[sKey].rowFixedPart = fnAccess(this.getId() + "-fixed");
			// row selector domRef
			mDomRefs[sKey].rowSelectorText = fnAccess(this.getId() + "-rowselecttext");

			if (bJQuery === true) {
				mDomRefs[sKey].row = mDomRefs[sKey].rowScrollPart;

				if (mDomRefs[sKey].rowFixedPart.length > 0) {
					mDomRefs[sKey].row = mDomRefs[sKey].row.add(mDomRefs[sKey].rowFixedPart);
				} else {
					// since this won't be undefined in jQuery case
					mDomRefs[sKey].rowFixedPart = undefined;
				}

				if (mDomRefs[sKey].rowSelector && mDomRefs[sKey].rowSelector.length > 0) {
					mDomRefs[sKey].row = mDomRefs[sKey].row.add(mDomRefs[sKey].rowSelector);
				} else {
					// since this won't be undefined in jQuery case
					mDomRefs[sKey].rowSelector = undefined;
				}

				if (mDomRefs[sKey].rowAction && mDomRefs[sKey].rowAction.length > 0) {
					mDomRefs[sKey].row = mDomRefs[sKey].row.add(mDomRefs[sKey].rowAction);
				} else {
					// since this won't be undefined in jQuery case
					mDomRefs[sKey].rowAction = undefined;
				}
			}
		}

		var mKeyDomRefs = mDomRefs[sKey];
		if (bCollection) {
			return Object.keys(mKeyDomRefs).map(function (sKey) {
				return mKeyDomRefs[sKey];
			}).filter(Boolean);
		}

		return mKeyDomRefs;
	};

	/**
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table
	 * @param {Object} mTooltipTexts texts for aria descriptions and tooltips
	 * @param {Object} mTooltipTexts.mouse texts for tooltips
	 * @param {String} mTooltipTexts.mouse.rowSelect text for row select tooltip (if row is unselected)
	 * @param {String} mTooltipTexts.mouse.rowDeselect text for row de-select tooltip (if row is selected)
	 * @param {Object} mTooltipTexts.keyboard texts for aria descriptions
	 * @param {String} mTooltipTexts.keyboard.rowSelect text for row select aria description (if row is unselected)
	 * @param {String} mTooltipTexts.keyboard.rowDeselect text for row de-select aria description (if row is selected)
	 * @param {Boolean} bSelectOnCellsAllowed set to true when the entire row may be clicked for selecting it
	 * @private
	 */
	Row.prototype._updateSelection = function(oTable, mTooltipTexts, bSelectOnCellsAllowed) {
		var bIsSelected = oTable.isIndexSelected(this.getIndex());
		var $DomRefs = this.getDomRefs(true);

		var sSelectReference = "rowSelect";
		if (bIsSelected) {
			// when the row is selected it must show texts how to deselect
			sSelectReference = "rowDeselect";
		}

		// update tooltips
		if ($DomRefs.rowSelector) {
			$DomRefs.rowSelector.attr("title", !this._bHidden ? mTooltipTexts.mouse[sSelectReference] : "");
		}

		if ($DomRefs.rowSelectorText) {
			var sText = "";
			if (!this._bHidden && !TableUtils.Grouping.isInSumRow($DomRefs.rowSelector) && !TableUtils.Grouping.isInGroupingRow($DomRefs.rowSelector)) {
				sText = mTooltipTexts.keyboard[sSelectReference];
			}
			$DomRefs.rowSelectorText.text(sText);
		}

		var $Row = $DomRefs.rowScrollPart;
		if ($DomRefs.rowFixedPart) {
			$Row = $Row.add($DomRefs.rowFixedPart);
		}

		if (bSelectOnCellsAllowed && !this._bHidden) {
			// the row requires a tooltip for selection if the cell selection is allowed
			$Row.attr("title", mTooltipTexts.mouse[sSelectReference]);
		} else {
			$Row.removeAttr("title");
		}

		if ($DomRefs.row) {
			// update visual selection state
			$DomRefs.row.toggleClass("sapUiTableRowSel", bIsSelected);
			oTable._getAccExtension().updateAriaStateOfRow(this, $DomRefs, bIsSelected);
		}
	};

	Row.prototype.setRowBindingContext = function(oContext, sModelName, oBinding) {
		var oNode;
		if (oContext && !(oContext instanceof Context)) {
			oNode = oContext;
			oContext = oContext.context;
		}

		var $rowTargets = this.getDomRefs(true).row;
		this._bHidden = !oContext;
		$rowTargets.toggleClass("sapUiTableRowHidden", this._bHidden);

		// collect rendering information for new binding context
		this._collectRenderingInformation(oContext, oNode, oBinding);

		this.setBindingContext(oContext, sModelName);
	};

	Row.prototype.setBindingContext = function(oContext, sModelName) {
		var bReturn = Element.prototype.setBindingContext.call(this, oContext || null, sModelName);

		this._updateTableCells(oContext);
		return bReturn;
	};

	Row.prototype._updateTableCells = function(oContext) {
		var oTable = this.getParent();

		if (!oTable) {
			return;
		}

		var aCells = this.getCells(),
			iAbsoluteRowIndex = this.getIndex(),
			bHasTableCellUpdate = !!oTable._updateTableCell,
			oCell, $Td, bHasCellUpdate;

		for (var i = 0; i < aCells.length; i++) {
			oCell = aCells[i];
			bHasCellUpdate = !!oCell._updateTableCell;
			$Td = bHasCellUpdate || bHasTableCellUpdate ? oCell.$().closest("td") : null;

			if (bHasCellUpdate) {
				oCell._updateTableCell(oCell, oContext, $Td, iAbsoluteRowIndex);
			}
			if (bHasTableCellUpdate) {
				oTable._updateTableCell(oCell, oContext, $Td, iAbsoluteRowIndex);
			}
		}
	};

	Row.prototype._collectRenderingInformation = function(oContext, oNode, oBinding) {
		// init node states
		this._oNodeState = undefined;
		this._iLevel = 0;
		this._bIsExpanded = false;
		this._bHasChildren = false;
		this._sTreeIconClass = "";

		if (oNode) {
			this._oNodeState = oNode.nodeState;
			this._iLevel = oNode.level;
			this._bIsExpanded = false;
			this._bHasChildren = false;
			this._sTreeIconClass = "sapUiTableTreeIconLeaf";
			this._sGroupIconClass = "";

			if (oBinding) {
				if (oBinding.getLevel) {
					//used by the "mini-adapter" in the TreeTable ClientTreeBindings
					this._bIsExpanded = oBinding.isExpanded(this.getIndex());
				} else if (oBinding.findNode) { // the ODataTreeBinding(Adapter) provides the hasChildren method for Tree
					this._bIsExpanded = this && this._oNodeState ? this._oNodeState.expanded : false;
				}

				if (oBinding.nodeHasChildren) {
					if (this._oNodeState) {
						this._bHasChildren = oBinding.nodeHasChildren(oNode);
					}
				} else if (oBinding.hasChildren) {
					this._bHasChildren = oBinding.hasChildren(oContext);
				}

				if (this._bHasChildren) {
					this._sTreeIconClass = this._bIsExpanded ? "sapUiTableTreeIconNodeOpen" : "sapUiTableTreeIconNodeClosed";
					this._sGroupIconClass = this._bIsExpanded ? "sapUiTableGroupIconOpen" : "sapUiTableGroupIconClosed";
				}
			}
		}
	};

	Row.prototype.destroy = function() {
		// when the row is destroyed, all its cell controls will be destroyed as well. Since
		// they shall be reused, the destroy function is overridden in order to remove the controls from the cell
		// aggregation. The column will take care to destroy all cell controls when the column is destroyed
		this.removeAllCells();
		return Element.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Creates a ghost of the row which will be used during drag and drop actions.
	 *
	 * @return {HTMLElement} The HTML element representing the drag ghost of the row.
	 * @private
	 */
	Row.prototype.getDragGhost = function() {
		var oTable = this.getParent();
		var oTableElement = oTable.getDomRef();
		var mRowAreas = this.getDomRefs();
		var oGhostElement;
		var oGhostAreaElement;
		var oRowElementClone;
		var iSelectedRowCount = oTable._getSelectedIndicesCount();

		function removeForbiddenAttributes(oElement) {
			oElement.removeAttribute("id");
			oElement.removeAttribute("data-sap-ui");
			oElement.removeAttribute("data-sap-ui-related");

			var iChildCount = oElement.children.length;
			for (var i = 0; i < iChildCount; i++) {
				removeForbiddenAttributes(oElement.children[i]);
			}
		}

		function cloneTableAndRow(oTableElement, oRowElement) {
			var oTableClone = oTableElement.cloneNode();
			var oTableHeadClone = oTableElement.querySelector("thead").cloneNode(true);
			var oTableBodyClone = oTableElement.querySelector("tbody").cloneNode();
			var oRowClone = oRowElement.cloneNode(true);

			oTableBodyClone.appendChild(oRowClone);
			oTableClone.appendChild(oTableHeadClone);
			oTableClone.appendChild(oTableBodyClone);

			return oTableClone;
		}

		oGhostElement = oTableElement.cloneNode();
		oGhostElement.classList.add("sapUiTableRowGhost");
		oGhostElement.classList.remove("sapUiTableVScr");
		oGhostElement.classList.remove("sapUiTableHScr");
		oGhostElement.style.width = oTableElement.getBoundingClientRect().width + "px";

		if (mRowAreas.rowSelector) {
			oGhostAreaElement = oTable.getDomRef("sapUiTableRowHdrScr").cloneNode();
			oRowElementClone = mRowAreas.rowSelector.cloneNode(true);

			oGhostAreaElement.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		if (mRowAreas.rowFixedPart) {
			oGhostAreaElement = oTable.getDomRef("sapUiTableCtrlScrFixed").cloneNode();
			oRowElementClone = cloneTableAndRow(oTable.getDomRef("table-fixed"), mRowAreas.rowFixedPart);

			oGhostAreaElement.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		if (mRowAreas.rowScrollPart) {
			var oScrollableColumnsContainer = oTable.getDomRef("sapUiTableCtrlScr");

			oGhostAreaElement = oScrollableColumnsContainer.cloneNode();
			oRowElementClone = cloneTableAndRow(oTable.getDomRef("table"), mRowAreas.rowScrollPart);

			oGhostAreaElement.appendChild(oTable.getDomRef("tableCtrlCnt").cloneNode());
			oGhostAreaElement.firstChild.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);

			// Copying the scroll position currently does not work.
			// The browser seems to "shift" the whole ghost to the right by the amount of pixels that is set for "scrollLeft".
			// Could work, if custom ghost handling is implemented in D&D.
			/*Promise.resolve().then(function(oGhostAreaElement, iScrollLeft) {
				// Needs to be done asynchronously, because the browser first needs to include this element into the layout.
				if (oGhostAreaElement) {
					oGhostAreaElement.scrollLeft = iScrollLeft;
				}
			}.bind(this, oGhostAreaElement, oScrollableColumnsContainer.scrollLeft));*/
		}

		if (mRowAreas.rowAction) {
			oGhostAreaElement = oTable.getDomRef("sapUiTableRowActionScr").cloneNode();
			oRowElementClone = mRowAreas.rowAction.cloneNode(true);

			oGhostAreaElement.appendChild(oRowElementClone);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		if (iSelectedRowCount > 1) {
			oGhostAreaElement = document.createElement("div");
			oGhostAreaElement.classList.add("sapUiTableRowGhostCount");

			var oCountElement = document.createElement("div");
			oCountElement.textContent = iSelectedRowCount;

			oGhostAreaElement.appendChild(oCountElement);
			oGhostElement.appendChild(oGhostAreaElement);
		}

		removeForbiddenAttributes(oGhostElement);

		return oGhostElement;
	};

	return Row;
});
