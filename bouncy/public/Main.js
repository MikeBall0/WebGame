var Game = Game || {};

Game.isKeyDown = {};

Game.Main = function() {
    Game.init();
    this.ctx = Game.canvas.getContext("2d");
    window.onkeydown = this.onKeyDown;
    window.onkeyup = this.onKeyUp;

    Game.current = this;

    Game.load.image("background", "images/background.png");
    
    this.guy = new Game.Guy();
    this.guy.position.x = 100;
    this.guy.position.y = 100;

    this.lastTickTime = 0;
    this.tick(0);
};

Game.Main.prototype = {
    tick: function(time) {
        var dt = time - Game.current.lastTickTime;
        // delta time can be less than 0 during page loading or when catching up from heavy lag
        // if this happens disregard the tick, can't update with negative dt
        if (dt > 0) {
            Game.current.lastTickTime = time;
            Game.current.update();
            Game.current.redraw();
        }
        requestAnimationFrame(Game.current.tick);
    },
    update: function(dt) {
        // console.log("Space " + Game.isKeyDown[Game.SPACE]);
        // console.log("Left " + Game.isKeyDown[Game.LEFT]);
        // console.log("Right " + Game.isKeyDown[Game.RIGHT]);
    },
    redraw: function() {
        this.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        this.ctx.drawImage(Game.loaded.image["background"], 0, 0);
        this.guy.draw(this.ctx);
    },
    onKeyDown: function(event) {
        Game.isKeyDown[event.keyCode] = true;
    },
    onKeyUp: function(event) {
        Game.isKeyDown[event.keyCode] = undefined;
    }
};
