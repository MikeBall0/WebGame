var Game = Game || {};

Game.Guy = function() {
    this.position = new Point();
    this.velocity = new Point();
    this.bounds = new Rect(-25, -50, 50, 50);
    Game.load.image("guy", "images/guy.png");
};

Game.Guy.prototype = {
    draw: function(ctx) {
        ctx.drawImage(Game.loaded.image["guy"], this.position.x + this.bounds.x, this.position.y + this.bounds.y);
    },
    update: function(dt) {
        
    }
};