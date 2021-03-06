'use strict'

var Game = Game || {};

Game.Guy = function() {
    Game.load.image("guy", "images/guy.png");
    Game.load.image("explodedBit", "images/explodedGuyBit.png"); // give the explode bits a hand with loading
    this.position = new Point();
    this.velocity = new Point();
    this.bounds = new Rect(-25, -50, 50, 50);
    this.horizontalAcceleration = 1;
    this.started = false;
    this.dead = false;
    this.exploded = false;
    this.explodedBits = [];
    this.acceleration = 0;
};

Game.Guy.MAX_X_SPEED = 200;

Game.Guy.prototype = {
    reset: function() {
        this.started = false;
        this.dead = false;
        this.exploded = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
    },
    draw: function(ctx) {
        if (!this.exploded) {
            var guyImg = Game.loaded.image["guy"];
            ctx.drawImage(guyImg, this.position.x - guyImg.width / 2, this.position.y + this.bounds.top() / 2 - guyImg.height / 2);
        } else {
            for (var i = 0; i < this.explodedBits.length; i ++) {
                var bit = this.explodedBits[i];
                bit.draw(ctx);
            }
        }
    },
    update: function(dt) {
        if (Game.isKeyDown[Game.RIGHT] || Game.isKeyDown[Game.LEFT]) {
            this.started = true;
        }
        if (!this.started) return;
        if (this.dead) {
            if (this.exploded) {
                for (var i = 0; i < this.explodedBits.length; i ++) {
                    var bit = this.explodedBits[i];
                    bit.update(dt);
                }
            }
            return; // don't update if pepsi
        };
        var world = Game.current.world;

        // update velocity
        this.velocity.y += world.gravity * dt;
        if (Game.isKeyDown[Game.RIGHT] && !Game.isKeyDown[Game.LEFT]) {
            this.velocity.x += this.acceleration * dt;
        } else if (Game.isKeyDown[Game.LEFT] && !Game.isKeyDown[Game.RIGHT]) {
            this.velocity.x -= this.acceleration * dt;
        } else {
            this.velocity.x *= 0.95;
        }
        if (Math.abs(this.velocity.x) > Game.Guy.MAX_X_SPEED) {
            if (this.velocity.x > 0) {
                this.velocity.x = Math.max(Game.Guy.MAX_X_SPEED, this.velocity.x * 0.8);
            } else {
                this.velocity.x = Math.min(-Game.Guy.MAX_X_SPEED, this.velocity.x * 0.8);
            }
        }

        while (dt > 0 && !this.dead) {
            var stepVelocity = new Point(this.velocity.x * dt, this.velocity.y * dt);
            var broadphaseBox = this.getBroadphaseBox(stepVelocity);
            var collision = this.getWorldBoundsCollision(stepVelocity);
            for (var i = 0; i < world.blocks.length; i ++) {
                var block = world.blocks[i];
                if (broadphaseBox.hitTest(block)) {
                    var blockColl = this.sweptTest(block, stepVelocity);
                    if (blockColl.at < collision.at) {
                        collision = blockColl;
                    }
                }
            }
            var stepTime = dt * collision.at;
            this.position.x += this.velocity.x * stepTime;
            this.position.y += this.velocity.y * stepTime;
            dt -= stepTime;
            if (collision.at < 1) {
                if (collision.normal.x != 0) {
                    this.reflectXVelocity();
                } else if (collision.normal.y != 0) {
                    this.reflectYVelocity();
                }
            }
        }
        this.interactWithWorldItems();
    },
    reflectXVelocity: function() {
        this.velocity.x *= -Game.current.world.decayPercent;  
    },
    reflectYVelocity: function() {
        if (this.velocity.y < 0) {
            this.velocity.y *= -Game.current.world.decayPercent;
        } else {
            this.velocity.y -= Game.current.world.decayAbsolute;
            this.velocity.y *= -Game.current.world.decayPercent;
            if (this.velocity.y >= 0) {
                this.dead = true;
            }
        }
    },
    left: function() {
        return this.position.x + this.bounds.left();
    },
    right: function() {
        return this.position.x + this.bounds.right();
    },
    top: function() {
        return this.position.y + this.bounds.top();
    },
    bottom: function() {
        return this.position.y + this.bounds.bottom();
    },
    centerPoint: function() {
        return new Point(this.position.x, this.position.y - this.bounds.height / 2);
    },
    getWorldBoundsCollision: function(stepVelocity) {
        var collision = {at: 1, normal: new Point()};
        var leftCollision = (Game.World.LEFT - this.left()) / stepVelocity.x;
        var rightCollision = (Game.World.RIGHT - this.right()) / stepVelocity.x;
        var bottomCollision = (Game.current.world.ground - this.bottom()) / stepVelocity.y;
        if (leftCollision > 0 && leftCollision < collision.at) {
            collision.at = leftCollision;
            collision.normal.x = 1;
        }
        if (rightCollision > 0 && rightCollision < collision.at) {
            collision.at = rightCollision;
            collision.normal.x = -1;
        }
        if (bottomCollision > 0 && bottomCollision < collision.at) {
            collision.at = bottomCollision;
            collision.normal.y = -1;
        }
        return collision;
    },
    getBroadphaseBox: function(stepVelocity) {
        var startBox = new Rect(this.left(), this.top(), this.bounds.width, this.bounds.height);
        var endBox = new Rect(this.left() + stepVelocity.x, this.top() + stepVelocity.y, this.bounds.width, this.bounds.height);
        return startBox.union(endBox);
    },
    sweptTest: function(block, stepVelocity) {
        var invEntry = new Point();
        var invExit = new Point();
        var left = this.left();
        var right = this.right();
        var top = this.top();
        var bottom = this.bottom();
        var v = stepVelocity.copy();
        var collision = {at: 1.0, normal: new Point()};
        // calculate the time of horizontal invEntry and invExit
        if (v.x > 0) {
            invEntry.x = block.x - right;
            invExit.x = block.x + block.width - left;
        } else {
            invEntry.x = block.x + block.width - left;
            invExit.x = block.x - right;
        }
        // calculate the time of vertical invEntry and invExit
        if (v.y > 0) {
            invEntry.y = block.y - bottom;
            invExit.y = block.y + block.height - top;
        } else {
            invEntry.y = block.y + block.height - top;
            invExit.y = block.y - bottom;
        }

        // invert the invEntry and invExit to find the real entry and exit
        var entry = new Point(invEntry.x / v.x, invEntry.y / v.y);
        var exit = new Point(invExit.x / v.x, invExit.y / v.y);

        // entryTime is the latest x/y time, exit time is the earlies
        var entryTime = Math.max(entry.x, entry.y);
        var exitTime = Math.min(exit.x, exit.y);

        // no collision
        if (entryTime > exitTime ||
            (entry.x < 0 && entry.y < 0) ||
            entry.x > 1 || entry.y > 1)
        {
            return collision;
        } else { // there was a collision, figure out where and on what surface
            if (entry.x > entry.y) {
                if (invEntry.x < 0) {
                    collision.normal.x = 1;
                    collision.normal.y = 0;
                } else {
                    collision.normal.x = -1;
                    collision.normal.y = 0;
                }
            } else {
                if (invEntry.y < 0) {
                    collision.normal.x = 0;
                    collision.normal.y = 1;
                } else {
                    collision.normal.x = 0;
                    collision.normal.y = -1;
                }
            }
            collision.at = entryTime;
        }
        return collision;
    },
    interactWithWorldItems: function() {
        var world = Game.current.world;
        var guyBoundingBox = new Rect(this.left(), this.top(), this.bounds.width, this.bounds.height);
        for (var i = 0; i < world.items.length; i ++) {
            var item = world.items[i];
            if (item instanceof Game.Flagpole) {
                if (!world.worldComplete && item.hitTest(guyBoundingBox)) {
                    world.worldComplete = true;
                    item.raise();
                    Game.completeLevel();
                }
            } else if (item instanceof Game.Spike) {
                if (item.hitTest(guyBoundingBox)) {
                    this.explode();
                }
            }
        }
    },
    explode: function() {
        if (this.exploded) return;
        this.dead = true;
        this.exploded = true;
        for (var i = 0; i < 25; i ++) {
            if (this.explodedBits[i] === undefined) {
                this.explodedBits[i] = new Game.Guy.ExplodedBit();
            }
            var bit = this.explodedBits[i];
            var rx = Game.lerp(i % 5, 0, 4, this.bounds.left() + 5, this.bounds.right() - 5);
            var ry = Game.lerp(Math.floor(i / 5), 0, 4, this.bounds.top() + 5, this.bounds.bottom() -5);
            bit.position.x = this.position.x + rx;
            bit.position.y = this.position.y + ry;
            bit.velocity.x = this.velocity.x + rx * Game.lerp(Math.random(), 0, 1, 0.3, 10);
            bit.velocity.y = this.velocity.y + (ry + this.bounds.height / 2) * Game.lerp(Math.random(), 0, 1, 0.3, 10);
            bit.lifetime = Game.lerp(Math.random(), 0, 1, 2, 3);
        }
    }
};

