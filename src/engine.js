(function(window) {
	function Engine() {
		var me = this;
		var gameBoard = window.document.getElementById('game-board');

		// Set properties.
		this.ctx = gameBoard.getContext('2d');
		this.boardHeight = parseInt(gameBoard.getAttribute('height'));
		this.boardWidth = parseInt(gameBoard.getAttribute('width'));

		// Listen to "start" button clicks.
		window.document.getElementById('start').addEventListener('click', function() {
			me.run();
		}, false);

		// Listen to user clicks.
		gameBoard.addEventListener('click', this.onGameBoardClick.bind(this), false);
	}

	Engine.prototype = {
		/**
		 * @type CanvasContext
		 */
		ctx: null,

		/**
		 * Determines hte board cell size. Should not be modified on the fly.
		 */
		boardCellSize: 32,
		boardWidth: 0,
		boardHeight: 0,

		/**
		 * Contains every object in the board.
		 *
		 * This is a 2d "array", e.g. gameObjects[0][1] equals to X = 0, Y = 1.
		 */
		gameObjects: {},

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
		 * If it's a string "player", then it's human, otherwise it's an AI of the specified name.
		 */
		players: ['player', 'KaiAI'],

		/**
		 * List of all possible AI players.
		 */
		AIs: {},

		/**
		 * List of all scopes for AI players.
		 */
		AIScopes: {},

		/**
		 * X and Y coordinates of the last successful move.
		 */
		lastMoveCoordinates: {x: -1, y: -1},

		/**
		 * Push functions to register after rendering callbacks.
		 */
		afterRenderCallbacks: [],

		/**
		 * Adds the given AI to the list of AIs.
		 *
		 * @param {String} name The name of the AI.
		 * @param {Function} getter The function to call to retrieve the move.
		 * @param {Object} scope
		 */
		addAI: function(name, getter, scope) {
			this.AIs[name] = getter;
			this.AIScopes[name] = scope;
		},

		/**
		 * Returns  the game object at the given location.
		 *
		 * @param {Number} x
		 * @param {Number} y
		 * @return {GameObject|null}
		 */
		getGameObject: function(x, y) {
			var column = this.gameObjects[x];

			if (!column) {
				return null;
			}

			return column[y] || null;
		},

		/**
		 * Returns the canvas context.
		 *
		 * @return {CanvasContext}
		 */
		getCanvasContext: function() {
			return this.ctx;
		},

		/**
		 * Draws the game board.
		 */
		draw: function() {
			var c = this.ctx;

			// Clear.
			c.clearRect(0, 0, this.boardWidth, this.boardHeight);

			this.drawCells();
			this.drawObjects();
			this.drawLastMove();

			this.afterRenderCallbacks.forEach(function(func) {func();});
		},

		/**
		 * Draws the given text into the given cell.
		 *
		 * @param text
		 * @param x
		 * @param y
		 */
		drawInfoOnCell: function(text, x, y) {
			x = x * this.boardCellSize;
			y = y * this.boardCellSize;

			this.ctx.strokeStyle = 'black';
			this.ctx.font = 'normal 12pt Courier';
			this.ctx.strokeText(text, x + 1, y + 13);
		},

		/**
		 * Draws the cells.
		 */
		drawCells: function() {
			var c = this.ctx;

			var numberOfCellsHor = Math.floor(this.boardWidth / this.boardCellSize);
			var numberOfCellsVer = Math.floor(this.boardHeight / this.boardCellSize);

			// Draw squares/cells.
			c.strokeStyle = 'rgb(128,128,128)';

			for (var x = 0; x <= numberOfCellsHor; x++) {
				c.beginPath();
				c.moveTo(x * this.boardCellSize + 0.5, 0);
				c.lineTo(x * this.boardCellSize + 0.5, this.boardHeight);
				c.stroke();
				c.closePath();
			}

			for (var y = 0; y <= numberOfCellsVer; y++) {
				c.beginPath();
				c.moveTo(0, y * this.boardCellSize + 0.5);
				c.lineTo(this.boardWidth, y * this.boardCellSize + 0.5);
				c.stroke();
				c.closePath();
			}
		},

		/**
		 * Draws all game objects.
		 */
		drawObjects: function() {
			var c = this.ctx;

			for (var x in this.gameObjects) {
				if (!this.gameObjects.hasOwnProperty(x)) {
					continue;
				}

				var objects = this.gameObjects[x];
				for (var y in objects) {
					if (!objects.hasOwnProperty(y)) {
						continue;
					}

					/** @type GameObject object */
					var object = objects[y];

					switch (object.type) {
						// X
						case 0:
							c.beginPath();
							c.strokeStyle = 'rgb(207,91,30)';
							c.moveTo(x * this.boardCellSize + 2, y * this.boardCellSize + 2.5);
							c.lineTo(x * this.boardCellSize + this.boardCellSize - 2, y * this.boardCellSize + 0.5 + this.boardCellSize - 2);
							c.moveTo(x * this.boardCellSize + this.boardCellSize - 2, y * this.boardCellSize + 2.5);
							c.lineTo(x * this.boardCellSize + 2, y * this.boardCellSize + 0.5 + this.boardCellSize - 2);
							c.stroke();
							c.closePath();
							break;

						// O
						case 1:
							c.beginPath();
							c.strokeStyle = 'rgb(10,148,207)';
							c.arc(x * this.boardCellSize + 0.5 + this.boardCellSize / 2, y * this.boardCellSize + 0.5 + this.boardCellSize / 2, this.boardCellSize / 2 - 2 , 0, 360, false);
							c.stroke();
							c.closePath();
							break;

						default:
							throw new Error('Not implemented');
							break;
					}
				}
			}
		},

		/**
		 * Draws the last move with a red rectangle.
		 */
		drawLastMove: function() {
			var ctx = this.ctx;

			ctx.strokeStyle = 'rgb(255, 0, 0)';
			ctx.lineWidth = 2;

			ctx.beginPath();
			ctx.strokeRect(
				this.lastMoveCoordinates.x * this.boardCellSize,
				this.lastMoveCoordinates.y * this.boardCellSize,
				this.boardCellSize + 1,
				this.boardCellSize + 1
			);
			ctx.closePath();

			ctx.lineWidth = 1;
		},

		/**
		 * Processes the next move.
		 */
		processTurn: function() {
			var me = this;
			var currentPlayer = this.getCurrentPlayer();

			// Process AI logic.
			if (currentPlayer !== 'player') {
				this.AIs[currentPlayer].call(this.AIScopes[currentPlayer], function(position) {
					this.addGameObject(position[0], position[1], this.turn);
					me.lastMoveCoordinates = {x: position[0], y: position[1]};

					this.turn = 1 - this.turn;
					this.draw();

					if (me.getCurrentPlayer() !== 'player') {
						setTimeout(function() {
							me.processTurn();
						}, 0);
					}
				}.bind(this));
			}
		},

		/**
		 * Adds the given game object.
		 *
		 * @param x
		 * @param y
		 * @param type
		 */
		addGameObject: function(x, y, type) {
			// Create new game object.
			var object = new GameObject();
			object.type = type;

			// Add it to the list.
			if (this.gameObjects[x] === undefined) {
				this.gameObjects[x] = {};
			}

			this.gameObjects[x][y] = object;
		},

		/**
		 * Returns the current player.
		 */
		getCurrentPlayer: function() {
			return this.players[this.turn];
		},

		/**
		 * Fired upon game board click.
		 *
		 * @param {Event} e
		 */
		onGameBoardClick: function(e) {
			// Ignore the click if it's not human player's turn.
			if (this.getCurrentPlayer() === 'player') {
				var cellX = Math.floor((e.offsetX || (e.clientX - e.target.offsetLeft + window.scrollX)) / this.boardCellSize);
				var cellY = Math.floor((e.offsetY || (e.clientY - e.target.offsetTop + window.scrollY)) / this.boardCellSize);

				this.addGameObject(cellX, cellY, this.turn);
				this.lastMoveCoordinates = {x: cellX, y: cellY};

				// Continue processing the turn.
				this.turn = 1 - this.turn;
				this.draw();
				this.processTurn();
			}
		},

		/**
		 * Runs the game engine.
		 */
		run: function() {
			this.reset();
			this.draw();
			this.processTurn();
		},

		reset: function() {
			this.gameObjects = {};
		}
	};

	window.addEventListener('load', function() {
		// Expose the engine instance to global scope.
		window.TTTEngine = new Engine();
	}, false);
}(window));