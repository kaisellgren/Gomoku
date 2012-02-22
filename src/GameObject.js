(function(window) {
	/**
	 * Creates a new game object.
	 *
	 * @class GameObject
	 * @param {*} type The type of game object.
	 */
	function GameObject(type) {
		this.type = type;
	}

	GameObject.prototype = {
		/**
		 * The type of object.
		 *
		 * Number represents players. 0 = first player, 1 = second player, etc.
		 *
		 * In the future we may have other types of objects such as "wall".
		 */
		type: null
	};

	window.GameObject = GameObject;
}(window));