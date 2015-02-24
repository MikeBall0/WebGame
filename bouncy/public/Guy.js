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
        ctx.drawImage(Game.loaded.image["guy"], this.position.x + this.bounds.x, this.position.y + this.bounds.y);
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
        // newVelocity tracks velocity changes due to bounces
        var newVelocity = this.velocity.copy();
        // update position
        var dx = this.velocity.x * dt;
        var dy = this.velocity.y * dt;
        // naively move the player horizontally, move horizontally first to be more forgiving with getting onto ledges
        var nx = this.position.x + dx;
        if (nx + this.bounds.left() <= Game.World.LEFT || nx + this.bounds.right() >= Game.World.RIGHT) {
            newVelocity.x *= -world.decayPercent;
            // reflect what's left of the horizontal velocity, adjusted
            if (nx + this.bounds.left() <= Game.World.LEFT) {
                nx = Game.World.LEFT + (nx + this.bounds.left() - Game.World.LEFT) * newVelocity.x / this.velocity.x - this.bounds.left();
            } else if (nx + this.bounds.right() >= Game.World.RIGHT) {
                nx = Game.World.RIGHT + (nx + this.bounds.right() - Game.World.RIGHT) * newVelocity.x / this.velocity.x - this.bounds.right();
            }
        }
        // TODO: compare collisions against blocks
        var ny = this.position.y + dy;
        // deal with vertical collisions to be a 
        if (ny >= world.ground) {
            newVelocity.y = Math.max(0, this.velocity.y - world.decayAbsolute);
            newVelocity.y *= -world.decayPercent;
            // reflect what was left of the vertical velocity, adjusted
            ny = world.ground + (ny - world.ground) * newVelocity.y / this.velocity.y;
            if (newVelocity.y == 0) {
                this.dead = true;
            }
        }
        // TODO: compare collisions against blocks
        this.position.x = nx;
        this.position.y = ny;
        this.velocity = newVelocity;
        // console.log(this.position);
    }
};