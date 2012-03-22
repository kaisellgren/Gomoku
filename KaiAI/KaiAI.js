window.addEventListener('load', function() {
	var engine = window.TTTEngine;

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

		/**
		 * Runs the AI engine. Currently inefficient.
		 *
		 * @param {Function} callback
		 */
		run: function(callback) {
			var me = this;

			var highestX = engine.boardWidth / engine.boardCellSize;
			var highestY = engine.boardHeight / engine.boardCellSize;

			var randomX = Math.floor(Math.random() * highestX);
			var randomY = Math.floor(Math.random() * highestY);

			// Fetch shapes.
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'KaiAI/Shapes', false);
			xhr.send(null);

			// Parse shape format into an object.
			var shapesText = xhr.responseText;
			var parts = shapesText.split('=== Score: ');
			parts.forEach(function(part) {
				// Skip if it's empty.
				if (part !== '') {
					var dataParts = part.split(' ===');
					var score = parseInt(dataParts[0], 10);
					var shape = dataParts[1].replace(/\s+/, '');
					shape = shape.replace(/(\r\n|\r|\n)$/, ''); // Remove last line break if it exists.

					var lines = shape.split(/(\r\n|\r|\n)/);
					var y = 0;
					for (var i = 0, length = lines.length; i < length; i += 2) {
						var line = lines[i];

						shape = new Shape();
						shape.score = score;

						for (var x = 0, chars = line.length; x < chars; x++) {
							shape.objects.push({
								x: x,
								y: y,
								type: line[x]
							});
						}

						y++;
					}



					me.shapes.push(shape);
				}
			});

			// Create rotated and mirrored versions as well, because we don't want to manually do those transforms in the shapes file.
			// TODO

			// Create scoreboard. An array of objects {x: 0, y: 0, score: 50}.
			var scoreboard = [];

			// Loop through the game area and mark scores.
			for (var x = 0; x < highestX; x++) {
				for (var y = 0; y < highestY; y++) {
					for (var i = 0, l = this.shapes.length; i < l; i++) {
						var shape = this.shapes[i];

						// Check if the shape was found at [x, y] coordinate.
						if (this.checkShape(x, y, shape)) {
							scoreboard.push({
								x: x,
								y: y,
								score: shape.score
							});
						}
					}
				}
			}

			// Choose the highest scored position (or random between several high positions).
			// TODO

			callback([randomX, randomY]);
		},

		/**
		 * Checks if the shape can be found at given location.
		 *
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Shape} shape
		 */
		checkShape: function(x, y, shape) {
			shape.objects.forEach(function(shapeObject) {

			});
		}
	};

	engine.addAI('KaiAI', ai.run, ai);
}, false);