'use strict'

var Game = Game || {};

Game.World = function(worldObject, onassetsloaded) {
    Game.load.image(worldObject.background, worldObject.background, false, function() {
        onassetsloaded();
    });
    Game.load.image("blockCornerTopLeft", "images/block_corner_top_left.png");
    Game.load.image("blockCornerTopRight", "images/block_corner_top_right.png");
    Game.load.image("blockCornerBottomLeft", "images/block_corner_bottom_left.png");
    Game.load.image("blockCornerBottomRight", "images/block_corner_bottom_right.png");
    Game.load.image("horizontalBorder", "images/block_outline_top_bottom.png");
    Game.load.image("verticalBorder", "images/block_outline_left_right.png");
    this.background = worldObject.background;
    this.ground = worldObject.ground;
    this.blocks = [];
    for (var block of worldObject.blocks) {
        var newBlock = new Rect(block.x, block.y, block.width, block.height);
        if (block.bottomborder !== undefined) {
            newBlock.bottomborder = block.bottomborder;
        } else {
            newBlock.bottomborder = true;
        }
        this.blocks.push(newBlock);
    }
    this.items = [];
    for (var item of worldObject.items) {
        this.items.push(this.createItem(item));
    }
    this.gravity = worldObject.gravity;
    this.decayPercent = worldObject.decayPercent;
    this.decayAbsolute = worldObject.decayAbsolute;
    this.tutorial = worldObject.tutorial;

    if (this.tutorial === 1) {
        Game.load.image("tutorial1_frame1", "images/tutorial/tutorial1_frame1.png");
        Game.load.image("tutorial1_frame2", "images/tutorial/tutorial1_frame2.png");
        Game.load.image("tutorial1_frame3", "images/tutorial/tutorial1_frame3.png");
    }

    this.animationTime = 0;
    this.worldComplete = false;
};

Game.World.prototype = {
    update: function(dt) {
        this.animationTime += dt;
    },
    draw: function(ctx) {
        ctx.drawImage(Game.loaded.image[this.background], 0, 0);
        var cacheFillStyle = ctx.fillStyle;
        this.drawBlockFills(ctx);
        this.drawBlockOutlines(ctx);
        ctx.fillStyle = cacheFillStyle;

        for (var item of this.items) {
            item.draw(ctx);
        }

        switch (this.tutorial) {
            case 1: {
                var tFrame = Math.floor(this.animationTime) % 4
                if (tFrame === 0) tFrame = 2;
                ctx.drawImage(Game.loaded.image["tutorial1_frame" + tFrame], 10, 150);
                break;
            }
        }
    },
    drawBlockFills: function(ctx) {
        if (Game.World.PATTERNS["groundPattern"]) {
            ctx.fillStyle = Game.World.PATTERNS["groundPattern"];
        } else {
            ctx.fillStyle = "#CE7100";
        }
        for (var block of this.blocks) {
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    },
    drawBlockOutlines: function(ctx) {
        var borderWidth = 20;
        var borderPadding = 1;
        var borderOverlap = borderWidth - borderPadding;
        var doubleBorderOverlap = borderOverlap * 2;
        for (var block of this.blocks) {
            ctx.drawImage(Game.loaded.image["horizontalBorder"], block.x + borderOverlap, block.y - borderPadding, block.width - doubleBorderOverlap, borderWidth);
            if (block.bottomborder === undefined || block.bottomborder) {
                ctx.drawImage(Game.loaded.image["horizontalBorder"], block.x + borderOverlap, block.y + block.height - borderOverlap, block.width - doubleBorderOverlap, borderWidth);
                ctx.drawImage(Game.loaded.image["verticalBorder"], block.x + block.width - borderOverlap, block.y + borderOverlap, borderWidth, block.height - doubleBorderOverlap);
                ctx.drawImage(Game.loaded.image["verticalBorder"], block.x - borderPadding, block.y + borderOverlap, borderWidth, block.height - doubleBorderOverlap);
            } else {
                ctx.drawImage(Game.loaded.image["verticalBorder"], block.x + block.width - borderOverlap, block.y + borderOverlap, borderWidth, block.height - borderOverlap);
                ctx.drawImage(Game.loaded.image["verticalBorder"], block.x - borderPadding, block.y + borderOverlap, borderWidth, block.height - borderOverlap);
            }
            ctx.drawImage(Game.loaded.image["blockCornerTopLeft"], block.x - borderPadding, block.y - borderPadding);
            ctx.drawImage(Game.loaded.image["blockCornerTopRight"], block.x + block.width - borderOverlap, block.y - borderPadding);
            if (block.bottomborder === undefined || block.bottomborder) {
                ctx.drawImage(Game.loaded.image["blockCornerBottomLeft"], block.x - borderPadding, block.y + block.height - borderOverlap);
                ctx.drawImage(Game.loaded.image["blockCornerBottomRight"], block.x + block.width - borderOverlap, block.y + block.height - borderOverlap);
            }
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
            case "spike": {
                var spike = new Game.Spike();
                spike.x = itemData.x;
                spike.y = itemData.y;
                if (itemData.orientation !== undefined) {
                    spike.setOrientation(itemData.orientation);
                }
                return spike;
            }
            case "evilspike": {
                var spike = new Game.EvilSpike();
                spike.x = itemData.x;
                spike.y = itemData.y;
                if (itemData.orientation !== undefined) {
                    spike.setOrientation(itemData.orientation);
                }
                if (itemData.visibleDistance !== undefined) {
                    spike.visibleDistance = itemData.visibleDistance;
                }
                return spike;
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