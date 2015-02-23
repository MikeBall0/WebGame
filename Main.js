var Game = Game || {};

Game.Main = function() {
	Game.init()
	this.ctx = Game.canvas.getContext("2d");
	Game.load.image("background", "images/background.png");
	Game.canvas.onmousemove = this.onMouseMove;
	Game.canvas.onmousedown = this.onMouseDown;
	Game.canvas.onmouseup = this.onMouseUp;
	this.lastTickTime = 0;

	this.board = new Game.Board(10, 7);
	this.board.x = 100;
	this.board.y = 350;

	// reference to this for help in the tick function
	Game.current = this;
	this.tick(0);
};

Game.Main.prototype = {
	tick: function(time) {
		var dt = time - Game.current.lastTickTime;
		// When the page first loads and during lag spikes time reported by
		// requestAnimationFrame may be incorrect, causing negative delta times
		// just discard it if that happens.
		if (dt > 0) {
			Game.current.lastTickTime = time;
			Game.current.update(dt);
			Game.current.redraw();
		}
		requestAnimationFrame(Game.current.tick);
	},
	update: function(dt) {
		
	},
	redraw: function() {
		this.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
		this.ctx.drawImage(Game.loaded.image["background"], 0, 0);
		this.board.draw(this.ctx);
	},
	onMouseDown: function(event) {
		var worldPoint = Game.canvasPointToWorld(new Point(event.layerX, event.layerY));
	},
	onMouseUp: function(event) {
		var worldPoint = Game.canvasPointToWorld(new Point(event.layerX, event.layerY));
	},
	onMouseMove: function(event) {
		var worldPoint = Game.canvasPointToWorld(new Point(event.layerX, event.layerY));
	}
};