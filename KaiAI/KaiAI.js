window.addEventListener('load', function() {
	var engine = window.TTTEngine;

	/*

	 x = opponent / self tic or toe
	 * = empty, placeable
	 - = empty, not placeable

	 */

	/**
	 * Defines a shape.
	 *
	 * @class Shape
	 */
	function Shape() {
		this.score = 0;
		this.objects = [];
	}

	// Define this AI.
	var ai = {
		/**
		 * @type Shape[]
		 */
		shapes: [],

		scoreboard: null,

		/**
		 * Runs the AI engine. Currently inefficient.
		 *
		 * @param {Function} callback
		 */
		run: function(callback) {
			// Process shape data.
			this.processShapes();

			// TODO: Remove duplicate shapes to further improve performance.
			// this.removeDuplicateShapes();

			// Make the move.
			var highestScoredItems = this.getHighestScoredItems();
			if (highestScoredItems.length) {
				// Choose a random item from the list.
				var item = highestScoredItems[Math.floor(Math.random() * highestScoredItems.length)];
				callback([item.x, item.y]);
			}

			// If no suitable move found, pick a random place.
			else {
				var randomX, randomY,
					highestX = engine.boardWidth / engine.boardCellSize,
					highestY = engine.boardHeight / engine.boardCellSize;

				while (randomX === undefined || engine.getGameObject(randomX, randomY) !== null) {
					randomX = Math.floor(Math.random() * highestX);
					randomY = Math.floor(Math.random() * highestY);
				}

				console.log('No suitable place found!', randomX, randomY);

				callback([randomX, randomY]);
			}
		},

		/**
		 * Returns an array of highest scored items/positions.
		 *
		 * @return {Array}
		 */
		getHighestScoredItems: function() {
			var highestX = engine.boardWidth / engine.boardCellSize;
			var highestY = engine.boardHeight / engine.boardCellSize;

			// Create scoreboard. An array of objects {x: 0, y: 0, score: 50}.
			var scoreboard = [];

			function updateScoreboard(x, y, score) {
				var result = scoreboard.filter(function(item) {
					return item.x === x && item.y === y;
				});

				if (result.length === 0) {
					scoreboard.push({
						x: x,
						y: y,
						score: score
					});
				} else {
					result[0].score += score;
				}
			}

			// Loop through the game area and mark scores.
			for (var x = 0; x < highestX; x++) {
				for (var y = 0; y < highestY; y++) {
					for (var i = 0, l = this.shapes.length; i < l; i++) {
						var shape = this.shapes[i];

						// Check if the shape was found at [x, y] coordinate.
						if (this.checkShape(x, y, shape)) {
							// Add score to each peaceable position.
							shape.objects.forEach(function(position) {
								if (position.type === '*') {
									updateScoreboard(x + position.x, y + position.y, shape.score);
								}
							});
						}
					}
				}
			}

			// Determine the highest score.
			var highestScore = 0;
			scoreboard.forEach(function(item) {
				if (item.score > highestScore) {
					highestScore = item.score;
				}
			});

			// Make an array of all highest scored items.
			var highestScoredItems = [];
			scoreboard.forEach(function(item) {
				if (item.score === highestScore) {
					highestScoredItems.push(item);
				}
			});

			this.scoreboard = scoreboard;

			return highestScoredItems;
		},

		/**
		 * Processes shapes data.
		 */
		processShapes: function() {
			var me = this;

			// If we already have processed shapes, just return.
			if (this.shapes.length) {
				return true;
			}

			// Fetch shapes.
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'KaiAI/Shapes', false);
			xhr.send(null);

			// Parse shape format into an object.
			this.shapes = [];
			var shapesText = xhr.responseText;
			var parts = shapesText.split('=== Score: ');
			parts.forEach(function(part) {
				// Skip if it's empty.
				if (part !== '') {
					var dataParts = part.split(' ===');
					var score = parseInt(dataParts[0], 10);
					var shapeText = dataParts[1].replace(/\s+/, '');
					shapeText = shapeText.replace(/(\r\n|\r|\n)$/, ''); // Remove last line break if it exists.

					var lines = shapeText.split(/(\r\n|\r|\n)/);

					var shape = new Shape();
					shape.score = score;

					var y = 0;
					for (var i = 0, length = lines.length; i < length; i += 2) { // +2 because there are also \n items which we want to skip...
						var line = lines[i];

						for (var x = 0, chars = line.length; x < chars; x++) {
							if (line[x] !== ' ') {
								shape.objects.push({
									x: x,
									y: y,
									type: line[x].toUpperCase()
								});
							}
						}

						y++;
					}

					me.shapes.push(shape);
				}
			});

			// Create rotated and mirrored versions as well, because we don't want to manually do those transforms in the shapes file.
			this.addRotatedShapes();
		},

		/**
		 * Checks if the shape can be found at given location.
		 *
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Shape} shape
		 */
		checkShape: function(x, y, shape) {
			var matches = 0;

			var metTicOrToe = null; // Keep logging if we met either X or O along the way.

			shape.objects.forEach(function(shapeObject) {
				var gameObject = engine.getGameObject(x + shapeObject.x, y + shapeObject.y);

				// Matched empty "*" or "-".
				if ((shapeObject.type === '*' || shapeObject.type === '-') && gameObject === null) {
					matches++;
				}

				// Matched "X".
				var isGameObjectXOrO = gameObject && (gameObject.type === 0 || gameObject.type === 1);
				if (shapeObject.type === 'X' && isGameObjectXOrO) {
					// Make sure the match does not change type between X or O.
					// i.e. we want *xxx* to match either 3 X's or 3 O's but not a mixed set of them.
					var gameObjectTypeIsOk = metTicOrToe === null || gameObject.type === metTicOrToe;
					if (gameObjectTypeIsOk) {
						matches++;
						metTicOrToe = gameObject.type;
					}
				}

				// Matched "B" = Block. Either different X/O or out of game arena.
				if (shapeObject.type === 'B') {
					var outOfGameArena = false; // TODO: Implement! Out of game arena check does not work yet because the loop never goes out of the arena!
					if (outOfGameArena) {
						matches++;
					} else {
						if (gameObject && (metTicOrToe === null || gameObject.type !== metTicOrToe)) {
							matches++;
							metTicOrToe = 1 - gameObject.type; // Switch the object type around because we match a block, not a player object.
						}
					}
				}
			});

			// Return true if all shape objects matched, and match count > 0.
			return (matches && shape.objects.length === matches);
		},

		/**
		 * Adds rotated versions of shapes. Basically multiplies the number of shapes by four.
		 */
		addRotatedShapes: function() {
			var me = this;

			var newShapes = [];

			this.shapes.forEach(function(shape) {
				var objects = shape.objects;

				// Now let's create 3 new shapes that represent the other 3 directions/rotations.

				var newShape = new Shape();
				newShape.score = shape.score;
				newShape.objects = [];
				objects.forEach(function(object) {
					newShape.objects.push({x: object.y, y: object.x, type: object.type});
				});

				newShapes.push(newShape);

				newShape = new Shape();
				newShape.score = shape.score;
				newShape.objects = [];
				objects.forEach(function(object) {
					var temp = object.x;
					newShape.objects.push({x: object.y, y: -temp, type: object.type});
				});

				me.shapes.push(newShape);

				newShape = new Shape();
				newShape.score = shape.score;
				newShape.objects = [];
				objects.forEach(function(object) {
					var temp = object.x;
					newShape.objects.push({x: -object.y, y: -temp, type: object.type});
				});

				me.shapes.push(newShape);
			});

			this.shapes = this.shapes.concat(newShapes);
		},

		/**
		 * Renders information about the scoreboard on the game board. Called when the engine wants.
		 */
		afterRender: function() {
			if (!this.scoreboard) {
				return true;
			}

			this.scoreboard.forEach(function(item) {
				engine.drawInfoOnCell(item.score, item.x, item.y);
			});
		}
	};

	engine.addAI('KaiAI', ai.run, ai);
	engine.afterRenderCallbacks.push(ai.afterRender.bind(ai));
}, false);