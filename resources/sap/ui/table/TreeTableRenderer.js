/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

//Provides default renderer for control sap.ui.table.TreeTable
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './TableRenderer'],
	function(jQuery, Renderer, TableRenderer) {
	"use strict";


	/**
	 * TreeTable renderer.
	 * @namespace
	 */
	var TreeTableRenderer = Renderer.extend(TableRenderer);


	TreeTableRenderer.renderTableCellControl = function(rm, oTable, oCell, iCellIndex) {
		if (oTable.isTreeBinding("rows") && iCellIndex === 0 && !oTable.getUseGroupMode()) {
			var oRow = oCell.getParent();
			rm.write("<span");
			rm.addClass("sapUiTableTreeIcon");
			rm.addClass(oCell.getParent()._sTreeIconClass);
			rm.writeAttribute("id", oRow.getId() + "-treeicon");
			rm.writeClasses();
			var aLevelIndentCSS = oTable._getLevelIndentCSS(oRow);
			if (aLevelIndentCSS) {
				rm.addStyle.apply(rm, aLevelIndentCSS);
				rm.writeStyles();
			}
			rm.writeAttribute("tabindex", -1);
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TREEICON", {row: oRow});
			rm.write("></span>");
		}
		rm.renderControl(oCell);
	};


	return TreeTableRenderer;

}, /* bExport= */ true);
