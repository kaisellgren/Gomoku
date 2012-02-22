(function(window) {
	function Engine() {
		var gameBoard = window.document.getElementById('game-board');

		this.ctx = gameBoard.getContext('2d');
		this.boardHeight = parseInt(gameBoard.getAttribute('height'));
		this.boardWidth = parseInt(gameBoard.getAttribute('width'));
	}

	Engine.prototype = {
		/**
		 * @type CanvasContext
		 */
		ctx: null,

		boardWidth: 0,
		boardHeight: 0,

		/**
		 * Contains every object in the board.
		 */
		boardObjects: [],

		/**
		 * Determines which side has the turn.
		 *
		 * 0 = X
		 * 1 = O
		 */
		turn: 0,

		/**
		 * The players who are playing. This array should always contain 2 entries.
		 *
		 * false:    human player
		 * string:   the name of the AI
		 */
		players: [],

		/**
		 * List of all possible AI players.
		 */
		AIs: {},

		/**
		 * Adds the given AI to the list of AIs.
		 *
		 * @param {String} name The name of the AI.
		 * @param {Function} getter The function to call to retrieve the move.
		 */
		addAI: function(name, getter) {
			this.AIs[name] = getter;
		},

		/**
		 * Draws the game board.
		 */
		draw: function() {
			var c = this.ctx;
			c.clearRect(0, 0, this.boardWidth, this.boardHeight);
		},

		/**
		 * Processes the next move.
		 */
		processTurn: function() {
			var currentPlayer = this.players[this.turn];

			// Check if the player is human.
			if (currentPlayer === false) {

			}

			// AI player.
			else {
				this.AIs[currentPlayer]();
			}

			this.turn = 1 - this.turn;
		},

		/**
		 * Runs the game engine.
		 */
		run: function() {
			this.draw();
			this.processTurn();
		},

		reset: function() {
			throw new Error('Not implemented');
		}
	};

	// Create a new engine.
	var engineInstance = new Engine();
	engineInstance.run();

	// Expose the engine instance to global scope.
	window.TTTEngine = engineInstance;
}(window));