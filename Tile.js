var Game = Game || {};
Game.Tile = function(x, y, standable) {
	Game.load.image("tile", "images/Tile.png");
	this.x = x;
	this.y = y;
	this.center = new Point(30, 10);
	this.standable = standable;
};

Game.Tile.prototype = {
	getImage: function() {
		return Game.loaded.image["tile"];
	}
};

Game.Tile.WIDTH = 60;
Game.Tile.HEIGHT = 20;
