if(typeof(Flave) === "undefined") Flave = {};

// Allows support for small broad-phase collision
// detection/resolving
Flave.Grid = function(){
	
	// The grid itself:
	this.grid = [];
	
	// Keep track of collision pairs (doesn't work, right now):
	this.colls = [[null],[null]];
	
	// The grid resolution (The larger, the greated the
	// ammount of cells. Can somewhat speed things up a
	// bit, but might slow down if incorrectly used).
	this.resolution = 0;
	
	// The grid subdivision
	this.subdiv = 0;
	
	this.drawGrid = false;
	
	this.MCMov = {}; // supposed to be a sprite
	
	this.tolerance = parseFloat("1.0E-8f");
	
	this.setGrid(10);
}

// Starts the broad phase grid to a new clear grid
// @param subdivision The grid subdivisions
Flave.Grid.prototype.setGrid = function(subdivision){
	// ALWAYS assume the simulation is 1000-sized.
	this.resolution = Math.ceil(550/subdivision);
	this.subdiv = subdivision;
	
	this.grid = new Array(subdivision);
	this.colls = [[null],[null]]; // WTF?!
	
	for (var i = 0; i < subdivision; i++) {
		grid[i] = [];
		for(var j = 0; j < subdivision; j++){
			grid[i][j] = [];
		}
	}
}

// Resets the broad phase grid to a new clear grid
// @param subdivision The grid subdivisions
Flave.Grid.prototype.resetGrid = function(subdivision){
	this.resolution = Math.ceil(550/subdivision);
	this.subdiv = subdivision;
	
	//grid = new Array(subdivision);
	this.colls = [[null],[null]];
	
	for(var i = 0; i < subdivision; i++){
		for(var j = 0; j < subdivision; j++){
			grid[i][j] = [];
		}
	}
}

// Adds a new particle to the broad phase collision checking
// @param part the particle to be added
Flave.Grid.prototype.addParticle = function(part){
	var x = this.toGrid(Math.floor(part.X), this.resolution);
	var y = this.toGrid(Math.floor(part.Y), this.resolution);
	var l = this.toGrid(Math.floor(part.X-part.rad*2), this.resolution);
	var r = this.toGrid(Math.floor(part.X+part.rad*2), this.resolution);
	var t = this.toGrid(Math.floor(part.Y-part.rad*2), this.resolution);
	var b = this.toGrid(Math.floor(part.Y+part.rad*2), this.resolution);
	
	// Check for the particle range:
	if(this.ior([x, y])) return;
	
	// Push it:
	this.grid[x / this.resolution][y / this.resolution].push(part);
	
	// Push also the extremities:
	// Now it ckecks the 8, instead of only 4:
	if(x/this.resolution != l/this.resolution && !this.ior(l)) this.grid[l/this.resolution][y/this.resolution].push(part);
	if(x/this.resolution != r/this.resolution && !this.ior(r)) this.grid[r/this.resolution][y/this.resolution].push(part);
	if(y/this.resolution != t/this.resolution && !this.ior(t)) this.grid[x/this.resolution][t/this.resolution].push(part);
	if(y/this.resolution != b/this.resolution && !this.ior(b)) this.grid[x/this.resolution][b/this.resolution].push(part);
	
	
	/*if(x/resolution != l/resolution && !ior(l)
	&& y/resolution != t/resolution && !ior(t)) grid[l/resolution][t/resolution].push(part);
	
	if(x/resolution != l/resolution && !ior(l)
	&& y/resolution != b/resolution && !ior(b)) grid[l/resolution][b/resolution].push(part);
	
	if(x/resolution != r/resolution && !ior(r)
	&& y/resolution != t/resolution && !ior(t)) grid[r/resolution][t/resolution].push(part);
	
	if(x/resolution != r/resolution && !ior(r)
	&& y/resolution != b/resolution && !ior(b)) grid[r/resolution][b/resolution].push(part);*/
}

