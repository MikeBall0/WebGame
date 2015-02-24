var Game = Game || {};

Game.World = function(worldObject) {
    this.ground = worldObject.ground;
    this.blocks = worldObject.blocks;
    this.items = worldObject.items;
    this.gravity = worldObject.gravity;
    this.decayPercent = worldObject.decayPercent;
    this.decayAbsolute = worldObject.decayAbsolute;
};

Game.World.LEFT = 0;
Game.World.RIGHT = 800;