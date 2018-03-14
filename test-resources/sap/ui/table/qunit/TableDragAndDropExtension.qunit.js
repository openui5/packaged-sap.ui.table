/*global QUnit, sinon, oTable, oTreeTable*/

sap.ui.require([
	"sap/ui/table/TableUtils", "sap/ui/core/dnd/DragDropInfo", "sap/ui/Device"
], function(TableUtils, DragDropInfo, Device) {
	"use strict";

	// mapping of globals
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var initRowActions = window.initRowActions;
	var getRowHeader = window.getRowHeader;
	var getCell = window.getCell;
	var getRowAction = window.getRowAction;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;

	function createDragEvent(sDragEventType) {
		var oJQueryDragEvent = jQuery.Event(sDragEventType);
		var oNativeDragEvent;

		if (typeof Event === "function") {
			oNativeDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE, PhantomJS
			oNativeDragEvent = document.createEvent("Event");
			oNativeDragEvent.initEvent(sDragEventType, true, true);
		}

		// Fake the DataTransfer object. This is the only cross-browser solution.
		oNativeDragEvent.dataTransfer = {
			dropEffect: "none",
			effectAllowed: "none",
			files: [],
			items: [],
			types: [],
			setDragImage: function() {},
			setData: function() {},
			getData: function() {}
		};

		oJQueryDragEvent.originalEvent = oNativeDragEvent;

		return oJQueryDragEvent;
	}

	QUnit.module("Common", {
		beforeEach: function() {
			createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Drag session data", function(assert) {
		var oFakeEvent = {
			dragSession: {
				mData: {},
				setComplexData: function(sId, oData) {
					this.mData[sId] = oData;
				},
				getComplexData: function(sId) {
					return this.mData[sId];
				}
			}
		};
		var mSessionData;
		var iOriginalPageXOffset = window.pageXOffset;
		var iOriginalPageYOffset = window.pageYOffset;

		// Prepare for all tests.
		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			persistent: "i should still exist after dragenter"
		});

		if (!Device.browser.msie) {
			window.pageYOffset = 123;
			window.pageXOffset = 321;
		}

		// Test without a drop control in the drag session.
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter.call(oTable, oFakeEvent);

		mSessionData = oFakeEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId());
		assert.equal(mSessionData.verticalScrollEdge, null, "No drop control: No vertical scroll edge stored");
		assert.equal(mSessionData.horizontalScrollEdge, null, "No drop control: No horizontal scroll edge stored");
		assert.strictEqual(mSessionData.persistent, "i should still exist after dragenter",
			"No drop control: Other session data was not manipulated");

		// Test the session data added by the table in dragenter.
		oFakeEvent.dragSession.dropControl = "dummy";
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter.call(oTable, oFakeEvent);

		mSessionData = oFakeEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId());
		var iPageYOffset = window.pageYOffset;
		var iPageXOffset = window.pageXOffset;
		var mVerticalScrollRect = oTable.getDomRef("table").getBoundingClientRect();
		var mHorizontalScrollRect = oTable.getDomRef("sapUiTableCtrlScr").getBoundingClientRect();

		assert.deepEqual(mSessionData.verticalScrollEdge, {
			bottom: mVerticalScrollRect.bottom + iPageYOffset,
			top: mVerticalScrollRect.top + iPageYOffset
		}, "The vertical scroll edge is stored in the drag session");

		assert.deepEqual(mSessionData.horizontalScrollEdge, {
			left: mHorizontalScrollRect.left + iPageXOffset,
			right: mHorizontalScrollRect.right + iPageXOffset
		}, "The horizontal scroll edge is stored in the drag session");

		assert.strictEqual(mSessionData.persistent, "i should still exist after dragenter",
			"Other session data was not manipulated");

		// Restore
		if (!Device.browser.msie) {
			window.pageXOffset = iOriginalPageXOffset;
			window.pageYOffset = iOriginalPageYOffset;
		}
	});

	QUnit.test("Scrolling & Indicator size - dragover", function(assert) {
		// Increase a column width to be able to test horizontal scrolling.
		oTable.getColumns()[1].setWidth("3000px");
		sap.ui.getCore().applyChanges();

		var oFakeIndicator = jQuery("<div style='width: 0; height: 0; left: 0; right: 0'></div>");
		var oFakeEvent = {
			dragSession: {
				mData: {},
				setComplexData: function(sId, oData) {
					this.mData[sId] = oData;
				},
				getComplexData: function(sId) {
					return this.mData[sId];
				},
				getIndicator: function() {
					return oFakeIndicator[0];
				}
			}
		};
		var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
		var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		var iScrollDistance = 32;
		var iThreshold = 50;
		var that = this;

		function testScrolling(oEvent, iPageY, iPageX, iExpectedScrollPosition) {
			oEvent.pageY = iPageY;
			oEvent.pageX = iPageX;

			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(oTable, oFakeEvent);

			assert.strictEqual(oVSb.scrollTop, iExpectedScrollPosition, "The vertical scroll position is correct");
			assert.strictEqual(oHSb.scrollLeft, iExpectedScrollPosition, "The horizontal scroll position is correct");
		}

		function testIndicatorSize(oEvent, iExpectedWidth, iExpectedHeight, iExpectedLeft, iExpectedRight) {
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(oTable, oEvent);

			var oIndicator = oEvent.dragSession.getIndicator();

			assert.strictEqual(oIndicator.style.width, iExpectedWidth + "px",
				"The style \"width\" of the indicator has the expected value");
			assert.strictEqual(oIndicator.style.height, iExpectedHeight + "px",
				"The style \"height\" of the indicator has the expected value");
			assert.strictEqual(oIndicator.style.left, iExpectedLeft + "px",
				"The style \"left\" of the indicator has the expected value");
			assert.strictEqual(oIndicator.style.right, iExpectedRight + "px",
				"The style \"right\" of the indicator has the expected value");
		}

		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			verticalScrollEdge: {
				top: 600,
				bottom: 300
			},
			horizontalScrollEdge: {
				left: 300,
				right: 600
			}
		});

		// Scroll down and to the right simultaneously.
		testScrolling(oFakeEvent, 300 - iThreshold, 600 - iThreshold, iScrollDistance);
		testScrolling(oFakeEvent, 300 - iThreshold - 1, 600 - iThreshold - 1, iScrollDistance);
		testScrolling(oFakeEvent, 300, 600, iScrollDistance * 2);
		testScrolling(oFakeEvent, 300 + iThreshold, 600 + iThreshold, iScrollDistance * 3);
		testScrolling(oFakeEvent, 300 + iThreshold + 1, 600 + iThreshold + 1, iScrollDistance * 3);

		// Scroll up and to the left simultaneously.
		testScrolling(oFakeEvent, 600 + iThreshold + 1, 300 + iThreshold + 1, iScrollDistance * 3);
		testScrolling(oFakeEvent, 600 + iThreshold, 300 + iThreshold, iScrollDistance * 2);
		testScrolling(oFakeEvent, 600, 300, iScrollDistance);
		testScrolling(oFakeEvent, 600 - iThreshold - 1, 300 - iThreshold - 1, iScrollDistance);
		testScrolling(oFakeEvent, 600 - iThreshold, 300 - iThreshold, 0);

		// If the drop target is the table, no scrolling should be performed.
		oFakeEvent.dragSession.dropControl = oTable;
		testScrolling(oFakeEvent, 300 - iThreshold, 600 - iThreshold, 0);

		/* Resize and reposition the indicator */

		// If there is no drop target, there is no need to modify the indicator.
		oFakeEvent.dragSession.dropControl = null;
		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			indicatorSize: {
				width: 500
			}
		});
		testIndicatorSize(oFakeEvent, 0, 0, 0, 0);

		// If there is an indicator size in the drag session, the indicator should be modified accordingly.
		oFakeEvent.dragSession.dropControl = "a control which needs indicator modification";
		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			indicatorSize: {
				width: 500,
				height: 50,
				left: 33,
				right: 222
			}
		});
		testIndicatorSize(oFakeEvent, 500, 50, 33, 222);

		// Not all controls need indicator modifications, so there might be no indicator size. In this case the indicator should not be modified.
		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			indicatorSize: undefined
		});
		testIndicatorSize(oFakeEvent, 500, 50, 33, 222);
	});

	QUnit.module("Rows", {
		beforeEach: function() {
			createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			oTable.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "rows",
				targetAggregation: "rows"
			}));

			initRowActions(oTable, 1, 1);

			oTreeTable.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "rows",
				targetAggregation: "rows",
				targetElement: oTable
			}));
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Draggable", function(assert) {
		var fnOriginalDragStartHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragstart;

		this.oDragAndDropExtension._ExtensionDelegate.ondragstart = function(oEvent) {
			var mParams = oEvent._mTestParameters;
			var bRowAreaDraggable = mParams.sRowAreaType === "Fixed" || mParams.sRowAreaType === "Scrollable";
			var sMessagePrefix = mParams.sRowType + " row - " + mParams.sRowAreaType + " area: ";

			fnOriginalDragStartHandler.apply(oTable, arguments);

			if (bRowAreaDraggable) {
				if (mParams.sRowType === "Standard") {
					assert.ok(!oEvent.isDefaultPrevented(),
						sMessagePrefix + "The default action was not prevented");
					assert.deepEqual(oEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId()).draggedRowContext,
						oTable.getContextByIndex(mParams.iRowIndex),
						sMessagePrefix + "The dragged row context is stored in the drag session");
				} else {
					assert.ok(oEvent.isDefaultPrevented(),
						sMessagePrefix + "The default action was prevented");
					assert.equal(oEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId()), null,
						sMessagePrefix + "No drag session data was stored in the drag session");
				}
			} else {
				assert.ok(!oEvent.isDefaultPrevented(), sMessagePrefix + "The default action was not prevented");
				assert.equal(oEvent.dragSession, null, sMessagePrefix + "No drag session available");
			}
		};

		function test($Target, mTestParameters) {
			var oDragStartEvent = createDragEvent("dragstart");
			oDragStartEvent._mTestParameters = mTestParameters;
			$Target.trigger(oDragStartEvent);
		}

		function testStandardRow() {
			test(getRowHeader(0).parent(), {sRowType: "Standard", sRowAreaType: "Header", iRowIndex: 0});
			test(getCell(0, 0).parent(), {sRowType: "Standard", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Standard", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).parent(), {sRowType: "Standard", sRowAreaType: "Action", iRowIndex: 0});
		}

		function testEmptyRow() {
			sinon.stub(oTable, "getContextByIndex", function(iIndex) {
				if (iIndex === 0) {
					return null;
				}
				return oTable.constructor.prototype.getContextByIndex.apply(oTable, arguments);
			});

			test(getRowHeader(0).parent(), {sRowType: "Empty", sRowAreaType: "Header", iRowIndex: 0});
			test(getCell(0, 0).parent(), {sRowType: "Empty", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Empty", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).parent(), {sRowType: "Empty", sRowAreaType: "Action", iRowIndex: 0});

			oTable.getContextByIndex.restore();
		}

		function testGroupHeaderRow() {
			fakeGroupRow(0);

			test(getRowHeader(0).parent(), {sRowType: "Group header", sRowAreaType: "Header", iRowIndex: 0});
			test(getCell(0, 0).parent(), {sRowType: "Group header", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Group header", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).parent(), {sRowType: "Group header", sRowAreaType: "Action", iRowIndex: 0});
		}

		function testSumRow() {
			fakeSumRow(0);

			test(getRowHeader(0).parent(), {sRowType: "Sum", sRowAreaType: "Header", iRowIndex: 0});
			test(getCell(0, 0).parent(), {sRowType: "Sum", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Sum", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).parent(), {sRowType: "Sum", sRowAreaType: "Action", iRowIndex: 0});
		}

		testStandardRow();
		testEmptyRow();
		testGroupHeaderRow();
		testSumRow();

		this.oDragAndDropExtension._ExtensionDelegate.ondragstart = fnOriginalDragStartHandler;
	});

	QUnit.test("Droppable & Drag session data", function(assert) {
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			var mParams = oEvent._mTestParameters;
			var oDragSessionData = oEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId());
			var bDraggingOverItself = oEvent.dragSession.draggedControl === oEvent.dragSession.dropControl;
			var sMessagePrefix;

			if (bDraggingOverItself) {
				sMessagePrefix = "Dragging the row over its own " + mParams.sRowAreaType + " area: ";
			} else {
				sMessagePrefix = mParams.sRowType + " row - " + mParams.sRowAreaType + " area: ";
			}

			fnOriginalDragEnterHandler.apply(oTable, arguments);

			if (mParams.sRowType === "Standard" && !bDraggingOverItself) {
				assert.ok(!oEvent.isDefaultPrevented(), sMessagePrefix + "The default action was not prevented");

				var bVerticalScrollbarVisible = oTable._getScrollExtension().isVerticalScrollbarVisible();
				var mTableCntRect = oTable.getDomRef("sapUiTableCnt").getBoundingClientRect();

				assert.deepEqual(oDragSessionData.indicatorSize, {
					width: mTableCntRect.width - (bVerticalScrollbarVisible ? 16 : 0),
					left: mTableCntRect.left + (oTable._bRtlMode && bVerticalScrollbarVisible ? 16 : 0)
				}, sMessagePrefix + "The indicator size is stored in the drag session");
			} else {
				assert.ok(oEvent.isDefaultPrevented(), sMessagePrefix + "The default action was prevented");
				assert.equal(oDragSessionData.indicatorSize, null, sMessagePrefix + "The indicator size is not stored in the drag session");
			}
		};

		function test($Target, mTestParameters, bTestDragOverItself) {
			var oDragEnterEvent;

			oTable.getRows()[mTestParameters.iRowIndex + 1].$().trigger(createDragEvent("dragstart"));
			oDragEnterEvent = createDragEvent("dragenter");
			oDragEnterEvent._mTestParameters = mTestParameters;
			$Target.trigger(oDragEnterEvent);

			if (bTestDragOverItself) {
				oTable.getRows()[mTestParameters.iRowIndex].$().trigger(createDragEvent("dragstart"));
				oDragEnterEvent = createDragEvent("dragenter");
				oDragEnterEvent._mTestParameters = mTestParameters;
				$Target.trigger(oDragEnterEvent);
			}
		}

		function testStandardRow() {
			test(getRowHeader(0), {sRowType: "Standard", sRowAreaType: "Header", iRowIndex: 0}, true);
			test(oTable.getRows()[0].getCells()[0].$(), {sRowType: "Standard", sRowAreaType: "Fixed", iRowIndex: 0}, true);
			test(oTable.getRows()[0].getCells()[1].$(), {sRowType: "Standard", sRowAreaType: "Scrollable", iRowIndex: 0}, true);
			test(getRowAction(0).find(".sapUiTableActionIcon").first(), {sRowType: "Standard", sRowAreaType: "Action", iRowIndex: 0}, true);
		}

		function testEmptyRow() {
			sinon.stub(oTable, "getContextByIndex", function(iIndex) {
				if (iIndex === 0) {
					return null;
				}
				return oTable.constructor.prototype.getContextByIndex.apply(oTable, arguments);
			});

			test(getRowHeader(0), {sRowType: "Empty", sRowAreaType: "Header", iRowIndex: 0});
			test(oTable.getRows()[0].getCells()[0].$(), {sRowType: "Empty", sRowAreaType: "Fixed", iRowIndex: 0});
			test(oTable.getRows()[0].getCells()[1].$(), {sRowType: "Empty", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).find(".sapUiTableActionIcon").first(), {sRowType: "Empty", sRowAreaType: "Action", iRowIndex: 0});

			oTable.getContextByIndex.restore();
		}

		function testGroupHeaderRow() {
			fakeGroupRow(0);

			test(getRowHeader(0), {sRowType: "Group header", sRowAreaType: "Header", iRowIndex: 0});
			test(oTable.getRows()[0].getCells()[0].$(), {sRowType: "Group header", sRowAreaType: "Fixed", iRowIndex: 0});
			test(oTable.getRows()[0].getCells()[1].$(), {sRowType: "Group header", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).find(".sapUiTableActionIcon").first(), {sRowType: "Group header", sRowAreaType: "Action", iRowIndex: 0});
		}

		function testSumRow() {
			fakeSumRow(0);

			test(getRowHeader(0), {sRowType: "Sum", sRowAreaType: "Header", iRowIndex: 0});
			test(oTable.getRows()[0].getCells()[0].$(), {sRowType: "Sum", sRowAreaType: "Fixed", iRowIndex: 0});
			test(oTable.getRows()[0].getCells()[1].$(), {sRowType: "Sum", sRowAreaType: "Scrollable", iRowIndex: 0});
			test(getRowAction(0).find(".sapUiTableActionIcon").first(), {sRowType: "Sum", sRowAreaType: "Action", iRowIndex: 0});
		}

		testStandardRow();
		testEmptyRow();
		testGroupHeaderRow();
		testSumRow();

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});

	QUnit.test("Droppable with empty rows aggregation", function(assert) {
		var oClock = sinon.useFakeTimers();
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;

		oTable.unbindRows();
		oTable.setVisibleRowCount(1);
		oTable.setShowNoData(false);
		sap.ui.getCore().applyChanges();
		oClock.tick(50);

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTable, arguments);
			assert.ok(!oEvent.isDefaultPrevented(),
				"Single empty row - " + oEvent._mTestParameters.sRowAreaType + " area: The default action was not prevented");
		};

		function test($Target, mTestParameters) {
			oTreeTable.getRows()[0].$().trigger(createDragEvent("dragstart"));
			var oDragEnterEvent = createDragEvent("dragenter");
			oDragEnterEvent._mTestParameters = mTestParameters;
			$Target.trigger(oDragEnterEvent);
		}

		test(getRowHeader(0), {sRowAreaType: "Header"});
		test(oTable.getRows()[0].getCells()[0].$(), {sRowAreaType: "Header"});
		test(oTable.getRows()[0].getCells()[1].$(), {sRowAreaType: "Header"});
		test(getRowAction(0).find(".sapUiTableActionIcon").first(), {sRowAreaType: "Header"});

		oClock.restore();
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});

	QUnit.test("Expand rows - longdragover", function(assert) {
		var oFakeEvent = {
			dragSession: "not null",
			target: null
		};
		var oToggleGroupHeaderSpy = sinon.spy(TableUtils.Grouping, "toggleGroupHeader");

		oFakeEvent.target = getRowHeader(0)[0];
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 0, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.target = oTable.getRows()[1].getCells()[0].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 1, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.target = oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 0, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.target = getRowAction(2)[0];
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 2, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.dragSession = {
			dropControl: oTable.getRows()[0].getCells()[1]
		};
		oFakeEvent.target = oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.notCalled, "TableUtils.Grouping.ToggleGroupHeader was not called");

		oToggleGroupHeaderSpy.restore();
	});

	QUnit.module("Columns", {
		beforeEach: function() {
			createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			oTable.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "columns",
				targetAggregation: "columns"
			}));

			oTable.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "title",
				targetAggregation: "columns"
			}));

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Draggable", function(assert) {
		var fnOriginalDragStartHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragstart;

		this.oDragAndDropExtension._ExtensionDelegate.ondragstart = function(oEvent) {
			var mParams = oEvent._mTestParameters;

			fnOriginalDragStartHandler.apply(oTable, arguments);

			assert.ok(oEvent.isDefaultPrevented(),
				"Column " + mParams.iColumnIndex + " - " + mParams.sColumnAreaType + ": The default action was prevented");
			assert.equal(oEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId()), null,
				"Column " + mParams.iColumnIndex + " - " + mParams.sColumnAreaType + ": No drag session data was stored in the drag session");
		};

		function test(oColumn) {
			var oDragStartEvent = createDragEvent("dragstart");
			var iColumnIndex = oColumn.getIndex();
			var sColumnAreaType = TableUtils.isFixedColumn(oTable, iColumnIndex) ? "Fixed" : "Scrollable";

			oDragStartEvent._mTestParameters = {iColumnIndex: iColumnIndex, sColumnAreaType: sColumnAreaType};
			oColumn.$().trigger(oDragStartEvent);
		}

		oTable.getColumns().forEach(function(oColumn) {
			test(oColumn);
		});

		this.oDragAndDropExtension._ExtensionDelegate.ondragstart = fnOriginalDragStartHandler;
	});

	QUnit.test("Droppable", function(assert) {
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			var mParams = oEvent._mTestParameters;

			fnOriginalDragEnterHandler.apply(oTable, arguments);

			assert.ok(oEvent.isDefaultPrevented(),
				"Column " + mParams.iColumnIndex + " - " + mParams.sColumnAreaType + ": The default action was prevented");
		};

		function test(oColumn) {
			var oDragEnterEvent = createDragEvent("dragenter");
			var iColumnIndex = oColumn.getIndex();
			var sColumnAreaType = TableUtils.isFixedColumn(oTable, iColumnIndex) ? "Fixed" : "Scrollable";

			oTable.getTitle().$().trigger(createDragEvent("dragstart"));
			oDragEnterEvent._mTestParameters = {iColumnIndex: iColumnIndex, sColumnAreaType: sColumnAreaType};
			oColumn.$().trigger(oDragEnterEvent);
		}

		oTable.getColumns().forEach(function(oColumn) {
			test(oColumn);
		});

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});
});