window.addEventListener('load', function() {
	var engine = window.TTTEngine;

	// Defines a shape.
	function Shape() {
		this.score = 0;
		this.objects = [];
	}

	// Define this AI.
	var ai = {
		shapes: [],

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

			console.log(this.shapes, this);

			callback([randomX, randomY]);
		}
	};

	engine.addAI('KaiAI', ai.run, ai);
}, false);