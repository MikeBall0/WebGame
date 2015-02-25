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

    this.currentScreen = Game.Main.LOADING_SCREEN;
    this.currentLevelData = null;
    this.lastTickTime = 0;
    this.tick(0);
    this.loadLevel(Game.levels[Game.currentLevel].name);
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
        if (dt > 1/40) dt = 1/40;
        switch (this.currentScreen) {
            case Game.Main.GAME_SCREEN: {
                if (Game.isKeyDown[Game.SPACE]) {
                    this.restartCurrentLevel();
                }
                this.world.update(dt);
                this.guy.update(dt);
                break;
            }
            case Game.Main.LOADING_SCREEN: {
                break;
            }
        }
    },
    redraw: function() {
        this.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        switch (this.currentScreen) {
            case Game.Main.LOADING_SCREEN: {
                this.ctx.drawImage(this.loadingImage, 0, 0);
                break;
            }
            case Game.Main.GAME_SCREEN: {
                this.world.draw(this.ctx);
                this.guy.draw(this.ctx);
                break;
            }
        }
    },
    onKeyDown: function(event) {
        Game.isKeyDown[event.keyCode] = true;
    },
    onKeyUp: function(event) {
        Game.isKeyDown[event.keyCode] = undefined;
    },
    loadLevel: function(level) {
        this.currentScreen = Game.Main.LOADING_SCREEN;
        Game.load.data("level", "data/" + level + ".json", true, function() { 
            var levelObject = JSON.parse(Game.loaded.data["level"]);
            Game.current.startLevel(levelObject);
        });
    },
    startLevel: function(levelObject) {
        this.currentScreen = Game.Main.LOADING_SCREEN;
        this.currentLevelData = levelObject;
        this.guy.reset();
        this.guy.position.x = levelObject.playerStart.x;
        this.guy.position.y = levelObject.playerStart.y;
        this.guy.acceleration = levelObject.playerAcceleration;
        this.world = new Game.World(levelObject, function() {
            Game.current.currentScreen = Game.Main.GAME_SCREEN;
        });
    },
    restartCurrentLevel: function(levelObject) {
        this.startLevel(this.currentLevelData);
    }
};

Game.Main.LOADING_SCREEN = "loading";
Game.Main.MENU_SCREEN = "menu";
Game.Main.GAME_SCREEN = "game";