var Game = Game || {};

Game.LEFT = 37;
Game.UP = 38;
Game.RIGHT = 39;
Game.DOWN = 40;

Game.SPACE = 32;

Game.init = function() {
    Game.canvas = document.getElementById("canvas");
};

Game.Point = function(x, y) {
    this.x = x || 0.0;
    this.y = y || 0.0;
};

Game.Point.prototype = {
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    copy: function() {
        return new Game.Point(this.x, this.y);
    },
    minus: function(other) {
        return new Game.Point(this.x - other.x, this.y - other.y);
    }
};

var Point = Game.Point;

Game.Rect = function(x, y, width, height) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.width = width || 0.0;
    this.height = height || 0.0;
};

Game.Rect.prototype = {
    area: function() {
        return this.width * this.height;
    },
    top: function() {
        return this.y;
    },
    bottom: function() {
        return this.y + this.height;
    },
    left: function() {
        return this.x;
    },
    right: function() {
        return this.x + this.width;
    },
    union: function(other) {
        var left = Math.min(this.left(), other.left()); 
        var right = Math.max(this.right(), other.right()); 
        var top = Math.min(this.top(), other.top()); 
        var bottom = Math.max(this.bottom(), other.bottom());
        return new Rect(left, top, right - left, bottom - top);
    },
    contains: function(point) {
        return this.left() < point.x &&
               this.right() > point.x &&
               this.top() < point.y &&
               this.bottom() > point.y;
    },
    intersects: function(other) {
        return !(this.left() >= other.right() ||
                 this.right() <= other.left() ||
                 this.top() >= other.bottom() ||
                 this.bottom() <= other.top());
    },
    hitTest: function(other) {
        if (other instanceof Game.Point) {
            return this.contains(other);
        } else if (other instanceof Game.Rect) {
            return this.intersects(other);
        }
        return false;
    }
}

var Rect = Game.Rect;

Game.lerp = function(value, minA, maxA, minB, maxB) {
    var rangeA = maxA - minA;
    var rangeB = maxB - minB;
    return (value - minA) / rangeA * rangeB + minB;
};

Game.plerp = function(point, rectA, rectB) {
    return new Point(Game.lerp(point.x, rectA.left(), rectA.right(), rectB.left(), rectB.right()),
                     Game.lerp(point.y, rectA.top(), rectA.bottom(), rectB.top(), rectB.bottom()));
};

Game.canvasPointToWorld = function(point) {
    // canvas.width/height is always the same, whatever it's set to in the html
    // canvas.clientWidth/clientHeight is the currently displayed width and height
    var canvasRect = new Rect(0, 0, Game.canvas.clientWidth, Game.canvas.clientHeight);
    var worldRect = new Rect(0, 0, Game.canvas.width, Game.canvas.height);
    return Game.plerp(point, canvasRect, worldRect);
};

Game.normalPointToWorld = function(point) {
    var worldRect = new Rect(0, 0, Game.canvas.width, Game.canvas.height);
    return Game.plerp(point, new Rect(0, 0, 1, 1), worldRect);
};