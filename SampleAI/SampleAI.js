window.addEventListener('load', function() {
	var engine = window.TTTEngine;

	// Define this AI.
	engine.addAI('SampleAI', function(callback) {
		var randomX = Math.floor(Math.random() * engine.boardWidth / engine.boardCellSize);
		var randomY = Math.floor(Math.random() * engine.boardHeight / engine.boardCellSize);

		callback([randomX, randomY]);
	});
}, false);