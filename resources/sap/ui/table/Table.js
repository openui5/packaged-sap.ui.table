/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.table.Table.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/IntervalTrigger', 'sap/ui/core/ScrollBar', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/theming/Parameters', 'sap/ui/model/SelectionModel', 'sap/ui/model/ChangeReason', './Row', './library', 'sap/ui/core/IconPool', 'jquery.sap.dom'],
	function(jQuery, Control, IntervalTrigger, ScrollBar, ItemNavigation, Parameters, SelectionModel, ChangeReason, Row, library, IconPool) {
	"use strict";



	/**
	 * Constructor for a new Table.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * <p>
	 *     Provides a comprehensive set of features for displaying and dealing with vast amounts of data. The Table control supports
	 *     desktop PCs and tablet devices. On tablets, special consideration should be given to the number of visible columns
	 *     and rows due to the limited performance of some devices.
	 * </p>
	 * <p>
	 *     In order to keep the document DOM as lean as possible, the Table control reuses its DOM elements of the rows.
	 *     When the user scrolls, only the row contexts are changed but the rendered controls remain the same. This allows
	 *     the Table control to handle huge amounts of data. Nevertheless, restrictions apply regarding the number of displayed
	 *     columns. Keep the number as low as possible to improve performance. Due to the nature of tables, the used
	 *     control for column templates also has a big influence on the performance.
	 * </p>
	 * <p>
	 *     The Table control relies completely on data binding, and its supported feature set is tightly coupled to
	 *     the data model and binding being used.
	 * </p>
	 *
	 *
	 * @extends sap.ui.core.Control
	 * @version 1.36.1
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Table
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = Control.extend("sap.ui.table.Table", /** @lends sap.ui.table.Table.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Width of the Table.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},

			/**
			 * Height of a row of the Table in pixel.
			 */
			rowHeight : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Height of the column header of the Table in pixel.
			 */
			columnHeaderHeight : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Flag whether the column header is visible or not.
			 */
			columnHeaderVisible : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Number of visible rows of the table.
			 */
			visibleRowCount : {type : "int", group : "Appearance", defaultValue : 10},

			/**
			 * First visible row.
			 */
			firstVisibleRow : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Selection mode of the Table. This property controls whether single or multiple rows can be selected and
			 * how the selection can be extended. It may also influence the visual appearance.
			 */
			selectionMode : {type : "sap.ui.table.SelectionMode", group : "Behavior", defaultValue : sap.ui.table.SelectionMode.Multi},

			/**
			 * Selection behavior of the Table. This property defines whether the row selector is displayed and whether the row, the row selector or both
			 * can be clicked to select a row.
			 */
			selectionBehavior : {type : "sap.ui.table.SelectionBehavior", group : "Behavior", defaultValue : sap.ui.table.SelectionBehavior.RowSelector},

			/**
			 * Zero-based index of selected item. Index value for no selection is -1.
			 * When multi-selection is enabled and multiple items are selected, the method returns
			 * the lead selected item. Sets the zero-based index of the currently selected item. This method
			 * removes any previous selections. When the given index is invalid, the call is ignored.
			 */
			selectedIndex : {type : "int", group : "Appearance", defaultValue : -1},

			/**
			 * Flag whether the controls of the Table are editable or not (currently this only controls the background color in certain themes!)
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Flag whether to use the scroll mode or paging mode. If the Paginator mode is used it will require the sap.ui.commons library!
			 */
			navigationMode : {type : "sap.ui.table.NavigationMode", group : "Behavior", defaultValue : sap.ui.table.NavigationMode.Scrollbar},

			/**
			 * The <code>threshold</code> defines how many additional (not yet visible records) shall be pre-fetched to enable smooth
			 * scrolling. The threshold is always added to the <code>visibleRowCount</code>. If the <code>visibleRowCount</code> is 10 and the
			 * <code>threshold</code> is 100, there will be 110 records fetched with the initial load.
			 * If the <code>threshold</code> is lower than the <code>visibleRowCount</code>, the <code>visibleRowCount</code> will be used as
			 * the <code>threshold</code>. If the value is 0 then the thresholding is disabled.
			 */
			threshold : {type : "int", group : "Appearance", defaultValue : 100},

			/**
			 * Flag to enable or disable column reordering
			 */
			enableColumnReordering : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Flag to enable or disable column grouping. (experimental!)
			 */
			enableGrouping : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Flag to show or hide the column visibility menu. This menu will get displayed in each
			 * generated column header menu. It allows to show or hide columns
			 */
			showColumnVisibilityMenu : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Flag whether to show the no data overlay or not once the table is empty. If set to false
			 * the table will just show a grid of empty cells
			 */
			showNoData : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * This defines how the table handles the visible rows in the table. The default behavior is,
			 * that a fixed row count is defined. If you change it to auto the visibleRowCount property is
			 * changed by the table automatically. It will then adjust its maximum row count to the space it is
			 * allowed to cover (limited by the surrounding container) and its minimum row count to the value of
			 * the property minAutoRowCount (default value : 5) In manual mode the user can change
			 * the visibleRowCount interactively.
			 * @since 1.9.2
			 * @see sap.ui.table.VisibleRowCountMode
			 */
			visibleRowCountMode : {type : "sap.ui.table.VisibleRowCountMode", group : "Appearance", defaultValue : sap.ui.table.VisibleRowCountMode.Fixed},

			/**
			 * This property is used to set the minimum count of visible rows when the property visibleRowCountMode is set to Auto or Interactive.
			 * For any other visibleRowCountMode, it is ignored.
			 */
			minAutoRowCount : {type : "int", group : "Appearance", defaultValue : 5},

			/**
			 * Number of columns that are fix on the left. When you use a horizontal scroll bar, only
			 * the columns which are not fixed, will scroll. Fixed columns need a defined width for the feature to work.
			 * Please note that the aggregated width of all fixed columns must not exceed the table width since there
			 * will be no scrollbar for fixed columns.
			 */
			fixedColumnCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Number of rows that are fix on the top. When you use a vertical scroll bar, only the rows which are not fixed, will scroll.
			 */
			fixedRowCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Number of rows that are fix on the bottom. When you use a vertical scroll bar, only the rows which are not fixed, will scroll.
			 * @since 1.18.7
			 */
			fixedBottomRowCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Flag whether to show or hide the column menu item to freeze or unfreeze a column.
			 * @since 1.21.0
			 */
			enableColumnFreeze : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Flag whether to enable or disable the context menu on cells to trigger a filtering with the cell value.
			 * @since 1.21.0
			 */
			enableCellFilter : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Setting this property to true will show an overlay on top of the Table content and users cannot click anymore on the Table content.
			 * @since 1.21.2
			 */
			showOverlay : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Specifies if a select all button should be displayed in the top left corner. This button is only displayed
			 * if the row selector is visible and the selection mode is set to any kind of multi selection.
			 * @since 1.23.0
			 */
			enableSelectAll : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Set this parameter to true to implement your own filter behaviour. Instead of the filter input box a button
			 * will be rendered for which' press event (customFilter) you can register an event handler.
			 * @since 1.23.0
			 */
			enableCustomFilter : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Set this parameter to true to make the table handle the busy indicator by its own.
			 * The table will switch to busy as soon as it scrolls into an unpaged area. This feature can only
			 * be used when the navigation mode is set to scrolling.
			 * @since 1.27.0
			 */
			enableBusyIndicator : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Flag to enable or disable column reordering
			 * @deprecated Since version 1.5.2.
			 * Use the property enableColumnReordering instead.
			 */
			allowColumnReordering : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

			/**
			 * This text is shown, in case there is no data available to be displayed in the Table and no custom noData control is set.
			 * @since 1.21.0
			 * @deprecated Since version 1.22.1.
			 * The aggregation noData also supports string values now. Use noData instead.
			 */
			noDataText : {type : "string", group : "Appearance", defaultValue : null, deprecated: true}
		},
		defaultAggregation : "columns",
		aggregations : {

			/**
			 * Control or text of title section of the Table (if not set it will be hidden)
			 */
			title : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

			/**
			 * Control or text of footer section of the Table (if not set it will be hidden)
			 */
			footer : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

			/**
			 * Toolbar of the Table (if not set it will be hidden)
			 */
			toolbar : {type : "sap.ui.core.Toolbar", multiple : false},

			/**
			 * Extension section of the Table (if not set it will be hidden)
			 */
			extension : {type : "sap.ui.core.Control", multiple : true, singularName : "extension"},

			/**
			 * Columns of the Table
			 */
			columns : {type : "sap.ui.table.Column", multiple : true, singularName : "column", bindable : "bindable"},

			/**
			 * Rows of the Table
			 */
			rows : {type : "sap.ui.table.Row", multiple : true, singularName : "row", bindable : "bindable"},

			/**
			 * The value for the noData aggregation can be either a string value or a control instance.
			 * The control is shown, in case there is no data for the Table available. In case of a string
			 * value this will simply replace the no data text.
			 */
			noData : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false}
		},
		associations : {

			/**
			 * Group By Column (experimental!)
			 */
			groupBy : {type : "sap.ui.table.Column", multiple : false}
		},
		events : {

			/**
			 * fired when the row selection of the table has been changed (the event parameters can be used to determine
			 * selection changes - to find out the selected rows you should better use the table selection API)
			 */
			rowSelectionChange : {
				parameters : {

					/**
					 * row index which has been clicked so that the selection has been changed (either selected or deselected)
					 */
					rowIndex : {type : "int"},

					/**
					 * binding context of the row which has been clicked so that selection has been changed
					 */
					rowContext : {type : "object"},

					/**
					 * array of row indices which selection has been changed (either selected or deselected)
					 */
					rowIndices : {type : "int[]"}
				}
			},

			/**
			 * fired when a column of the table has been selected
			 */
			columnSelect : {allowPreventDefault : true,
				parameters : {

					/**
					 * reference to the selected column
					 */
					column : {type : "sap.ui.table.Column"}
				}
			},

			/**
			 * fired when a table column is resized.
			 */
			columnResize : {allowPreventDefault : true,
				parameters : {

					/**
					 * resized column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * new width of the table column as CSS Size definition.
					 */
					width : {type : "sap.ui.core.CSSSize"}
				}
			},

			/**
			 * fired when a table column is moved.
			 */
			columnMove : {allowPreventDefault : true,
				parameters : {

					/**
					 * moved column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * new position of the column.
					 */
					newPos : {type : "int"}
				}
			},

			/**
			 * fired when the table is sorted.
			 */
			sort : {allowPreventDefault : true,
				parameters : {

					/**
					 * sorted column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * Sort Order
					 */
					sortOrder : {type : "sap.ui.table.SortOrder"},

					/**
					 * If column was added to sorter this is true. If new sort is started this is set to false
					 */
					columnAdded : {type : "boolean"}
				}
			},

			/**
			 * fired when the table is filtered.
			 */
			filter : {allowPreventDefault : true,
				parameters : {

					/**
					 * filtered column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * filter value.
					 */
					value : {type : "string"}
				}
			},

			/**
			 * fired when the table is grouped (experimental!).
			 */
			group : {allowPreventDefault : true,
				parameters : {
					/**
					 * grouped column.
					 */
					column : {type : "sap.ui.table.Column"}
				}
			},

			/**
			 * fired when the visibility of a table column is changed.
			 */
			columnVisibility : {allowPreventDefault : true,
				parameters : {

					/**
					 * affected column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * new value of the visible property.
					 */
					visible : {type : "boolean"}
				}
			},

			/**
			 * fired when the user clicks a cell of the table (experimental!).
			 * @since 1.21.0
			 */
			cellClick : {allowPreventDefault : true,
				parameters : {
					/**
					 * The control of the cell.
					 */
					cellControl : {type : "sap.ui.core.Control"},

					/**
					 * DOM reference of the clicked cell. Can be used to position the context menu.
					 */
					cellDomRef : {type : "Object"},

					/**
					 * Row index of the selected cell.
					 */
					rowIndex : {type : "int"},

					/**
					 * Column index of the selected cell. This is the index of visible columns and might differ from
					 * the index maintained in the column aggregation.
					 */
					columnIndex : {type : "int"},

					/**
					 * Column ID of the selected cell.
					 */
					columnId : {type : "string"},

					/**
					 * Row binding context of the selected cell.
					 */
					rowBindingContext : {type : "sap.ui.model.Context"}
				}
			},

			/**
			 * fired when the user clicks a cell of the table.
			 * @since 1.21.0
			 */
			cellContextmenu : {allowPreventDefault : true,
				parameters : {
					/**
					 * The control of the cell.
					 */
					cellControl : {type : "sap.ui.core.Control"},

					/**
					 * DOM reference of the clicked cell. Can be used to position the context menu.
					 */
					cellDomRef : {type : "Object"},

					/**
					 * Row index of the selected cell.
					 */
					rowIndex : {type : "int"},

					/**
					 * Column index of the selected cell. This is the index of visible columns and might differ from
					 * the index maintained in the column aggregation.
					 */
					columnIndex : {type : "int"},

					/**
					 * Column ID of the selected cell.
					 */
					columnId : {type : "string"},

					/**
					 * Row binding context of the selected cell.
					 */
					rowBindingContext : {type : "sap.ui.model.Context"}
				}
			},

			/**
			 * fired when a column of the table should be freezed
			 * @since 1.21.0
			 */
			columnFreeze : {allowPreventDefault : true,
				parameters : {

					/**
					 * reference to the column to freeze
					 */
					column : {type : "sap.ui.table.Column"}
				}
			},

			/**
			 * This event is triggered when the custom filter item of the column menu is pressed. The column on which the event was triggered is passed as parameter.
			 * @since 1.23.0
			 */
			customFilter : {
				/**
				 * The column instance on which the custom filter button was pressed.
				 */
				column : {type : "sap.ui.table.Column"},

				/**
				 * Filter value.
				 */
				value : {type : "string"}
			}
		}
	}});
































	// =============================================================================
	// BASIC CONTROL API
	// =============================================================================

	Table.ResizeTrigger = new IntervalTrigger(300);

	IconPool.insertFontFaceStyle();

	/**
	 * Initialization of the Table control
	 * @private
	 */
	Table.prototype.init = function() {
		this._iBaseFontSize = parseFloat(jQuery("body").css("font-size")) || 16;
		// create an information object which contains always required infos
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");
		this._bAccMode = sap.ui.getCore().getConfiguration().getAccessibility();
		this._bRtlMode = sap.ui.getCore().getConfiguration().getRTL();

		// basic selection model (by default the table uses multi selection)
		this._initSelectionModel(sap.ui.model.SelectionModel.MULTI_SELECTION);

		// minimum width of a table column in pixel:
		// should at least be larger than the paddings for cols and cells!
		this._iColMinWidth = 20;
		if ('ontouchstart' in document) {
			this._iColMinWidth = 88;
		}

		this._oCalcColumnWidths = [];

		// columns to cells map
		this._aIdxCols2Cells = [];

		// visible columns
		this._aVisibleColumns = [];

		// we add a delegate to enable to focus the scrollbar when clicking on them
		// to avoid that the table control grabs the focus and scrolls to the focus
		// element (hide the outline)
		var fnFocusIndex = {
			onAfterRendering: function(oEvent) {
				oEvent.srcControl.$("sb").attr("tabindex", "-1").css("outline", "none");
			}
		};

		// vertical scrollbar
		this._oVSb = new ScrollBar(this.getId() + "-vsb", {size: "100%"});

		//
		// Optimization for large tables: scroll event is fired only by mouse up.
		//
		// TODO: decide if to switch this dynamically or via API
		this._oVSb._bLargeDataScrolling = false;

		this._oVSb.attachScroll(this.onvscroll, this);
		this._oVSb.addDelegate(fnFocusIndex);

		// horizontal scrollbar (configure by default for the pixel mode)
		this._oHSb = new ScrollBar(this.getId() + "-hsb", {size: "100%", contentSize: "0px", vertical: false});
		this._oHSb.attachScroll(this.onhscroll, this);
		this._oHSb.addDelegate(fnFocusIndex);

		// action mode flag (for keyboard navigation)
		this._bActionMode = false;

		// column index of the last fixed column (to prevent column reordering!)
		this._iLastFixedColIndex = -1;

		// flag whether the editable property should be inherited or not
		this._bInheritEditableToControls = false;

		// text selection for column headers?
		this._bAllowColumnHeaderTextSelection = false;

		// flag, whether to call _updateTableCell on cell control or not?
		this._bCallUpdateTableCell = false;

		// timer delay in ms
		this._iTimerDelay = 250;

		this._doubleclickDelay = 300;
		this._clicksRegistered = 0;

		// determine whether jQuery version is less than 1.8 (height and width behaves different!!)
		this._bjQueryLess18 = jQuery.sap.Version(jQuery.fn.jquery).compareTo("1.8") < 0;
		this._iDataRequestedCounter = 0;
		this._bDataRequestedListenersAttached = false;

		// F6 Handling is done in TableRenderer to make sure the table content gets the focus. The
		// Toolbar has its own F6 stop.
		// this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};


	/**
	 * Termination of the Table control
	 * @private
	 */
	Table.prototype.exit = function() {
		// destroy the child controls
		this._oVSb.destroy();
		this._oHSb.destroy();
		if (this._oPaginator) {
			this._oPaginator.destroy();
		}
		// destroy helpers
		this._destroyItemNavigation();
		// cleanup
		this._cleanUpTimers();
		this._detachEvents();
	};


	/**
	 * theme changed
	 * @private
	 */
	Table.prototype.onThemeChanged = function() {
		if (this.getDomRef()) {
			this.invalidate();
		}
	};


	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onBeforeRendering = function() {
		this._cleanUpTimers();
		this._detachEvents();
	};


	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onAfterRendering = function() {
		this._bOnAfterRendering = true;

		var $this = this.$();

		if ('ontouchstart' in document) {
			$this.addClass("sapUiTableTouch");
		}

		this._renderOverlay();
		this._updateVSb(true);
		this._updateTableContent();
		this._handleResize();

		this._attachEvents();

		// restore the column icons
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			if (aCols[i].getVisible()) {
				aCols[i]._restoreIcons();
			}
		}

		// enable/disable text selection for column headers
		if (!this._bAllowColumnHeaderTextSelection) {
			this._disableTextSelection($this.find(".sapUiTableColHdrCnt"));
		}

		this._bOnAfterRendering = false;

		this._initItemNavigation();

		if (this._bDetermineVisibleCols === true) {
			this._determineVisibleCols();
			this._bDetermineVisibleCols = false;
		}
	};

	/**
	 * Render overlay div
	 * @private
	 */
	Table.prototype._renderOverlay = function() {
		var $this = this.$(),
		    $overlay = $this.find(".sapUiTableOverlay"),
		    bShowOverlay = this.getShowOverlay();
		if (bShowOverlay && $overlay.length === 0) {
			$overlay = jQuery("<div>").addClass("sapUiOverlay sapUiTableOverlay").css("z-index", "1");
			$this.append($overlay);
		} else if (!bShowOverlay) {
			$overlay.remove();
		}
	};

	Table.prototype.setShowOverlay = function(bShow) {
		this.setProperty("showOverlay", bShow, true);
		this._renderOverlay();
		return this;
	};

	/**
	 * update the table content (scrollbar, no data overlay, selection, row header, ...)
	 * @private
	 */
	Table.prototype._updateTableContent = function() {

		// show or hide the no data container
		this._updateNoData();

		// update the selection visualization
		this._updateSelection();

		// update the rows (TODO: generalize this for 1.6)
		if (this._modifyRow) {
			jQuery.each(this.getRows(), function(iIndex, oRow) {
				this._modifyRow(iIndex + this.getFirstVisibleRow(), oRow.$());
				this._modifyRow(iIndex + this.getFirstVisibleRow(), oRow.$("fixed"));
			}.bind(this));
		}

		var oBinding = this.getBinding("rows");
		var iFixedTopRows = this.getFixedRowCount();
		var iFixedBottomRows = this.getFixedBottomRowCount();
		var iVisibleRowCount = this.getVisibleRowCount();

		jQuery.each(this.getRows(), function(iIndex, oRow) {
			var $rowDomRefs = oRow.getDomRefs(true);

			// update row header tooltip
			if (oRow.getBindingContext() && this._isRowSelectable(oRow.getIndex())) {
				$rowDomRefs.rowSelector.attr("title", this._oResBundle.getText("TBL_ROW_SELECT"));
			} else {
				$rowDomRefs.rowSelector.attr("title", "");
			}

			if (iFixedTopRows > 0) {
				$rowDomRefs.row.toggleClass("sapUiTableFixedTopRow", iIndex < iFixedTopRows);
				$rowDomRefs.row.toggleClass("sapUiTableFixedLastTopRow", iIndex == iFixedTopRows - 1);
			}

			if (iFixedBottomRows > 0) {
				var bIsPreBottomRow = false;
				if (oBinding) {
					if (oBinding.getLength() >= iVisibleRowCount) {
						bIsPreBottomRow = (iIndex == iVisibleRowCount - iFixedBottomRows - 1);
					} else {
						bIsPreBottomRow = (this.getFirstVisibleRow() + iIndex) == (oBinding.getLength() - iFixedBottomRows - 1) && (this.getFirstVisibleRow() + iIndex) < oBinding.getLength();
					}
				}

				$rowDomRefs.row.toggleClass("sapUiTableFixedPreBottomRow", bIsPreBottomRow);
			}
		}.bind(this));

		// update the row header (sync row heights)
		this._updateRowHeader();

		// hook for update table cell after rendering is complete
		if (this._bOnAfterRendering && (this._bCallUpdateTableCell || typeof this._updateTableCell === "function")) {
			var oBindingInfo = this.mBindingInfos["rows"];
			jQuery.each(this.getRows(), function(iIndex, oRow) {
				var iAbsoluteRowIndex = this.getFirstVisibleRow() + iIndex; //get the absolute row index

				jQuery.each(oRow.getCells(), function(iIndex, oCell) {
					if (oCell._updateTableCell) {
						oCell._updateTableCell(oCell /* cell control */,
						                       oCell.getBindingContext(oBindingInfo && oBindingInfo.model) /* cell context */,
						                       oCell.$().closest("td") /* jQuery object for td */,
						                       iAbsoluteRowIndex);
					}
					if (this._updateTableCell) {
						this._updateTableCell(oCell /* cell control */,
						                       oCell.getBindingContext(oBindingInfo && oBindingInfo.model) /* cell context */,
						                       oCell.$().closest("td") /* jQuery object for td */,
						                       iAbsoluteRowIndex);
					}
				});
			}.bind(this));
		}
	};


	// =============================================================================
	// ITEMNAVIGATION
	// =============================================================================


	/**
	 * initialize ItemNavigation. Transfer relevant controls to ItemNavigation.
	 * TabIndexes are set by ItemNavigation
	 * @private
	*/
	Table.prototype._initItemNavigation = function() {

		var $this = this.$();
		var iColumnCount = this._getVisibleColumnCount();
		var iTotalColumnCount = iColumnCount;
		var bHasRowHeader = this.getSelectionMode() !== sap.ui.table.SelectionMode.None && this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly;

		// initialization of item navigation for the Column Headers
		if (!this._oColHdrItemNav) {
			this._oColHdrItemNav = new ItemNavigation();
			this._oColHdrItemNav.setCycling(false);
			this.addDelegate(this._oColHdrItemNav);
		}

		// create the list of item dom refs
		var aItemDomRefs = [];
		if (this.getFixedColumnCount() == 0) {
			aItemDomRefs = $this.find(".sapUiTableCtrl td[tabindex]").get();
		} else {
			var $topLeft = this.$().find('.sapUiTableCtrlFixed.sapUiTableCtrlRowFixed');
			var $topRight = this.$().find('.sapUiTableCtrlScroll.sapUiTableCtrlRowFixed');
			var $middleLeft = this.$().find('.sapUiTableCtrlFixed.sapUiTableCtrlRowScroll');
			var $middleRight = this.$().find('.sapUiTableCtrlScroll.sapUiTableCtrlRowScroll');
			var $bottomLeft = this.$().find('.sapUiTableCtrlFixed.sapUiTableCtrlRowFixedBottom');
			var $bottomRight = this.$().find('.sapUiTableCtrlScroll.sapUiTableCtrlRowFixedBottom');
			for (var i = 0; i < this.getVisibleRowCount(); i++) {
				aItemDomRefs = aItemDomRefs.concat($topLeft.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
				aItemDomRefs = aItemDomRefs.concat($topRight.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
				aItemDomRefs = aItemDomRefs.concat($middleLeft.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
				aItemDomRefs = aItemDomRefs.concat($middleRight.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
				aItemDomRefs = aItemDomRefs.concat($bottomLeft.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
				aItemDomRefs = aItemDomRefs.concat($bottomRight.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
			}
		}

		// to later determine the position of the first TD in the aItemDomRefs we keep the
		// count of TDs => aCount - TDs = first TD (add the row headers to the TD count / except the first one!)
		var iTDCount = aItemDomRefs.length;
		var iInitialIndex = 0;

		// add the row header items (if visible)
		if (bHasRowHeader) {
			var aRowHdrDomRefs = $this.find(".sapUiTableRowHdr").get();
			for (var i = aRowHdrDomRefs.length - 1; i >= 0; i--) {
				aItemDomRefs.splice(i * iColumnCount, 0, aRowHdrDomRefs[i]);
				// we ignore the row headers
				iTDCount++;
			}
			// except the first row header
			iTDCount--;
			// add the row header to the column count
			iTotalColumnCount++;
			iInitialIndex = 1;
		}

		// add the column items
		if (this.getColumnHeaderVisible()) {
			aItemDomRefs = $this.find(".sapUiTableCol").get().concat(aItemDomRefs);
		}

		// add the select all item
		if (bHasRowHeader && this.getColumnHeaderVisible()) {
			var aRowHdr = $this.find(".sapUiTableColRowHdr").get();
			for (var i = this._getHeaderRowCount() - 1; i >= 0; i--) {
				aItemDomRefs.splice(i * iColumnCount, 0, aRowHdr[0]);
			}
		}

		// initialization of item navigation for the Table control
		if (!this._oItemNavigation) {
			this._iLastSelectedDataRow = this._getHeaderRowCount();
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.setTableMode(true);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BeforeFocus, function(oEvent) {
				this.$("ariadesc").text("");
			}, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, function(oEvent) {
				var iRow = Math.floor(oEvent.getParameter("index") / this._oItemNavigation.iColumns);
				if (iRow > 0) {
					this._iLastSelectedDataRow = iRow;
				}
			}, this);
			this.addDelegate(this._oItemNavigation);
		}

		// configure the item navigation
		this._oItemNavigation.setColumns(iTotalColumnCount);
		this._oItemNavigation.setRootDomRef($this.find(".sapUiTableCnt").get(0));
		this._oItemNavigation.setItemDomRefs(aItemDomRefs);
		this._oItemNavigation.setFocusedIndex(iInitialIndex);

	};

	/**
	 * destroys ItemNavigation
	 * @private
	*/
	Table.prototype._destroyItemNavigation = function() {

		// destroy of item navigation for the Table control
		if (this._oItemNavigation) {
			this._oItemNavigation.destroy();
			this._oItemNavigation = undefined;
		}

	};


	/*
	 * @see JSDoc generated by SAPUI5 control
	 */
	Table.prototype.getFocusInfo = function() {
		var sId = this.$().find(":focus").attr("id");
		if (sId) {
			return {customId: sId};
		} else {
			return sap.ui.core.Element.prototype.getFocusInfo.apply(this, arguments);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control
	 */
	Table.prototype.applyFocusInfo = function(mFocusInfo) {
		if (mFocusInfo && mFocusInfo.customId) {
			this.$().find("#" + mFocusInfo.customId).focus();
		} else {
			sap.ui.core.Element.prototype.getFocusInfo.apply(this, arguments);
		}
		return this;
	};


	// =============================================================================
	// PUBLIC TABLE API
	// =============================================================================


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setTitle = function(vTitle) {
		var oTitle = vTitle;
		if (typeof (vTitle) === "string" || vTitle instanceof String) {
			oTitle = sap.ui.table.TableHelper.createTextView({
				text: vTitle,
				width: "100%"
			});
			oTitle.addStyleClass("sapUiTableHdrTitle");
		}
		this.setAggregation("title", oTitle);
		return this;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFooter = function(vFooter) {
		var oFooter = vFooter;
		if (typeof (vFooter) === "string" || vFooter instanceof String) {
			oFooter = sap.ui.table.TableHelper.createTextView({
				text: vFooter,
				width: "100%"
			});
		}
		this.setAggregation("footer", oFooter);
		return this;
	};


	/**
	 * Sets the selection mode. The current selection is lost.
	 * @param {string} sSelectionMode the selection mode, see sap.ui.table.SelectionMode
	 * @public
	 * @return a reference on the table for chaining
	 */
	Table.prototype.setSelectionMode = function(sSelectionMode) {
		this.clearSelection();
		if (sSelectionMode === sap.ui.table.SelectionMode.Single) {
			this._oSelection.setSelectionMode(SelectionModel.SINGLE_SELECTION);
		} else {
			this._oSelection.setSelectionMode(SelectionModel.MULTI_SELECTION);
		}
		this.setProperty("selectionMode", sSelectionMode);
		return this;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFirstVisibleRow = function(iRowIndex, bOnScroll) {
		// TODO: think about this optimization - for now it doesn't work since
		//       this API is used to update the rows afterwards
		//if (iRowIndex !== this.getFirstVisibleRow()) {
			// update the property

			this.setProperty("firstVisibleRow", iRowIndex, true);
			// update the bindings:
			//  - prevent the rerendering
			//  - use the databinding fwk to update the content of the rows
			if (this.getBinding("rows") && !this._bRefreshing) {
				this.updateRows();
			}

			this._updateAriaRowOfRowsText(true);

		if (bOnScroll && !this._$AriaLiveDomRef && this._bAccMode) {
			if (this._ariaLiveTimer) {
				jQuery.sap.clearDelayedCall(this._ariaLiveTimer);
			}

			var fnSetAriaLive = function() {
				if (this._oItemNavigation) {
					this._$AriaLiveDomRef = jQuery(this._oItemNavigation.getFocusedDomRef()).attr("aria-live", "rude");
					var oTable = this;
					var fnRemoveAriaLive = function () {
						if (oTable._$AriaLiveDomRef) {
							oTable._$AriaLiveDomRef.removeAttr("aria-live");
							delete oTable._$AriaLiveDomRef;
						}
					};
					jQuery.sap.delayedCall(0, this, fnRemoveAriaLive);
					delete this._ariaLiveTimer;
				}
			};

			this._ariaLiveTimer = jQuery.sap.delayedCall(60, this, fnSetAriaLive);
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.getAllowColumnReordering = function() {
		jQuery.sap.log.warning("getAllowColumnReordering is deprecated - please use getEnableColumnReordering!");
		return Table.prototype.getEnableColumnReordering.apply(this, arguments);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setAllowColumnReordering = function() {
		jQuery.sap.log.warning("setAllowColumnReordering is deprecated - please use setEnableColumnReordering!");
		return Table.prototype.setEnableColumnReordering.apply(this, arguments);
	};


	// enable calling 'bindAggregation("rows")' without a factory
	Table.getMetadata().getAggregation("rows")._doesNotRequireFactory = true;

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.bindRows = function(oBindingInfo, vTemplate, oSorter, aFilters) {
		// ensure old Table API compatibility (sPath, [oSorter], [aFilters])
		if (typeof oBindingInfo === "string" &&
			  (vTemplate instanceof sap.ui.model.Sorter || jQuery.isArray(oSorter) && oSorter[0] instanceof sap.ui.model.Filter) ) {
			aFilters = oSorter;
			oSorter = vTemplate;
			vTemplate = undefined;
		}

		return this.bindAggregation("rows", oBindingInfo, vTemplate, oSorter, aFilters);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype._bindAggregation = function(sName, sPath, oTemplate, oSorter, aFilters) {
		sap.ui.core.Element.prototype._bindAggregation.apply(this, arguments);
		var oBinding = this.getBinding("rows");
		if (sName === "rows" && oBinding) {
			oBinding.attachChange(this._onBindingChange, this);
		}

		// re-initialize the selection model, might be necessary in case the table gets "rebound"
		this._initSelectionModel(sap.ui.model.SelectionModel.MULTI_SELECTION);

		// currently only required for TreeBindings, will be relevant for ListBindings later
		if (oBinding && this.isTreeBinding("rows") && !oBinding.hasListeners("selectionChanged")) {
			oBinding.attachSelectionChanged(this._onSelectionChanged, this);
		}
		return this;
	};

	/**
	 * Initialises a new selection model for the Table instance.
	 * @param {sap.ui.model.SelectionModel.MULTI_SELECTION|sap.ui.model.SelectionModel.SINGLE_SELECTION} sSelectionMode the selection mode of the selection model
	 * @return {sap.ui.table.Table} the table instance for chaining
	 * @private
	 */
	Table.prototype._initSelectionModel = function (sSelectionMode) {
		// detach old selection model event handler
		if (this._oSelection) {
			this._oSelection.detachSelectionChanged(this._onSelectionChanged, this);
		}
		//new selection model with the currently set selection mode
		this._oSelection = new sap.ui.model.SelectionModel(sSelectionMode);
		this._oSelection.attachSelectionChanged(this._onSelectionChanged, this);

		return this;
	};

	/**
	 * handler for change events of the binding
	 * @param {sap.ui.base.Event} oEvent change event
	 * @private
	 */
	Table.prototype._onBindingChange = function(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;
		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
			this.setFirstVisibleRow(0);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.unbindAggregation = function(sName, bSuppressReset) {
		var oBinding = this.getBinding("rows");
		if (sName === "rows" && oBinding) {
			oBinding.detachChange(this._onBindingChange);
			//Reset needs to be resetted, else destroyRows is called, which is not allowed to be called
			bSuppressReset = true;
			this._restoreAppDefaultsColumnHeaderSortFilter();
			// metadata might have changed
			this._invalidateColumnMenus();
			this.updateRows(); // TODO: shouldn't this be more a central feature?!
		}

		return sap.ui.core.Element.prototype.unbindAggregation.apply(this, [sName, bSuppressReset]);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setVisibleRowCountMode = function(oVisibleRowCountMode) {
		this.setProperty("visibleRowCountMode", oVisibleRowCountMode);
		this._handleRowCountMode();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setVisibleRowCount = function(iVisibleRowCount) {
		if (iVisibleRowCount != null && !isFinite(iVisibleRowCount)) {
			return this;
		}

		if (iVisibleRowCount <= (this.getFixedRowCount() + this.getFixedBottomRowCount())) {
			jQuery.sap.log.error("Table: " + this.getId() + " visibleRowCount('" + iVisibleRowCount + "') must be bigger than number of fixed rows('" + (this.getFixedRowCount() + this.getFixedBottomRowCount()) + "')");
			return this;
		}

		iVisibleRowCount = this.validateProperty("visibleRowCount", iVisibleRowCount);
		if (this.getBinding("rows") && this.getBinding("rows").getLength() <= iVisibleRowCount) {
			this.setProperty("firstVisibleRow", 0);
		}
		this.setProperty("visibleRowCount", iVisibleRowCount);
		return this;
	};

	/**
	 * Sets a new tooltip for this object. The tooltip can either be a simple string
	 * (which in most cases will be rendered as the <code>title</code> attribute of this
	 * Element) or an instance of {@link sap.ui.core.TooltipBase}.
	 *
	 * If a new tooltip is set, any previously set tooltip is deactivated.
	 *
	 * Please note that tooltips are not rendered for the table. The tooltip property will be set
	 * but it won't effect the DOM.
	 *
	 * @param {string|sap.ui.core.TooltipBase} vTooltip
	 * @returns {sap.ui.table.Table} This-reference for chaining
	 * @public
	 * @override
	 */
	Table.prototype.setTooltip = function(vTooltip) {
		jQuery.sap.log.warning("The aggregation tooltip is not supported for sap.ui.table.Table");
		return this.setAggregation("tooltip", vTooltip, true);
	};

	/**
	 * refresh rows
	 * @private
	 */
	Table.prototype.refreshRows = function(sReason) {
		this._attachBindingListener();
		this._bBusyIndicatorAllowed = true;
		//needs to be called here to reset the firstVisible row so that the correct data is fetched
		this._bRefreshing = true;
		this._onBindingChange(sReason);
		this._updateBindingContexts(true);
		this._bRefreshing = false;
	};

	/**
	 * updates the rows - called internally by the updateAggregation function when
	 * anything in the model has been changed.
	 * @private
	 */
	Table.prototype.updateRows = function(sReason) {
		this._setBusy(sReason ? {changeReason: sReason} : false);

		// by default the start index is the first visible row
		var iStartIndex = this.getFirstVisibleRow();

		// calculate the boundaries (at least 0 - max the row count - visible row count)
		iStartIndex = Math.max(iStartIndex, 0);
		if (this.getNavigationMode() === sap.ui.table.NavigationMode.Scrollbar && this._getRowCount() > 0) {
			iStartIndex = Math.min(iStartIndex, Math.max(this._getRowCount() - this.getVisibleRowCount(), 0));
		}
		this.setProperty("firstVisibleRow", iStartIndex, true);

		// when not scrolling we update also the scroll position of the scrollbar
		if (this._oVSb.getScrollPosition() !== iStartIndex) {
			this._oVSb.setScrollPosition(iStartIndex);
			this._updateAriaRowOfRowsText(true);
		}

		// update the paginator
		if (this._oPaginator && this.getNavigationMode() === sap.ui.table.NavigationMode.Paginator) {
			// if iStartIndex is equal or greater than the number of total rows go back to page 1
			var iNewPage = 1;
			if (iStartIndex < this.getBinding("rows").getLength()) {
				iNewPage = Math.ceil((iStartIndex + 1) / this.getVisibleRowCount());
			}
			if (iNewPage !== this._oPaginator.getCurrentPage()) {
				this.setProperty("firstVisibleRow", (iNewPage - 1) * this.getVisibleRowCount(), true);
				this._oPaginator.setCurrentPage(iNewPage);
				if (this._oPaginator.getDomRef()) {
					this._oPaginator.rerender();
				}
			}
		}

		// update the bindings only once the table is rendered
		if (this.getDomRef()) {
			// update the bindings by using a delayed mechanism to avoid to many update
			// requests: by using the mechanism below it will trigger an update each 50ms
			// except if the reason is coming from the binding with reason "change" then
			// we do an immediate update instead of a delayed one
			var iDelay = (sReason == ChangeReason.Change ? 0 : 50);
			this._sBindingTimer = this._sBindingTimer || jQuery.sap.delayedCall(iDelay, this, function() {
				// update only if control not marked as destroyed (could happen because updateRows is called during destroying the table)
				if (!this.bIsDestroyed) {
					this._determineVisibleCols();
					this._updateBindingContexts();
					this._updateVSb(); // this was moved here, before it was done before updatebindingContext
					this._updateTableContent();
					this._sBindingTimer = undefined;
					//Helper event for testing
					this.fireEvent("_rowsUpdated");
				}
			});
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertRow = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addRow = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeRow = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllRows = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.destroyRows = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!");
	};

	/**
	 * triggers automatic resizing of a column to the widest content.(experimental!)
	 * @experimental Experimental! Presently implemented to only work with pure text-based controls,
	 * the sap.ui.commons.Checkbox and sap.m.Image as well as sap.ui.commons.Image.
	 * It will also work for most simple input fields (TextField, CheckBox, but not ComboBox)
	 *
	 * @param {int} iColId column id
	 * @function
	 * @public
	 */
	Table.prototype.autoResizeColumn = function(iColId) {
		var oCol = this.getColumns()[iColId];
		this._iColumnResizeStart = null;
		var iNewWidth = this._calculateAutomaticColumnWidth(iColId);
		if (iNewWidth == null) {
			return;
		}

		oCol._iNewWidth = iNewWidth;
		this._oCalcColumnWidths[iColId] = oCol._iNewWidth;
		this._onColumnResized(null, iColId);
	};


	// =============================================================================
	// EVENT HANDLING & CLEANUP
	// =============================================================================

	/**
	 * attaches the required native event handlers
	 * @private
	 */
	Table.prototype._attachEvents = function() {

		var $this = this.$();

		// listen to the scroll events of the containers (for keyboard navigation)
		$this.find(".sapUiTableColHdrScr").scroll(jQuery.proxy(this._oncolscroll, this));
		$this.find(".sapUiTableCtrlScr").scroll(jQuery.proxy(this._oncntscroll, this));
		$this.find(".sapUiTableCtrlScrFixed").scroll(jQuery.proxy(this._oncntscroll, this));

		// sync row header > content (hover effect)
		$this.find(".sapUiTableRowHdr").hover(function() {
			jQuery(this).addClass("sapUiTableRowHvr");
			var iIndex = $this.find(".sapUiTableRowHdr").index(this);
			$this.find(".sapUiTableCtrlFixed > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
		}, function() {
			jQuery(this).removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlFixed > tbody > tr").removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").removeClass("sapUiTableRowHvr");
		});

		// sync content fixed > row header (hover effect)
		$this.find(".sapUiTableCtrlFixed > tbody > tr").hover(function() {
			jQuery(this).addClass("sapUiTableRowHvr");
			var iIndex = $this.find(".sapUiTableCtrlFixed > tbody > tr").index(this);
			$this.find(".sapUiTableRowHdr").filter(":eq(" + (iIndex) + ")").addClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
		}, function() {
			jQuery(this).removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableRowHdr").removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").removeClass("sapUiTableRowHvr");
		});

		// sync content scroll > row header (hover effect)
		$this.find(".sapUiTableCtrlScroll > tbody > tr").hover(function() {
			jQuery(this).addClass("sapUiTableRowHvr");
			var iIndex = $this.find(".sapUiTableCtrlScroll > tbody > tr").index(this);
			$this.find(".sapUiTableRowHdr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlFixed > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
		}, function() {
			jQuery(this).removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableRowHdr").removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlFixed > tbody > tr").removeClass("sapUiTableRowHvr");
		});

		// listen to the resize handlers
		$this.find(".sapUiTableColRsz").mousedown(jQuery.proxy(this._onColumnResizeStart, this));

		this._enableColumnAutoResizing();
		Table.ResizeTrigger.addListener(this._checkTableSize, this);

		// the vertical scrollbar listens to the mousewheel on the content section
		this._oHSb.bind($this.find(".sapUiTableCtrlScr").get(0));
		this._oVSb.bind($this.find(".sapUiTableCtrlScr").get(0));
		this._oHSb.bind($this.find(".sapUiTableCtrlScrFixed").get(0));
		this._oVSb.bind($this.find(".sapUiTableCtrlScrFixed").get(0));
		this._oVSb.bind($this.find(".sapUiTableRowHdrScr").get(0));

		jQuery("body").bind('webkitTransitionEnd transitionend',
			jQuery.proxy(function(oEvent) {
				if (jQuery(oEvent.target).has($this).length > 0) {
					this._handleResize();
				}
			}, this));
	};


	/**
	 * detaches the required native event handlers
	 * @private
	 */
	Table.prototype._detachEvents = function() {

		var $this = this.$();

		$this.find(".sapUiTableRowHdrScr").unbind();
		$this.find(".sapUiTableColHdrScr").unbind();

		$this.find(".sapUiTableCtrl > tbody > tr").unbind();
		$this.find(".sapUiTableRowHdr").unbind();

		Table.ResizeTrigger.removeListener(this._checkTableSize, this);

		$this.find(".sapUiTableColRsz").unbind();

		this._oHSb.unbind($this.find(".sapUiTableCtrlScr").get(0));
		this._oVSb.unbind($this.find(".sapUiTableCtrlScr").get(0));
		this._oHSb.unbind($this.find(".sapUiTableCtrlScrFixed").get(0));
		this._oVSb.unbind($this.find(".sapUiTableCtrlScrFixed").get(0));
		this._oVSb.unbind($this.find(".sapUiTableRowHdrScr").get(0));

		jQuery("body").unbind('webkitTransitionEnd transitionend');
	};


	/**
	 * cleanup the timers when not required anymore
	 * @private
	 */
	Table.prototype._cleanUpTimers = function() {

		if (this._sBindingTimer) {
			jQuery.sap.clearDelayedCall(this._sBindingTimer);
			this._sBindingTimer = undefined;
		}

		if (this._sScrollBarTimer) {
			jQuery.sap.clearDelayedCall(this._sScrollBarTimer);
			this._sScrollBarTimer = undefined;
		}

		if (this._sDelayedMenuTimer) {
			jQuery.sap.clearDelayedCall(this._sDelayedMenuTimer);
			this._sDelayedMenuTimer = undefined;
		}

		if (this._sDelayedActionTimer) {
			jQuery.sap.clearDelayedCall(this._sDelayedActionTimer);
			this._sDelayedActionTimer = undefined;
		}

		if (this._sColHdrPosTimer) {
			jQuery.sap.clearDelayedCall(this._sColHdrPosTimer);
			this._sColHdrPosTimer = undefined;
		}

		if (this._visibleRowCountTimer) {
			jQuery.sap.clearDelayedCall(this._visibleRowCountTimer);
			this._visibleRowCountTimer = undefined;
		}

		Table.ResizeTrigger.removeListener(this._checkTableSize, this);
	};


	// =============================================================================
	// PRIVATE TABLE STUFF :)
	// =============================================================================

	/**
	 *
	 * @param oBinding
	 * @returns {*}
	 * @private
	 */
	Table.prototype._getFixedBottomRowContexts = function (oBinding) {
		var iFixedBottomRowCount = this.getFixedBottomRowCount();
		var iVisibleRowCount = this.getVisibleRowCount();
		var aContexts;
		if (iFixedBottomRowCount > 0 && (iVisibleRowCount - iFixedBottomRowCount) < oBinding.getLength()) {
			aContexts = oBinding.getContexts(oBinding.getLength() - iFixedBottomRowCount, iFixedBottomRowCount, 1);
		} else {
			aContexts = [];
		}

		return aContexts;
	};


	/**
	 * creates the rows for the rows aggregation
	 * @private
	 */
	Table.prototype._createRows = function(iStartIndex) {
		var iFirstVisibleRow = this.getFirstVisibleRow();
		var iVisibleRowCount = this.getVisibleRowCount();

		// by default the start index is the first visible row
		iStartIndex = iStartIndex === undefined ? iFirstVisibleRow : iStartIndex;

		// create the new template
		var oTemplate = new Row(this.getId() + "-rows");
		var aCols = this.getColumns();
		var iCellIndex = 0;
		for (var i = 0, l = aCols.length; i < l; i++) {
			if (aCols[i].getVisible()) {
				var oColTemplate = aCols[i].getTemplate();
				if (oColTemplate) {
					var oClone = oColTemplate.clone("col" + i);
					// inherit the editable property if required to the child controls
					if (this._bInheritEditableToControls && !this.getEditable() && oClone.setEditable) {
						oClone.setEditable(false);
					}
					oClone.data("sap-ui-colindex", i);
					oClone.data("sap-ui-colid", aCols[i].getId());
					oTemplate.addCell(oClone);
					this._aIdxCols2Cells[i] = iCellIndex++;
				}
			}
		}

		// initially called without iStartIndex and iLength
		this.destroyAggregation("rows", true);
		var aContexts;
		var oBinding = this.getBinding("rows");
		var oBindingInfo = this.mBindingInfos["rows"];
		if (oBinding && iVisibleRowCount > 0) {
			// if thresholding is 0 then it is disabled and we forward 0 to the binding
			var iThreshold = this.getThreshold() ? Math.max(this.getVisibleRowCount(), this.getThreshold()) : 0;
			var iFixedBottomRowCount = this.getFixedBottomRowCount();
			aContexts = oBinding.getContexts(iStartIndex, iVisibleRowCount - iFixedBottomRowCount, iThreshold);
			this._setBusy({
				requestedLength: iVisibleRowCount - iFixedBottomRowCount,
				receivedLength: aContexts.length,
				contexts: aContexts });

			var aFixedBottomContexts = [];
			aFixedBottomContexts = this._getFixedBottomRowContexts(oBinding);

			aContexts = aContexts.concat(aFixedBottomContexts);

			if (iFixedBottomRowCount > 0 && (iVisibleRowCount - iFixedBottomRowCount) < oBinding.getLength()) {
				this._setBusy({
					requestedLength: iFixedBottomRowCount,
					receivedLength: aFixedBottomContexts.length,
					contexts: aFixedBottomContexts });
			}
		}
		for (var i = 0; i < iVisibleRowCount; i++) {
			var oClone = oTemplate.clone("row" + i); // TODO: Isn't the following required! + "-" + this.getId());
			if (aContexts && aContexts[i]) {
				oClone.setBindingContext(aContexts[i], oBindingInfo.model);
				oClone._bHidden = false;
			} else {
				if (oBindingInfo) {
					oClone.setBindingContext(null, oBindingInfo.model);
				} else {
					oClone.setBindingContext(null);
				}

				oClone._bHidden = true;
			}
			this.addAggregation("rows", oClone, true);
		}

		// destroy the template
		oTemplate.destroy();
	};


	/**
	 * updates the horizontal scrollbar
	 * @private
	 */
	Table.prototype._updateHSb = function() {

		// get the width of the container
		var $this = this.$();

		// apply the new content size
		var iColsWidth = $this.find(".sapUiTableCtrlScroll").width();
		if (!!sap.ui.Device.browser.safari) {
			iColsWidth = Math.max(iColsWidth, this._getColumnsWidth(this.getFixedColumnCount()));
		}

		// add the horizontal scrollbar
		if (iColsWidth > $this.find(".sapUiTableCtrlScr").width()) {
			// show the scrollbar
			if (!$this.hasClass("sapUiTableHScr")) {
				$this.addClass("sapUiTableHScr");

				if (!!sap.ui.Device.browser.safari) {
					var $sapUiTableColHdr = $this.find(".sapUiTableCtrlScroll, .sapUiTableColHdrScr > .sapUiTableColHdr");
					// min-width on table elements does not work for safari
					if (this._bjQueryLess18) {
						$sapUiTableColHdr.width(iColsWidth);
					} else {
						$sapUiTableColHdr.outerWidth(iColsWidth);
					}
				}
			}

			var iScrollPadding = $this.find(".sapUiTableCtrlFixed").width();

			if ($this.find(".sapUiTableRowHdrScr:visible").length > 0) {
				iScrollPadding += $this.find(".sapUiTableRowHdrScr").width();
			}

			var $sapUiTableHSb = $this.find(".sapUiTableHSb");
			if (this._bRtlMode) {
				$sapUiTableHSb.css('padding-right', iScrollPadding + 'px');
			} else {
				$sapUiTableHSb.css('padding-left', iScrollPadding + 'px');
			}

			// When table has no fixed width, the scrollbar is not allowed to increase the width of the table.
			// We define the max-width of the scrollbar to be limited by its parent width.
			var iMaximumScrollBarWidth = $sapUiTableHSb.parent().width();
			$sapUiTableHSb.css('max-width', iMaximumScrollBarWidth + "px");

			this._oHSb.setContentSize(iColsWidth + "px");

			if (this._oHSb.getDomRef()) {
				this._oHSb.rerender();
			}
		} else {
			// hide the scrollbar
			if ($this.hasClass("sapUiTableHScr")) {
				$this.removeClass("sapUiTableHScr");
				if (!!sap.ui.Device.browser.safari) {
					// min-width on table elements does not work for safari
					$this.find(".sapUiTableCtrlScroll, .sapUiTableColHdr").css("width", "");
				}
			}
		}

		this._syncHeaderAndContent();

	};


	/**
	 * updates the vertical scrollbar
	 * @private
	 */
	Table.prototype._updateVSb = function(bOnAfterRendering) {
		var $this = this.$();
		var bDoResize = false;
		var bForceUpdateVSb = false;
		var oBinding = this.getBinding("rows");
		if (oBinding) {

			// move the vertical scrollbar to the scrolling table only
			var iFixedRows = this.getFixedRowCount();
			if (iFixedRows > 0) {
				var iOffsetTop = $this.find('.sapUiTableCtrl.sapUiTableCtrlRowScroll.sapUiTableCtrlScroll')[0].offsetTop;
				this.$().find('.sapUiTableVSb').css('top', (iOffsetTop - 1) + 'px');
				bForceUpdateVSb = true;
			}
			var iFixedBottomRows = this.getFixedBottomRowCount();
			if (iFixedBottomRows > 0) {
				var iOffsetHeight = $this.find('.sapUiTableCtrl.sapUiTableCtrlRowScroll.sapUiTableCtrlScroll')[0].offsetHeight;
				this.$().find('.sapUiTableVSb').css('height', iOffsetHeight + 'px');
				bForceUpdateVSb = true;
			}

			var iLength = oBinding.getLength();
			var iSteps = Math.max(0, (iLength || 0) - this.getVisibleRowCount());
			// check for paging mode or scrollbar mode
			if (this._oPaginator && this.getNavigationMode() === sap.ui.table.NavigationMode.Paginator) {
				// update the paginator (set the first visible row property)
				var iNumberOfPages = Math.ceil((iLength || 0) / this.getVisibleRowCount());
				this._oPaginator.setNumberOfPages(iNumberOfPages);
				var iPage = Math.min(iNumberOfPages, Math.ceil((this.getFirstVisibleRow() + 1) / this.getVisibleRowCount()));
				this.setProperty("firstVisibleRow", (Math.max(iPage,1) - 1) * this.getVisibleRowCount(), true);
				this._oPaginator.setCurrentPage(iPage);
				if (this._oPaginator.getDomRef()) {
					this._oPaginator.rerender();
				}
				if ($this.hasClass("sapUiTableVScr")) {
					$this.removeClass("sapUiTableVScr");
				}

				if (this._sScrollBarTimer != undefined) {
					jQuery.sap.clearDelayedCall(this._sScrollBarTimer);
				}
			} else {
				// in case of scrollbar mode show or hide the scrollbar dependening on the
				// calculated steps:
				if (iSteps > 0) {
					if (!$this.hasClass("sapUiTableVScr")) {
						$this.addClass("sapUiTableVScr");
						bDoResize = true;
					}
				} else {
					//scroll to top when the scrollbar vanishes -> the binding length is smaller than the number of visible rows
					if (iLength > 0) {
						// only set the scroll position to 0 if there is some data which can be shown.
						// this allows the application to set a scroll position even though the data was not yet loaded.
						this.setFirstVisibleRow(0);
					}

					if ($this.hasClass("sapUiTableVScr")) {
						$this.removeClass("sapUiTableVScr");
						bDoResize = true;
					}
				}

				// update the scrollbar only if it is required
				if (bOnAfterRendering || bForceUpdateVSb || iSteps !== this._oVSb.getSteps() || this.getFirstVisibleRow() !== this._oVSb.getScrollPosition()) {
					jQuery.sap.clearDelayedCall(this._sScrollBarTimer);
					this._sScrollBarTimer = undefined;
					// TODO: in case of bForceUpdateVSb the scrolling doesn't work anymore
					//       height changes of the scrollbar should not require a re-rendering!
					this._sScrollBarTimer = jQuery.sap.delayedCall(bOnAfterRendering ? 0 : 250, this, function() {
						// When the scrollbar timer is planned iSteps might be 0 because the binding might not have data yet.
						// This can even happen with JSON ListBinding if setProperty is called on a collection
						// Make sure to get the current length from the binding.
						var iSteps = 0;
						if (oBinding) {
							// the binding might have changed by the time the function gets called
							iSteps = Math.max(0, (oBinding.getLength() || 0) - this.getVisibleRowCount());
						}

						if ($this) {
							$this.toggleClass("sapUiTableVScr", iSteps > 0);
						}

						this._oVSb.setSteps(iSteps);
						if (this._oVSb.getDomRef()) {
							this._oVSb.rerender();
						}
						this._oVSb.setScrollPosition(this.getFirstVisibleRow());
						this._sScrollBarTimer = undefined;
					});
				}
			}
		} else {
			// check for paging mode or scrollbar mode
			if (this._oPaginator && this.getNavigationMode() === sap.ui.table.NavigationMode.Paginator) {
				// update the paginator (set the first visible row property)
				this._oPaginator.setNumberOfPages(0);
				this._oPaginator.setCurrentPage(0);
				if (this._oPaginator.getDomRef()) {
					this._oPaginator.rerender();
				}
			} else {
				if ($this.hasClass("sapUiTableVScr")) {
					$this.removeClass("sapUiTableVScr");
					bDoResize = true;
				}
			}
		}
		if (bDoResize && !this._bOnAfterRendering) {
			this._handleResize();
		}
	};


	/**
	 * updates the binding contexts of the currently visible controls
	 * @private
	 */
	Table.prototype._updateBindingContexts = function(bSuppressUpdate) {

		var aRows = this.getRows(),
			oBinding = this.getBinding("rows"),
			oBindinginfo = this.mBindingInfos["rows"],
			aFixedContexts,
			aContexts,
			aFixedBottomContexts,
			iFixedRows = this.getFixedRowCount(),
			iFixedBottomRows = this.getFixedBottomRowCount(),
			iVisibleRowCount = this.getVisibleRowCount();

		// fetch the contexts from the binding
		if (oBinding) {
			var iThreshold;
			if ((iFixedRows > 0 || iFixedBottomRows > 0) && aRows.length > 0) {
				// thresholding is deactivated when value is 0
				var iTotalFixedRows = iFixedRows + iFixedBottomRows;
				iThreshold = this.getThreshold() ? Math.max((this.getVisibleRowCount() - iTotalFixedRows), this.getThreshold()) : 0;
				var iRequestedLength = Math.max(0, aRows.length - iTotalFixedRows);
				aContexts = oBinding.getContexts(this.getFirstVisibleRow() + iFixedRows, iRequestedLength, iThreshold);
				this._setBusy({
					requestedLength: iRequestedLength,
					receivedLength: aContexts.length,
					contexts: aContexts });
				// static rows: we fetch the contexts without threshold to avoid loading
				// of unnecessary data. Make sure to fetch after the normal rows to avoid
				// outgoing double requests for the contexts.
				if (iFixedRows > 0) {
					aFixedContexts = oBinding.getContexts(0, iFixedRows);
					this._setBusy({
						requestedLength: iFixedRows,
						receivedLength: aFixedContexts.length,
						contexts: aFixedContexts });

					aContexts = aFixedContexts.concat(aContexts);
				}

				var aFixedBottomContexts = this._getFixedBottomRowContexts(oBinding);
				aContexts = aContexts.concat(aFixedBottomContexts);

				if (iFixedBottomRows > 0 && (iVisibleRowCount - iFixedBottomRows) < oBinding.getLength()) {
					this._setBusy({
						requestedLength: iFixedBottomRows,
						receivedLength: aFixedBottomContexts.length,
						contexts: aFixedBottomContexts });
				}
			} else if (aRows.length > 0) {
				// thresholding is deactivated when value is 0
				iThreshold = this.getThreshold() ? Math.max(this.getVisibleRowCount(), this.getThreshold()) : 0;
				aContexts = oBinding.getContexts(this.getFirstVisibleRow(), aRows.length, iThreshold);
				this._setBusy({
					requestedLength: aRows.length,
					receivedLength: aContexts.length,
					contexts: aContexts });
			}
		}

		// update the binding contexts only for the visible columns
		//for (var iIndex = 0, iLength = this.getRows().length; iIndex < iLength; iIndex++) {
		if (!bSuppressUpdate) {
			for (var iIndex = aRows.length - 1; iIndex >= 0; iIndex--) {
				var oContext = aContexts ? aContexts[iIndex] : undefined;
				var oRow = aRows[iIndex];
				if (oRow) {
					//calculate the absolute row index, used by the Tree/AnalyticalTable to find the rendering infos for this row
					var iAbsoluteRowIndex = this.getFirstVisibleRow() + iIndex;
					this._updateRowBindingContext(oRow, oContext, oBindinginfo && oBindinginfo.model, iAbsoluteRowIndex);
				}
			}
		}

	};

	/**
	 * updates the binding context a row
	 * @param {sap.ui.table.Row} row to update
	 * @param {sap.ui.model.Context} binding context of the row
	 * @private
	 */
	Table.prototype._updateRowBindingContext = function(oRow, oContext, sModelName, iAbsoluteRowIndex) {
		var aCells = oRow.getCells();
		var $rowTargets = oRow.getDomRefs(true).row;

		// check for a context object (in case of grouping there could be custom context objects)
		oRow.setBindingContext(oContext, sModelName);
		if (oContext && oContext instanceof sap.ui.model.Context) {
			for (var i = 0, l = this._aVisibleColumns.length; i < l; i++) {
				var col = this._aIdxCols2Cells[this._aVisibleColumns[i]];
				if (aCells[col]) {
					this._updateCellBindingContext(aCells[col], oContext, sModelName, iAbsoluteRowIndex);
				}
			}
			$rowTargets.removeClass("sapUiTableRowHidden");
			oRow._bHidden = false;
		} else {
			$rowTargets.addClass("sapUiTableRowHidden");
			$rowTargets.removeClass('sapUiTableFixedPreBottomRow sapUiTableFixedTopRow');

			oRow._bHidden = true;
			for (var i = 0, l = this._aVisibleColumns.length; i < l; i++) {
				var col = this._aIdxCols2Cells[this._aVisibleColumns[i]];
				if (aCells[col]) {
					this._updateCellBindingContext(aCells[col], oContext, sModelName, iAbsoluteRowIndex);
				}
			}
		}
	};

	/**
	 * updates the binding context a cell
	 * @param {sap.ui.core.Control} control of the cell
	 * @param {sap.ui.model.Context} binding context of the cell
	 * @private
	 */
	Table.prototype._updateCellBindingContext = function(oCell, oContext, sModelName, iAbsoluteRowIndex) {
			//oCell.setBindingContext(oContext, sModelName);
			if (this._bCallUpdateTableCell && oCell._updateTableCell) {
				oCell._updateTableCell(oCell /* cell control */, oContext /* cell context */, oCell.$().closest("td") /* jQuery object for td */, iAbsoluteRowIndex);
			}
			if (typeof this._updateTableCell === "function") {
				this._updateTableCell(oCell /* cell control */, oContext /* cell context */, oCell.$().closest("td") /* jQuery object for td */, iAbsoluteRowIndex);
			}
	};

	/**
	 * check if data is available in the table
	 * @private
	 */
	Table.prototype._hasData = function() {
		var oBinding = this.getBinding("rows");
		if (!oBinding || (oBinding.getLength() || 0) === 0) {
			return false;
		}
		return true;
	};

	/**
	 * show or hide the no data container
	 * @private
	 */
	Table.prototype._updateNoData = function() {
		// no data?
		if (this.getShowNoData()) {
			var oBinding = this.getBinding("rows");
			if (!this._hasData()) {
				if (!this.$().hasClass("sapUiTableEmpty")) {
					this.$().addClass("sapUiTableEmpty");
				}
				// update the ARIA text for the row count
				this.$("ariacount").text(this._oResBundle.getText("TBL_DATA_ROWS", [0]));
			} else {
				if (this.$().hasClass("sapUiTableEmpty")) {
					this.$().removeClass("sapUiTableEmpty");
				}
				// update the ARIA text for the row count
				this.$("ariacount").text(this._oResBundle.getText("TBL_DATA_ROWS", [(oBinding.getLength() || 0)]));
			}
		}
	};


	/**
	 * determines the currently visible columns (used for simply updating only the
	 * controls of the visible columns instead of the complete row!)
	 * @private
	 */
	Table.prototype._determineVisibleCols = function() {

		// determine the visible colums
		var $this = this.$(),
		    that = this;

		if ($this.hasClass("sapUiTableHScr")) {

			var bRtl = this._bRtlMode;

			// calculate the view port
			var iScrollLeft = this._oHSb.getNativeScrollPosition();
			if (bRtl && sap.ui.Device.browser.firefox && iScrollLeft < 0) {
				// Firefox deals with negative scrollPosition in RTL mode
				iScrollLeft = iScrollLeft * -1;
			}
			var iScrollRight = iScrollLeft + this._getScrollWidth();

			// has the view port changed?
			if (this._iOldScrollLeft !== iScrollLeft || this._iOldScrollRight !== iScrollRight || this._bForceVisibleColCalc) {

				// calculate the first and last visible column
				var iLeft = bRtl ? $this.find(".sapUiTableCtrlScroll").width() : 0;

				if ((sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.firefox) && bRtl) {
					// Assume ScrollWidth=100px, Scroll to the very left in RTL mode
					// IE has reverse scroll position (Chrome = 0, IE = 100, FF = -100)
					iLeft = 0;
				}

				this._aVisibleColumns = [];
				for (var i = 0, l = this.getFixedColumnCount(); i < l; i++) {
					this._aVisibleColumns.push(i);
				}
				var $ths = $this.find(".sapUiTableCtrl.sapUiTableCtrlScroll .sapUiTableCtrlFirstCol > th[data-sap-ui-headcolindex]");
				$ths.each(function(iIndex, oElement) {
					var iWidth = jQuery(oElement).width();
					if (bRtl && sap.ui.Device.browser.chrome) {
						iLeft -= iWidth;
					}
					if (iLeft + iWidth >= iScrollLeft && iLeft <= iScrollRight) {
						that._aVisibleColumns.push(parseInt(jQuery(oElement).data('sap-ui-headcolindex'),10));
					}
					if (!bRtl || (sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.firefox)) {
						iLeft += iWidth;
					}
				});

				// keep the view port information (performance!!)
				this._iOldScrollLeft = iScrollLeft;
				this._iOldScrollRight = iScrollRight;
				this._bForceVisibleColCalc = false;
			}
		} else {
			this._aVisibleColumns = [];
			var aCols = this.getColumns();
			for (var i = 0, l = aCols.length; i < l; i++) {
				if (aCols[i].shouldRender()) {
					this._aVisibleColumns.push(i);
				}
			}
		}

	};

	/**
	 * enables automatic resizing on doubleclick on a column if the corresponding column attribute is set
	 * @experimental Experimental, only works with limited control set
	 * @function
	 * @private
	 */
	Table.prototype._enableColumnAutoResizing = function (){
		var that = this;
		jQuery.each(this.getColumns(), function (iIndex, oCol){
			if (!!oCol.getAutoResizable()){
				var $resizer = jQuery.find(".sapUiTableColRsz[data-sap-ui-colindex=" + iIndex + "]");
				if ($resizer){
					that._bindSimulatedDoubleclick($resizer, null /* fnSingleClick*/, that._onAutomaticColumnResize /* fnDoubleClick */);
				}
			}
		});
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeColumn = function (oColumn) {
		var oResult = this.removeAggregation('columns', oColumn);
		this._bDetermineVisibleCols = true;

		if (typeof oColumn === "number" && oColumn > -1) {
			oColumn = this.getColumns()[oColumn];
		}

		var iIndex = jQuery.inArray(oColumn, this._aSortedColumns);
		if (this._iNewColPos === undefined && iIndex >= 0) {
			this._aSortedColumns.splice(iIndex, 1);
		}

		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllColumns = function() {
		var oResult = this.removeAllAggregation('columns');
		this._aSortedColumns = [];

		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 contdrol API generator
	 */
	Table.prototype.destroyColumns = function() {
		var oResult = this.destroyAggregation('columns');
		this._aSortedColumns = [];

		return oResult;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addColumn = function (oColumn) {
		var that = this;
		this.addAggregation('columns', oColumn);
		oColumn.attachEvent('_widthChanged', function(oEvent) {
			that._bForceVisibleColCalc = true;
		});

		this._bDetermineVisibleCols = true;
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertColumn = function (oColumn, iIndex) {
		var that = this;
		this.insertAggregation('columns', oColumn, iIndex);
		oColumn.attachEvent('_widthChanged', function() {
			that._bForceVisibleColCalc = true;
		});

		this._bDetermineVisibleCols = true;
		return this;
	};

	/**
	 * returns the count of rows when bound or 0
	 * @private
	 */
	Table.prototype._getRowCount = function() {
		var oBinding = this.getBinding("rows");
		return oBinding ? (oBinding.getLength() || 0) : 0;
	};

	/**
	 * returns the count of rows which can ca selected when bound or 0
	 * @private
	 */
	Table.prototype._getSelectableRowCount = function() {
		return this._getRowCount();
	};


	/**
	 * returns the current top scroll position of the scrollbar (row number)
	 * @private
	 */
	Table.prototype._getScrollTop = function() {
		if (this.$().hasClass("sapUiTableVScr")) {
			return this._oVSb.getScrollPosition() || 0;
		} else {
			if (this.getNavigationMode() === sap.ui.table.NavigationMode.Paginator) {
				return (((this._oPaginator.getCurrentPage() || 1) - 1) * this.getVisibleRowCount());
			} else {
				return 0;
			}
		}
	};

	/**
	 * returns the width of the table scroll container
	 * @private
	 */
	Table.prototype._getScrollWidth = function() {
		return this.$().find(".sapUiTableCtrlScr").width();
	};

	/**
	 * returns the height of the table scroll container
	 * @private
	 */
	Table.prototype._getScrollHeight = function() {
		return this.$().find(".sapUiTableCtrlScr").height();
	};

	/**
	 * returns the count of visible columns
	 * @private
	 */
	Table.prototype._getVisibleColumns = function() {
		var aColumns = [];
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			if (aCols[i].shouldRender()) {
				aColumns.push(aCols[i]);
			}
		}
		return aColumns;
	};

	/**
	 * returns the count of visible columns
	 * @private
	 */
	Table.prototype._getVisibleColumnCount = function() {
		return this._getVisibleColumns().length;
	};

	/**
	 * returns the row count of headers
	 * @private
	 */
	Table.prototype._getHeaderRowCount = function() {
		if (!this.getColumnHeaderVisible()) {
			return 0;
		} else if (!this._useMultiHeader()) {
			return 1;
		}
		var iHeaderRows = 0;
		jQuery.each(this._getVisibleColumns(), function(iIndex, oColumn) {
			iHeaderRows = Math.max(iHeaderRows,  oColumn.getMultiLabels().length);
		});
		return iHeaderRows;
	};

	/**
	 * returns if multi header beahviour is used or not
	 * @private
	 */
	Table.prototype._useMultiHeader = function() {
		var useMultiLabels = false;
		jQuery.each(this._getVisibleColumns(), function(iIndex, oColumn) {
			if (oColumn.getMultiLabels().length > 0) {
				useMultiLabels = true;
				return false;
			}
		});
		return useMultiLabels;
	};


	/**
	 * Returns the summed width of all rendered columns
	 * @private
	 * @param {Number} iStartColumn starting column for calculating the width
	 * @param {Number} iEndColumn ending column for calculating the width
	 * @returns {Number} the summed column width
	 */
	Table.prototype._getColumnsWidth = function(iStartColumn, iEndColumn) {
		// first calculate the min width of the table for all columns
		var aCols = this.getColumns();
		var iColsWidth = 0;

		if (iStartColumn !== 0 && !iStartColumn) {
			iStartColumn = 0;
		}
		if (iEndColumn !== 0 && !iEndColumn) {
			iEndColumn = aCols.length;
		}

		for (var i = iStartColumn, l = iEndColumn; i < l; i++) {
			if (aCols[i] && aCols[i].shouldRender()) {
				iColsWidth += this._CSSSizeToPixel(aCols[i].getWidth());
			}
		}

		return iColsWidth;

	};

	/**
	 * Calculates the pixel value from a given CSS size and returns it with or without unit.
	 * @param sCSSSize
	 * @param bReturnWithUnit
	 * @returns {string|number} Converted CSS value in pixel
	 * @private
	 */
	Table.prototype._CSSSizeToPixel = function(sCSSSize, bReturnWithUnit) {
		var sPixelValue = this._iColMinWidth;

		if (sCSSSize) {
			if (jQuery.sap.endsWith(sCSSSize, "px")) {
				sPixelValue = parseInt(sCSSSize, 10);
			} else if (jQuery.sap.endsWith(sCSSSize, "em") || jQuery.sap.endsWith(sCSSSize, "rem")) {
				sPixelValue = Math.ceil(parseFloat(sCSSSize) * this._getBaseFontSize());
			}
		}

		if (bReturnWithUnit) {
			return sPixelValue + "px";
		} else {
			return parseInt(sPixelValue, 10);
		}
	};

	Table.prototype._getBaseFontSize = function() {
		return this._iBaseFontSize;
	};

	/**
	 * calculates the width of the columns by using the browsers calculation
	 * mechanism and setting a fix width to the columns
	 * @private
	 */
	Table.prototype._handleResize = function() {

		// when using the native resize handler then this function could be called
		// before the table has been rendered - therefore we interrupt this method
		if (!this.getDomRef()) {
			return;
		}

		// update the horizontal scrollbar
		this._updateHSb();

		// update the column header (sync column widths)
		this._updateColumnHeader();

		this._updateRowHeader();

		this._handleRowCountMode();
	};

	Table.prototype._checkTableSize = function() {
		if (!this.getDomRef()) {
			return;
		}

		var oParentDomRef = this.getDomRef().parentNode,
			iHeight = oParentDomRef.offsetHeight,
			iWidth = oParentDomRef.offsetWidth;

		if (oParentDomRef != this._lastParent || iHeight != this._lastParentHeight || iWidth != this._lastParentWidth) {
			this._handleResize();
			this._lastParent = oParentDomRef;
			this._lastParentHeight = iHeight;
			this._lastParentWidth = iWidth;

			// update the bindings
			if (this.getBinding("rows")) {
				this.updateRows();
			}
		}
	};

	Table.prototype._handleRowCountMode = function() {
		//if visibleRowCountMode is auto change the visibleRowCount according to the parents container height
		if (this.getVisibleRowCountMode() == sap.ui.table.VisibleRowCountMode.Auto) {
			var $this = this.$();

			var iCanvasHeight = $this.parent().height();
			var iRows = this._calculateRowsToDisplay(iCanvasHeight);

			if (isNaN(iRows)) {
				return;
			}
			// Currently this needs to be executed in a timeout because invalidate is lost wenn method is called during onAfterRendering
			// This can be reverted when keeping the invalidate calls, that occur during onAfterRendering are kept
			var that = this;
			this._visibleRowCountTimer = setTimeout(function() {
				that.setVisibleRowCount(iRows);
			}, 0);
		}
	};

	/**
	 * updates the row headers
	 * @private
	 */
	Table.prototype._updateRowHeader = function() {

		// we skip this expensive height and width calculation when not required!
		if (this.getFixedRowCount() >= 0 || this.getFixedColumnCount() >= 0 || this.getRowHeight() <= 0) {

			var $this = this.$();

			var $fixedRows = $this.find(".sapUiTableCtrlFixed > tbody > tr");
			var $scrollRows = $this.find(".sapUiTableCtrlScroll > tbody > tr");
			var $rowHeaders = $this.find(".sapUiTableRowHdr");

			if (this.getFixedColumnCount() > 0 && !this.getRowHeight()) {
				$fixedRows.css('height','');
				$scrollRows.css('height','');
			}

			for (var i = 0, l = $scrollRows.length; i < l; i++) {
				var iHeight = Math.max($fixedRows[i] ? ($fixedRows[i].getBoundingClientRect().bottom - $fixedRows[i].getBoundingClientRect().top) : 0, $scrollRows[i] ? ($scrollRows[i].getBoundingClientRect().bottom - $scrollRows[i].getBoundingClientRect().top) : 0);
				if (this._bjQueryLess18) {
					jQuery($rowHeaders[i]).height(iHeight);
					if (this.getFixedColumnCount() > 0 && !this.getRowHeight()) {
						jQuery($fixedRows[i]).height(iHeight);
						jQuery($scrollRows[i]).height(iHeight);
					}
				} else {
					jQuery($rowHeaders[i]).outerHeight(iHeight);
					if (this.getFixedColumnCount() > 0 && !this.getRowHeight()) {
						jQuery($fixedRows[i]).outerHeight(iHeight);
						jQuery($scrollRows[i]).outerHeight(iHeight);
					}
				}
			}

		}

	};

	/**
	 * Synchronizes the <th> width of the table, with the rendered header divs.
	 * @private
	 */
	Table.prototype._syncColumnHeaders = function(bUpdateResizeHandlers) {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			// _syncColumnHeaders gets called async, there might be no DomRef anymore
			return;
		}
		var $this = this.$();
		var oRectTable = oDomRef.getBoundingClientRect();
		var iTableWidth = oRectTable.right - oRectTable.left;
		var aVisibleColumns = this._getVisibleColumns();
		if (aVisibleColumns.length == 0) {
			return;
		}
		var iInvisibleColWidth = 0;

		var bRtl = this._bRtlMode;
		var iLeftAway = bRtl ? 99000 : -99000;

		// Select only table headers (identified by data-sap-ui-headcolindex attribute). Not the row header.
		var $colHeaderContainer = $this.find(".sapUiTableColHdr");
		var $tableHeaders = $this.find(".sapUiTableCtrlFirstCol > th");

		var bHasRowHeader = this.getSelectionMode() !== sap.ui.table.SelectionMode.None && this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly;
		if (bHasRowHeader && $tableHeaders.length > 0) {
			var oHiddenElement = $tableHeaders.get(0);
			iInvisibleColWidth = oHiddenElement.getBoundingClientRect().right - oHiddenElement.getBoundingClientRect().left;
			$tableHeaders = $tableHeaders.not(":nth-child(1)");
		}

		// Create map with source table headers and their corresponding resizers.
		var mHeaders = {};

		// Traverse the source table headers, which are needed to determine the column head width
		$tableHeaders.each(function(iIndex, oElement) {
			var iHeadColIndex = oElement.getAttribute("data-sap-ui-headcolindex");
			var oRect = oElement.getBoundingClientRect();

			// set width of target column div
			var iTargetWidth;
			var oVisibleColumn = aVisibleColumns[iIndex];
			if (oVisibleColumn) {
				iTargetWidth = oRect.right - oRect.left;
			}

			//for the first column also calculate the width of the hidden column
			if (iIndex == 0) {
				iTargetWidth += iInvisibleColWidth;
			}

			// apply the width of the column
			var	vHeaderSpan = aVisibleColumns[iIndex] ? aVisibleColumns[iIndex].getHeaderSpan() : 1,
				aHeaderData = [],
				aSpans;

			if (vHeaderSpan) {
				// vHeaderSpan can be an array for multi column header rows purpose.
				if (!jQuery.isArray(vHeaderSpan)) {
					vHeaderSpan = [vHeaderSpan];
				}
				jQuery.each(vHeaderSpan, function(iSpanIndex, iSpan) {
					vHeaderSpan[iSpanIndex] = Math.max((iSpan + iIndex > aVisibleColumns.length) ? Math.min(iSpan, aVisibleColumns.length - iIndex) : iSpan, 1);
				});

				aSpans = vHeaderSpan;
			} else {
				aSpans = [1];
			}

			for (var i = 0; i < aSpans.length; i++) {
				aHeaderData[i] = {
					width: iTargetWidth,
					span: 1
				};

				for (var j = 1; j < aSpans[i]; j++) {
					var oHeader = $tableHeaders[iIndex + j];
					var oHeaderRect = oHeader.getBoundingClientRect();
					if (oHeader) {
						aHeaderData[i].width += oHeaderRect.right - oHeaderRect.left;
						aHeaderData[i].span = aSpans[i];
					}
				}
			}

			if (oVisibleColumn) {
				var oColRsz = document.getElementById(oVisibleColumn.getId() + "-rsz");
				mHeaders[iHeadColIndex] = {
					domRefColumnTh: oElement,
					domRefColumnDivs: [],
					domRefColumnResizer: oColRsz,
					domRefColumnResizerPosition: undefined,
					rect: oRect,
					aHeaderData: aHeaderData
				};
			}
		});

		// Map target column header divs to corresponding source table header.
		var $cols = $colHeaderContainer.find(".sapUiTableCol");
		$cols.each(function(iIndex, oElement) {
			var iColIndex = parseInt(oElement.getAttribute("data-sap-ui-colindex"),10);
			var mHeader = mHeaders[iColIndex];
			mHeader.domRefColumnDivs.push(oElement);

			var iResizerPositionLeft = 0;

			if (mHeader) {
				if (!bRtl) {
					iResizerPositionLeft = mHeader.rect.right - oRectTable.left;
				} else {
					iResizerPositionLeft = mHeader.rect.left - oRectTable.left;
				}
			}

			if (!iResizerPositionLeft || iResizerPositionLeft <= 0 || iResizerPositionLeft >= iTableWidth) {
				iResizerPositionLeft = iLeftAway;
			}

			mHeader.domRefColumnResizerPosition = iResizerPositionLeft;
		});

		jQuery.each(mHeaders, function(iIndex, mHeader) {
			for (var i = 0; i < mHeader.domRefColumnDivs.length; i++) {
				// apply header widths
				var oHeaderData = mHeader.aHeaderData[0];
				if (mHeader.aHeaderData[i]) {
					oHeaderData = mHeader.aHeaderData[i];
				}
				mHeader.domRefColumnDivs[i].style.width =  oHeaderData.width + "px";
				mHeader.domRefColumnDivs[i].setAttribute("data-sap-ui-colspan", oHeaderData.span);

				// position resizer
				if (mHeader.domRefColumnResizer) {
					mHeader.domRefColumnResizer.style.left = mHeader.domRefColumnResizerPosition + "px";
				}
			}
		});

		// Table Column Height Calculation

		// we change the height of the cols, col header and the row header to auto to
		// find out whether to use the height of a cell or the min height of the col header.
		var iHeaderRowCount = this._getHeaderRowCount();
		var bHasColHdrHeight = this.getColumnHeaderHeight() > 0;
		if (!bHasColHdrHeight && !bUpdateResizeHandlers) {
			var $jqo = $this.find(".sapUiTableColHdrCnt,.sapUiTableColRowHdr");

			// We do this without jQuery for improved performance in IE (3500ms)
			var iColsLength = $cols.length;
			for (var i = 0; i < iColsLength; i++) {
				$cols[i].style.height = 'auto';
			}
			$jqo.height("auto");


			// Total height of the table header
			var iHeight = Math.max($colHeaderContainer.height(), $jqo.height());

			// Height of one row within the header
			// avoid half pixels
			var iRegularHeight = Math.floor(iHeight / iHeaderRowCount);
			if (this._bjQueryLess18) {
				$cols.height(iRegularHeight);
				$jqo.height(iHeight);
			} else {
				$cols.outerHeight(iRegularHeight);
				$jqo.outerHeight(iHeight);
			}
		}
	};

	/**
	 * updates the column headers (width and position of the resize handles)
	 * @private
	 */
	Table.prototype._updateColumnHeader = function(bUpdateResizeHandlers) {
		if (this._sColHdrPosTimer) {
			jQuery.sap.clearDelayedCall(this._sColHdrPosTimer);
		}

		// instantly execute the synchronization or delay it
		if (this._bOnAfterRendering) {
			this._syncColumnHeaders.apply(this, arguments);
		} else {
			this._sColHdrPosTimer = jQuery.sap.delayedCall(150, this, this._syncColumnHeaders, arguments);
		}
	};

	/**
	 * disables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._disableTextSelection = function (oElement) {
		// prevent text selection
		jQuery(oElement || document.body).
			attr("unselectable", "on").
			css({
				"-moz-user-select": "none",
				"-webkit-user-select": "none",
				"user-select": "none"
	        }).
			bind("selectstart", function(oEvent) {
				oEvent.preventDefault();
				return false;
			});
	};

	/**
	 * enables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._enableTextSelection = function (oElement) {
		jQuery(oElement || document.body).
			attr("unselectable", "off").
			css({
				"-moz-user-select": "",
				"-webkit-user-select": "",
				"user-select": ""
	        }).
			unbind("selectstart");
	};

	/**
	 * clears the text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._clearTextSelection = function () {
		if (window.getSelection) {
		  if (window.getSelection().empty) {  // Chrome
		    window.getSelection().empty();
		  } else if (window.getSelection().removeAllRanges) {  // Firefox
		    window.getSelection().removeAllRanges();
		  }
		} else if (document.selection && document.selection.empty) {  // IE?
			try {
			    document.selection.empty();
			} catch (ex) {
			    // ignore error to as a workaround for bug in IE8
			}
		}
	};

	// =============================================================================
	// CONTROL EVENT HANDLING
	// =============================================================================

	/**
	 * will be called by the vertical scrollbar. updates the visualized data by
	 * applying the first visible (scrollpos) row from the vertical scrollbar
	 * @private
	 */
	Table.prototype.onvscroll = function(oEvent) {
		// do not scroll in action mode!
		this._leaveActionMode();
		// set the first visible row
		this.setFirstVisibleRow(this._getScrollTop(), true);
	};

	/**
	 * sync the column header and content
	 * @private
	 */
	Table.prototype._syncHeaderAndContent = function() {
		if (!this._bSyncScrollLeft) {
			this._bSyncScrollLeft = true;
			// synchronize the scroll areas
			var $this = this.$();
			var iScrollLeft = this._oHSb.getNativeScrollPosition();
			$this.find(".sapUiTableCtrlScr").scrollLeft(iScrollLeft);
			if (!!sap.ui.Device.browser.webkit && this._bRtlMode) {
				var oScrollDomRef = $this.find(".sapUiTableColHdrScr").get(0);
				iScrollLeft = oScrollDomRef.scrollWidth - oScrollDomRef.clientWidth - this._oHSb.getScrollPosition();
			}
			$this.find(".sapUiTableColHdrScr").scrollLeft(iScrollLeft);
			this._bSyncScrollLeft = false;
		}

	};

	/**
	 * will be called when the horizontal scrollbar is used. since the table does
	 * not render/update the data of all columns (only the visible ones) in case
	 * of scrolling horizontally we need to update the content of the columns which
	 * became visible.
	 * @private
	 */
	Table.prototype.onhscroll = function(oEvent) {

		if (!this._bOnAfterRendering) {

			// sync the column header and the content area
			this._syncHeaderAndContent();

			// update the column headers (resize handles)
			this._updateColumnHeader(true);

			// update the bindings
			if (this.getBinding("rows")) {
				this.updateRows();
			}

		}

	};

	/**
	 * when navigating within the column header we need to synchronize the content
	 * area with the position (scrollLeft) of the column header.
	 * @private
	 */
	Table.prototype._oncolscroll = function(oEvent) {
		if (!this._bSyncScrollLeft) {
			var $cnt = this.$().find(".sapUiTableColHdrScr");
			if (!!sap.ui.Device.browser.webkit && this._bRtlMode) {
				var oScrollDomRef = this.$().find(".sapUiTableColHdrScr").get(0);
				this._oHSb.setScrollPosition(oScrollDomRef.scrollWidth - oScrollDomRef.clientWidth - $cnt.scrollLeft());
			} else {
				this._oHSb.setNativeScrollPosition($cnt.scrollLeft());
			}
		}
	};

	/**
	 * when navigating within the content area we need to synchronize the column
	 * header with the position (scrollLeft) of the content area.
	 * @private
	 */
	Table.prototype._oncntscroll = function(oEvent) {
		if (!this._bSyncScrollLeft) {
			var $cnt = this.$().find(".sapUiTableCtrlScr");
			this._oHSb.setNativeScrollPosition($cnt.scrollLeft());
		}
	};


	/**
	 * listens to the mousedown events for starting column drag & drop. therefore
	 * we wait 200ms to make sure it is no click on the column to open the menu.
	 * @private
	 */
	Table.prototype.onmousedown = function(oEvent) {
		// only move on left click!
		var bLeftButton = oEvent.button === 0;
		var bIsTouchMode = this._isTouchMode(oEvent);

		if (bLeftButton) {
			var $target = jQuery(oEvent.target);

			var $splitter = this.$("sb");
			if (oEvent.target == $splitter[0]) {

				// Fix for IE text selection while dragging
				jQuery(document.body).bind("selectstart", jQuery.proxy(this._splitterSelectStart, this));

				var offset = $splitter.offset();
				var height = $splitter.height();
				var width = $splitter.width();

				jQuery(document.body).append(
						"<div id=\"" + this.getId() + "-ghost\" class=\"sapUiHSBGhost\" style =\" height:" + height + "px; width:"
						+ width + "px; left:" + offset.left + "px; top:" + offset.top + "px\" ></div>");

				// append overlay over splitter to enable correct functionality of moving the splitter
				$splitter.append(
						"<div id=\"" + this.getId() + "-overlay\" style =\"left: 0px;" +
								" right: 0px; bottom: 0px; top: 0px; position:absolute\" ></div>");

				var $Document = jQuery(document);
				if (bIsTouchMode) {
					$Document.bind("touchend", jQuery.proxy(this._onGhostMouseRelease, this));
					$Document.bind("touchmove", jQuery.proxy(this._onGhostMouseMove, this));
				} else {
					$Document.bind("mouseup", jQuery.proxy(this._onGhostMouseRelease, this));
					$Document.bind("mousemove", jQuery.proxy(this._onGhostMouseMove, this));
				}

				this._disableTextSelection();

				return;
			}

			var $col = $target.closest(".sapUiTableCol");
			if ($col.length === 1) {

				this._bShowMenu = true;
				this._sDelayedMenuTimer = jQuery.sap.delayedCall(200, this, function() {
					this._bShowMenu = false;
				});

				var bIsColumnMenuTarget = this._isTouchMode(oEvent) && ($target.hasClass("sapUiTableColDropDown") || $target.hasClass("sapUiTableColResizer"));
				if (this.getEnableColumnReordering() && !bIsColumnMenuTarget) {
					var iIndex = parseInt($col.attr("data-sap-ui-colindex"), 10);
					if (iIndex > this._iLastFixedColIndex) {
						var oColumn = this.getColumns()[iIndex];

						this._sDelayedActionTimer = jQuery.sap.delayedCall(200, this, function() {
							this._onColumnMoveStart(oColumn, bIsTouchMode);
						});
					}
				}
			}

			// in case of FireFox and CTRL+CLICK it selects the target TD
			//   => prevent the default behavior only in this case (to still allow text selection)
			var bCtrl = !!(oEvent.metaKey || oEvent.ctrlKey);
			if (!!sap.ui.Device.browser.firefox && bCtrl) {
				oEvent.preventDefault();
			}
		}

	};

	/**
	 * controls the action mode when clicking into the table control
	 * @private
	 */
	Table.prototype.onmouseup = function(oEvent) {
		// clean up the timer
		jQuery.sap.clearDelayedCall(this._sDelayedActionTimer);

		if (oEvent.isMarked()) {
			// the event was already handled by some other handler, do nothing.
			return;
		}

		if (this.$().find(".sapUiTableCtrl td :focus").length > 0) {
			// when clicking into a focusable control we enter the action mode!
			this._enterActionMode(this.$().find(".sapUiTableCtrl td :focus"));
		} else {
			// when clicking anywhere else in the table we leave the action mode!
			this._leaveActionMode(oEvent);
		}
	};

	/**
	 * handles the selection when clicking on the table
	 * @private
	 */
	Table.prototype.onclick = function(oEvent) {
		// clean up the timer
		jQuery.sap.clearDelayedCall(this._sDelayedActionTimer);

		if (oEvent.isMarked()) {
			// the event was already handled by some other handler, do nothing.
			return;
		}

		// forward the event
		if (!this._findAndfireCellEvent(this.fireCellClick, oEvent)) {
			this._onSelect(oEvent);
		} else {
			oEvent.preventDefault();
		}
	};

	/**
	 * handles the cell contextmenu eventing of the table, open the menus for cell, group header and column header
	 * @private
	 */
	Table.prototype.oncontextmenu = function(oEvent) {
		var $Target = jQuery(oEvent.target);
		var $Header = $Target.closest('.sapUiTableCol');
		if ($Header.length > 0) {
			var oColumn = sap.ui.getCore().byId($Header.attr("data-sap-ui-colid"));
			if (oColumn) {
				oColumn._openMenu($Header[0], false);
			}
			oEvent.preventDefault();
		} else {
			if (this._findAndfireCellEvent(this.fireCellContextmenu, oEvent, this._oncellcontextmenu)) {
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * handles the default cell contextmenu
	 * @private
	 */
	Table.prototype._oncellcontextmenu = function(mParams) {
		if (this.getEnableCellFilter()) {
			// create the contextmenu instance the first time it is needed
			if (!this._oContextMenu) {
				jQuery.sap.require("sap.ui.unified.Menu");
				jQuery.sap.require("sap.ui.unified.MenuItem");

				this._oContextMenu = new sap.ui.unified.Menu(this.getId() + "-contextmenu");
				this.addDependent(this._oContextMenu);
			}

			// does the column support filtering?
			var oColumn = sap.ui.getCore().byId(mParams.columnId);
			var sProperty = oColumn.getFilterProperty();
			// currently only filter is possible by default cell context menu, if filtering is not allowed by
			// menu, don't open the context menu at all.
			if (oColumn && oColumn.isFilterableByMenu() && mParams.rowBindingContext) {
				// destroy all items of the menu and recreate
				this._oContextMenu.destroyItems();
				this._oContextMenu.addItem(new sap.ui.unified.MenuItem({
					text: this._oResBundle.getText("TBL_FILTER"),
					select: [function() {
						var oContext = this.getContextByIndex(mParams.rowIndex);
						var sValue = oContext.getProperty(sProperty);
						if (this.getEnableCustomFilter()) {
							// only fire custom filter event
							this.fireCustomFilter({
								column: oColumn,
								value: sValue
							});
						} else {
							this.filter(oColumn, sValue);
						}

					}, this]
				}));

				// open the popup below the cell
				var eDock = sap.ui.core.Popup.Dock;
				this._oContextMenu.open(false, mParams.cellDomRef, eDock.BeginTop, eDock.BeginBottom, mParams.cellDomRef, "none none");
				return true;
			}
		}
	};

	/**
	 * helper method to bind different functions to a click if both a single and a double click can occur on an element
	 * @experimental Experimental
	 * @function
	 * @private
	 */
	Table.prototype._bindSimulatedDoubleclick = function(element, fnClick, fnDoubleclick){
		var eventBound = "click";
		var that = this;
		if (!!sap.ui.Device.support.touch){
			//event needs to be touchend due to timing issues on the ipad
			eventBound = "touchend";
		}
		jQuery(element).on(eventBound, function(oEvent){
			oEvent.preventDefault();
			oEvent.stopPropagation();
			that._clicksRegistered = that._clicksRegistered + 1;
			if (that._clicksRegistered < 2){
				that._singleClickTimer = jQuery.sap.delayedCall(that._doubleclickDelay, that, function(){
					that._clicksRegistered = 0;
					if (fnClick){
						fnClick.call(that, oEvent);
					}
				}, [oEvent]);
			} else {
				jQuery.sap.clearDelayedCall(that._singleClickTimer);
				that._clicksRegistered = 0;
				fnDoubleclick.call(that, oEvent);
			}
		});
	};

	/**
	 * finds the cell on which the click or contextmenu event is executed and
	 * notifies the listener which control has been clicked or the contextmenu
	 * should be openend.
	 * @param {function} fnFire function to fire the event
	 * @param {DOMEvent} oEvent event object
	 * @return {boolean} cancelled or not
	 * @private
	 */
	Table.prototype._findAndfireCellEvent = function(fnFire, oEvent, fnContextMenu) {
		var $target = jQuery(oEvent.target);
		// find out which cell has been clicked
		var $cell = $target.closest("td[role='gridcell']");
		var sId = $cell.attr("id");
		var aMatches = /.*-row(\d*)-col(\d*)/i.exec(sId);
		var bCancel = false;
		if (aMatches) {
			var iRow = aMatches[1];
			var iCol = aMatches[2];
			var oRow = this.getRows()[iRow];
			var oCell = oRow && oRow.getCells()[iCol];
			var iRealRowIndex = oRow && oRow.getIndex();
			var sColId = oCell.data("sap-ui-colid");

			var oRowBindingContext;
			if (this.getBindingInfo("rows")) {
				oRowBindingContext = oRow.getBindingContext(this.getBindingInfo("rows").model);
			}

			var mParams = {
				rowIndex: iRealRowIndex,
				columnIndex: iCol,
				columnId: sColId,
				cellControl: oCell,
				rowBindingContext: oRowBindingContext,
				cellDomRef: $cell.get(0)
			};
			bCancel = !fnFire.call(this, mParams);
			if (!bCancel && typeof fnContextMenu === "function") {
				mParams.cellDomRef = $cell[0];
				bCancel = fnContextMenu.call(this, mParams);
			}
		}
		return bCancel;
	};

	/**
	 * handles the focus in to reposition the focus or prevent default handling for
	 * column resizing
	 * @private
	 */
	Table.prototype.onfocusin = function(oEvent) {
		var $target = jQuery(oEvent.target);
		var bNoData = this.$().hasClass("sapUiTableEmpty");
		var bControlBefore = $target.hasClass("sapUiTableCtrlBefore");
		this._updateAriaRowOfRowsText();
		// KEYBOARD HANDLING (_bIgnoreFocusIn is set in onsaptabXXX)
		if (!this._bIgnoreFocusIn && (bControlBefore || $target.hasClass("sapUiTableCtrlAfter"))) {
			// set the focus on the last focused dom ref of the item navigation or
			// in case if not set yet (tab previous into item nav) then we set the
			// focus to the root domref
			// reset the aria description of the table that the table is announced the
			// first time the table grabs the focus
			this.$("ariadesc").text(this._oResBundle.getText("TBL_TABLE"));
			// when entering the before or after helper DOM elements we put the
			// focus on the current focus element of the item navigation and we
			// leave the action mode!
			this._leaveActionMode();
			if (jQuery.contains(this.$().find('.sapUiTableColHdrCnt')[0], oEvent.target)) {
				jQuery(this._oItemNavigation.getFocusedDomRef() || this._oItemNavigation.getRootDomRef()).focus();
			} else {
				if (bControlBefore) {
					if (bNoData) {
						this._bIgnoreFocusIn = true;
						this.$().find(".sapUiTableCtrlEmpty").focus();
						this._bIgnoreFocusIn = false;
					} else {
						this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex() % this._oItemNavigation.iColumns, oEvent);
					}
				} else {
					this._oItemNavigation.focusItem((this._oItemNavigation.getFocusedIndex() % this._oItemNavigation.iColumns) + (this._oItemNavigation.iColumns * this._iLastSelectedDataRow), oEvent);
				}
			}

			if (!bNoData) {
				oEvent.preventDefault();
			}
		} else if (jQuery.sap.endsWith(oEvent.target.id, "-rsz")) {
			// prevent that the ItemNavigation grabs the focus!
			// only for the column resizing
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * The row index only considers the position of the row in the aggregation. It must be adapted
	 * to consider the firstVisibleRow offset or if a fixed bottom row was pressed
	 * @param {int} iRow row index of the control in the rows aggregation
	 * @returns {int} the adapted (absolute) row index
	 * @private
	 */
	Table.prototype._getAbsoluteRowIndex = function(iRow) {
		var iIndex = 0;
		var iFirstVisibleRow = this.getFirstVisibleRow();
		var iFixedBottomRowCount = this.getFixedBottomRowCount();
		var iVisibleRowCount = this.getVisibleRowCount();
		var iFirstFixedBottomRowIndex = iVisibleRowCount - iFixedBottomRowCount;

		if (iFixedBottomRowCount > 0 && iRow >= iFirstFixedBottomRowIndex) {
			iIndex = this.getBinding().getLength() - iVisibleRowCount + iRow;
		} else {
			iIndex = iFirstVisibleRow + iRow;
		}

		return iIndex;
	};

	// =============================================================================
	// SELECTION HANDLING
	// =============================================================================

		/**
	 * handles the row selection and the column header menu
	 * @private
	 */
	Table.prototype._onSelect = function(oEvent) {

		// trigger column menu
		var $target = jQuery(oEvent.target);

		// determine modifier keys
		var bShift = oEvent.shiftKey;
		var bCtrl = !!(oEvent.metaKey || oEvent.ctrlKey);

		// column header?
		var $col = $target.closest(".sapUiTableCol");
		if (this._bShowMenu && $col.length === 1) {
			var iIndex = parseInt($col.attr("data-sap-ui-colindex"), 10);
			var oColumn = this.getColumns()[iIndex];

			if ($target.hasClass("sapUiTableColDropDown")) {
				var bExecuteDefault = this.fireColumnSelect({
					column: oColumn
				});

				if (bExecuteDefault) {
					oColumn._openMenu($col[0], oEvent.type == "keyup");
				}
			} else {
				this._onColumnSelect(oColumn, $col[0], this._isTouchMode(oEvent), oEvent.type == "keyup");
			}

			return;
		}

		// row header?
		var $row = $target.closest(".sapUiTableRowHdr");
		if ($row.length === 1) {
			var iIndex = parseInt($row.attr("data-sap-ui-rowindex"), 10);
			this._onRowSelect(this._getAbsoluteRowIndex(iIndex), bShift, bCtrl);
			return;
		}

		// table control? (only if the selection behavior is set to row)
		var oClosestTd;
		if (oEvent.target) {
			var $ClosestTd = jQuery(oEvent.target).closest("td");
			if ($ClosestTd.length > 0) {
				oClosestTd = $ClosestTd[0];
			}
		}

		if (oClosestTd && oClosestTd.getAttribute("role") == "gridcell" && (
		    this.getSelectionBehavior() === sap.ui.table.SelectionBehavior.Row ||
		    this.getSelectionBehavior() === sap.ui.table.SelectionBehavior.RowOnly)) {
			var $row = $target.closest(".sapUiTableCtrl > tbody > tr");
			if ($row.length === 1) {
				var iIndex = parseInt($row.attr("data-sap-ui-rowindex"), 10);
				this._onRowSelect(this._getAbsoluteRowIndex(iIndex), bShift, bCtrl);
				return;
			}
		}

		// select all?
		if (jQuery.sap.containsOrEquals(this.getDomRef("selall"), oEvent.target)) {
			this._toggleSelectAll();
			return;
		}

	};


	// =============================================================================
	// ROW EVENT HANDLING
	// =============================================================================

	/**
	 *
	 * @param iRowIndex
	 * @returns {boolean}
	 * @private
	 */
	Table.prototype._isRowSelectable = function(iRowIndex) {
		return true;
	};

	/**
	 * handles the row selection (depending on the mode)
	 * @private
	 */
	Table.prototype._onRowSelect = function(iRowIndex, bShift, bCtrl) {

		// in case of IE and SHIFT we clear the text selection
		if (!!sap.ui.Device.browser.internet_explorer && bShift) {
			this._clearTextSelection();
		}

		// is the table bound?
		var oBinding = this.getBinding("rows");
		if (!oBinding) {
			return;
		}

		//var iRowIndex = Math.min(Math.max(0, iRowIndex), this.getBinding("rows").getLength() - 1);
		if (iRowIndex < 0 || iRowIndex >= (oBinding.getLength() || 0)) {
			return;
		}

		// Make sure that group headers, which represents a tree node in AnalyticalTable, are not selectable.
		if (!this._isRowSelectable(iRowIndex)) {
			return;
		}

		this._iSourceRowIndex = iRowIndex;

		var oSelMode = this.getSelectionMode();
		if (oSelMode !== sap.ui.table.SelectionMode.None) {
			if (oSelMode === sap.ui.table.SelectionMode.Single) {
				if (!this.isIndexSelected(iRowIndex)) {
					this.setSelectedIndex(iRowIndex);
				} else {
					this.clearSelection();
				}
			} else {
				// in case of multi toggle behavior a click on the row selection
				// header adds or removes the selected row and the previous seleciton
				// will not be removed
				if (oSelMode === sap.ui.table.SelectionMode.MultiToggle) {
					bCtrl = true;
				}
				if (bShift) {
					// If no row is selected getSelectedIndex returns -1 - then we simply
					// select the clicked row:
					var iSelectedIndex = this.getSelectedIndex();
					if (iSelectedIndex >= 0) {
						this.addSelectionInterval(iSelectedIndex, iRowIndex);
					} else {
						this.setSelectedIndex(iRowIndex);
					}
				} else {
					if (!this.isIndexSelected(iRowIndex)) {
						if (bCtrl) {
							this.addSelectionInterval(iRowIndex, iRowIndex);
						} else {
							this.setSelectedIndex(iRowIndex);
						}
					} else {
						if (bCtrl) {
							this.removeSelectionInterval(iRowIndex, iRowIndex);
						} else {
							if (this.getSelectedIndices().length === 1) {
								this.clearSelection();
							} else {
								this.setSelectedIndex(iRowIndex);
							}
						}
					}
				}
			}
		}

		this._iSourceRowIndex = undefined;

	};


	// =============================================================================
	// COLUMN EVENT HANDLING
	// =============================================================================

	/**
	 * column select event => opens the column menu
	 * @private
	 */
	Table.prototype._onColumnSelect = function(oColumn, oDomRef, bIsTouchMode, bWithKeyboard) {
		// On tablet open special column header menu
		if (bIsTouchMode) {
			var $ColumnHeader = jQuery(oDomRef);
			var $ColumnCell = $ColumnHeader.find(".sapUiTableColCell");

			if ($ColumnHeader.find(".sapUiTableColCellMenu").length < 1) {
				$ColumnCell.hide();

				var sColumnDropDownButton = "";
				if (oColumn._menuHasItems()) {
					sColumnDropDownButton = "<div class='sapUiTableColDropDown'></div>";
				}

				var sColumnResizerButton = "";
				if (oColumn.getResizable()) {
					sColumnResizerButton = "<div class='sapUiTableColResizer''></div>";
				}

				var $ColumnHeaderMenu = jQuery("<div class='sapUiTableColCellMenu'>" + sColumnDropDownButton + sColumnResizerButton + "</div>");
				$ColumnHeader.append($ColumnHeaderMenu);
				$ColumnHeader.bind("focusout", function() {
					this.cell.show();
					this.menu.remove();
					this.self.unbind("focusout");
				}.bind({
					cell: $ColumnCell,
					menu: $ColumnHeaderMenu,
					self: $ColumnHeader
				}));

				// listen to the resize handlers
				if (oColumn.getResizable()) {
					$ColumnHeader.find(".sapUiTableColResizer").bind("touchstart", jQuery.proxy(this._onColumnResizeStart, this));
				}
			}

			return;
		}

		// forward the event
		var bExecuteDefault = this.fireColumnSelect({
			column: oColumn
		});

		// if the default behavior should be prevented we suppress to open
		// the column menu!
		if (bExecuteDefault) {
			oColumn._openMenu(oDomRef, bWithKeyboard);
		}

	};

	/**
	 * start column moveing
	 * @private
	 */
	Table.prototype._onColumnMoveStart = function(oColumn, bIsTouchMode) {
		this._disableTextSelection();

		var $col = oColumn.$();
		var iColIndex = parseInt($col.attr("data-sap-ui-colindex"), 10);

		if (iColIndex < this.getFixedColumnCount()) {
			return;
		}

		this.$().addClass("sapUiTableDragDrop");
		this._$colGhost = $col.clone().removeAttr("id");

		$col.css({
			"opacity": ".25"
		});

		this._$colGhost.addClass("sapUiTableColGhost").css({
			"left": -10000,
			"top": -10000,
			//Position is set to relative for columns later, if the moving is started a second time the position: relative overwrites
			//the absolut position set by the sapUiTableColGhost class, so we overrite the style attribute for position here to make
			//sure that the position is absolute
			"position": "absolute",
			"z-index": this.$().zIndex() + 10
		});

		// TODO: only for the visible columns!?
		this.$().find(".sapUiTableCol").each(function(iIndex, oElement) {

			var $col = jQuery(this);
			$col.css({position: "relative"});

			$col.data("pos", {
				left: $col.position().left,
				center: $col.position().left + $col.outerWidth() / 2,
				right:  $col.position().left + $col.outerWidth()
			});

		});

		this._$colGhost.appendTo(document.body);

		var $body = jQuery(document.body);
		if (bIsTouchMode) {
			$body.bind("touchmove", jQuery.proxy(this._onColumnMove, this));
			$body.bind("touchend", jQuery.proxy(this._onColumnMoved, this));
		} else {
			$body.mousemove(jQuery.proxy(this._onColumnMove, this));
			$body.mouseup(jQuery.proxy(this._onColumnMoved, this));
		}
	};

	/**
	 * move the column position the ghost
	 * @private
	 */
	Table.prototype._onColumnMove = function(oEvent) {
		var $this = this.$();
		var iLocationX = oEvent.pageX;
		var iLocationY = oEvent.pageY;
		if (oEvent && this._isTouchMode(oEvent)) {
			iLocationX = oEvent.targetTouches[0].pageX;
			iLocationY = oEvent.targetTouches[0].pageY;
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}

		var bRtl = this._bRtlMode;
		var iRelX = iLocationX - $this.offset().left;
		var iDnDColIndex = parseInt(this._$colGhost.attr("data-sap-ui-colindex"), 10);
		var $DnDCol = this.getColumns()[iDnDColIndex].$();

		// find out the new col position
		var iOldColPos = this._iNewColPos;
		this._iNewColPos = iDnDColIndex;
		var that = this;
		$this.find(".sapUiTableCol").each(function(iIndex, oCol) {
			var $col = jQuery(oCol);
			var iColIndex = parseInt($col.attr("data-sap-ui-colindex"), 10);
			var vHeaderSpans = sap.ui.getCore().byId($col.attr("data-sap-ui-colid")).getHeaderSpan();
			var iSpan;

			if (vHeaderSpans) {
				if (jQuery.isArray(vHeaderSpans)) {
					iSpan = vHeaderSpans[0];
				} else {
					iSpan = vHeaderSpans;
				}
			} else {
				iSpan = 1;
			}

			if ($col.get(0) !== $DnDCol.get(0)) {

				var oPos = $col.data("pos");

				var bBefore = iRelX >= oPos.left && iRelX <= oPos.center;
				var bAfter = iRelX >= oPos.center && iRelX <= oPos.right;

				if (!bRtl) {
					if (bBefore) {
						that._iNewColPos = iColIndex;
					} else if (bAfter) {
						that._iNewColPos = iColIndex + iSpan;
					} else {
						that._iNewColPos = that._iNewColPos;
					}
				} else {
					if (bAfter) {
						that._iNewColPos = iColIndex;
					} else if (bBefore) {
						that._iNewColPos = iColIndex + iSpan;
					} else {
						that._iNewColPos = that._iNewColPos;
					}
				}

				if ((bBefore || bAfter) && iColIndex > iDnDColIndex) {
					that._iNewColPos--;
				}

			}

		});

		// prevent the reordering of the fixed columns
		if (this._iNewColPos <= this._iLastFixedColIndex) {
			this._iNewColPos = iOldColPos;
		}
		if (this._iNewColPos < this.getFixedColumnCount()) {
			this._iNewColPos = iOldColPos;
		}

		// animate the column move
		this._animateColumnMove(iDnDColIndex, iOldColPos, this._iNewColPos);

		// update the ghost position
		this._$colGhost.css({
			"left": iLocationX + 5,
			"top": iLocationY + 5
		});
	};

	/**
	 * animates the column movement
	 */
	Table.prototype._animateColumnMove = function(iColIndex, iOldPos, iNewPos) {

		var bRtl = this._bRtlMode;
		var $DnDCol = this.getColumns()[iColIndex].$();

		// position has been changed => reorder
		if (iOldPos !== iNewPos) {

			for (var i = Math.min(iOldPos, iNewPos), l = Math.max(iOldPos, iNewPos); i <= l; i++) {
				var oCol = this.getColumns()[i];
				if (i !== iColIndex && oCol.getVisible()) {
					oCol.$().stop(true, true).animate({left: "0px"});
				}
			}

			var iOffsetLeft = 0;
			if (iNewPos < iColIndex) {
				for (var i = iNewPos; i < iColIndex; i++) {
					var oCol = this.getColumns()[i];
					if (oCol.getVisible()) {
						var $col = oCol.$();
						iOffsetLeft -= $col.outerWidth();
						$col.stop(true, true).animate({left: $DnDCol.outerWidth() * (bRtl ? -1 : 1) + "px"});
					}
				}
			} else {
				for (var i = iColIndex + 1, l = iNewPos + 1; i < l; i++) {
					var oCol = this.getColumns()[i];
					if (oCol.getVisible()) {
						var $col = oCol.$();
						iOffsetLeft += $col.outerWidth();
						$col.stop(true, true).animate({left: $DnDCol.outerWidth() * (bRtl ? 1 : -1) + "px"});
					}
				}
			}
			$DnDCol.stop(true, true).animate({left: iOffsetLeft * (bRtl ? -1 : 1) + "px"});
		}

	};

	/**
	 * columns is moved => update!
	 * @private
	 */
	Table.prototype._onColumnMoved = function(oEvent) {
		this.$().removeClass("sapUiTableDragDrop");

		var iDnDColIndex = parseInt(this._$colGhost.attr("data-sap-ui-colindex"), 10);
		var oDnDCol = this.getColumns()[iDnDColIndex];

		var $Body = jQuery(document.body);
		$Body.unbind("touchmove", this._onColumnMove);
		$Body.unbind("touchend", this._onColumnMoved);
		$Body.unbind("mousemove", this._onColumnMove);
		$Body.unbind("mouseup", this._onColumnMoved);

		this._$colGhost.remove();
		this._$colGhost = undefined;

		this._enableTextSelection();

		// forward the event
		var bExecuteDefault = this.fireColumnMove({
			column: oDnDCol,
			newPos: this._iNewColPos
		});

		var bMoveRight = iDnDColIndex < this._iNewColPos;

		if (bExecuteDefault && this._iNewColPos !== undefined && this._iNewColPos !== iDnDColIndex) {
			this.removeColumn(oDnDCol);
			this.insertColumn(oDnDCol, this._iNewColPos);
			var vHeaderSpan = oDnDCol.getHeaderSpan(),
				iSpan;

			if (vHeaderSpan) {
				if (jQuery.isArray(vHeaderSpan)) {
					iSpan = vHeaderSpan[0];
				} else {
					iSpan = vHeaderSpan;
				}
			} else {
				iSpan = 1;
			}

			if (iSpan > 1) {
				if (!bMoveRight) {
					this._iNewColPos++;
				}
				for (var i = 1; i < iSpan; i++) {
					var oDependentCol = this.getColumns()[bMoveRight ? iDnDColIndex : iDnDColIndex + i];
					this.removeColumn(oDependentCol);
					this.insertColumn(oDependentCol, this._iNewColPos);
					this.fireColumnMove({
						column: oDependentCol,
						newPos: this._iNewColPos
					});
					if (!bMoveRight) {
						this._iNewColPos++;
					}
				}
			}
			this._oColHdrItemNav.setFocusedIndex(this._iNewColPos);
		} else {
			this._animateColumnMove(iDnDColIndex, this._iNewColPos, iDnDColIndex);
			oDnDCol.$().css({
				"backgroundColor": "",
				"backgroundImage": "",
				"opacity": ""
			});
		}

		// Re-apply focus
		setTimeout(function() {
			var iOldFocusedIndex = this._oItemNavigation.getFocusedIndex();
			this._oItemNavigation.focusItem(0, oEvent);
			this._oItemNavigation.focusItem(iOldFocusedIndex, oEvent);
		}.bind(this), 0);

		delete this._iNewColPos;
	};

	/**
	 * starts the automatic column resize after doubleclick
	 * @experimental Experimental, only works with a limited control set
	 * @private
	 */
	Table.prototype._onAutomaticColumnResize = function(oEvent) {
		var iColIndex, oCol, headerSpan, maxHeaderSpan, iColsToResize = 1, bResizeMultiple = false;
		jQuery.sap.log.debug("doubleclick fired");
		this._disableTextSelection();
		this._$colResize = jQuery(oEvent.target);
		this._$colResize.addClass("sapUiTableColRszActive");
		//get the id of the column which needs to be resized. it might be different from the resizers column id if a headerspan is used.
		var iParentColIndex = parseInt(this._$colResize.prevAll(".sapUiTableCol").first().attr("data-sap-ui-colindex"), 10);
		iColIndex = parseInt(this._$colResize.attr("data-sap-ui-colindex"), 10);
		if (iParentColIndex != iColIndex) {
			bResizeMultiple = true;
		}
		//try to find out if we are only resizing one column or all columns under a header span
		if (bResizeMultiple) {
			oCol = this.getColumns()[iParentColIndex];
			headerSpan = oCol.getHeaderSpan();
			if (headerSpan instanceof Array){
				maxHeaderSpan = Math.max.apply(Math, headerSpan);
			} else if (!!headerSpan) {
				maxHeaderSpan = headerSpan;
			}
			if (iColIndex + headerSpan - 1 != iParentColIndex){
				iColsToResize = maxHeaderSpan;
				iColIndex = iParentColIndex + maxHeaderSpan;
			}
		}
		if (iColsToResize > 1){
		//	for(var i = 0; i < iColsToResize; i--{
			while (iColIndex > iParentColIndex) {
				iColIndex--;
				this.autoResizeColumn(iColIndex);
			}
		} else {
			this.autoResizeColumn(iColIndex);
		}
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Determines the associated resizer id for a column.
	 * @param {int} the column index of the target column
	 * @param {int} the column span of the target column
	 * @return {String} the associated resizer id
	 */
	Table.prototype._getResizerIdForColumn = function(iColIndex, iColSpan) {
		if (iColSpan > 0) {
			iColSpan--;
		}

		var oColumn = this.getColumns()[this._aIdxCols2Cells[iColIndex + iColSpan]];
		return oColumn.getId() + "-rsz";
	};

	/**
	 * start the column resize
	 * @private
	 */
	Table.prototype._onColumnResizeStart = function(oEvent) {
		if (this._isTouchMode(oEvent)) {
			this._iColumnResizeStart = oEvent.targetTouches[0].pageX;
			this._disableTextSelection();

			var $Column = jQuery(oEvent.target).closest(".sapUiTableCol");
			var iColIndex = parseInt($Column.attr("data-sap-ui-colindex"), 10);
			var iColSpan = $Column.attr("data-sap-ui-colspan");

			var sResizerId = this._getResizerIdForColumn(iColIndex, iColSpan);
			this._$colResize = jQuery.sap.byId(sResizerId);

			jQuery(document.body).bind("touchmove", jQuery.proxy(this._onColumnResize, this));
			jQuery(document.body).bind("touchend", jQuery.proxy(this._onColumnResized, this));

			return;
		}

		// only resize on left click!
		var bLeftButton = oEvent.button === 0;
		if (bLeftButton) {
			this._iColumnResizeStart = oEvent.pageX;

			this._disableTextSelection();
			this._$colResize = jQuery(oEvent.target);

			jQuery(document.body).
				mousemove(jQuery.proxy(this._onColumnResize, this)).
				mouseup(jQuery.proxy(this._onColumnResized, this));
		}
	};

	/**
	 * resize the column
	 * @private
	 */
	Table.prototype._onColumnResize = function(oEvent) {
		var iLocationX;
		if (this._isTouchMode(oEvent)) {
			iLocationX = oEvent.targetTouches[0].pageX;
			oEvent.stopPropagation();
			oEvent.preventDefault();
		} else {
			iLocationX = oEvent.pageX;
		}

		if (this._iColumnResizeStart && iLocationX < this._iColumnResizeStart + 3 && iLocationX > this._iColumnResizeStart - 3) {
			return;
		}

		if (this._isTouchMode(oEvent)) {
			this._$colResize.addClass("sapUiTableColTouchRszActive");
		} else {
			this._$colResize.addClass("sapUiTableColRszActive");
		}

		var $this = this.$();

		var bRtl = this._bRtlMode;
		var iColIndex = parseInt(this._$colResize.attr("data-sap-ui-colindex"), 10);
		var oColumn = this.getColumns()[iColIndex];
		var $col = $this.find(".sapUiTableCtrlFirstCol > th[data-sap-ui-headcolindex='" + iColIndex + "']");

		// get the left position of the column to calculate the new width
		// relative to the parent container (sapUiTableCnt)!
		var iColLeft = $col.position().left;

		var iWidth;
		if (!bRtl) {
			// refine width calculation in case of fixed columns
			if (this.getFixedColumnCount() > 0 && iColIndex >= this.getFixedColumnCount()) {
				var iFixedColumnsWidth = $this.find(".sapUiTableColHdrFixed").width();
				iColLeft = iColLeft + iFixedColumnsWidth;

				// Consider scroll offset of non fixed area.
				iColLeft = iColLeft - $this.find(".sapUiTableCtrlScr").scrollLeft();
			}

			// find the total left offset from the document (required for pageX info)
			var iOffsetLeft = $this.find(".sapUiTableCtrlFirstCol > th:first").offset().left;

			// relative left position within the table scroll container
			var iRelLeft = iLocationX - iOffsetLeft;

			// calculate the new width
			iWidth = iRelLeft - iColLeft;
		} else {
			var $ScrollArea;
			if (this.getFixedColumnCount() > 0 && iColIndex < this.getFixedColumnCount()) {
				$ScrollArea = $this.find('.sapUiTableCtrlScrFixed');
			} else {
				$ScrollArea = $this.find('.sapUiTableCtrlScr');
			}
			var iScrollAreaScrollLeft = $ScrollArea.scrollLeft();

			if (sap.ui.Device.browser.internet_explorer) {
				// Assume ScrollWidth=100px, Scroll to the very left in RTL mode
				// IE has reverse scroll position (Chrome = 0, IE = 100, FF = -100)
				iScrollAreaScrollLeft = $ScrollArea[0].scrollWidth - iScrollAreaScrollLeft - $ScrollArea[0].clientWidth;
			} else if (sap.ui.Device.browser.firefox) {
				// FF has negative reverse scroll position (Chrome = 0, IE = 100, FF = -100)
				iScrollAreaScrollLeft = iScrollAreaScrollLeft + $ScrollArea[0].scrollWidth - $ScrollArea[0].clientWidth;
			}

			//get the difference between where mouse was released and left side of the table
			var iDiff = iColLeft - iScrollAreaScrollLeft - iLocationX + $ScrollArea.offset().left;
			iWidth = $col.outerWidth() + iDiff;
		}

		iWidth = Math.max(iWidth, this._iColMinWidth);

		// calculate and set the position of the resize handle
		var iRszOffsetLeft = $this.find(".sapUiTableCnt").offset().left;

		var iRszLeft = iLocationX - iRszOffsetLeft;
		iRszLeft -= this._$colResize.width() / 2;
		this._$colResize.css("left", iRszLeft);

		// store the width of the column to apply later
		oColumn._iNewWidth = iWidth;
	};

	/**
	 * column is resized => update!
	 * @private
	 */
	Table.prototype._onColumnResized = function(oEvent, iIndex) {
		var iColIndex;
		// ignore when no resize column is set
		if (!this._$colResize && (iIndex === null || iIndex === undefined)) {
			return;
		}
		// get the new width of the column
		if (iIndex === null || iIndex === undefined) {
			iColIndex = parseInt(this._$colResize.attr("data-sap-ui-colindex"), 10);
		} else {
			iColIndex = iIndex;
		}
		var oColumn = this.getColumns()[iColIndex];
		// if the resize has started and we have a new width for the column
		// we apply it to the column object
		var bResized = false;
		if (oColumn._iNewWidth) {
			var sWidth;
			var iAvailableSpace = this.$().find(".sapUiTableCtrl").width();
			if (!this._checkPercentageColumnWidth()) {
				sWidth = oColumn._iNewWidth + "px";
			} else {
				var iColumnWidth = Math.round(100 / iAvailableSpace * oColumn._iNewWidth);
				sWidth = iColumnWidth + "%";
			}

			this._updateColumnWidth(oColumn, sWidth);
			this._resizeDependentColumns(oColumn, sWidth);

			delete oColumn._iNewWidth;

			bResized = true;
		}

		// unbind the event handlers
		var $Body = jQuery(document.body);
		$Body.unbind("touchmove", this._onColumnResize);
		$Body.unbind("touchend", this._onColumnResized);
		$Body.unbind("mousemove", this._onColumnResize);
		$Body.unbind("mouseup", this._onColumnResized);

		// focus the column
		oColumn.focus();

		// hide the text selection
		if (this._$colResize) {
			this._$colResize.removeClass("sapUiTableColTouchRszActive sapUiTableColRszActive");
			this._$colResize = undefined;
		}
		this._enableTextSelection();

		// rerender / ignore if nothing changed!
		if (bResized) {
			this.invalidate();
		}

	};

	/**
	 *
	 * @param oColumn
	 * @param sWidth
	 * @private
	 */
	Table.prototype._resizeDependentColumns = function(oColumn, sWidth) {

		//Adjust columns only if the columns have percentage values
		if (this._checkPercentageColumnWidth()) {
			var aVisibleColumns = this._getVisibleColumns();
			//var oLastVisibleColumn = aVisibleColumns[aVisibleColumns.length - 1]; // NOT USED!
			//var bAllFollowingColumnsFlexible = true; // NOT USED!

			var iColumnIndex;
			jQuery.each(aVisibleColumns, function(iIndex, oCurrentColumn) {
				if (oColumn === oCurrentColumn) {
					iColumnIndex = iIndex;
				//} else if (iColumnIndex !== undefined && !oCurrentColumn.getFlexible()) { // NOT REQUIRED?
					//bAllFollowingColumnsFlexible = false;
				}
			});

			var iOthersWidth = 0;
			var iLastIndex = aVisibleColumns.length - 1;
			var iTotalPercentage;
			if (iColumnIndex === undefined) {
				iTotalPercentage = 0;
			} else {
				iTotalPercentage = parseInt(sWidth,10);
			}
			var iPercentages = 0;
			var aOtherColumns = [];
			var that = this;

			jQuery.each(aVisibleColumns, function(iIndex, oCurrentColumn) {
				var iColumnPercentage = that._getColumnPercentageWidth(oCurrentColumn);
				if ((((iColumnIndex === iLastIndex && iIndex < iColumnIndex) || ((iColumnIndex !== iLastIndex) && iIndex > iColumnIndex)) && oCurrentColumn.getFlexible()) || iColumnIndex === undefined) {
					iOthersWidth += oCurrentColumn.$().outerWidth();
					iPercentages += iColumnPercentage;
					aOtherColumns.push(oCurrentColumn);
				} else if (iIndex !== iColumnIndex) {
					iTotalPercentage += iColumnPercentage;
				}
			});

			var iCalcPercentage = iTotalPercentage;
			jQuery.each(aOtherColumns, function(iIndex, oCurrentColumn){
				var iColumnPercentage = that._getColumnPercentageWidth(oCurrentColumn);
				var iNewWidth = Math.round((100 - iCalcPercentage) / iPercentages * iColumnPercentage);
				if (iIndex === aOtherColumns.length - 1) {
					iNewWidth = 100 - iTotalPercentage;
				} else {
					iTotalPercentage += iNewWidth;
				}
				that._updateColumnWidth(oCurrentColumn, iNewWidth + "%");
			});
		} else if (!this._hasOnlyFixColumnWidths()) {

			var aVisibleColumns = this._getVisibleColumns(),
				iAvailableSpace = this.$().find(".sapUiTableCtrl").width(),
				iColumnIndex,
				iRightColumns = 0,
				iLeftWidth = 0,
				iRightWidth = 0,
				iNonFixedColumns = 0;

			jQuery.each(aVisibleColumns, function(iIndex, oCurrentColumn) {
				//Check columns if they are fixed = they have a pixel width
				if (!jQuery.sap.endsWith(oCurrentColumn.getWidth(), "px")
					&& !jQuery.sap.endsWith(oCurrentColumn.getWidth(), "em")
					&& !jQuery.sap.endsWith(oCurrentColumn.getWidth(), "rem")) {
					iNonFixedColumns++;
					return false;
				}
				//if iColumnIndex is defined we already found our column and all other columns are right of that one
				if (iColumnIndex != undefined) {
					iRightWidth += this._CSSSizeToPixel(oCurrentColumn.getWidth());
					iRightColumns++;
				} else if (oColumn !== oCurrentColumn) {
					iLeftWidth += this._CSSSizeToPixel(oCurrentColumn.getWidth());
				}
				if (oColumn === oCurrentColumn) {
					iColumnIndex = iIndex;
					//Use new width of column
					iLeftWidth += this._CSSSizeToPixel(sWidth);
				}
			}.bind(this));
			//If there are non fixed columns we don't do this
			if (iNonFixedColumns > 0 || (iLeftWidth + iRightWidth > iAvailableSpace)) {
				return;
			}
			//Available space is all space right of the modified columns
			iAvailableSpace -= iLeftWidth;
			for (var i = iColumnIndex + 1; i < aVisibleColumns.length; i++) {
				//Calculate new column width based on previous percentage width
				var oColumn = aVisibleColumns[i],
					iColWidth = this._CSSSizeToPixel(oColumn.getWidth()),
					iPercent = iColWidth / iRightWidth * 100,
					iNewWidth = iAvailableSpace / 100 * iPercent;
				this._updateColumnWidth(oColumn, Math.round(iNewWidth) + 'px');
			}
		}
	};

	/**
	 *
	 * @param oColumn
	 * @returns {*}
	 * @private
	 */
	Table.prototype._getColumnPercentageWidth = function(oColumn) {
		var sColumnWidth = oColumn.getWidth();
		var iColumnPercentage = parseInt(oColumn.getWidth(),10);
		var iTotalWidth = this.$().find(".sapUiTableCtrl").width();
		if (jQuery.sap.endsWith(sColumnWidth, "px") || jQuery.sap.endsWith(sColumnWidth, "em") || jQuery.sap.endsWith(sColumnWidth, "rem")) {
			iColumnPercentage = Math.round(100 / iTotalWidth * iColumnPercentage);
		} else if (!jQuery.sap.endsWith(sColumnWidth, "%")) {
			iColumnPercentage = Math.round(100 / iTotalWidth * oColumn.$().width());
		}
		return iColumnPercentage;
	};

	/**
	 *
	 * @param oColumn
	 * @param sWidth
	 * @private
	 */
	Table.prototype._updateColumnWidth = function(oColumn, sWidth) {
		// forward the event
		var bExecuteDefault = this.fireColumnResize({
			column: oColumn,
			width: sWidth
		});

		// set the width of the column (when not cancelled)
		if (bExecuteDefault) {
			oColumn.setProperty("width", sWidth, true);
			this.$().find('th[aria-owns="' + oColumn.getId() + '"]').css('width', sWidth);
		}
	};

	/**
	 * Check if at least one column has a percentage value
	 * @private
	 */
	Table.prototype._checkPercentageColumnWidth = function() {
		var aColumns = this.getColumns();
		var bHasPercentageColumns = false;
		jQuery.each(aColumns, function(iIndex, oColumn) {
			if (jQuery.sap.endsWith(oColumn.getWidth(), "%")) {
				bHasPercentageColumns = true;
				return false;
			}
		});
		return bHasPercentageColumns;
	};

	/**
	 * Check if table has only non flexible columns with fixed widths and only then
	 * the table adds a dummy column to fill the rest of the width instead of resizing
	 * the columns to fit the complete table width
	 * @private
	 */
	Table.prototype._hasOnlyFixColumnWidths = function() {
		var bOnlyFixColumnWidths = true;
		jQuery.each(this.getColumns(), function(iIndex, oColumn) {
			var sWidth = oColumn.getWidth();
			if (oColumn.getFlexible() || !sWidth || sWidth.substr(-2) !== "px") {
				bOnlyFixColumnWidths = false;
				return false;
			}
		});
		return bOnlyFixColumnWidths;
	};


	// =============================================================================
	// SORTING & FILTERING
	// =============================================================================

	/**
	 * pushes the sorted column to array
	 *
	 * @param {sap.ui.table.Column} oColumn
	 *         column to be sorted
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
	 * @type sap.ui.table.Table
	 * @private
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	Table.prototype.pushSortedColumn = function(oColumn, bAdd) {

		if (!bAdd) {
			this._aSortedColumns = [];
		}

		this._aSortedColumns.push(oColumn);

	};

	/**
	 * gets sorted columns
	 *
	 * @return Array of sorted columns
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getSortedColumns = function() {

		return this._aSortedColumns;

	};

	/**
	 * sorts the given column ascending or descending
	 *
	 * @param {sap.ui.table.Column} oColumn
	 *         column to be sorted
	 * @param {sap.ui.table.SortOrder} oSortOrder
	 *         sort order of the column (if undefined the default will be ascending)
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.sort = function(oColumn, oSortOrder, bAdd) {
		if (jQuery.inArray(oColumn, this.getColumns()) >= 0) {
			oColumn.sort(oSortOrder === sap.ui.table.SortOrder.Descending, bAdd);
		}
	};


	/**
	 * filter the given column by the given value
	 *
	 * @param {sap.ui.table.Column} oColumn
	 *         column to be filtered
	 * @param {string} sValue
	 *         filter value as string (will be converted)
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.filter = function(oColumn, sValue) {
		if (jQuery.inArray(oColumn, this.getColumns()) >= 0) {
			oColumn.filter(sValue);
		}
	};


	// =============================================================================
	// SELECTION HANDLING
	// =============================================================================

	Table.prototype._getSelectOnCellsAllowed = function () {
		var sSelectionBehavior = this.getSelectionBehavior();
		var sSelectionMode = this.getSelectionMode();
		return sSelectionMode !== sap.ui.table.SelectionMode.None && (sSelectionBehavior === sap.ui.table.SelectionBehavior.Row || sSelectionBehavior === sap.ui.table.SelectionBehavior.RowOnly);
	};

	/**
	 * Retrieve Aria descriptions from resource bundle for a certain selection mode
	 * @param {Boolean} [bConsiderSelectionState] set to true if the current selection state of the table shall be considered
	 * @param {String} [sSelectionMode] optional parameter. If no selection mode is set, the current selection mode of the table is used
	 * @returns {{mouse: {rowSelect: string, rowDeselect: string}, keyboard: {rowSelect: string, rowDeselect: string}}}
	 * @private
	 */
	Table.prototype._getAriaTextsForSelectionMode = function (bConsiderSelectionState, sSelectionMode) {
		if (!sSelectionMode) {
			sSelectionMode = this.getSelectionMode();
		}

		var oResBundle = this._oResBundle;
		var mTooltipTexts = {
			mouse: {
				rowSelect: "",
				rowDeselect: ""
			},
			keyboard:{
				rowSelect: "",
				rowDeselect: ""
			}};

		if (sSelectionMode === sap.ui.table.SelectionMode.Single) {
			mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT");
			mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT");
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");
		} else if (sSelectionMode === sap.ui.table.SelectionMode.Multi) {
			mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI");
			mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_MULTI");
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_KEY");
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_MULTI_KEY");

			if (bConsiderSelectionState === true) {
				if (this.getSelectedIndices().length === 1) {
					// in multi selection case, if there is only one row selected it's not required
					// to press CTRL in order to only deselect this single row hence use the description text
					// of the single de-selection.
					// for selection it's different since the description for SHIFT/CTRL handling is required
					mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT");
					mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");
				} else if (this.getSelectedIndices().length === 0) {
					// if there are no rows selected in multi selection mode, it's not required to press CTRL or SHIFT
					// in order to enhance the selection.
					mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT");
					mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
				}
			}

		} else if (sSelectionMode === sap.ui.table.SelectionMode.MultiToggle) {
			mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_TOGGLE");
			// text for de-select is the same like for single selection
			mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT");
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_TOGGLE_KEY");
			// text for de-select is the same like for single selection
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");

			if (bConsiderSelectionState === true && this.getSelectedIndices().length === 0) {
				// if there is no row selected yet, the selection is like in single selection case
				mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT");
				mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
			}
		}

		return mTooltipTexts;
	};

	/**
	 * updates the visual selection in the HTML markup
	 * @private
	 */
	Table.prototype._updateSelection = function() {
		if (this.getSelectionMode() === sap.ui.table.SelectionMode.None) {
			// there is no selection which needs to be updated. With the switch of the
			// selection mode the selection was cleared (and updated within that step)
			return;
		}

		// retrieve tooltip and aria texts only once and pass them to the rows _updateSelection function
		var mTooltipTexts = this._getAriaTextsForSelectionMode(true);

		// check whether the row can be clicked to change the selection
		var bSelectOnCellsAllowed = this._getSelectOnCellsAllowed();

		// trigger the rows to update their selection
		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow._updateSelection(this, mTooltipTexts, bSelectOnCellsAllowed);
		}
		// update internal property to reflect the correct index
		this.setProperty("selectedIndex", this.getSelectedIndex(), true);
	};


	/**
	 * notifies the selection listeners about the changed rows
	 * @private
	 */
	Table.prototype._onSelectionChanged = function(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");
		var iRowIndex = this._iSourceRowIndex !== undefined ? this._iSourceRowIndex : this.getSelectedIndex();
		this._updateSelection();
		var oSelMode = this.getSelectionMode();
		if (oSelMode === "Multi" || oSelMode === "MultiToggle") {
			this.$("selall").attr('title',this._oResBundle.getText("TBL_SELECT_ALL")).addClass("sapUiTableSelAll");
		}
		this.fireRowSelectionChange({
			rowIndex: iRowIndex,
			rowContext: this.getContextByIndex(iRowIndex),
			rowIndices: aRowIndices
		});
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Returns the context of a row by its index. Please note that for server-based models like OData,
	 * the supplied index might not have been loaded yet. If the context is not available at the client,
	 * the binding will trigger a backend request and request this single context. Although this API
	 * looks synchronous it may not return a context but load it and fire a change event on the binding.
	 *
	 * For server-based models you should consider to only make this API call when the index is within
	 * the currently visible scroll area.
	 *
	 * @param {int} iIndex
	 *         Index of the row to return the context from.
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getContextByIndex = function(iIndex) {
		// TODO: ODataListBinding needs to make sure to prevent loading multiple times
		// index must not be smaller than 0! otherwise the ODataModel fails
		var oBinding = this.getBinding("rows");
		return iIndex >= 0 && oBinding ? oBinding.getContexts(iIndex, 1)[0] : null;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.getSelectedIndex = function() {
		return this._oSelection.getLeadSelectedIndex();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setSelectedIndex = function(iIndex) {
		if (iIndex === -1) {
			//If Index eq -1 no item is selected, therefore clear selection is called
			//SelectionModel doesn't know that -1 means no selection
			this.clearSelection();
		} else {
			this._oSelection.setSelectionInterval(iIndex, iIndex);
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Removes complete selection.
	 *
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.clearSelection = function() {
		this._oSelection.clearSelection();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Add all rows to the selection.
	 * Please note that for server based models like OData the indices which are considered to be selected might not
	 * be available at the client yet. Calling getContextByIndex might not return a result but trigger a roundtrip
	 * to request this single entity.
	 *
	 * @return sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.selectAll = function() {
		var oSelMode = this.getSelectionMode();
		if (!this.getEnableSelectAll() || (oSelMode != "Multi" && oSelMode != "MultiToggle")) {
			return this;
		}
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			// first give the higher number. The toIndex will be used as leadIndex. It more likely that
			// in oData case the index 0 is already loaded than that the last index is loaded. The leadIndex will
			// be used to determine the leadContext in the selectionChange event. If not yet loaded it would need to
			// be request. To avoid unnecessary roundtrips the lead index is set to 0.
			this._oSelection.setSelectionInterval((oBinding.getLength() || 0) - 1, 0);
			this.$("selall").attr('title',this._oResBundle.getText("TBL_DESELECT_ALL")).removeClass("sapUiTableSelAll");
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Zero-based indices of selected items, wrapped in an array. An empty array means "no selection".
	 *
	 * @return int[]
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getSelectedIndices = function() {
		return this._oSelection.getSelectedIndices();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Adds the given selection interval to the selection. In case of single selection the "indexTo" value will be used for as selected index.
	 *
	 * @param {int} iIndexFrom
	 *         Index from which .
	 * @param {int} iIndexTo
	 *         Indices of the items that shall additionally be selected.
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		this._oSelection.addSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Sets the given selection interval as selection. In case of single selection the "indexTo" value will be used for as selected index.
	 *
	 * @param {int} iIndexFrom
	 *         Index from which .
	 * @param {int} iIndexTo
	 *         Indices of the items that shall additionally be selected.
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		this._oSelection.setSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection this call removeSelectedIndex with the "indexTo" value.
	 *
	 * @param {int} iIndexFrom
	 *         Index from which .
	 * @param {int} iIndexTo
	 *         Indices of the items that shall additionally be selected.
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		this._oSelection.removeSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Returns whether the given index is selected.
	 *
	 * @param {int} iIndex
	 *         Index which is checked for selection state.
	 * @type boolean
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.isIndexSelected = function(iIndex) {
		return this._oSelection.isSelectedIndex(iIndex);
	};


	// =============================================================================
	// KEYBOARD HANDLING HELPERS
	// =============================================================================

	/**
	 * scrolls down a single row
	 * @private
	 */
	Table.prototype._scrollNext = function() {
		// we are at the end => scroll one down if possible
		if (this.getFirstVisibleRow() < this._getRowCount() - this.getVisibleRowCount()) {
			this.setFirstVisibleRow(Math.min(this.getFirstVisibleRow() + 1, this._getRowCount() - this.getVisibleRowCount()));
		}
	};

	/**
	 * scrolls up a single row
	 * @private
	 */
	Table.prototype._scrollPrevious = function() {
		// we are at the beginning => scroll one up if possible
		if (this.getFirstVisibleRow() > 0) {
			this.setFirstVisibleRow(Math.max(this.getFirstVisibleRow() - 1, 0));
		}
	};

	/**
	 * scrolls down a up page
	 * @private
	 */
	Table.prototype._scrollPageUp = function() {
		this.setFirstVisibleRow(Math.max(this.getFirstVisibleRow() - this.getVisibleRowCount(), 0));
	};

	/**
	 * scrolls down a complete page
	 * @private
	 */
	Table.prototype._scrollPageDown = function() {
		this.setFirstVisibleRow(Math.min(this.getFirstVisibleRow() + this.getVisibleRowCount() - this.getFixedBottomRowCount(), this._getRowCount() - this.getVisibleRowCount()));
	};

	/**
	 * checks if the current target domref is in the first row of the table
	 * @private
	 */
	Table.prototype._isTopRow = function(oEvent) {
		var $target = jQuery(oEvent.target);
		var iRowIndex = parseInt($target.add($target.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"), 10);
		var iFixedRows = this.getFixedRowCount();
		if (iFixedRows > 0 && iRowIndex >= iFixedRows) {
			return iRowIndex === iFixedRows;
		}
		return iRowIndex === 0;
	};

	/**
	 * checks if the current target domref is in the last row of the table
	 * @private
	 */
	Table.prototype._isBottomRow = function(oEvent) {
		var $target = jQuery(oEvent.target);
		var iRowIndex = parseInt($target.add($target.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"), 10);
		var iFixedRows = this.getFixedBottomRowCount();
		if (iFixedRows > 0 && iRowIndex <= this.getVisibleRowCount() - 1 - iFixedRows) {
			return iRowIndex === this.getVisibleRowCount() - 1 - iFixedRows;
		}
		return iRowIndex === this.getVisibleRowCount() - 1;
	};

	/**
	 * enters the action mode. in the action mode the user can navigate through the
	 * interactive controls of the table by using the TAB & SHIFT-TAB. this table is
	 * aligned with the official WAI-ARIA 1.0.
	 * @private
	 */
	Table.prototype._enterActionMode = function($Focusable) {
		// only enter the action mode when not already in action mode and:
		if ($Focusable.length > 0 && !this._bActionMode) {

			//If cell has no tabbable element, we don't do anything
			if ($Focusable.filter(":sapTabbable").length == 0) {
				return;
			}

			// in the action mode we need no item navigation
			this._bActionMode = true;
			this.removeDelegate(this._oItemNavigation);

			// remove the tab index from the item navigation
			jQuery(this._oItemNavigation.getFocusedDomRef()).attr("tabindex", "-1");

			// set the focus to the active control
			$Focusable.filter(":sapTabbable").eq(0).focus();
		}
	};

	/**
	 * leaves the action mode and enters the navigation mode. in the navigation mode
	 * the user can navigate through the cells of the table by using the arrow keys,
	 * page up & down keys, home and end keys. this table is aligned with the
	 * official WAI-ARIA 1.0.
	 * @private
	 */
	Table.prototype._leaveActionMode = function(oEvent) {

	 // TODO: update ItemNavigation position otherwise the position is strange!
	 //        EDIT AN SCROLL!

		if (this._bActionMode) {

			// in the navigation mode we use the item navigation
			this._bActionMode = false;
			this.addDelegate(this._oItemNavigation);

			// reset the tabindex of the focused domref of the item navigation
			jQuery(this._oItemNavigation.getFocusedDomRef()).attr("tabindex", "0");

			// when we have an event which is responsible to leave the action mode
			// we search for the closest
			if (oEvent) {
				if (jQuery(oEvent.target).closest("td[tabindex='-1']").length > 0) {
					// triggered when clicking into a cell, then we focus the cell
					var iIndex = jQuery(this._oItemNavigation.aItemDomRefs).index(jQuery(oEvent.target).closest("td[tabindex='-1']").get(0));
					this._oItemNavigation.focusItem(iIndex, null);
				} else {
					// somewhere else means whe check if the click happend inside
					// the container, then we focus the last focused element
					// (DON'T KNOW IF THIS IS OK - but we don't know where the focus was!)
					if (jQuery.sap.containsOrEquals(this.$().find(".sapUiTableCCnt").get(0), oEvent.target)) {
						this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex(), null);
					}
				}
			} else {
				// when no event is given we just focus the last focused index
				this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex(), null);
			}

		}

	};

	/**
	 * Return the focused row index.
	 * @return {int} the currently focused row index.
	 * @private
	 */
	Table.prototype._getFocusedRowIndex = function() {
		var iFocusedIndex = this._oItemNavigation.iFocusedIndex;
		var iColumns = this._oItemNavigation.iColumns;
		var iSelectedCellInRow = iFocusedIndex % iColumns;
		var iSelectedRow = this.getFirstVisibleRow() + (iFocusedIndex - iSelectedCellInRow) / iColumns;

		if (!this.getColumnHeaderVisible()) {
			iSelectedRow++;
		}
		return iSelectedRow - 1;
	};

	/**
	 * Checks whether the row of the currently focused cell is selected or not.
	 * @return {boolean} true or false
	 * @private
	 */
	Table.prototype._isFocusedRowSelected = function() {
		var iSelectedRow = this._getFocusedRowIndex();
		var bIsFocusedRowSelected = this.isIndexSelected(iSelectedRow);

		var bIsCellRowHeader = (this._oItemNavigation.iFocusedIndex % this._oItemNavigation.iColumns == 0);
		if (bIsCellRowHeader) {
			return bIsFocusedRowSelected;
		} else {
			var bHasRowHeader = this.getSelectionMode() !== sap.ui.table.SelectionMode.None && this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly;
			if (bHasRowHeader) {
				return null;
			} else {
				return bIsFocusedRowSelected;
			}
		}
	};

	// =============================================================================
	// KEYBOARD HANDLING EVENTS
	// =============================================================================

	// FYI: two more relevant things are handled in the onclick and onfocusin event

	/**
	 * handle the row selection via SPACE or ENTER key if key is pressed on a group header, the open state is toggled
	 * @private
	 */
	Table.prototype.onkeyup = function(oEvent) {
		if (!this._bEventSapSelect === true) {
			return;
		}

		this._bEventSapSelect = false;

		// this mimics the sapselect event but on keyup
		if (oEvent.keyCode !== jQuery.sap.KeyCodes.ENTER &&
			oEvent.keyCode !== jQuery.sap.KeyCodes.SPACE &&
			oEvent.keyCode !== jQuery.sap.KeyCodes.F4 ||
			oEvent.srcControl !== this &&
			jQuery.inArray(oEvent.srcControl,this.getRows()) === -1 &&
			jQuery.inArray(oEvent.srcControl,this.getColumns()) === -1) {
			return;
		}
		var $Parent = jQuery(oEvent.target).closest('.sapUiTableGroupHeader');
		if ($Parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($Parent.attr("data-sap-ui-rowindex"), 10);
			var oBinding = this.getBinding("rows");
			if (oBinding) {
				if (oBinding.isExpanded(iRowIndex)) {
					oBinding.collapse(iRowIndex);
				} else {
					oBinding.expand(iRowIndex);
				}
			}
			oEvent.preventDefault();
			return;
		}
		this._bShowMenu = true;
		this._onSelect(oEvent);
		this._bShowMenu = false;
		oEvent.preventDefault();
	};

	/**
	 * @private
	 */
	Table.prototype.onsapselect = function() {
		this._bEventSapSelect = true;
	};

	/**
	 * @private
	 */
	Table.prototype.onsapselectmodifiers = function() {
		this._bEventSapSelect = true;
	};

	Table.prototype.onsapspace = function(oEvent) {
		var $target = jQuery(oEvent.target);
		if (((this.getSelectionBehavior() == sap.ui.table.SelectionBehavior.Row || this.getSelectionBehavior() == sap.ui.table.SelectionBehavior.RowOnly) && oEvent.srcControl instanceof sap.ui.table.Row) ||
			$target.hasClass("sapUiTableRowHdr") || $target.hasClass("sapUiTableColRowHdr") || $target.hasClass("sapUiTableCol")) {
			oEvent.preventDefault();
		}
	};

	/**
	 * handle the row selection via SPACE or ENTER key
	 * @private
	 */
	Table.prototype.onkeydown = function(oEvent) {
		var $this = this.$();

		if (!this._bActionMode &&
			oEvent.keyCode == jQuery.sap.KeyCodes.F2 ||
			oEvent.keyCode == jQuery.sap.KeyCodes.ENTER) {
			if ($this.find(".sapUiTableCtrl td:focus").length > 0) {
				this._enterActionMode($this.find(".sapUiTableCtrl td:focus").find(":sapFocusable"));
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		} else if (this._bActionMode &&
			oEvent.keyCode == jQuery.sap.KeyCodes.F2) {
			this._leaveActionMode(oEvent);
		} else if (oEvent.keyCode == jQuery.sap.KeyCodes.TAB && this._bActionMode) {
			//Set tabindex to second table if fixed columns are used
			if (this.getFixedColumnCount() > 0) {
				var $cell = jQuery(oEvent.target);
				if ($cell.is("td[role=gridcell]") == false) {
					$cell = $cell.parents("td[role=gridcell]");
				}
				var $row = $cell.parent("tr[data-sap-ui-rowindex]");
				var $table = $row.closest(".sapUiTableCtrl");
				var iRowIndex = parseInt($row.attr("data-sap-ui-rowindex"),10);
				var $cells = $row.find("td[role=gridcell]");
				var iColIndex = $cells.index($cell);
				var iTableCols = $cells.length;
				if (iColIndex === (iTableCols - 1)) {
					var $otherTable;
					if ($table.hasClass("sapUiTableCtrlFixed")) {
						$otherTable = $this.find(".sapUiTableCtrl.sapUiTableCtrlScroll");
					} else {
						$otherTable = $this.find(".sapUiTableCtrl.sapUiTableCtrlFixed");
						iRowIndex++;
						if (iRowIndex == this.getVisibleRowCount()) {
							iRowIndex = 0;
						}
					}
					var $otherRow = $otherTable.find("tr[data-sap-ui-rowindex='" + iRowIndex + "']");
					var $nextFocus = $otherRow.find("td :sapFocusable[tabindex='0']").first();
					if ($nextFocus.length > 0) {
						$nextFocus.focus();
						oEvent.preventDefault();
					}
				}
			}
		} else if (oEvent.keyCode == jQuery.sap.KeyCodes.A && (oEvent.metaKey || oEvent.ctrlKey)) {
			// CTRL + A handling
			var oIN = this._oItemNavigation;
			var iFocusedIndex = oIN.getFocusedIndex();

			this._toggleSelectAll();

			oIN.focusItem(iFocusedIndex, oEvent);

			oEvent.preventDefault();
			oEvent.stopImmediatePropagation(true);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.F10 && (oEvent.shiftKey)) {
			// SHIFT + 10 should open the context menu
			this.oncontextmenu(oEvent);
		}
	};

	/**
	 * handle the ESCAPE key to leave the action mode
	 * @private
	 */
	Table.prototype.onsapescape = function(oEvent) {
		this._leaveActionMode(oEvent);
	};

	/**
	 * handle the SHIFT-TAB key
	 * <ul>
	 *   <li>Navigation Mode:
	 *      <ul>
	 *          <li>If focus is on header: jump to the next focusable control before the table</li>
	 *          <li>If focus in on content: jump to header for the current column</li>
	 *      </ul>
	 *   <li>Action Mode: switch back to navigation mode</li>
	 * </ul>
	 * @private
	 */
	Table.prototype.onsaptabprevious = function(oEvent) {
		var $this = this.$();
		if (this._bActionMode) {
			this._leaveActionMode();
			oEvent.preventDefault();
		} else {
			var oIN = this._oItemNavigation;
			var bNoData = this.$().hasClass("sapUiTableEmpty");
			var oSapUiTableCCnt = $this.find('.sapUiTableCCnt')[0];
			var bFocusFromTableContent = jQuery.contains(oSapUiTableCCnt, oEvent.target);

			if (bFocusFromTableContent && this.getColumnHeaderVisible()) {
				// Focus comes from table content. Focus the column header which corresponds to the
				// selected column (column index)
				var iColumn = oIN.getFocusedIndex() % oIN.iColumns;
				oIN.focusItem(iColumn, oEvent);
				oEvent.preventDefault();
			} else if (oIN.getFocusedDomRef() === oEvent.target && jQuery.sap.containsOrEquals(oSapUiTableCCnt, oEvent.target) ||
				(!this.getColumnHeaderVisible() && bNoData && bFocusFromTableContent)) {
				// in case of having the focus in the row or column header we do not need to
				// place the focus to the div before the table control because there we do
				// not need to skip the table controls anymore.
				this._bIgnoreFocusIn = true;
				$this.find(".sapUiTableCtrlBefore").focus();
				this._bIgnoreFocusIn = false;
			}
		}
	};

	/**
	 * handle the TAB key:
	 * <ul>
	 *   <li>Navigation Mode:
	 *      <ul>
	 *          <li>If focus is on header: jump to the first data column of the focused column header</li>
	 *          <li>If focus in on content: jump to the next focusable control after the table</li>
	 *      </ul>
	 *   <li>Action Mode: switch back to navigation mode</li>
	 * </ul>
	 * @private
	 */
	Table.prototype.onsaptabnext = function(oEvent) {
		var $this = this.$();
		if (this._bActionMode) {
			this._leaveActionMode();
			oEvent.preventDefault();
		} else {
			var oIN = this._oItemNavigation;
			var bContainsColHdrCnt = jQuery.contains($this.find('.sapUiTableColHdrCnt')[0], oEvent.target);
			var bNoData = this.$().hasClass("sapUiTableEmpty");

			if (bContainsColHdrCnt && !bNoData) {
				oIN.focusItem(oIN.getFocusedIndex() + oIN.iColumns * this._iLastSelectedDataRow, oEvent);
				oEvent.preventDefault();
			} else if (oIN.getFocusedDomRef() === oEvent.target || (bNoData && bContainsColHdrCnt)) {
				this._bIgnoreFocusIn = true;
				$this.find(".sapUiTableCtrlAfter").focus();
				this._bIgnoreFocusIn = false;
			}
		}
	};

	/**
	 *
	 * @param bForceUpdate
	 * @private
	 */
	Table.prototype._updateAriaRowOfRowsText = function(bForceUpdate) {
		var oAriaElement = document.getElementById(this.getId() + "-rownumberofrows");

		if (!oAriaElement) {
			// table is not in DOM anymore
			return;
		}

		var oIN = this._oItemNavigation;
		if (oIN) {
			var iIndex = oIN.getFocusedIndex();
			var iColumnNumber = iIndex % oIN.iColumns;

			var iFirstVisibleRow = this.getFirstVisibleRow();
			var iTotalRowCount = this._getRowCount();
			var iRowIndex = Math.floor(iIndex / oIN.iColumns) + iFirstVisibleRow + 1 - this._getHeaderRowCount();

			var sRowCountText = this._oResBundle.getText("TBL_ROW_ROWCOUNT", [iRowIndex, iTotalRowCount]);
			if (iRowIndex > 0 && iColumnNumber === 0 || bForceUpdate) {
				oAriaElement.innerText = sRowCountText;
			} else {
				oAriaElement.innerText = " ";
			}
		}
	};


	/**
	 * dynamic scrolling when reaching the bottom row with the ARROW DOWN key
	 * @private
	 */
	Table.prototype.onsapdown = function(oEvent) {
		if (!this._bActionMode && this._isBottomRow(oEvent)) {
			if (this.getFirstVisibleRow() != this._getRowCount() - this.getVisibleRowCount()) {
				oEvent.stopImmediatePropagation(true);
				if (this.getNavigationMode() === sap.ui.table.NavigationMode.Scrollbar) {
					this._scrollNext();
				} else {
					this._scrollPageDown();
				}
			}
		}
		oEvent.preventDefault();
	};

	/**
	 * Implements selecting/deselecting rows when pressing SHIFT + DOWN
	 * @private
	 */
	Table.prototype.onsapdownmodifiers = function(oEvent) {
		if (oEvent.shiftKey) {
			var iFocusedRow = this._getFocusedRowIndex();
			var bIsFocusedRowSelected = this._isFocusedRowSelected();
			if (bIsFocusedRowSelected === true) {
				this.addSelectionInterval(iFocusedRow + 1, iFocusedRow + 1);
			} else if (bIsFocusedRowSelected === false) {
				this.removeSelectionInterval(iFocusedRow + 1, iFocusedRow + 1);
			}

			if (this._isBottomRow(oEvent)) {
				this._scrollNext();
			}
		} else if (oEvent.altKey) {
			// Toggle group header on ALT + DOWN.
			this._toggleGroupHeader(oEvent);
		}
	};

	/**
	 * Implements selecting/deselecting rows when pressing SHIFT + UP
	 *
	 * @private
	 */
	Table.prototype.onsapupmodifiers = function(oEvent) {
		if (oEvent.shiftKey) {
			var iFocusedRow = this._getFocusedRowIndex();
			var bIsFocusedRowSelected = this._isFocusedRowSelected();

			if (bIsFocusedRowSelected === true) {
				this.addSelectionInterval(iFocusedRow - 1, iFocusedRow - 1);
			} else if (bIsFocusedRowSelected === false) {
				this.removeSelectionInterval(iFocusedRow - 1, iFocusedRow - 1);
			}

			if (this._isTopRow(oEvent)) {
				// Prevent that focus jumps to header in this case.
				if (this.getFirstVisibleRow() != 0) {
					oEvent.stopImmediatePropagation(true);
				}
				this._scrollPrevious();
			}
		} else if (oEvent.altKey) {
			// Toggle group header on ALT + UP.
			this._toggleGroupHeader(oEvent);
		}
	};

	/**
	 * dynamic scrolling when reaching the top row with the ARROW UP key
	 *
	 * @private
	 */
	Table.prototype.onsapup = function(oEvent) {
		if (!this._bActionMode && this._isTopRow(oEvent)) {
			if (this.getFirstVisibleRow() != 0) {
				oEvent.stopImmediatePropagation(true);
			}
			if (this.getNavigationMode() === sap.ui.table.NavigationMode.Scrollbar) {
				this._scrollPrevious();
			} else {
				this._scrollPageUp();
			}
		}
		oEvent.preventDefault();
	};

	/**
	 * dynamic scrolling when reaching the bottom row with the PAGE DOWN key
	 * @private
	 */
	Table.prototype.onsappagedown = function(oEvent) {
		if (!this._bActionMode) {
			var $this = this.$();
			var oIN = this._oItemNavigation;

			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);
			var iHeaderRows = $this.find(".sapUiTableColHdrScr>.sapUiTableColHdr").length;

			// Check if focus is on header
			// Special Handling is required here:
			// - If not in the last header row, jump to the last header row in the same column
			// - If in the last header row, scroll table to first row and jump to first row, same column
			if (this.getColumnHeaderVisible() && oIN.iFocusedIndex < (oIN.iColumns * iHeaderRows)) {
				// focus is on header
				var iCol = oIN.iFocusedIndex % oIN.iColumns;
				if ((oIN.iFocusedIndex <= (oIN.iColumns * iHeaderRows) && oIN.iFocusedIndex >= (oIN.iColumns * iHeaderRows) - oIN.iColumns) ||
					(iCol === 0 && bRowHeader)) {
					// move focus to first data row, scroll table to top
					this.setFirstVisibleRow(0);
					oIN.focusItem(oIN.iColumns * iHeaderRows + iCol, oEvent);
				} else {
					// set focus to last header row, same column if possible
					oIN.focusItem(oIN.iColumns * iHeaderRows - oIN.iColumns + iCol, oEvent);
				}

				oEvent.stopImmediatePropagation(true);
			} else {
				if (this._isBottomRow(oEvent)) {
					this._scrollPageDown();
				}

				var iFixedBottomRowsOffset = this.getFixedBottomRowCount();
				if (this.getFirstVisibleRow() === this._getRowCount() - this.getVisibleRowCount()) {
					iFixedBottomRowsOffset = 0;
				}

				var iRowCount = (oIN.aItemDomRefs.length / oIN.iColumns) - iFixedBottomRowsOffset;
				var iCol = oIN.iFocusedIndex % oIN.iColumns;
				var iIndex = (iRowCount - 1) * oIN.iColumns + iCol;

				oIN.focusItem(iIndex, oEvent);

				oEvent.stopImmediatePropagation(true);
			}
			oEvent.preventDefault();
		}
	};

	/**
	 * dynamic scrolling when reaching the top row with the PAGE DOWN key
	 * @private
	 */
	Table.prototype.onsappagedownmodifiers = function(oEvent) {
		if (!this._bActionMode && oEvent.altKey) {
			var oIN = this._oItemNavigation;
			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);

			var iCol = oIN.iFocusedIndex % oIN.iColumns;
			var iNewCol;
			if (iCol == 0 && bRowHeader) {
				iNewCol = 1;
			} else {
				var iVisibleColumns = this._aVisibleColumns.length;
				var iMaxIndex = this._getVisibleColumns().length;
				if (!bRowHeader) {
					iMaxIndex--;
				}
				if (iVisibleColumns === 0) {
					iNewCol = iMaxIndex;
				} else {
					iNewCol = Math.min(iMaxIndex, iCol + iVisibleColumns);
				}
			}
			oIN.focusItem(oIN.iFocusedIndex - (iCol - iNewCol), oEvent);
			oEvent.stopImmediatePropagation(true);
			oEvent.preventDefault();
		}
	};

	/**
	 * dynamic scrolling when reaching the top row with the PAGE UP key
	 * @private
	 */
	Table.prototype.onsappageup = function(oEvent) {
		if (!this._bActionMode) {
			var $this = this.$();
			var oIN = this._oItemNavigation;

			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);
			var iHeaderRows = $this.find(".sapUiTableColHdrScr>.sapUiTableColHdr").length;
			var iCol = oIN.iFocusedIndex % oIN.iColumns;

			if (this.getColumnHeaderVisible() && oIN.iFocusedIndex < (oIN.iColumns * iHeaderRows)) {
				// focus is on header
				if (oIN.iFocusedIndex > oIN.iColumns) {
					// focus is not on the first header row, move to first
					oIN.focusItem(iCol, oEvent);
				}
				oEvent.stopImmediatePropagation(true);
			} else {
				// focus is on content area
				if (this.getColumnHeaderVisible() && this.getFirstVisibleRow() == 0 && this._isTopRow(oEvent)) {
					// focus is on first row, move to last header row, same column
					if (bRowHeader && iCol === 0) {
						oIN.focusItem(iCol, oEvent);
					} else {
						oIN.focusItem(oIN.iColumns * iHeaderRows - oIN.iColumns + iCol, oEvent);
					}
					oEvent.stopImmediatePropagation(true);
				} else {
					var iIndex = this.getColumnHeaderVisible() ? oIN.iColumns * iHeaderRows : 0;
					oIN.focusItem(iIndex + iCol, oEvent);
					oEvent.stopImmediatePropagation(true);

					if (this._isTopRow(oEvent)) {
						this._scrollPageUp();
					}
				}
			}

			oEvent.preventDefault();
		}
	};

	/**
	 * dynamic scrolling when reaching the top row with the PAGE UP key
	 * @private
	 */
	Table.prototype.onsappageupmodifiers = function(oEvent) {
		if (!this._bActionMode && oEvent.altKey) {
			var oIN = this._oItemNavigation;
			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);

			var iCol = oIN.iFocusedIndex % oIN.iColumns;
			if (iCol > 0) {
				var iNewCol;
				if (iCol == 1 && bRowHeader) {
					iNewCol = 0;
				} else {
					var iVisibleColumns = this._aVisibleColumns.length;
					if (iVisibleColumns === 0) {
						if (bRowHeader) {
							iNewCol = 1;
						} else {
							iNewCol = 0;
						}
					} else {
						var iMin = 1;
						if (!bRowHeader) {
							iMin = 0;
						}
						iNewCol = Math.max(iMin, iCol - iVisibleColumns);
					}
				}
				oIN.focusItem(oIN.iFocusedIndex - (iCol - iNewCol), oEvent);
			}
			oEvent.stopImmediatePropagation(true);
			oEvent.preventDefault();
		}
	};

	/**
	 * Keyboard Handling regarding HOME key
	 *
	 * @private
	 */
	Table.prototype.onsaphome = function(oEvent) {
		var bIsRowOnly = (this.getSelectionBehavior() == sap.ui.table.SelectionBehavior.RowOnly);

		// If focus is on a group header, do nothing.
		var bIsGroupCell = jQuery(oEvent.target).parents(".sapUiTableGroupHeader").length > 0;
		if (bIsGroupCell) {
			oEvent.stopImmediatePropagation(true);
			return;
		}

		var iFocusedIndex = this._oItemNavigation.iFocusedIndex;
		var iColumns = this._oItemNavigation.iColumns;
		var iSelectedCellInRow = iFocusedIndex % iColumns;

		var offset = 0;
		if (!bIsRowOnly) {
			offset = 1;
		}

		if (iSelectedCellInRow > this.getFixedColumnCount() + offset) {
			// If there is a fixed column, stop right of it.
			oEvent.stopImmediatePropagation(true);
			this._oItemNavigation.focusItem(iFocusedIndex - iSelectedCellInRow + this.getFixedColumnCount() + offset, null);
		} else if (!bIsRowOnly) {
			if (iSelectedCellInRow > 1) {
				// if focus is anywhere in the row, move focus to the first column cell.
				oEvent.stopImmediatePropagation(true);
				this._oItemNavigation.focusItem(iFocusedIndex - iSelectedCellInRow + 1, null);
			} else if (iSelectedCellInRow == 1) {
				// if focus is on first cell, move focus to row header.
				oEvent.stopImmediatePropagation(true);
				this._oItemNavigation.focusItem(iFocusedIndex - 1, null);
			} else {
				// If focus is on selection cell, do nothing.
				oEvent.stopImmediatePropagation(true);
			}
		}
	};

	/**
	 * Keyboard Handling regarding END key
	 *
	 * @private
	 */
	Table.prototype.onsapend = function(oEvent) {
		// If focus is on a group header, do nothing.
		var bIsGroupCell = jQuery(oEvent.target).parents(".sapUiTableGroupHeader").length > 0;
		if (bIsGroupCell) {
			oEvent.stopImmediatePropagation(true);
			return;
		}

		// If focus is on a selection cell, move focus to the first cell of the same row.
		var iFocusedIndex = this._oItemNavigation.iFocusedIndex;
		var iColumns = this._oItemNavigation.iColumns;
		var iSelectedCellInRow = iFocusedIndex % iColumns;

		var bIsRowOnly = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);
		var offset = 0;
		if (!bIsRowOnly) {
			offset = 1;
		}

		if (iSelectedCellInRow === 0 && bIsRowOnly) {
			// If focus is in row header, select first cell in same row.
			oEvent.stopImmediatePropagation(true);
			this._oItemNavigation.focusItem(iFocusedIndex + 1, null);
		} else if (iSelectedCellInRow < this.getFixedColumnCount() - offset) {
			// if their is a fixed column, stop left of it.
			oEvent.stopImmediatePropagation(true);
			this._oItemNavigation.focusItem(iFocusedIndex - iSelectedCellInRow + this.getFixedColumnCount() - offset, null);
		}
	};

	/**
	 * dynamic scrolling when using CTRL + HOME key
	 *
	 * @private
	 */
	Table.prototype.onsaphomemodifiers = function(oEvent) {
		if (oEvent.metaKey || oEvent.ctrlKey) {
			var $this = this.$();

			// Is target a table header cell
			var oTableHeader = $this.find(".sapUiTableColHdrCnt")[0];
			var bIsTableHeaderCell = jQuery.contains(oTableHeader, oEvent.target);

			// If focus is on a group header, do nothing.
			if (bIsTableHeaderCell) {
				oEvent.stopImmediatePropagation(true);
				return;
			}

			var iFocusedIndex = this._oItemNavigation.iFocusedIndex;
			var iColumns = this._oItemNavigation.iColumns;
			var iSelectedRowInColumn = Math.ceil(iFocusedIndex / iColumns) - 1;
			var iSelectedCellInRow = iFocusedIndex % iColumns;

			if (this.getColumnHeaderVisible()) {
				if (iSelectedRowInColumn == 1) {
					// if focus is in first row, select corresponding header
					oEvent.stopImmediatePropagation(true);
					this._oItemNavigation.focusItem(iSelectedCellInRow, oEvent);
				} else if (iSelectedRowInColumn > 1) {
					oEvent.stopImmediatePropagation(true);

					// if focus is in any row, select first cell row
					this.setFirstVisibleRow(0);

					var iTargetIndex = iSelectedCellInRow + iColumns;
					this._oItemNavigation.focusItem(iTargetIndex, oEvent);
				}
			} else {
				oEvent.stopImmediatePropagation(true);

				// if focus is in any row, select first cell row
				this.setFirstVisibleRow(0);

				var iTargetIndex = iFocusedIndex - iSelectedRowInColumn * iColumns;
				this._oItemNavigation.focusItem(iTargetIndex, oEvent);
			}
		}
	};

	/**
	 * dynamic scrolling when using CTRL + END key
	 *
	 * @private
	 */
	Table.prototype.onsapendmodifiers = function(oEvent) {
		if (oEvent.metaKey || oEvent.ctrlKey) {
			var $this = this.$();

			// Is target a table header cell
			var oTableHeader = $this.find(".sapUiTableColHdrCnt")[0];
			var bIsTableHeaderCell = jQuery.contains(oTableHeader, oEvent.target);

			var iFocusedIndex = this._oItemNavigation.iFocusedIndex;
			var iColumns = this._oItemNavigation.iColumns;
			var iSelectedCellInRow = iFocusedIndex % iColumns;

			oEvent.stopImmediatePropagation(true);

			if (bIsTableHeaderCell) {
				// If focus is on a group header, select first cell row after header.
				this._oItemNavigation.focusItem(iFocusedIndex + iColumns, oEvent);
			} else {
				// if focus is on any cell row, select last cell row.
				this.setFirstVisibleRow(this._getRowCount() - this.getVisibleRowCount());
				var iTargetIndex = this._oItemNavigation.aItemDomRefs.length - (iColumns - iSelectedCellInRow);
				this._oItemNavigation.focusItem(iTargetIndex, oEvent);
			}
		}
	};

	/**
	 * Default handler for sapleft event.
	 * @private
	 */
	Table.prototype.onsapleft = function(oEvent) {
		this._collapseGroupHeader(oEvent);
	};

	/**
	 * Default handler for sapright event.
	 * @private
	 */
	Table.prototype.onsapright = function(oEvent) {
		this._expandGroupHeader(oEvent);
	};


	/**
	 * If focus is on group header, open/close the group header, depending on the expand state.
	 * @private
	 */
	Table.prototype._toggleGroupHeader = function(oEvent) {
		var $Parent = jQuery(oEvent.target).closest('.sapUiTableGroupHeader');
		if ($Parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($Parent.attr("data-sap-ui-rowindex"), 10);
			var oBinding = this.getBinding("rows");
			if (oBinding && oBinding.isExpanded(iRowIndex)) {
				oBinding.collapse(iRowIndex);
			} else {
				oBinding.expand(iRowIndex);
			}
			oEvent.preventDefault();
			oEvent.stopImmediatePropagation();
		}
	};

	/**
	 * If focus is on group header, close the group header, else do the default behaviour of item navigation
	 * @private
	 */
	Table.prototype._collapseGroupHeader = function(oEvent) {
		var $Parent = jQuery(oEvent.target).closest('.sapUiTableGroupHeader');
		if ($Parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($Parent.attr("data-sap-ui-rowindex"), 10);
			var oBinding = this.getBinding("rows");
			if (oBinding && oBinding.isExpanded(iRowIndex)) {
				oBinding.collapse(iRowIndex);
			}
			oEvent.preventDefault();
			oEvent.stopImmediatePropagation();
		}
	};

	/**
	 * If focus is on group header, open the group header, else do the default behaviour of item navigation
	 * @private
	 */
	Table.prototype._expandGroupHeader = function(oEvent) {
		var $Parent = jQuery(oEvent.target).closest('.sapUiTableGroupHeader');
		if ($Parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($Parent.attr("data-sap-ui-rowindex"), 10);
			var oBinding = this.getBinding("rows");
			if (oBinding && !oBinding.isExpanded(iRowIndex)) {
				oBinding.expand(iRowIndex);
			}
			oEvent.preventDefault();
			oEvent.stopImmediatePropagation();
		}
	};

	/**
	 * On shift+left on column header decrease the width of a column
	 * @private
	 */
	Table.prototype.onsapleftmodifiers = function(oEvent) {
		var $Target = jQuery(oEvent.target);
		if ($Target.hasClass('sapUiTableCol')) {
			var iColIndex = parseInt($Target.attr('data-sap-ui-colindex'), 10),
				aVisibleColumns = this._getVisibleColumns(),
				oColumn = aVisibleColumns[this._aVisibleColumns.indexOf(iColIndex)];

			 if (oEvent.shiftKey) {
				 var iNewWidth = parseInt(oColumn.getWidth(), 10) - 16;
				oColumn.setWidth((iNewWidth > 20 ? iNewWidth : 20) + "px");
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			} else if (oEvent.ctrlKey || oEvent.metaKey) {
				if (iColIndex - 1 >= 0) {
					// check whether preceding column is part of column span
					var iNewIndex = 0;

					for (var iPointer = this._aVisibleColumns.indexOf(iColIndex) - 1; iPointer >= 0; iPointer--) {
						iNewIndex = this._aVisibleColumns[iPointer];
						if (aVisibleColumns[iPointer].$().css("display") !== "none") {
							break;
						}
					}
					this.removeColumn(oColumn);
					this.insertColumn(oColumn, iNewIndex);

					// also move spanned columns
					var iHeaderSpan = oColumn.getHeaderSpan();
					if (iHeaderSpan > 1) {
						for (var i = 1; i < iHeaderSpan; i++) {
							oColumn = aVisibleColumns[iColIndex + i];
							this.removeColumn(oColumn);
							this.insertColumn(oColumn, iNewIndex + i);
						}
					}
				}
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			}
		}
	};

	/**
	 * On shift+left on column header decrease the width of a column
	 * @private
	 */
	Table.prototype.onsaprightmodifiers = function(oEvent) {
		var $Target = jQuery(oEvent.target);
		if ($Target.hasClass('sapUiTableCol')) {
			var iColIndex = parseInt($Target.attr('data-sap-ui-colindex'), 10);
			var aVisibleColumns = this._getVisibleColumns();
			var iPointer = this._aVisibleColumns.indexOf(iColIndex);
			var oColumn = aVisibleColumns[iPointer];
			 if (oEvent.shiftKey) {
				oColumn.setWidth(parseInt(oColumn.getWidth(), 10) + 16 + "px");
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			} else if (oEvent.ctrlKey || oEvent.metaKey) {
				var iHeaderSpan = oColumn.getHeaderSpan();
				if (iPointer < aVisibleColumns.length - iHeaderSpan) {
					// Depending on the header span of the column to be moved, several
					// columns might need to be moved to the right
					var iNextHeaderSpan = aVisibleColumns[iPointer + 1].getHeaderSpan(),
						iNewIndex = this._aVisibleColumns[iPointer + iNextHeaderSpan];
					//iPointer = this._aVisibleColumns[iPointer];
					for (var i = iHeaderSpan - 1; i >= 0; i--) {
						oColumn = aVisibleColumns[iPointer + i];
						this.removeColumn(oColumn);
						this.insertColumn(oColumn, iNewIndex + i);
					}
				}
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			}
		}
	};

	// =============================================================================
	// GROUPING
	// =============================================================================

	/*
	 * overridden to hide the group by column when set
	 */
	Table.prototype.setGroupBy = function(vValue) {

		// determine the group by column
		var oGroupBy = vValue;
		if (typeof oGroupBy === "string") {
			oGroupBy = sap.ui.getCore().byId(oGroupBy);
		}

		// only for columns we do the full handling here - otherwise the method
		// setAssociation will fail below with a specific fwk error message
		var bReset = false;
		if (oGroupBy && oGroupBy instanceof sap.ui.table.Column) {

			// check for column being part of the columns aggregation
			if (jQuery.inArray(oGroupBy, this.getColumns()) === -1) {
				throw new Error("Column has to be part of the columns aggregation!");
			}

			// fire the event (to allow to cancel the event)
			var bExecuteDefault = this.fireGroup({column: oGroupBy, groupedColumns: [oGroupBy.getId()], type: sap.ui.table.GroupEventType.group});

			// first we reset the grouping indicator of the old column (will show the column)
			var oOldGroupBy = sap.ui.getCore().byId(this.getGroupBy());
			if (oOldGroupBy) {
				oOldGroupBy.setGrouped(false);
				bReset = true;
			}

			// then we set the grouping indicator of the new column (will hide the column)
			// ==> only if the default behavior is not prevented
			if (bExecuteDefault && oGroupBy instanceof sap.ui.table.Column) {
				oGroupBy.setGrouped(true);
			}

		}

		// reset the binding when no value is given or the binding needs to be reseted
		// TODO: think about a better handling to recreate the group binding
		if (!oGroupBy || bReset) {
			var oBindingInfo = this.getBindingInfo("rows");
			delete oBindingInfo.binding;
			this._bindAggregation("rows", oBindingInfo);
		}

		// set the new group by column (TODO: undefined doesn't work!)
		return this.setAssociation("groupBy", oGroupBy);
	};

	/*
	 * override the getBinding to inject the grouping information into the JSON model.
	 *
	 * !!EXPERIMENTAL FEATURE!!
	 *
	 * TODO:
	 *   - Grouping is not really possible for models based on OData:
	 *     - it works when loading data from the beginning because in this case the
	 *       model has the relevant information (distinct values) to determine the
	 *       count of rows and add them properly in the scrollbar as well as adding
	 *       the group information to the contexts array which is used by the
	 *       _modifyRow to display the group headers
	 *     - it doesn't work when not knowing how many groups are available before
	 *       and on which position the group header has to be added - e.g. when
	 *       displaying a snapshot in the middle of the model.
	 *   - For OData it might be a server-side feature?
	 */
	Table.prototype.getBinding = function(sName) {

		// default binding is the "rows" binding
		sName = sName || "rows";
		var oBinding = sap.ui.core.Element.prototype.getBinding.call(this, sName);

		// we do all the extended stuff only when grouping is enabled
		if (this.getEnableGrouping()) {

			// require the binding types (think about loading them only if required)
			jQuery.sap.require("sap.ui.model.ClientListBinding");

			// check for grouping being supported or not (only for client ListBindings!!)
			var oGroupBy = sap.ui.getCore().byId(this.getGroupBy());
			var bIsSupported = oGroupBy && oGroupBy.getGrouped() &&
			                   sName === "rows" && oBinding &&
			                   oBinding instanceof sap.ui.model.ClientListBinding;

			// only enhance the binding if it has not been done yet and supported!
			if (bIsSupported && !oBinding._modified) {

				// once the binding is modified we always return the modified binding
				// and don't wanna modifiy the binding once again
				oBinding._modified = true;

				// hook into the row modification and add the grouping specifics
				this._modifyRow = function(iRowIndex, $row) {

					// we add the style override to display the row header
					this.$().find(".sapUiTableRowHdrScr").css("display", "block");

					// modify the rows
					var $rowHdr = this.$().find("div[data-sap-ui-rowindex='" + $row.attr("data-sap-ui-rowindex") + "']");
					if (oBinding.isGroupHeader(iRowIndex)) {
						$row.addClass("sapUiTableGroupHeader sapUiTableRowHidden");
						var sClass = oBinding.isExpanded(iRowIndex) ? "sapUiTableGroupIconOpen" : "sapUiTableGroupIconClosed";
						$rowHdr.html("<div class=\"sapUiTableGroupIcon " + sClass + "\" tabindex=\"-1\">" + oBinding.getTitle(iRowIndex) + "</div>");
						$rowHdr.addClass("sapUiTableGroupHeader").removeAttr("title");
					} else {
						$row.removeClass("sapUiTableGroupHeader");
						$rowHdr.html("");
						$rowHdr.removeClass("sapUiTableGroupHeader");
					}

				};

				this.onclick = function(oEvent) {
					if (jQuery(oEvent.target).hasClass("sapUiTableGroupIcon")) {
						var $parent = jQuery(oEvent.target).parents("[data-sap-ui-rowindex]");
						if ($parent.length > 0) {
							var iRowIndex = this.getFirstVisibleRow() + parseInt($parent.attr("data-sap-ui-rowindex"), 10);
							var oBinding = this.getBinding("rows");
							if (oBinding.isExpanded(iRowIndex)) {
								oBinding.collapse(iRowIndex);
								jQuery(oEvent.target).removeClass("sapUiTableGroupIconOpen").addClass("sapUiTableGroupIconClosed");
							} else {
								oBinding.expand(iRowIndex);
								jQuery(oEvent.target).removeClass("sapUiTableGroupIconClosed").addClass("sapUiTableGroupIconOpen");
							}
						}
					} else {
						if (Table.prototype.onclick) {
							Table.prototype.onclick.apply(this, arguments);
						}
					}
				};

				// we use sorting finally to sort the values and afterwards group them
				var sPropertyName = oGroupBy.getSortProperty();
				oBinding.sort(new sap.ui.model.Sorter(sPropertyName));

				// fetch the contexts from the original binding
				var iLength = oBinding.getLength(),
					aContexts = oBinding.getContexts(0, iLength);

				// add the context information for the group headers which are later on
				// used for displaying the grouping information of each group
				var sKey;
				var iCounter = 0;
				for (var i = iLength - 1; i >= 0; i--) {
					var sNewKey = aContexts[i].getProperty(sPropertyName);
					if (!sKey) {
						sKey = sNewKey;
					}
					if (sKey !== sNewKey) {
						aContexts.splice(i + 1, 0, {
							oContext: aContexts[i + 1],
							name: sKey,
							count: iCounter,
							groupHeader: true,
							expanded: true
						});
						sKey = sNewKey;
						iCounter = 0;
					}
					iCounter++;
				}
				aContexts.splice(0, 0, {
					oContext: aContexts[0],
					name: sKey,
					count: iCounter,
					groupHeader: true,
					expanded: true
				});

				// extend the binding and hook into the relevant functions to provide
				// access to the grouping information for the _modifyRow function
				jQuery.extend(oBinding, {
					getLength: function() {
						return aContexts.length;
					},
					getContexts: function(iStartIndex, iLength) {
						return aContexts.slice(iStartIndex, iStartIndex + iLength);
					},
					isGroupHeader: function(iIndex) {
						var oContext = aContexts[iIndex];
						return oContext && !(oContext instanceof sap.ui.model.Context);
					},
					getTitle: function(iIndex) {
						var oContext = aContexts[iIndex];
						return oContext && !(oContext instanceof sap.ui.model.Context) && (oContext["name"] + " - " + oContext["count"]);
					},
					isExpanded: function(iIndex) {
						return this.isGroupHeader(iIndex) && aContexts[iIndex].expanded;
					},
					expand: function(iIndex) {
						if (this.isGroupHeader(iIndex) && !aContexts[iIndex].expanded) {
							for (var i = 0; i < aContexts[iIndex].childs.length; i++) {
								aContexts.splice(iIndex + 1 + i, 0, aContexts[iIndex].childs[i]);
							}
							delete aContexts[iIndex].childs;
							aContexts[iIndex].expanded = true;
							this._fireChange();
						}
					},
					collapse: function(iIndex) {
						if (this.isGroupHeader(iIndex) && aContexts[iIndex].expanded) {
							aContexts[iIndex].childs = aContexts.splice(iIndex + 1, aContexts[iIndex].count);
							aContexts[iIndex].expanded = false;
							this._fireChange();
						}
					}

				});

			}

		}

		return oBinding;

	};

	/**
	 * @private
	 */
	Table.prototype.resetGrouping = function() {

		// reset the group binding only when enhanced
		var oBinding = this.getBinding("rows");
		if (oBinding && oBinding._modified) {

			// we remove the style override to display the row header
			this.$().find(".sapUiTableRowHdrScr").css("display", "");

			// if the grouping is not supported we remove the hacks we did
			// and simply return the binding finally
			this.onclick = Table.prototype.onclick;
			this._modifyRow = undefined;

			// reset the binding
			var oBindingInfo = this.getBindingInfo("rows");
			this.unbindRows();
			this.bindRows(oBindingInfo);

		}

	};

	/**
	 * @private
	 */
	Table.prototype.setEnableGrouping = function(bEnableGrouping) {
		// set the property
		this.setProperty("enableGrouping", bEnableGrouping);
		// reset the grouping
		if (!bEnableGrouping) {
			this.resetGrouping();
		}
		// update the column headers
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableCustomFilter = function(bEnableCustomFilter) {
		this.setProperty("enableCustomFilter", bEnableCustomFilter);
		// update the column headers
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableColumnFreeze = function(bEnableColumnFreeze) {
		this.setProperty("enableColumnFreeze", bEnableColumnFreeze);
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setShowColumnVisibilityMenu = function(bShowColumnVisibilityMenu) {
		this.setProperty("showColumnVisibilityMenu", bShowColumnVisibilityMenu);
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedColumnCount = function(iFixedColumnCount) {
		var aCols = this._getVisibleColumns();
		var vHeaderSpan = aCols[iFixedColumnCount - 1] && aCols[iFixedColumnCount - 1].getHeaderSpan();
		if (vHeaderSpan) {
			var iHeaderSpan;
			if (jQuery.isArray(vHeaderSpan)) {
				iHeaderSpan = parseInt(vHeaderSpan[0], 10);
			} else {
				iHeaderSpan = parseInt(vHeaderSpan, 10);
			}
			iFixedColumnCount += iHeaderSpan - 1;
		}
		//Set current width as fixed width for cols
		var $ths = this.$().find(".sapUiTableCtrlFirstCol > th");
		for (var i = 0; i < iFixedColumnCount; i++) {
			var oColumn = aCols[i];
			if (oColumn) {
				var iColumnIndex = jQuery.inArray(oColumn, this.getColumns());
				if (!oColumn.getWidth()) {
					oColumn.setWidth($ths.filter("[data-sap-ui-headcolindex='" + iColumnIndex + "']").width() + "px");
				}
			}
		}
		this.setProperty("fixedColumnCount", iFixedColumnCount);
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedRowCount = function(iFixedRowCount) {
		if (!(parseInt(iFixedRowCount, 10) >= 0)) {
			jQuery.sap.log.error("Number of fixed rows must be greater or equal 0");
			return this;
		}

		if ((iFixedRowCount + this.getFixedBottomRowCount()) < this.getVisibleRowCount()) {
			this.setProperty("fixedRowCount", iFixedRowCount);
		} else {
			jQuery.sap.log.error("Table '" + this.getId() + "' fixed rows('" + (iFixedRowCount + this.getFixedBottomRowCount()) + "') must be smaller than numberOfVisibleRows('" + this.getVisibleRowCount() + "')");
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedBottomRowCount = function(iFixedRowCount) {
		if (!(parseInt(iFixedRowCount, 10) >= 0)) {
			jQuery.sap.log.error("Number of fixed bottom rows must be greater or equal 0");
			return this;
		}

		if ((iFixedRowCount + this.getFixedRowCount()) < this.getVisibleRowCount()) {
			this.setProperty("fixedBottomRowCount", iFixedRowCount);
		} else {
			jQuery.sap.log.error("Table '" + this.getId() + "' fixed rows('" + (iFixedRowCount + this.getFixedRowCount()) + "') must be smaller than numberOfVisibleRows('" + this.getVisibleRowCount() + "')");
		}
		return this;
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._invalidateColumnMenus = function() {
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			aCols[i].invalidateMenu();
		}
	};

	/**
	 * The selectstart event triggered in IE to select the text.
	 * @private
	 * @param {event} oEvent The splitterselectstart event
	 * @return {boolean} false
	 */
	Table.prototype._splitterSelectStart = function(oEvent){
		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	};

	/**
	 * Checks whether the passed oEvent is a touch event.
	 * @private
	 * @param {event} oEvent The event to check
	 * @return {boolean} false
	 */
	Table.prototype._isTouchMode = function(oEvent) {
		return !!oEvent.originalEvent["touches"];
	};

	/**
	 * drops the splitter bar
	 * @private
	 */
	Table.prototype._onGhostMouseRelease = function(oEvent) {
		var splitterBarGhost = this.getDomRef("ghost");

		var iLocationY = this._isTouchMode(oEvent) ? oEvent.changedTouches[0].pageY : oEvent.pageY;
		var iNewHeight = iLocationY - this.$().offset().top;

	    this.setVisibleRowCount(this._calculateRowsToDisplay(iNewHeight));

		jQuery(splitterBarGhost).remove();
		this.$("overlay").remove();

		jQuery(document.body).unbind("selectstart", this._splitterSelectStart);

		var $Document = jQuery(document);
		$Document.unbind("touchend", this._onGhostMouseRelease);
		$Document.unbind("touchmove", this._onGhostMouseMove);
		$Document.unbind("mouseup", this._onGhostMouseRelease);
		$Document.unbind("mousemove", this._onGhostMouseMove);

		this._enableTextSelection();
	};

	/**
	 *
	 * @param oEvent
	 * @private
	 */
	Table.prototype._onGhostMouseMove = function(oEvent) {
		var splitterBarGhost = this.getDomRef("ghost");

		var iLocationY = this._isTouchMode(oEvent) ? oEvent.targetTouches[0].pageY : oEvent.pageY;
		var min = this.$().offset().top;
		if (iLocationY > min) {
			jQuery(splitterBarGhost).css("top", iLocationY + "px");
		}
	};

	/**
	 * Calculates the maximum rows to display within the table.
	 * @private
	 */
	Table.prototype._calculateRowsToDisplay = function(iHeight) {
		var iMinRowCount = this.getMinAutoRowCount() || 5;

		// If no iHeight is passed, return minimum row count.
		if (!iHeight) {
			return iMinRowCount;
		}

		var $this = this.$();
		if (!$this.get(0)) {
			return iMinRowCount;
		}

		var iUsedHeight = this._calculateUsedHeight($this.find('.sapUiTableCCnt'), $this);

		var aRows = this.getRows();
		if (!aRows.length) {
			return iMinRowCount;
		}

		var oDomRefs = aRows[0].getDomRefs(true);
		var $row = oDomRefs.rowFixedPart || oDomRefs.rowScrollPart;
		var iRowHeight = $row.outerHeight();

		// No rows displayed when visible row count == 0, no row height can be determined, therefore we set standard row height
		if (!iRowHeight) {
			var sRowHeightParamName = "sap.ui.table.Table:sapUiTableRowHeight";
			if ($this.parents().hasClass('sapUiSizeCompact')) {
				sRowHeightParamName = "sap.ui.table.Table:sapUiTableCompactRowHeight";
			}
			iRowHeight = parseInt(Parameters.get(sRowHeightParamName), 10);
		}

		// Maximum height of the table is the height of the window minus two row height, reserved for header and footer.
		var iMaxHeight = window.innerHeight - 2 * iRowHeight;
		var iCalculatedSpace = iHeight - iUsedHeight;

		// Make sure that table does not grow to infinity
		var iAvailableSpace = Math.min(iCalculatedSpace, iMaxHeight);

		// the last content row height is iRowHeight - 1, therefore + 1 in the formula below:
		// to avoid issues with having more fixed rows than visible row count, the number of visible rows must be
		// adjusted.
		return Math.max((this.getFixedRowCount() + this.getFixedBottomRowCount()) + 1, Math.max(iMinRowCount, Math.floor((iAvailableSpace + 1) / iRowHeight)));
	};

	/**
	 * Calculates the already used vertical space of the table which is blocked by other elements than the row content area.
	 * @private
	 * @param $element start element from which traversing begins
	 * @param $targetElement end element where traversing stops
	 * @returns {Number} the used height as a number
	 */
	Table.prototype._calculateUsedHeight = function($element, $targetElement) {
		if (!$element || $element.length == 0 || !$targetElement || $element.is($targetElement)) {
			return 0;
		}

		return Math.max(0, $targetElement.height() - $element.height());
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setShowNoData = function(bShowNoData) {
		this.setProperty('showNoData', bShowNoData, true);
		bShowNoData = this.getProperty('showNoData');
		if (!bShowNoData) {
			this.$().removeClass("sapUiTableEmpty");
		} else {
			this._updateNoData();
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setNoDataText = function(sText) {
		this.setProperty("noDataText", sText, true);
		this.$().find('.sapUiTableCtrlEmptyMsg').text(sText);
	};

	/**
	 * Creates a new {@link sap.ui.core.util.Export} object and fills row/column information from the table if not provided. For the cell content, the column's "sortProperty" will be used (experimental!)
	 *
	 * <p><b>Please note: The return value was changed from jQuery Promises to standard ES6 Promises.
	 * jQuery specific Promise methods ('done', 'fail', 'always', 'pipe' and 'state') are still available but should not be used.
	 * Please use only the standard methods 'then' and 'catch'!</b></p>
	 *
	 * @param {object} [mSettings] settings for the new Export, see {@link sap.ui.core.util.Export} <code>constructor</code>
	 * @return {Promise} Promise object
	 *
	 * @experimental Experimental because the property for the column/cell definitions (sortProperty) could change in future.
	 * @public
	 */
	Table.prototype.exportData = function(mSettings) {
		jQuery.sap.require("sap.ui.core.util.Export");

		mSettings = mSettings || {};

		if (!mSettings.rows) {
			var oBinding = this.getBinding("rows"),
				oBindingInfo = this.getBindingInfo("rows");

			var aFilters = oBinding.aFilters.concat(oBinding.aApplicationFilters);

			mSettings.rows = {
				path: oBindingInfo.path,
				model: oBindingInfo.model,
				sorter: oBinding.aSorters,
				filters: aFilters,
				parameters: oBindingInfo.parameters
			};
		}

		// by default we choose the export type CSV
		if (!mSettings.exportType) {
			jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
			mSettings.exportType = new sap.ui.core.util.ExportTypeCSV();
		}

		var sModelName = mSettings.rows.model;
		if (!sModelName) {
			// if a model separator is found in the path, extract model name from there
			var sPath = mSettings.rows.path;
			var iSeparatorPos = sPath.indexOf(">");
			if (iSeparatorPos > 0) {
				sModelName = sPath.substr(0, iSeparatorPos);
			}
		}

		if (!mSettings.columns) {
			mSettings.columns = [];

			var aColumns = this.getColumns();
			for (var i = 0, l = aColumns.length; i < l; i++) {
				var oColumn = aColumns[i];
				if (oColumn.getSortProperty()) {
					mSettings.columns.push({
						name: oColumn.getLabel().getText(),
						template: {
							content: {
								path: oColumn.getSortProperty(),
								model: sModelName
							}
						}
					});
				}
			}
		}

		var oExport = new sap.ui.core.util.Export(mSettings);
		this.addDependent(oExport);

		return oExport;
	};

	/**
	 * internal function to calculate the widest content width of the column
	 * also takes the column header and potential icons into account
	 * @param {int} iColIndex index of the column which should be resized
	 * @return {int} minWidth minimum width the column needs to have
	 * @private
	 * @experimental Experimental, only works with a limited control set
	 * @function
	 */

	Table.prototype._calculateAutomaticColumnWidth = function(iColIndex) {

		var aTextBasedControls = [
			"sap.m.Text",
			"sap.m.Label",
			"sap.m.Link",
			"sap.ui.commons.TextView",
			"sap.ui.commons.Label",
			"sap.ui.commons.Link"
		];

		var $this = this.$();
		var iHeaderWidth = 0;

		var $cols = $this.find('td[headers=\"' + this.getId() + '_col' + iColIndex + '\"]').children("div");
		var oColumns = this.getColumns();
		var oCol = oColumns[iColIndex];
		if (!oCol) {
			return null;
		}
		var aHeaderSpan = oCol.getHeaderSpan();
		var oColLabel = oCol.getLabel();
		var that = this;

		var oColTemplate = oCol.getTemplate();
		var bIsTextBased = jQuery.inArray(oColTemplate.getMetadata().getName(), aTextBasedControls) != -1 ||
		                   sap.ui.commons && sap.ui.commons.TextField && oColTemplate instanceof sap.ui.commons.TextField ||
		                   sap.m && sap.m.Input && oColTemplate instanceof sap.m.Input;

		var hiddenSizeDetector = document.createElement("div");
		document.body.appendChild(hiddenSizeDetector);
		jQuery(hiddenSizeDetector).addClass("sapUiTableHiddenSizeDetector");

		var oColLabels = oCol.getMultiLabels();
		if (oColLabels.length == 0 && !!oColLabel){
			oColLabels = [oColLabel];
		}

		if (oColLabels.length > 0) {
			jQuery.each(oColLabels, function(iIdx, oLabel){
				var iHeaderSpan;
				if (!!oLabel.getText()){
					jQuery(hiddenSizeDetector).text(oLabel.getText());
					iHeaderWidth = hiddenSizeDetector.scrollWidth;
				} else {
					iHeaderWidth = oLabel.$().scrollWidth;
				}
				iHeaderWidth = iHeaderWidth + $this.find("#" + oCol.getId() + "-icons").first().width();

				$this.find(".sapUiTableColIcons#" + oCol.getId() + "_" + iIdx + "-icons").first().width();
				if (aHeaderSpan instanceof Array && aHeaderSpan[iIdx] > 1){
					iHeaderSpan = aHeaderSpan[iIdx];
				} else if (aHeaderSpan > 1){
					iHeaderSpan = aHeaderSpan;
				}
				if (!!iHeaderSpan){
					// we have a header span, so we need to distribute the width of this header label over more than one column
					//get the width of the other columns and subtract from the minwidth required from label side
					var i = iHeaderSpan - 1;
					while (i > iColIndex) {
						iHeaderWidth = iHeaderWidth - (that._oCalcColumnWidths[iColIndex + i] || 0);
						i -= 1;
					}
				}
			});
		}

		var minAddWidth = Math.max.apply(null, $cols.map(
			function(){
				var _$this = jQuery(this);
				return parseInt(_$this.css('padding-left'), 10) + parseInt(_$this.css('padding-right'), 10)
						+ parseInt(_$this.css('margin-left'), 10) + parseInt(_$this.css('margin-right'), 10);
			}).get());

		//get the max width of the currently displayed cells in this column
		var minWidth = Math.max.apply(null, $cols.children().map(
			function() {
				var width = 0,
				sWidth = 0;
				var _$this = jQuery(this);
				var sColText = _$this.text() || _$this.val();

				if (bIsTextBased){
					jQuery(hiddenSizeDetector).text(sColText);
					sWidth = hiddenSizeDetector.scrollWidth;
				} else {
					sWidth = this.scrollWidth;
				}
				if (iHeaderWidth > sWidth){
					sWidth = iHeaderWidth;
				}
				width = sWidth + parseInt(_$this.css('margin-left'), 10)
										+ parseInt(_$this.css('margin-right'), 10)
										+ minAddWidth
										+ 1; // ellipsis is still displayed if there is an equality of the div's width and the table column
				return width;
			}).get());

		jQuery(hiddenSizeDetector).remove();
		return Math.max(minWidth, this._iColMinWidth);
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onPersoApplied = function() {

		// apply the sorter and filter again (right now only the first sorter is applied)
		var aColumns = this.getColumns();
		var aSorters = [];//, aFilters = [];
		for (var i = 0, l = aColumns.length; i < l; i++) {
			var oColumn = aColumns[i];
			if (oColumn.getSorted()) {
				aSorters.push(new sap.ui.model.Sorter(oColumn.getSortProperty(), oColumn.getSortOrder() === sap.ui.table.SortOrder.Descending));
			/*
			} else if (oColumn.getFiltered()) {
				aFilters.push(oColumn._getFilter());
			*/
			}
		}

		if (aSorters.length > 0 && this.getBinding("rows")) {
			this.getBinding("rows").sort(aSorters);
		}
		/*
		if (aFilters.length > 0 && this.getBinding("rows")) {
			this.getBinding("rows").filter(aFilters);
		}
		*/

		this.refreshRows();

	};

	/**
	 * Toggles the selection state of all cells.
	 * @private
	 */
	Table.prototype._toggleSelectAll = function() {

		if (!this.$("selall").hasClass("sapUiTableSelAll")) {
			this.clearSelection();
		} else {
			this.selectAll();
		}
		if (!!sap.ui.Device.browser.internet_explorer) {
			this.$("selall").focus();
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._restoreAppDefaultsColumnHeaderSortFilter = function () {
		var aColumns = this.getColumns();
		jQuery.each(aColumns, function(iIndex, oColumn){
			oColumn._restoreAppDefaults();
		});
	};

	/**
	 *
	 * @param mParameters
	 * @private
	 */
	Table.prototype._setBusy = function (mParameters) {
		var oBinding,
			i,
			bSetBusy;

		if (!this.getEnableBusyIndicator() || !this._bBusyIndicatorAllowed) {
			return;
		}

		oBinding = this.getBinding("rows");
		if (!oBinding) {
			return;
		}

		this.setBusy(false);
		if (mParameters) {
			if (mParameters.contexts && mParameters.contexts.length !== undefined) {
				// TreeBinding and AnalyticalBinding always return a contexts array with the
				// requested length. Both put undefined in it for contexts which need to be loaded
				// Check for undefined in the contexts array.
				bSetBusy = false;
				for (i = 0; i < mParameters.contexts.length; i++) {
					if (mParameters.contexts[i] === undefined) {
						bSetBusy = true;
						break;
					}
				}
			} else if (mParameters.changeReason === ChangeReason.Expand) {
				this.setBusy(true);
			}

			var iLength = oBinding.getLength();
			if (bSetBusy || (oBinding.isInitial()) || (mParameters.receivedLength === 0 && this._iDataRequestedCounter !== 0) ||
				(mParameters.receivedLength < mParameters.requestedLength && mParameters.receivedLength !== iLength &&
				 mParameters.receivedLength !== iLength - this.getFirstVisibleRow())) {
				this.setBusy(true);
			}
		}
	};

	/*
	 * Prevents re-rendering, when enabling/disabling busy indicator.
	 * Avoids the request delays.
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableBusyIndicator = function (bValue) {
		this.setProperty("enableBusyIndicator", bValue, true);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setColumnHeaderVisible = function(bColumnHeaderVisible) {
		this.setProperty("columnHeaderVisible", bColumnHeaderVisible);
		// Adapt the item navigation. Since the HeaderRowCount changed, also the lastSelectedDataRow changes.
		this._iLastSelectedDataRow = this._getHeaderRowCount();

	};

	/**
	 *
	 * @private
	 */
	Table.prototype._attachDataRequestedListeners = function () {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			this._iDataRequestedCounter = 0;
			oBinding.detachDataRequested(this._onBindingDataRequestedListener, this);
			oBinding.detachDataReceived(this._onBindingDataReceivedListener, this);

			oBinding.attachDataRequested(this._onBindingDataRequestedListener, this);
			oBinding.attachDataReceived(this._onBindingDataReceivedListener, this);
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataRequestedListener = function () {
		this._iDataRequestedCounter++;
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataReceivedListener = function () {
		this._iDataRequestedCounter--;
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._attachBindingListener = function() {
		this._attachDataRequestedListeners();
	};

	/**
	 * Lets you control in which situation the <code>ScrollBar</code> fires scroll events.
	 *
	 * @param {boolean} bLargeDataScrolling Set to true to let the <code>ScrollBar</code> only fires scroll events when
	 * the scroll handle is released. No matter what the setting is, the <code>ScrollBar</code> keeps on fireing scroll events
	 * when the user scroll with the mousewheel or using touch
	 * @private
	 */
	Table.prototype._setLargeDataScrolling = function(bLargeDataScrolling) {
		if (this._oVSb) {
			this._oVSb._bLargeDataScrolling = !!bLargeDataScrolling;
		} else {
			jQuery.sap.log.error("Vertical Scrollbar wasn't initialized yet.");
		}
	};

	return Table;

}, /* bExport= */ true);
