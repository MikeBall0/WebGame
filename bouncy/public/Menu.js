'use strict'

var Game = Game || {};

Game.Menu = function() {
    Game.load.image("menuBackground", "images/menu_image.png");
    this.lockedImg = Game.load.image("lockedLevel", "images/locked_level_node.png");
    this.unlockedImg = Game.load.image("unlockedLevel", "images/unlocked_level_node.png");
    this.beatenImg = Game.load.image("beatenLevel", "images/beaten_level_node.png");
    this.maxColumns = 10;
    this.levelButtonXPadding = 10;
    this.levelButtonYPadding = 10;
    this.levelButtonXOffset = 30;
    this.levelButtonYOffset = 160;
};

Game.Menu.prototype = {
    update: function(dt) {

    },
    draw: function(ctx) {
        ctx.font = "45pt Cooper";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.drawImage(Game.loaded.image["menuBackground"], 0, 0);
        for (var i = 0; i < Game.levels.length; i ++) {
            var nodeImg = !Game.levels[i].unlocked ? this.lockedImg : 
                           Game.levels[i].beaten ? this.beatenImg : this.unlockedImg;
            var x = (i % this.maxColumns) * (this.unlockedImg.width + this.levelButtonXPadding) + this.levelButtonXOffset;
            var y = Math.floor(i / this.maxColumns) * (this.unlockedImg.height + this.levelButtonYPadding) + this.levelButtonYOffset;
            ctx.drawImage(nodeImg, x, y);
            ctx.fillText(i, x + this.unlockedImg.width / 2, y + this.unlockedImg.height - 14);
        }
    },
    onMouseEvent: function(me) {
        if (me.type === "up") {
            var x = me.position.x - this.levelButtonXOffset;
            var y = me.position.y - this.levelButtonYOffset;
            var buttonCellWidth = this.unlockedImg.width + this.levelButtonXPadding;
            var buttonCellHeight = this.unlockedImg.height + this.levelButtonYPadding;
            if (x % buttonCellWidth > this.unlockedImg.width || y % buttonCellHeight > this.unlockedImg.height) return; // if we clicked on the space between buttons
            x = Math.floor(x / (this.unlockedImg.width + this.levelButtonXPadding));
            y = Math.floor(y / (this.unlockedImg.height + this.levelButtonYOffset));
            if (x >= this.maxColumns) return; // if we clicked off to the right of the level buttons
            var selectedLevel = x + y * this.maxColumns;
            Game.current.loadLevel(selectedLevel); // the game will handle not loading illegal levels
        }
    }
}