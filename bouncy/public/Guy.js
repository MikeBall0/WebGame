var Game = Game || {};

Game.Guy = function() {
    Game.load.image("guy", "images/guy.png");
    this.position = new Point();
    this.velocity = new Point();
    this.bounds = new Rect(-25, -50, 50, 50);
    this.horizontalAcceleration = 1;
    this.started = false;
    this.dead = false;
    this.acceleration = 0;
};

Game.Guy.MAX_X_SPEED = 200;

Game.Guy.prototype = {
    reset: function() {
        this.started = false;
        this.dead = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
    },
    draw: function(ctx) {
        var guyImg = Game.loaded.image["guy"];
        ctx.drawImage(guyImg, this.position.x - guyImg.width / 2, this.position.y + this.bounds.top() / 2 - guyImg.height / 2);
    },
    update: function(dt) {
        if (Game.isKeyDown[Game.RIGHT] || Game.isKeyDown[Game.LEFT]) {
            this.started = true;
        }
        if (this.dead || !this.started) return; // don't update if pepsi
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
            for (var block of world.blocks) {
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
        for (var item of world.items) {
            if (item instanceof Game.Flagpole) {
                if (!world.worldComplete && item.hitTest(guyBoundingBox)) {
                    world.worldComplete = true;
                    item.raise();
                }
            }
        }
    }
};