if(typeof(Flave) === "undefined") Flave = {};

// World class. This is the root of the engine
// and this guy here runs the simulation for you!
Flave.World = function(){
	
	// Really, not used yet.
	this.timeStep = 1.0/50.0;
	
	// Ammount of iterations for constraint solver
	this.consIterations = 2;
	
	// Ammount of iterations for the collision solver
	this.iterations = 2;
	
	// Grid file, the broad-phase that the engine uses
	this.grid = new Grid();
	
	// Whether the engine can be interacted with (drag particles
	// around, etc)
	this.interactible = true;
	
	// Array of partices, constraints, polygons and raycasters
	this.parts = [];
	this.cons  = [];
	this.polys = [];
	this.rays  = [];
	
	// Default particle size, used when creating particles:
	this.defPartSize = 10;
	
	// Gravity speed
	this.grav = 0.1;
	
	// Clipping bounds used to keep elements inside. Any element
	// exiting the boundaries is quickly sent back inside
	this.clipBounds;
	// Whether to draw the boundaries as a outlined rectangle
	// on the .Draw() function
	this.drawBounds = false;
	
	// Offset to which particles will be add. Keep this as
	// (0,0), just in case
	this.offset = vec3.create([0,0,0]);
	
	// If the engine is active. If not, no iterations are given
	this.active = true;
	
	//grid.MCMov = new Sprite();
	//addChild(grid.MCMov);
}