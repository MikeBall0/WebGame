var Game = Game || {};

Game.currentLevel = 5;
Game.levels = ["",
               {name: "level1", unlocked: true},
               {name: "level1.5", unlocked: false},
               {name: "level2", unlocked: false},
               {name: "level3", unlocked: false},
               {name: "level4", unlocked: false}];
Game.saveLevelProgress = function() {
    var i = 1;
    while (Game.levels[i].unlocked) {
        i ++;
    }
    document.cookie = "_level=" + (i-1);
};

Game.loadLevelProgress = function() {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    };
    var level = getCookie("_level");
    if (level !== undefined) {
        for (var i = parseInt(level); i > 0; i --) {
            Game.levels[i].unlocked = true;
        }
    }
};