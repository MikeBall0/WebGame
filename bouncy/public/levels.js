var Game = Game || {};

Game.currentLevel = 1;
Game.levels = ["",
               {name: "level1", unlocked: true},
               {name: "level2", unlocked: false}];
Game.saveLevelProgress = function() {
    var i = 1;
    while (Game.levels[i].unlocked) {
        i ++;
    }
    
};

Game.loadLevelProgress = function() {

};