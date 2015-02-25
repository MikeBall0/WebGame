var Game = Game || {};

Game.Item = function() {
    this.x = 0;
    this.y = 0;
    this.bounds = new Rect();
};

Game.Item.prototype = {
    hitTest: function(other) {
        var myBounds = new Rect(this.x + this.bounds.left(), this.y + this.bounds.top(),
                                this.bounds.width, this.bounds.height);
        return myBounds.hitTest(other);
    },
    draw: function(ctx) {
        throw "Abstract method error";
    }
};

/* extends Game.Item */
Game.Flagpole = function() {
    Game.load.image("flagpole", "images/flagpole.png");
    Game.load.image("flag", "images/flag.png");
    Game.Item.call(this);
    this.bounds.x = -15;
    this.bounds.y = -90;
    this.bounds.width = 30;
    this.bounds.height = 90;
    this.flagHeight = 0;
};

Game.Flagpole.prototype = Object.create(Game.Item.prototype);
Game.Flagpole.prototype.draw = function(ctx) {
    ctx.drawImage(Game.loaded.image["flagpole"], this.x + this.bounds.left(), this.y + this.bounds.top());
    ctx.drawImage(Game.loaded.image["flag"],
                  this.x - Game.loaded.image["flag"].width - 2,
                  this.y + this.bounds.top() + Game.lerp(this.flagHeight, 0, 1, 44, 5));
};
Game.Flagpole.prototype.raise = function(duration) {
    duration = duration || 1;
    var flag = this;
    requestAnimationFrame(function(startTime) {
        requestAnimationFrame(function tick(time) {
            flag.flagHeight = Math.min(1, (time - startTime) / (duration * 1000));
            if (flag.flagHeight < 1) {
                requestAnimationFrame(tick);
            }
        });
    });
};