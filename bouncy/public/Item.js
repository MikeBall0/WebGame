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

/* extends Game.Item */
Game.Spike = function() {
    Game.load.image("spike", "images/spike.png");
    Game.Item.call(this);
    this.bounds = new Rect(0, 0, 30, 30);
    this.setOrientation("up");
};

Game.Spike.prototype = Object.create(Game.Item.prototype);
Game.Spike.prototype.setOrientation = function(orientation) {
    this.orientation = orientation;
    switch(orientation) {
        case "up": {
            this.bounds.x = -15;
            this.bounds.y = -30;
            break;
        }
        case "down": {
            this.bounds.x = -15;
            this.bounds.y = 0;
            break;
        }
        case "left": {
            this.bounds.x = -30;
            this.bounds.y = -15;
            break;
        }
        case "right": {
            this.bounds.x = 0;
            this.bounds.y = -15;
            break;
        }
        default: {
            throw "Invalid orientation " + orientation;
        }
    }
};
Game.Spike.prototype.hitTest = function(other) {
    // broadphase
    if (!Game.Item.prototype.hitTest.call(this, other)) {
        return false;
    }
    // copying the python implementation for triangle hit test
    // test if point p lies in triangle abc
    function pointInTriangle(a, b, c, p) {
        var v0 = new Point(c.x - a.x, c.y - a.y);
        var v1 = new Point(b.x - a.x, b.y - a.y);
        var v2 = new Point(p.x - a.x, p.y - a.y);
        function cross(u, v) {
            return u.x*v.y - u.y*v.x;
        };
        var u = cross(v2, v0);
        var v = cross(v1, v2);
        var d = cross(v1, v0);
        if (d < 0) {
            u = -u;
            v = -v;
            d = -d;
        }
        return u >= 0 && v >= 0 && (u + v) <= d;
    };
    // test if line (p1, p2) intersects with line (p3, p4)
    function lineIntersect(p1, p2, p3, p4) {
        var d = (p4.y-p3.y) * (p2.x-p1.x) - (p4.x-p3.x)*(p2.y-p1.y);
        var u = (p4.x-p3.x) * (p1.y-p3.y) - (p4.y-p3.y)*(p1.x-p3.x);
        var v = (p2.x-p1.x) * (p1.y-p3.y) - (p2.y-p1.y)*(p1.x-p3.x);
        if (d < 0) {
            u = -u;
            v = -v;
            d = -d;
        }
        return 0 <= u && u <= d && 0 <= v && v <= d;
    };
    var a;
    var b;
    var c;
    if (this.orientation === "up" || this.orientation === "down") {
        a = new Point(this.x + this.bounds.left(), this.y);
        b = new Point(this.x + this.bounds.right(), this.y);
        if (this.orientation === "up") {
            c = new Point(this.x, this.y + this.bounds.top());
        } else {
            c = new Point(this.x, this.y + this.bounds.bottom());
        }
    } else if (this.orientation === "left" || this.orientation === "right") {
        a = new Point(this.x, this.y + this.bounds.top());
        b = new Point(this.x, this.y + this.bounds.bottom());
        if (this.orientation === "left") {
            c = new Point(this.x + this.bounds.left(), this.y);
        } else {
            c = new Point(this.x + this.bounds.right(), this.y);
        }
    }
    // the other box's vertices
    var ba = new Point(other.left(), other.top());
    var bb = new Point(other.right(), other.top());
    var bc = new Point(other.right(), other.bottom());
    var bd = new Point(other.left(), other.bottom());

    // test for a vertext being in either shape,
    // then test for intersections between their lines
    // short circuit, for the love of god!
    return other.contains(a) ||
           other.contains(b) ||
           other.contains(c) ||
           pointInTriangle(a, b, c, ba) ||
           pointInTriangle(a, b, c, bb) ||
           pointInTriangle(a, b, c, bc) ||
           pointInTriangle(a, b, c, bd) ||
           lineIntersect(a, b, ba, bb) ||
           lineIntersect(a, b, bb, bc) ||
           lineIntersect(a, b, bc, bd) ||
           lineIntersect(a, b, bd, ba) ||
           lineIntersect(b, c, ba, bb) ||
           lineIntersect(b, c, bb, bc) ||
           lineIntersect(b, c, bc, bd) ||
           lineIntersect(b, c, bd, ba) ||
           lineIntersect(c, a, ba, bb) ||
           lineIntersect(c, a, bb, bc) ||
           lineIntersect(c, a, bc, bd) ||
           lineIntersect(c, a, bd, ba)
};
Game.Spike.prototype.draw = function(ctx) {
    var rotation = 0;
    switch(this.orientation) {
        case "up": {
            rotation = 0;
            break;
        }
        case "down": {
            rotation = Math.PI;
            break;
        }
        case "left": {
            rotation = 3 * Math.PI / 2;
            break;
        }
        case "right": {
            rotation = Math.PI / 2;
            break;
        }
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(rotation);
    var spikeImg = Game.loaded.image["spike"];
    ctx.drawImage(spikeImg, -spikeImg.width / 2, -spikeImg.height);
    ctx.restore();
};

/* extends Spike */
Game.EvilSpike = function() {
    Game.Spike.call(this);
    this.visibleDistance = 150;
};

Game.EvilSpike.prototype = Object.create(Game.Spike.prototype);
Game.EvilSpike.prototype.draw = function(ctx) {
    var dPoint = new Point(this.x, this.y).minus(Game.current.guy.centerPoint());
    var alpha = 1 - Math.max(0, Math.min(1, (dPoint.length() - 50) / (this.visibleDistance - 50)));
    if (alpha == 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    Game.Spike.prototype.draw.call(this, ctx);
    ctx.restore();
};