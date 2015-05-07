(function ($)
{
	var defaults = {
		 _boardSize: 4
	};
	var self; // Shameless.

	$.puzzle2 = function ($parent, options) {
		/*
		The plugin constructor.
		*/
		this.$parent = $parent;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this.setBoard();
		this.setBoardControls();
		self = this;
	}

	$.puzzle2.prototype = {
		setBoard: function () {
			/*
			Switchboard method for setting up the board.
			*/
			this.setBoardSize(this.options._boardSize);
			this.setBoardImage();
		},

		setBoardSize: function (boardSize) {
			/*
			Initializes general board attributes.
			*/
			this.boardSize = boardSize;
			this.tileCount = this.boardSize * this.boardSize;
			this.tileArray = [];
			this.moves = 0;
			this.solved = false;
		},

		setBoardImage: function (image) {
			/*
			Brings in our puzzle image from the DOM, then clears ands sets the board itself, using attributes of the image.
			*/
			this.$image = !image ? $(this.$parent).find('img:first')[0] : image;
			this.imageSrc = $(this.$image).attr('src');
			this.imageWidth = $(this.$image).width();
			this.imageHeight = $(this.$image).height();

			this.tileWidth = this.imageWidth / this.boardSize;
			this.tileHeight = this.imageHeight / this.boardSize;

			$(this.$parent)
				.empty()
				.width(this.imageWidth)
				.height(this.imageHeight);

			setTimeout(function () {
				self.setBoardTiles();
			}, 500);
		},

		setBoardTiles: function () {
			/*
			Builds the critical tileArray, constructs each tile, shuuffles the tiles, adds the tile to the board within the DOM.
			*/
			for (var i = 0; i < this.boardSize; i++) {
				this.tileArray[i] = [];
				for (var j = 0; j < this.boardSize; j++) {
					this.tileArray[i][j] = this.setBoardTile(i, j);
				}
			}

			this.shuffleBoardTiles();

			for (var i = 0; i < this.boardSize; i++) {
				for (var j = 0; j < this.boardSize; j++) {
					var $tile = $("<div />")
						.addClass("tile")
						.width(this.tileArray[i][j].width)
						.height(this.tileArray[i][j].height)
						.attr("data-tile-id", this.tileArray[i][j].id)
						.attr("data-row", i)
						.attr("data-col", j)
						.click(this.swapBoardTiles)
						.css({
							backgroundImage: "url( '" + this.imageSrc + "' )",
							backgroundSize: this.tileArray[i][j].bgsize,
							backgroundPosition: this.tileArray[i][j].bgpos,
							top: (i * this.tileHeight) + "px",
							left: (j * this.tileHeight) + "px"
						});

					if (this.tileArray[i][j].empty) {
						$tile.addClass("empty");
					}

					var $tileId = $("<div>" + (this.tileArray[i][j].id + 1) + "</div>")
						.addClass("tileId")
						.css({
							lineHeight: this.tileArray[i][j].lheight
						});

					$tile.html($tileId);
					$(this.$parent).append($tile);
				}
			}
		},

		setBoardTile: function (row, col) {
			/*
			Builds a JavaScript object for a single tile, with some UX trappings to boot.
			*/
			var tile = {
				"id" : row * this.boardSize + col,
				"row" : row,
				"col" : col,
				"empty" : (row * this.boardSize + col == this.tileCount - 1) ? 1 : 0,
				"bgsize" : (this.boardSize * 100) + "%",
				"bgpos": (col * -this.tileHeight) + "px " + (row * -this.tileHeight) + "px",
				"top": (row * this.tileHeight) + "px",
				"left": (col * this.tileHeight) + "px",
				"width": this.tileWidth,
				"height": this.tileHeight,
				"lheight": this.tileHeight + "px"
			};
			return tile;
		},

		setBoardControls: function () {
			/*
			Builds UX objects for controlling the board (buttons, counters, etc).
			*/
			var $legend = $("<div />")
				.attr("id", "legend");
			var $hint = $("<a />")
				.attr("id", "hint")
				.attr("href", "#")
				.html("hint");
			var $solve = $("<a />")
				.attr("id", "solve")
				.attr("href", "#")
				.html("solve");
			var $moves = $("<span />")
				.attr("id", "moves")
				.html("Moves: <em>0</em>");

			// Shameless again... Why not outerHtml, jQuery, why?
			$legend.html(
				$hint.wrap("<span />").parent().html() +
				$solve.wrap("<span />").parent().html() +
				$moves.wrap("<span />").parent().html()
				);
			$(this.$parent).before($legend.wrap("<span />").parent().html());
		},

		shuffleBoardTiles: function () {
			/*
			Fisher-Yates... Knuth... whichever you choose to call it. This alogorithm generates a random permutation of the tileArray.
			If the permutation is not solvable, it calls recurses itself until it finds a a solvable board.

			I didn't like the fact that my multidimensional array only got its individual rows sorted, so I added a safe secondary sort (which assumes 
			that our puzzle is a NxN square).

			References:
			https://github.com/coolaj86/knuth-shuffle
			http://jsfiddle.net/fWZt7/1/
			*/

			// This effectively randomizes columns, or the inner array of the multidimensional array.
			for (var i = 0; i < this.tileArray.length; i++) {
				k = this.tileArray[i].length;
				while (k--) {
					j = Math.floor(Math.random() * (this.tileArray.length - 1));
					tempk = this.tileArray[i][k];
					tempj = this.tileArray[i][j];
					this.tileArray[i][k] = tempj;
					this.tileArray[i][j] = tempk;
				}
			}

			// Not optimal - and not safe on non-square puzzles - but this will randomize rows.
			if (Math.sqrt(this.tileCount) == this.tileArray.length) {
				for (var i = 0; i < this.tileArray.length; i++) {
					k = this.tileArray[i].length;
					while (k--) {
						j = Math.floor(Math.random() * (this.tileArray.length - 1));
						tempk = this.tileArray[k][i];
						tempj = this.tileArray[j][i];
						this.tileArray[k][i] = tempj;
						this.tileArray[j][i] = tempk;
					}
				}
			}

			if (!this.isBoardSolvable(this.boardSize, this.boardSize, this.getEmptyPiece().row + 1)) {
				this.shuffleBoardTiles();
			}

			this.moves = 0;
		},

		swapBoardTiles: function () {
			/*
			Click handler for UX actions. Called when the baord is clicked/tapped. Personally, I think there is a more elegant way to do this
			than what I have below, but it should work. The shameless 'self' variable/hack had its birth while coding this.
			*/
			if (!self.solved) {
				var clicked = $(this);
				var clickedAttr = {
					top: parseInt(clicked.css("top")),
					left: parseInt(clicked.css("left")),
					row: clicked.attr("data-row"),
					col: clicked.attr("data-col")
				};

				var empty = $("#board").find(".empty:first")[0];
				var emptyAttr = {
					top: parseInt($(empty).css("top")),
					left: parseInt($(empty).css("left")),
					row: $(empty).attr("data-row"),
					col: $(empty).attr("data-col")
				};

				// Continue only if the clicked tile and empty tile are one-slot-distant (total) in row and column.
				if (Math.abs(clickedAttr.row - emptyAttr.row) + Math.abs(clickedAttr.col - emptyAttr.col) == 1) {
					var tempPosition = $.extend(true, {}, clickedAttr);
					clickedAttr.row = emptyAttr.row;
					clickedAttr.col = emptyAttr.col;
					emptyAttr.row = tempPosition.row;
					emptyAttr.col = tempPosition.col;

					clicked.attr("data-row", clickedAttr.row).attr("data-col", clickedAttr.col);
					self.tileArray[emptyAttr.row][emptyAttr.col] = clicked;

					// Haven't dived deeper into why I needed to wrap the jQuery 'empty' object in jQuery again. Not a good practice here,
					// so I would look into this more. Cannot tell if it's indicative of a larger problem or part of the general binding 
					// issue I have had in this method.
					$(empty).attr("data-row", emptyAttr.row).attr("data-col", emptyAttr.col);
					self.tileArray[clickedAttr.row][clickedAttr.col] = empty;

					clicked.animate({ top: ((emptyAttr.top) + "px"), left: ((emptyAttr.left) + "px") }, 200, function () {
						$(empty).css({ top: ((tempPosition.top) + "px"), left: ((tempPosition.left) + "px") });
					});

					self.updateMoveCount();

					if (self.isBoardSolved()) {
						self.setSolvedState();
					}
				}
			}
		},

		isBoardSolvable: function (width, height, rowWithEmpty) {
			/*
			We're talking polarity and inversions here. Nutshell: a puzzle is solvable if:
			* [1] The width of the puzzle (count of columns) is odd and [2] there are an even number of inversions (inversion = when
			a tile 'linearally' precedes another tile with a lower number, in left-to-right-then-down order).
			* [1] The width of the puzzle is even, [2] there are an even number of inversions, and [3] the empty tile is on a zero-based odd row counting up-from-bottom.
			* [1] The width of the puzzle is even, [2] there are an odd number of inversions, and [3] the empty tile is on a zero-based even row counting up-from-bottom.

			This method - and its called methods - checks for that. The method should be called on initial construction of the board.

			References:
			https://www.cs.bham.ac.uk/~mdr/teaching/modules04/java2/TilesSolvability.html
			http://www.sitepoint.com/randomizing-sliding-puzzle-tiles/
			*/
			if (width % 2 == 1) {
				return (this.sumInversions() % 2 == 0);
			}
			else {
				return ((this.sumInversions() + height - rowWithEmpty) % 2 == 0);
			}

		},

		sumInversions: function () {
			/*
			See isBoardSolvable() for more detail.
			*/
			var inversions = 0;
			for (var i = 0; i < this.boardSize; i++) {
				for (var j = 0; j < this.boardSize; j++) {
					inversions += this.countInversions(i, j);
				}
			}
			return inversions;
		},

		countInversions: function (i, j) {
			/*
			See isBoardSolvable() for more detail.
			*/
			var inversions = 0;
			var tileIdToStart = i * this.boardSize + j;
			var tileIdToStop = this.boardSize * this.boardSize;
			var tileValue = this.tileArray[i][j].id;

			for (var k = tileIdToStart; k < tileIdToStop; ++k) {
				var dim1 = Math.floor(k / this.boardSize);
				var dim2 = k % this.boardSize;

				var compValue = this.tileArray[dim1][dim2].id;
				if (tileValue > compValue) {
					++inversions;
				}
			}
			return inversions;
		},

		updateMoveCount: function () {
			/*
			Simple reusable method for tracking and displaying tile clicks, purely informational for the puzzler.
			*/
			this.moves++;
			$("#moves em").text(this.moves);
		},

		isBoardSolved: function () {
			/*
			Triggered on any movement of tiles. Loops up-to-tileCount, checking the jQuery object for a match on row/col data.
			*/
			var $domTiles = $("#board");
			for (var i = 0; i < this.tileCount; i++) {
			{
				var expectedValue = i;
				var expectedRow = Math.floor(expectedValue / this.boardSize);
				var expectedCol = expectedValue % this.boardSize;
				
				if ($domTiles.find("[data-row='" + expectedRow + "'][data-col='" + expectedCol + "']").attr("data-tile-id") != expectedValue)
				{
					return false;
				}

			}}
			return true;
		},

		setSolvedState: function () {
			/*
			Triggered when the puzzle is solved. Should set all UX trappings to a happy place, and show a success message.
			TODO: UX effects were conceived quickly, and they are 'fine', but I would improve the handling here.
			*/
			$("#legend a, #board div").click(function (e) {
				e.preventDefault();
				$(this).css("cursor", "default");
			});
			$("#legend").addClass("disabled");
			$("h1").text("You solved it!");
			$(".tileId").fadeOut(500);
			this.solved = true;
		},

		getHint: function () {
			/*
			Architecture:
			Please see getSolution() for full details.

			We only need to know the next move here, but it has to be the correct move to get to the end-state. My suggestion here, is to call
			getSolution(), informing it via parameter that we're only returning a single move to the UX. getSolution() would be smart enough to
			store the tileArray solution locally for potential reuse (a successive/potential click on the 'solve' button would be spared the 
			async roundtrip).

			Not currently implemented.
			*/
		},

		getSolution: function (hintOnly) {
			/*
			Architecture:
			The search algorithm(s) involved in path-finding the current-state to the end-state has very high potential to bog down memory
			if performed on the client. We have to perform this operation on the server.

			Goal on the server would be to pathfind using (probably) IDA* as the search algorithm.

			[1] Client-side
			* Check if previously-fetched solution-response exists AND that it matches the current-state of the board. If so, use that 
			and skip down to #3 below.
			* Bundle the current state of the tileArray into a JSON object.
			* Post the JSON to the server via async (jQuery .ajax(), some other, no matter).

			[2] Server-side
			* Receive and process JSON request data, and run it through the IDA* search to find the most optimal path.
			* Bundle the response JSON in the optimal order to solve the puzzle, and return it to the client.

			[3] Client-side
			* Receive and process JSON response data.
			* If hintOnly parameter is true, store the solution locally (if a server-side async call was made) and return the single-tile data. [done]
			* If hintOnly parameter is false, animate the response - in order - in the UX, and call isBoardSolved(), 
			which will in turn trigger setSolvedState(). [done]

			References:
			https://plus.google.com/u/0/+JulienDramaix/posts/4vLG9oghrLy
			https://mhesham.wordpress.com/tag/iterative-deepening-depth-first-search/
			http://webdocs.cs.ualberta.ca/~jonathan/PREVIOUS/Courses/657/Notes/10.Single-agentSearch.pdf

			Not currently implemented.
			*/
		},

		getEmptyPiece: function () {
			/*
			Fetches and returns the lone element in the tileArray which is our opaque/empty tile.
			*/
			for (var i = 0; i < this.boardSize; i++) {
				for (var j = 0; j < this.boardSize; j++) {
					if (this.tileArray[i][j].empty == 1) {
						return this.tileArray[i][j];
					}
				}
			}
			return null;
		}
	}

	$.fn.puzzle2 = function (options) {
		return this.each(function () {
			var theThing = new $.puzzle2(this, options);
		});
	}
})(jQuery);
