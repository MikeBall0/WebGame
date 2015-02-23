var Game = Game || {};

Game.Cache = function() {
	this.image = {};
};

Game.loaded = new Game.Cache();

Game.Preloader = function() {
	this.xhr = new XMLHttpRequest();
};

Game.Preloader.prototype = {
	image: function(name, source, force, onload) {
		if (Game.loaded.image[name] && !force) return;
		var loadingImage = new Image();
		loadingImage.onload = onload;
		loadingImage.src = source;
		Game.loaded.image[name] = loadingImage;
	}
};

Game.load = new Game.Preloader();