// Adds a constraint to the broad phase collision checking
// @param c the contraint to add to the broad phase
Flave.Grid.prototype.addConstraint = function(c){
	var vx, vy, incx, incy;
	
	var gridA = resolution;
	
	var bax = c.p1.X / gridA;
	var bay = c.p1.Y / gridA;
	var bbx = c.p2.X / gridA;
	var bby = c.p2.Y / gridA;
	
	if(bax < bbx) {
		var tx = bax;
		bax = bbx;
		bbx = tx;
		
		var ty = bay;
		bay = bby;
		bby = ty;
	}
	
	vx = bbx - bax;
	vy = bby - bay;
	
	var scale = 1;
	
	incx = ((vx < 0 ? -vx : vx) < this.tolerance) ? 1.0 / this.tolerance : 1.0 / (vx < 0 ? -vx : vx);
	incy = ((vy < 0 ? -vy : vy) < this.tolerance) ? 1.0 / this.tolerance : 1.0 / (vy < 0 ? -vy : vy);
	
	incx *= scale;
	incy *= scale;
	
	var x = Math.floor(bax);
	var y = Math.floor(bay);
	
	var dx = (vx < 0.0) ? -1 : (vx > 0.0) ? 1 : 0;
	var dy = (vy < 0.0) ? -1 : (vy > 0.0) ? 1 : 0;
	
	dx *= scale;
	dy *= scale;
	
	var accumx = (vx < 0.0) ? (bax - x) * incx : ((x+1*scale) - bay) * incx;
	var accumy = (vy < 0.0) ? (bay - y) * incy : ((y+1*scale) - bay) * incy;
	
	accumx *= scale;
	accumy *= scale;
	
	var t = 0.0;
	
	while (t <= 1.0)
	{
		if(!this.ior(x) && !this.ior(y)) {
			if(this.grid[x] != undefined && this.grid[x][y] != undefined 
			&& this.grid[x][y].indexOf(c) == -1)
				this.grid[x][y].push(c);
		}
		
		if(accumx < accumy)
		{
			t	 	= accumx;
			accumx += incx;
			x	   += dx;
		}
		else
		{
			t		= accumy;
			accumy += incy;
			y	   += dy;
		}
	}
}

// Adds a ray to the broad phase collision checking
// @param c the ray to add to the broad phase
// Yep, this is a shame copy of the addConstraint() function
Flave.Grid.prototype.addRay = function(c){
	var vx, vy, incx, incy;
	
	var gridA = resolution;
	
	var bax = c.p1.X / gridA;
	var bay = c.p1.Y / gridA;
	var bbx = c.p2.X / gridA;
	var bby = c.p2.Y / gridA;
	
	if(bax < bbx) {
		var tx = bax;
		bax = bbx;
		bbx = tx;
		
		var ty = bay;
		bay = bby;
		bby = ty;
	}
	
	vx = bbx - bax;
	vy = bby - bay;
	
	var scale = 1;
	
	incx = ((vx < 0 ? -vx : vx) < this.tolerance) ? 1.0 / this.tolerance : 1.0 / (vx < 0 ? -vx : vx);
	incy = ((vy < 0 ? -vy : vy) < this.tolerance) ? 1.0 / this.tolerance : 1.0 / (vy < 0 ? -vy : vy);
	
	incx *= scale;
	incy *= scale;
	
	var x = Math.floor(bax);
	var y = Math.floor(bay);
	
	var dx = (vx < 0.0) ? -1 : (vx > 0.0) ? 1 : 0;
	var dy = (vy < 0.0) ? -1 : (vy > 0.0) ? 1 : 0;
	
	dx *= scale;
	dy *= scale;
	
	var accumx = (vx < 0.0) ? (bax - x) * incx : ((x+1*scale) - bay) * incx;
	var accumy = (vy < 0.0) ? (bay - y) * incy : ((y+1*scale) - bay) * incy;
	
	accumx *= scale;
	accumy *= scale;
	
	var t = 0.0;
	
	while (t <= 1.0)
	{
		if(!this.ior(x) && !this.ior(y)) {
			if(this.grid[x] != undefined && this.grid[x][y] != undefined 
			&& this.grid[x][y].indexOf(c) == -1 && this.grid[x][y].length > 0)
				this.grid[x][y].push(c);
		}
		
		if(accumx < accumy)
		{
			t	 	= accumx;
			accumx += incx;
			x	   += dx;
		}
		else
		{
			t		= accumy;
			accumy += incy;
			y	   += dy;
		}
	}
}

