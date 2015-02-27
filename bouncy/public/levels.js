'use strict'

var Game = Game || {};

Game.LevelData = function(name, unlocked, beaten) {
    this.name = name;
    this.unlocked = !!unlocked;
    this.beaten = !!beaten;
};

Game.currentLevel = 0;
Game.levels = [
                new Game.LevelData("level1", true),
                new Game.LevelData("level1.5"),
                new Game.LevelData("level2"),
                new Game.LevelData("level3"),
                new Game.LevelData("level4"),
              ];

Game.completeLevel = function() {
    Game.levels[Game.currentLevel].beaten = true;
    if (Game.levels.length > Game.currentLevel + 1) {
        Game.levels[Game.currentLevel + 1].unlocked = true;
    }
    Game.saveLevelProgress();
};

Game.incrementLevelIfAvailable = function() {
    if (Game.levels.length > Game.currentLevel + 1 && Game.levels[Game.currentLevel + 1].unlocked) {
        Game.currentLevel ++;
    }
};

Game.saveLevelProgress = function() {
    var leveldata = [];
    for (var i = 0; i < Game.levels.length; i ++) {
        var level = Game.levels[i];
        leveldata.push({unlocked: level.unlocked, beaten: level.beaten});
    }
    document.cookie = "_leveldata=" + JSON.stringify(leveldata);
};

Game.loadLevelProgress = function() {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    };
    var leveldata = getCookie("_leveldata");
    if (leveldata !== undefined) {
        try {
            leveldata = JSON.parse(leveldata);
            for (var i = 0; i < leveldata.length && i < Game.levels.length; i ++) {
                Game.levels[i].unlocked = leveldata[i].unlocked;
                Game.levels[i].beaten = leveldata[i].beaten;
            }
        } catch(e) {}
    }
};