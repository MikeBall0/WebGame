var Game = Game || {};

Game.loaded = {
    image: {},
    data: {}
};

Game.Preloader = function() {
    this.xhr = new XMLHttpRequest();
};

Game.Preloader.prototype = {
    image: function(name, source, force, onload) {
        if (Game.loaded.image[name] && !force) {
            if (onload) onload();
        } else {
            var loadingImage = new Image();
            loadingImage.onload = onload;
            loadingImage.src = source;
            Game.loaded.image[name] = loadingImage;
        }
    },
    data: function(name, source, force, onload) {
        if (Game.loaded.data[name] && !force) {
            if (onload) onload();
        } else {
            if (Game.loaded.data[name] === undefined) {
                Game.loaded.data[name] = "";
            }
            this.xhr.open("GET", source, true);
            this.xhr.onload = function(e) {
                Game.loaded.data[name] = e.target.responseText;
                if (onload) {
                    onload();
                }
            };
            this.xhr.send();
        }
    }
};

Game.load = new Game.Preloader();