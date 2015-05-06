/*!
 * jQuery wrapper for a slider-puzzle
 * Original author: @doughertyzoo
 * Some inspration from http://www.bennadel.com/blog/1009-jquery-demo-creating-a-sliding-image-puzzle-plug-in.htm
 */

(function ($) {
	var defaults = { rows: 4, cols: 4 };
	var rows, cols, gridSize;
	var container, puzzleImage;
	var showAnimate, animateLocked;
	var tiles = [];
	var allPieces = {};
	var pieces = [];
	allPieces.pieces = pieces;

	// puzzle1 plugin constructor
	$.puzzle1 = function (element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	$.puzzle1.prototype = {

		init: function () {
			rows = this.options.rows;
			cols = this.options.cols;

			container = $(this.element);
			puzzleImage = $(container).find("img:first");
			gridSize = rows || 4;

			// Control and lock animations as appropariate, used mostly for initial load of page.
			// TODO: do not be dependent on this lock, and remove them.
			showAnimate = false;
			animateLocked = false;

			// Make sure image has loaded, then initialize the board.
			if (puzzleImage[0].complete) {
				this.initTiles();
			} else {
				puzzleImage[0].load(function () {
					this.initTiles();
				});
			}
		},

		initTiles: function () {
			this.initContainer(puzzleImage.width(), puzzleImage.height(), puzzleImage.attr("src"));

			for (var iRow = 0; iRow < gridSize; iRow++) {
				tiles[iRow] = [];
				for (var iCol = 0; iCol < gridSize; iCol++) {
					var t = this.buildTile(iRow, iCol, container.width(), container.height());
					var $tile = $("<div></div>")
						.addClass("tile")
						.width(t.width)
						.height(t.height)
						.attr("data-tile-id", t.id)
						.attr("data-row", t.row)
						.attr("data-col", t.col)
						.click(this.tileAction)
						.css({
							backgroundImage: "url( '" + allPieces.img + "' )",
							backgroundSize: t.bgsize,
							backgroundPosition: t.bgpos,
							top: t.top,
							left: t.left
						});

					if (t.hole) {
						$tile
							.attr("rel", "empty")
							.css({
								opacity: 0
							});
					}

					var $tileId = $("<div>" + t.id + "</div>")
						.addClass("tileId")
						.css({
							lineHeight: t.lheight
						});

					$tile.html($tileId);
					tiles[iRow][iCol] = $tile;
					container.append($tile);
				}
			}

			// This brute-forces the puzzle to be solvable, at the expense of a lack of elegance and - more
			// importantly - starting with a greater degree of difficulty (as many of these random forced-clicks may 
			// not result in a board change. TODO: implement a "random + solvability-check" setup.)
			for (intI = 0; intI < 2000; intI++) {
				var piece = tiles[(Math.floor(Math.random() * gridSize * gridSize) % gridSize)][(Math.floor(Math.random() * gridSize * gridSize) % gridSize)];
				piece.click();
			}

			showAnimate = true;
		},

		initContainer: function (width, height, src) {
			container
				.empty()
				.width(width)
				.height(height);
			allPieces.img = src;
		},

		tileAction: function () {
			if (animateLocked) {
				return false;
			}

			// Fetch the attributes of the triggered tile.
			var targetTile = $(this);
			var targetPosition = {
				top: parseInt(targetTile.css("top")),
				left: parseInt(targetTile.css("left")),
				row: targetTile.attr("data-row"),
				col: targetTile.attr("data-col")
			};

			// TODO: duplicate code, refactor for reusability.
			var emptyTile = container.find("div[ rel = 'empty' ]");
			var emptyPosition = {
				top: parseInt(emptyTile.css("top")),
				left: parseInt(emptyTile.css("left")),
				row: emptyTile.attr("data-row"),
				col: emptyTile.attr("data-col")
			};

			// Only proceed if an adjacent, clickable tile was triggered.
			if (Math.abs(targetPosition.row - emptyPosition.row) + Math.abs(targetPosition.col - emptyPosition.col) == 1) {
				var tempPosition = $.extend(true, {}, targetPosition);
				targetPosition.row = emptyPosition.row;
				targetPosition.col = emptyPosition.col;
				emptyPosition.row = tempPosition.row;
				emptyPosition.col = tempPosition.col;

				targetTile.attr("data-row", targetPosition.row).attr("data-col", targetPosition.col);
				tiles[emptyPosition.row][emptyPosition.col] = targetTile;
				emptyTile.attr("data-row", emptyPosition.row).attr("data-col", emptyPosition.col);
				tiles[targetPosition.row][targetPosition.col] = emptyTile;

				if (showAnimate) {
					animateLocked = true;
					tiles[emptyPosition.row][emptyPosition.col].animate({ top: ((emptyPosition.top) + "px"), left: ((emptyPosition.left) + "px") }, 200, function () {
						tiles[targetPosition.row][targetPosition.col].animate({ top: ((tempPosition.top) + "px"), left: ((tempPosition.left) + "px") }, 200, function () {
							animateLocked = false;
						});
					});
				}
				else {
					tiles[emptyPosition.row][emptyPosition.col].css("top", ((emptyPosition.top) + "px")).css("left", ((emptyPosition.left) + "px"));
					tiles[targetPosition.row][targetPosition.col].css("top", ((tempPosition.top) + "px")).css("left", ((tempPosition.left) + "px"));
				}
			}

			return false;
		},

		buildTile: function (row, col, width, height) {
			var widthCalc = Math.floor(width / gridSize);
			var heightCalc = Math.floor(height / gridSize);

			piece = {
				"id": (row * gridSize + col + 1),
				"hole": (row == gridSize - 1 && col == gridSize - 1) ? true : false,
				"row": row,
				"col": col,
				"bgsize": (gridSize * 100) + "%",
				"bgpos": (col * -heightCalc) + "px " + (row * -widthCalc) + "px",
				"top": (row * heightCalc) + "px",
				"left": (col * widthCalc) + "px",
				"width": widthCalc,
				"height": heightCalc,
				"lheight": widthCalc + "px"
			}
			allPieces.pieces.push(piece);
			return piece;
		}

	};

	// Plugin wrapper for puzzle1 constructor
	$.fn.puzzle1 = function (options) {
		return this.each(function () {
			var xxx = new $.puzzle1(this, options);
		});
	}

})(jQuery);