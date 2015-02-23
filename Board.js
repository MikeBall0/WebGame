var Game = Game || {};

Game.Board = function(width, height) {
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;
	var vx = this.vx = new Point(Game.Tile.WIDTH / 2, -Game.Tile.HEIGHT / 2);
	var vy = this.vy = new Point(Game.Tile.WIDTH / 2, Game.Tile.HEIGHT / 2);
	this.md = vy.y * vx.x - vy.x * vx.y;
	this.tiles = [];
	for (var h = 0; h < this.height; h ++) {
		for (var w = 0; w < this.width; w ++) {
			this.tiles.push(new Game.Tile(w, h, true));
		}
	}
};

Game.Board.prototype = {
	draw: function(ctx) {
		var origin = this.getBoardOrigin();
		for (var i = 0; i < this.tiles.length; i ++) {
			var imgCenter = this.tilePointToPixel(new Point(this.tiles[i].x,
															this.tiles[i].y));
			var imgX = imgCenter.x + origin.x;
			var imgY = imgCenter.y + origin.y;
			ctx.drawImage(this.tiles[i].getImage(), imgX, imgY);
		}
	},
	getBoardBounds: function() {
		var breadth = (this.width + this.height) / 2;
		var pixelWidth = Game.Tile.WIDTH * breadth;
		var pixelHeight = Game.Tile.HEIGHT * breadth;
		return new Rect(x, y, pixelWidth, pixelHeight);
	},
	getBoardOrigin: function() {
		return new Point(this.x, this.y + this.width * Game.Tile.HEIGHT / 2);
	},
	// returns the center of the tile relative to board origin
	tilePointToPixel: function(point) {
		return new Point(point.x * this.vx.x + point.y * this.vy.x + Game.Tile.WIDTH / 2,
						 point.x * this.vx.y + point.y * this.vy.y);
	},
	boardPointToTile: function(point) {
		var nx = point.x;
		var ny = point.y - this.width * Game.Tile.HEIGHT / 2;
		var vx = this.vx;
		var vy = this.vy;
		var m = (ny * vx.x - nx * vx.y) / md;
		var n = (nx - m * vy.x) / vx.x;
		return new Point(Math.floor(n), Math.floor(m));
	}
};