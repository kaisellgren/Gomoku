(function(engine) {
	// Define this AI.
	engine.addAI('SampleAI', function() {
		var randomX = Math.floor(Math.random() * engine.boardWidth);
		var randomY = Math.floor(Math.random() * engine.boardHeight);

		return [randomX, randomY];
	});
}(window.TTTEngine));