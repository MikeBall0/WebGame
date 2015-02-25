var Game = Game || {};

Game.isKeyDown = {};

Game.Main = function() {
    Game.init();
    this.ctx = Game.canvas.getContext("2d");
    window.onkeydown = this.onKeyDown;
    window.onkeyup = this.onKeyUp;

    Game.current = this;

    this.loadingImage = document.getElementById("loading");
    
    Game.World.ConstructPatterns();

    this.guy = new Game.Guy();
    
    // this.world = new Game.World();
    this.loadingLevel = true;
    this.currentLevelData = null;
    Game.load.data("level", "data/level1.json", true, function() { 
        var levelObject = JSON.parse(Game.loaded.data["level"]);
        Game.current.loadLevel(levelObject);
    });

    this.lastTickTime = 0;
    this.tick(0);
};

Game.Main.prototype = {
    tick: function(time) {
        var dt = (time - Game.current.lastTickTime) / 1000;
        // delta time can be less than 0 during page loading or when catching up from heavy lag
        // if this happens disregard the tick, can't update with negative dt
        if (dt > 0) {
            Game.current.lastTickTime = time;
            Game.current.update(dt);
            Game.current.redraw();
        }
        requestAnimationFrame(Game.current.tick);
    },
    update: function(dt) {
        if (!this.loadingLevel) {
            if (Game.isKeyDown[Game.SPACE]) {
                this.reloadCurrentLevel();
            }
            this.guy.update(dt);
        }
    },
    redraw: function() {
        this.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        // console.log(this.loadingLevel);
        if (this.loadingLevel) {
            this.ctx.drawImage(this.loadingImage, 0, 0);
        } else {
            this.world.draw(this.ctx);
            this.guy.draw(this.ctx);
        }
    },
    onKeyDown: function(event) {
        Game.isKeyDown[event.keyCode] = true;
    },
    onKeyUp: function(event) {
        Game.isKeyDown[event.keyCode] = undefined;
    },
    loadLevel: function(levelObject) {
        this.loadingLevel = true;
        this.currentLevelData = levelObject;
        this.guy.reset();
        this.guy.position.x = levelObject.playerStart.x;
        this.guy.position.y = levelObject.playerStart.y;
        this.guy.acceleration = levelObject.playerAcceleration;
        this.world = new Game.World(levelObject, function() {
            Game.current.loadingLevel = false;
        });
    },
    reloadCurrentLevel: function(levelObject) {
        this.loadLevel(this.currentLevelData);
    }
};
