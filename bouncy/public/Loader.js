'use strict'

var Game = Game || {};

Game.loaded = {
    image: {},
    data: {}
};

Game.Loader = function() {
    this.xhr = new XMLHttpRequest();
};

Game.Loader.prototype = {
    image: function(name, source, force, onload) {
        if (Game.loaded.image[name] && !force) {
            if (onload) onload();
            return Game.loaded.image[name];
        } else {
            var loadingImage = new Image();
            loadingImage.onload = onload;
            loadingImage.src = source;
            Game.loaded.image[name] = loadingImage;
            return loadingImage;
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

Game.load = new Game.Loader();