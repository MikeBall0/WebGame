var Game = Game || {};

Game.World = function(worldObject, onassetsloaded) {
    Game.load.image(worldObject.background, worldObject.background, false, function() {
        onassetsloaded();
    });
    this.background = worldObject.background;
    this.ground = worldObject.ground;
    this.blocks = [];
    for (var block of worldObject.blocks) {
        this.blocks.push(new Rect(block.x, block.y, block.width, block.height));
    }
    this.items = [];
    for (var item of worldObject.items) {
        this.items.push(this.createItem(item));
    }
    this.gravity = worldObject.gravity;
    this.decayPercent = worldObject.decayPercent;
    this.decayAbsolute = worldObject.decayAbsolute;

    this.worldComplete = false;
};

Game.World.prototype = {
    draw: function(ctx) {
        var cacheFillStyle = ctx.fillStyle;
        ctx.drawImage(Game.loaded.image[this.background], 0, 0);
        if (Game.World.PATTERNS["groundPattern"]) {
            ctx.fillStyle = Game.World.PATTERNS["groundPattern"];
        } else {
            ctx.fillStyle = "#CE7100";
        }
        for (var block of this.blocks) {
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
        ctx.fillStyle = cacheFillStyle;
        for (var item of this.items) {
            item.draw(ctx);
        }
    },
    createItem: function(itemData) {
        switch (itemData.type) {
            case "flagpole": {
                var flagpole = new Game.Flagpole();
                flagpole.x = itemData.x;
                flagpole.y = itemData.y;
                return flagpole;
            }
        }
    }
};

Game.World.ConstructPatterns = function() {
    if (!Game.World.PATTERNS) {
        Game.World.PATTERNS = {};
        Game.load.image("groundTile", "images/groundtile.png", false, function() {
            Game.World.PATTERNS["groundPattern"] = Game.current.ctx.createPattern(Game.loaded.image["groundTile"], "repeat");
        });
    }
};

Game.World.LEFT = 0;
Game.World.RIGHT = 800;