Game.Guy.ExplodedBit = function() {
    Game.load.image("explodedBit", "images/explodedGuyBit.png");
    this.position = new Point();
    this.velocity = new Point();
    this.lifetime = 0;
};

Game.Guy.ExplodedBit.prototype = {
    update: function(dt) {
        if (this.lifetime > 0) {
            this.position.x += this.velocity.x * dt;
            this.position.y += this.velocity.y * dt;
            if (this.position.x > Game.World.RIGHT) {
                this.position.x = Game.World.RIGHT;
                this.velocity.x *= -1;
            } else if (this.position.x < Game.World.LEFT) {
                this.position.x = Game.World.LEFT;
                this.velocity.x *= -1;
            }
            if (this.position.y > Game.current.world.ground) {
                this.position.y = Game.current.world.ground;
                this.velocity.y *= -1;
            }
            if (this.velocity.length() > 10) {
                this.velocity.x *= 1 - Math.min(dt * 3, 1);
                this.velocity.y *= 1 - Math.min(dt * 3, 1);
            }
            this.lifetime -= dt;
        }
    },
    draw: function(ctx) {
        if (this.lifetime > 0) {
            ctx.drawImage(Game.loaded.image["explodedBit"],
                          this.position.x - Game.loaded.image["explodedBit"].width / 2,
                          this.position.y - Game.loaded.image["explodedBit"].height / 2);
        }
    }
};