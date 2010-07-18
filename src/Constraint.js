if(typeof(Flave) === "undefined") Flave = {};

/**
 * Creates a new constraint
 *
 * @param  Particle _p1 The first particle defining the constraint
 * @param  Particle _p2 The second particle defining the constraint
 * @param  number _dis -1 The distance between the particles. -1 will cause the distance to be calculated
 * @param  bool collide true Whether or not this constraint is collidable
 * @return  void 
 * @constructor
 */
Flave.Constraint = function( _p1, _p2, _dis, collide ){
	if(!_dis) _dis = -1;
	if(!collide) collide = true;
	
	
	//---------------------------------------------------------------------
	// Define class members
	//---------------------------------------------------------------------
	
	// First particle, second particle, restlen and error:
	this.p1, this.p2, dis, error;
	
	// Whether this constraint is collidable:
	this.collidable = true;
	
	// Stiffness and damping:
	this.stiff = 1; // [0-1]
	this.damp  = 1; // [0-1]
	
	// Rupture tolerance. If the difference between the delta
	// and the rest length is larger than the rupture point,
	// the constraint breaks.
	this.rupturePoint = 0.02 * 1000;
	
	// The delta distance between the particles
	this.diff = 0;
	
	// User defined data
	this.userDef = {};
	
	//---------------------------------------------------------------------
	// Actual constructor
	//---------------------------------------------------------------------
	
	this.p1 = _p1; if(this.p1.constraints.indexOf(this) == -1) this.p1.constraints.push(this);
	this.p2 = _p2; if(this.p2.constraints.indexOf(this) == -1) this.p2.constraints.push(this);
	
	this.dis = _dis == -1 ? Math.sqrt((this.p1.X - this.p2.X)*(this.p1.X - this.p2.X) + (this.p1.Y - this.p2.Y)*(this.p1.Y - this.p2.Y))
					   : _dis;
	
	this.collidable = collide;
}

Flave.Constraint.prototype.resolve = function(){
	if((this.p1.fixed || this.p1.drag) && (this.p2.fixed || this.p2.drag)) return;
	
	var vx = this.p1.X - this.p2.X;
	var vy = this.p1.Y - this.p2.Y;
	
	var vlen = Math.sqrt(vx * vx + vy * vy);
	
	this.diff = (this.dis - vlen) / vlen;
	
	var dx = (vx * this.diff) * this.stiff;
	var dy = (vy * this.diff) * this.stiff;
	
	var mw = 1 / (this.p1.iMass + this.p2.iMass);
	
	if(!this.p1.fixed && !this.p1.drag){
		this.p1.X += dx * (this.p1.iMass * mw) * this.stiff;
		this.p1.Y += dy * (this.p1.iMass * mw) * this.stiff;
	}
	
	if(!this.p2.fixed && !this.p2.drag){
		this.p2.X -= dx * (this.p2.iMass * mw) * this.stiff;
		this.p2.Y -= dy * (this.p2.iMass * mw) * this.stiff;
	}
}

Flave.Constraint.prototype.rupture = function(){
	if((this.diff < 0 ? -this.diff : this.diff) > this.rupturePoint){
		// FIXME: This is broken
		parent['removeConstraint'](this);
	}
}

Flave.Constraint.prototype.draw = function(ctx){
	var rp = this.diff / this.rupturePoint;
	rp = (rp < 0 ? -rp : rp);

	ctx.strokeStyle = "rgba("+(255*rp)+",0,0," + (this.collidable ? 0.5 : 0.2) + ")";
	ctx.moveTo(this.p1.X, this.p1.Y);
	ctx.lineTo(this.p2.X, this.p2.Y);
	ctx.stroke(); // FIXME: doing this separately might be slow
}

Flave.Constraint.prototype.getLen = function(){
	return Math.sqrt((this.p1.X - this.p2.X)*(this.p1.X - this.p2.X) + (this.p1.Y - this.p2.Y)*(this.p1.Y - this.p2.Y));
}