if(typeof(Flave) === "undefined") Flave = {};

/**
 * Creates a new particle
 *
 * @param  number _x  initial X position
 * @param  number  _y  initial Y position
 * @return  void
 */
Flave.Particle = function(_x, _y){
	//---------------------------------------------------------------------
	// Class Members
	//---------------------------------------------------------------------	
	// Define some vars here:
	this.X      = 0,      // X position
	this.Y      = 0,      // Y position
	this.oldx   = 0,      // Last X position
	this.oldy   = 0,      // Last Y position
	this.rad    = 10,     // Particle radius
	this.mass   = 30,     // Particle mass
	this.fixed  = false,  // If fixed, it won't move
	this.index  = 0;      // Particle index
	
	// X and Y friction:
	this.xfric = 0.9999, this.yfric = 0.9999;
	
	// Cheesiest way to do collision pairing (don't work now):
	this.CollisionPair = [];
	
	// If the particle is currently being drag
	this.drag = false;
	
	// Temp vars
	this.vx = this.X;
	this.vy = this.Y;
	
	// Last connected constraint
	this.lastIndex = 0;
	
	// Constraints that this particle is attached to:
	this.constraints = [];
	
	// Whether this particle collide with other particles
	// and other constraints:
	this.collideWithPart = true
	this.collideWithConstraint = true;
	
	// Whether this particle has been drawn already.
	// If so, no need to redraw every frame
	this.drawn = false;
	
	// User defined data
	this.userDef = {};
	
	//---------------------------------------------------------------------
	// Constructor
	//---------------------------------------------------------------------
	
	oldx = X = _x;
	oldy = Y = _y;
	//this.cacheAsBitmap = true;
	
	// FIXME: can't add event listeners to virtual objects in JS
	//this.addEventListener("mouseDown", this.click, false, 0, true);
}

Flave.Particle.prototype.init = function(){
	// empty...
}

Flave.Particle.prototype.draw = function(ctx){
	if(this.drawn) return;
	if(!this.drawn) return true;
	
	ctx.strokeStyle = "rgba(0," + this.collideWithPart ? 0 : 121,  + ",128, 0)";
	
	if(!fixed)
		ctx.fillStyle = "rgba(238,238,238,"+ (0.5 + this.iMass/2) +")";
	else
		ctx.fillStyle = "rgba(170,170,170,"+ (0.5 + this.iMass/2) +")";
	
	ctx.arc(this.X, this.Y, this.rad, 0, Math.PI*2, false);
	ctx.fill();
	ctx.stroke();
}

Flave.Particle.prototype.cleanGarbage = function(){
	//stage.removeEventListener("mouseMove", move);
	//stage.removeEventListener("mouseUp", up);
	//this.removeEventListener("mouseDown", click);
}

Flave.Particle.prototype.step = function(){
	// Reset collision pair
	this.CollisionPair = [];
	
	// Dragging:
	if(this.drag){
		this.oldx = this.X = ID.IsKeyDown(ID.SHIFT) ? this.toGrid(this.vx, 10) : this.vx;
		this.oldy = this.Y = ID.IsKeyDown(ID.SHIFT) ? this.toGrid(this.vy, 10) : this.vy;
		return;
	}
	
	if(this.fixed) return; // Don't move if fixed!
	
	// Basic verlet procedure:
	var tx = this.X, ty = this.Y;
	
	this.X += (this.X - this.oldx) * this.xfric;
	this.Y += (this.Y - this.oldy) * this.yfric;
	
	this.oldx = tx;
	this.oldy = ty;

}

// Happens when the particle is clicked:
Flave.Particle.prototype.click = function(e){
	
	if(ID.IsKeyDown(ID.SHIFT)){
		this.fixed = !this.fixed;
		return;
	}
	
	this.drag = true;
	// FIXME: this.canvas is undefined
	this.X = this.vx = e.clientX - this.canvas.offsetLeft;
	this.Y = this.vy = e.clientY - this.canvas.offsetTop;
	
	window.addEventListener("mousemove", move, false);
	window.addEventListener("mouseup", up, false);

}

// Happens when the particle is released:
Flave.Particle.prototype.up = function(e){
	this.drag = false;
	window.removeEventListerner("mousemove", move);
}

// Happens when the particle is mouse-moved:
Flave.Particle.prototype.move = function(e){
	if(!this.drag)
		window.removeEventListener("mousemove", move);
	
	this.X = this.vx = e.clientX - this.canvas.offsetLeft;
	this.Y = this.vy = e.clientY - this.canvas.offsetTop;
	
	this.X = ID.IsKeyDown(ID.SHIFT) ? this.toGrid(this.vx, 10) : this.vx;
	this.Y = ID.IsKeyDown(ID.SHIFT) ? this.toGrid(this.vy, 10) : this.vy;
}

// Returns the inverse mass of the particle (read-only)
Flave.Particle.prototype.iMass = function(){
	return 1 / this.mass;
}

// Returns the total velocity of this particle (read-only)
Flave.Particle.prototype.velocity = function(){
	return vec3.create([this.X - this.oldx, this.Y - this.oldY, 0]);
}

// Returns the direction of the particle (read-only)
Flave.Particle.prototype.direction = function(){
	return vec3.direction([this.X, this.Y, 0], [this.oldx, this.oldY, 0]);
}

// Slows down a particle by dividing the speed vectors:
// @param factor The slowdown factor (1: no change 0: complete stop)
Flave.Particle.prototype.slowDown = function(factor){
	if(!factor) factor = 0.5;
	var vx = this.X - this.oldx;
	var vy = this.Y - this.oldy;
	
	this.oldx = this.X - (vx * factor);
	this.oldy = this.Y - (vy * factor);
}

// Accelerates the particle on the givven coordinates:
// @param vx The x acceleration
// @param vy The y acceleration
Flave.Particle.prototype.accelerate = function(vx, vy){
	this.oldx += vx;
	this.oldy += vy;
}

// Gets the next particle connected with a constraint (read-only)
Flave.Particle.prototype.nextConnected = function(){
	return (this.constraints[this.lastIndex].p1 == this ? this.constraints[this.lastIndex].p2 : this.constraints[this.lastIndex].p1);
}

// Snaps a value to a grid
// @param vari Variable to snap
// @param grid Grid to snap variable to
Flave.Particle.prototype.toGrid = function(vari, grid){
	return Math.floor(vari/grid)*grid;
}

// Callback function used to ensure this instance exists
Flave.Particle.prototype.callback = function(){
	//if(parent == null) return false;
	return true;
}