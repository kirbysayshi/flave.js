if(typeof(Flave) === "undefined") Flave = {};

// Implements a Ray, which is a beam that
// can be blocked (or reflected?) by objects
Flave.Ray = function(){
	
	// Start points:
	this.sx, this.sy;
	// End points:
	this.ex, this.ey;
	// The beam's Direction:
	this.Direction = 0;
	// The beam's Range:
	this.Range;
	// The currently projected beam's range:
	this.CurRange;
	// The beam's color:
	this.Color = [255,0,0,1];
	// The ray's caster It can be a particle in which the ray
	// will remain fixed (see below)
	this.Caster = null;
	// Wheter to update the starting and ending points to match caster
	// movements:
	this.fixOnCaster = false;
	
	// Returns the last hitten object:
	this.lastHit = null;
	
	// User defined data
	this.userDef = {};
	
}

// Updates the beam stream
// @param startX The X origin of the beam
// @param startY The Y origin of the beam
// @param dir The beam's direction
// @param range The beams's range
Flave.Ray.prototype.updateBeam = function(startX, startY, dir, range){
	this.sx = startX;
	this.sy = startY;
	
	this.Direction = dir;
	
	this.CurRange = this.Range = range;
	
	// Calculate end points:
	this.ex = this.sx + Math.cos(this.Direction * (Math.PI / 180)) * this.Range;
	this.ey = this.sy + Math.sin(this.Direction * (Math.PI / 180)) * this.Range;
	
	this.lastHit = null;
}

// redraws the beam:
Flave.Ray.prototype.redraw = function(ctx){
	ctx.strokeStyle = "rgba("
		+this.color[0]+","
		+this.color[1]+","
		+this.color[2]+","
		+this.color[3]+")";
	ctx.fillStyle = "rgba("
		+this.color[0]+","
		+this.color[1]+","
		+this.color[2]+","
		+this.color[3]+")";
	ctx.arc(this.ex, this.ey, 2, 0, Math.PI*2, false);
	ctx.fill();
	ctx.moveTo(this.sx, this.sy);
	ctx.lineTo(this.ex, this.ey);
	ctx.stroke();
}

// TODO: Optimize this thing!
// Trims the ray into the given range
// @param minX The left X boundary
// @param minY The top Y boundary
// @param maxX The right X boundary
// @param maxY The bottom Y boundary
Flave.Ray.prototype.trim = function(minX, minY, maxX, maxY){
	// Test each line of the boundary:
	var res = CollisionResolver.checkLinesP(this.sx, this.sy, this.ex, this.ey, minX, minY, maxX, minY);
	if(res[0]){
		this.ex = res[1].x;
		this.ey = res[1].y;
	}
	
	res = CollisionResolver.checkLinesP(this.sx, this.sy, this.ex, this.ey, minX, minY, minX, maxY);
	if(res[0]){
		this.ex = res[1].x;
		this.ey = res[1].y;
	}
	
	res = CollisionResolver.checkLinesP(this.sx, this.sy, this.ex, this.ey, minX, maxY, maxX, maxY);
	if(res[0]){
		this.ex = res[1].x;
		this.ey = res[1].y;
	}
	
	res = CollisionResolver.checkLinesP(this.sx, this.sy, this.ex, this.ey, maxX, minY, maxX, maxY);
	if(res[0]){
		this.ex = res[1].x;
		this.ey = res[1].y;
	}
}