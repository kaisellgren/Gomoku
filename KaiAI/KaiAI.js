window.addEventListener('load', function() {
	var engine = window.TTTEngine;

	// Define this AI.
	var ai = {
		run: function(callback) {
			var highestX = engine.boardWidth / engine.boardCellSize;
			var highestY = engine.boardHeight / engine.boardCellSize;

			var randomX = Math.floor(Math.random() * highestX);
			var randomY = Math.floor(Math.random() * highestY);

			// Fetch shapes.
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'KaiAI/Shapes', false);
			xhr.send(null);

			var shapesText = xhr.responseText;
			var parts = shapesText.split('=== Score: ');
			parts.forEach(function(part) {
				// Skip if it's empty.
				if (part !== '') {
					var dataParts = part.split(' ===');
					var score = parseInt(dataParts[0], 10);
					var shape = dataParts[1].replace(/\s+/, '');
					console.log(score, shape);
				}
			});

			callback([randomX, randomY]);
		}
	};

	engine.addAI('KaiAI', ai.run);
}, false);