Flave.Grid.prototype.testRay = function(c){
	var vx, vy, incx, incy;
	
	var gridA = resolution;
	
	var bax = c.p1.X / gridA;
	var bay = c.p1.Y / gridA;
	var bbx = c.p2.X / gridA;
	var bby = c.p2.Y / gridA;
	
	if(bax < bbx) {
		var tx = bax;
		bax = bbx;
		bbx = tx;
		
		var ty = bay;
		bay = bby;
		bby = ty;
	}
	
	vx = bbx - bax;
	vy = bby - bay;
	
	var scale = 1;
	
	incx = ((vx < 0 ? -vx : vx) < this.tolerance) ? 1.0 / this.tolerance : 1.0 / (vx < 0 ? -vx : vx);
	incy = ((vy < 0 ? -vy : vy) < this.tolerance) ? 1.0 / this.tolerance : 1.0 / (vy < 0 ? -vy : vy);
	
	incx *= scale;
	incy *= scale;
	
	var x = Math.floor(bax);
	var y = Math.floor(bay);
	
	var dx = (vx < 0.0) ? -1 : (vx > 0.0) ? 1 : 0;
	var dy = (vy < 0.0) ? -1 : (vy > 0.0) ? 1 : 0;
	
	dx *= scale;
	dy *= scale;
	
	var accumx = (vx < 0.0) ? (bax - x) * incx : ((x+1*scale) - bay) * incx;
	var accumy = (vy < 0.0) ? (bay - y) * incy : ((y+1*scale) - bay) * incy;
	
	accumx *= scale;
	accumy *= scale;
	
	var t = 0.0;
	
	var l, i, obj, result, ddx, ddy, dis;
	
	var resBy1 = 1 / this.resolution, hit = false;
	
	while (t <= 1.0)
	{
		if (!this.ior(x) && !this.ior(y) && this.grid[x] != undefined && this.grid[x][y] != undefined) {
			l = this.grid[x][y].length;
			
			for (i = 0; i < l; i++) {
				obj = this.grid[x][y][i];
				
				if (obj instanceof Particle) {
					result = CollisionResolver.rayOnParticle(obj, c);
					
					if (result[0]) {
						// Test if the hit was inside this cell:
						if (Math.floor(result[1].X * resBy1) == x && Math.floor(result[1].Y * resBy1) == y) {
							// Test to see if this collision is closer to the casting point:
							ddx = result[1].X - c.sx;
							ddy = result[1].Y - c.sy;
							
							dis = Math.sqrt(ddx * ddx + ddy * ddy);
							
							if (dis < c.CurRange) {
								c.ex = result[1].x;
								c.ey = result[1].y;
								c.lastHit = obj;
								c.CurRange = dis;
								hit = true;
							}
						}
					}
				}
				
				if (obj instanceof Constraint) {
					result = CollisionResolver.rayOnConstraint(obj, c);
					
					if (result[0]) {
						//FlashConnect.atrace(result);
						// Test if the hit was inside this cell:
						//FlashConnect.atrace(x, y, result[1].x, result[1].y, int(result[1].x / resolution), int(result[1].y / resolution));
						if (true){//int(result[1].X / resolution) == x && int(result[1].Y / resolution) == y) {
							// Test to see if this collision is closer to the casting point:
							ddx = result[1].X - c.sx;
							ddy = result[1].Y - c.sy;
							
							dis = Math.sqrt(ddx * ddx + ddy * ddy);
							
							if (dis < c.CurRange) {
								c.ex = result[1].X;
								c.ey = result[1].Y;
								c.lastHit = obj;
								c.CurRange = dis;
								hit = true;
							}
						}
					}
				}
				
				// Did it hit something? Then finish!
				// if (hit) return;
			}
		}
		
		if(accumx < accumy)
		{
			t	 	= accumx;
			accumx += incx;
			x	   += dx;
		}
		else
		{
			t		= accumy;
			accumy += incy;
			y	   += dy;
		}
	}
}

// Returns if a value is out of the Broad-Phase range
// @param x the value to check the range validity
Flave.Grid.prototype.ior = function(x){
	if(x instanceof Number){
		if(x / this.resolution > this.grid.length - 1) return true;
		if(x / this.resolution < 0) return true;
	}if(x instanceof Array){
		for(var i = 0; i < x.length; i++){
			if(this.ior(x[i])) return true;
		}
	}
	return false;
}

// Resolves the broad-phase collisions
Flave.Grid.prototype.resolveBroadPhase = function(){
	if(this.drawGrid){
		// MCMov.graphics.lineStyle(1, 0x000000, 1.0);
	}
	
	for(var x = 0; x < this.grid.length; x++){
		for(var y = 0; y < this.grid[x].length; y++){
			var a, b;
			for(var i = 0; i < this.grid[x][y].length; i++){
				if(this.grid[x][y][i] instanceof Ray) break;
				
				for(var j = i + 1; j < this.grid[x][y].length; j++){
					a = this.grid[x][y][i];
					b = this.grid[x][y][j];
					
					// Particle-Particle
					if(a instanceof Particle && b instanceof Particle){
						CollisionResolver.resolveParticle(a, b);
					}
					
					// Particle-Constraint
					if(a instanceof Particle && b instanceof Constraint){
						CollisionResolver.resolveCircleConstraint(a, b);
					}
					
					// NO MORE RAYS ON THE BROAD-PHASE GRID
					
					// Particle-Ray
					/*if(a is Particle &&
					   b is Ray){
						CollisionResolver.rayOnParticle(a, b);
					}
					
					// Constraitn-Ray
					if(a is Constraint &&
					   b is Ray){
						CollisionResolver.rayOnConstraint(a, b);
					}*/
				}
			}
			
			//if(drawGrid){
			//	if(this.grid[x][y].length == 0) {
			//		MCMov.graphics.lineStyle(1, 0x000000, 1.0);
			//	} else MCMov.graphics.lineStyle(1, 0xFF0000, 1.0);
			//	
			//	MCMov.graphics.moveTo(x * resolution+1, y * resolution+1);
			//	MCMov.graphics.lineTo(x * (resolution)+resolution-1, y * resolution+1);
			//	MCMov.graphics.lineTo(x * (resolution)+resolution-1, y * (resolution)+resolution-1);
			//	MCMov.graphics.lineTo(x * resolution+1, y * (resolution)+resolution-1);
			//	MCMov.graphics.lineTo(x * resolution+1, y * resolution+1);
			//}
		}
	}
}

// Clamps a value into a grid with range
// seted by te user
Flave.Grid.prototype.toGrid = function(gx, grid) {
	return Math.floor(gx/grid)*grid;
}

// Returns the number of particles found on the cell given by
// the X and Y coordinates
Flave.Grid.prototype.partsOnCell = function(cellX, cellY) {
	var parts = 0;
	
	for(var i = 0; i < this.grid[cellX][cellY].length; i++){
		if(this.grid[cellX][cellY][i] instanceof Particle){
			parts++;
		}
	}
	
	return parts;
}

// Returns the number of constraints found on the cell given by
// the X and Y coordinates
Flave.Grid.prototype.consOnCell = function(cellX, cellY) {
	var cons = 0;
	
	for(var i = 0; i < this.grid[cellX][cellY].length; i++){
		if(this.grid[cellX][cellY][i] instanceof Constraint){
			cons++;
		}
	}
	
	return cons;
}