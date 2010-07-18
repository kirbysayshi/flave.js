if(typeof(Flave) === "undefined") Flave = {};

Flave.CollisionResolver = {}
	
// Resolves particle-particle collision
// @param p1 The first particle to resolve
// @param p2 The second particle to resolve
Flave.CollisionResolver.resolveParticle = function(p1, p2) {
	if(p1 == p2  || !p1.collideWithPart || !p2.collideWithPart) return;
	
	var dx, dy, dis;
	
	dx = p1.X - p2.X;
	dy = p1.Y - p2.Y;
	
	dis = Math.sqrt(dx * dx + dy * dy);
	
	// If the distance between both particles is smaller than
	// the sum of both radius....
	if(dis <= p1.rad + p2.rad){
		var pen = ((p1.rad + p2.rad) - dis) * 0.5;
		
		dx /= dis;
		dy /= dis;
		
		if(p1.fixed || p2.fixed)
			pen *= 2;
		
		// var mw:Number = (p1.iMass + p2.iMass), m:Number;
		if(!p1.fixed){
			//m = (p1.iMass / mw);
			p1.X += dx * pen;
			p1.Y += dy * pen;
			
		}
		
		if(!p2.fixed){
			//m = (p2.iMass / mw);
			p2.X -= dx * pen;
			p2.Y -= dy * pen;
		}
	}
}

Flave.CollisionResolver.resolveCircleConstraint = function(p0, c1) {
	// Usind the dot factor, you can easily resolve the penetration between
	// a circle and a line:
	
	// Do not test if particle and constraint are linked:
	if(p0.constraints.indexOf(c1) != -1 || (c1.p1.fixed && c1.p2.fixed && p0.fixed))
		return;
	
	// Declare the variables:
	var ax, ay, bx, by, AdotB, p1, p2, len, px, py;
	
	p1 = c1.p1;
	p2 = c1.p2;
	
	///// First, test trajectory penetrations:
	
	// ...between the old and new position:
	var p1v = vec3.create(p1.X, p1.Y, 0);
	var p2v = vec3.create(p2.X, p2.Y, 0);
	
	var p0v = vec3.create(p0.X, p0.Y, 0);
	var pov = vec3.create(p0.oldx, p0.oldy, 0);
	
	// var v:Vector2, nx:Number, ny:Number, ns:Number;
	var dx, dy, dir, dis,
		pen, perc1, perc2;
	
	// TODO: Apply the force also to the constraint's particles:
	
	// Math.abs is too slow :(
	var dpx = p0.oldx - p0.X;
	dpx = (dpx < 0 ? -dpx : dpx);
	
	var dpy = p0.oldy - p0.Y;
	dpy = (dpy < 0 ? -dpy : dpy);
	
	if((dpx > p0.rad || dpy > p0.rad) && Flave.CollisionResolver.checkLines(p1v, p2v, pov, p0v)[0] && !p0.fixed){
		var v, nx, ny, ns;
		
		//trace(checkLines(p1v, p2v, pov, p0v)[1]);
		// Take the penetration Vector2:
		v = Flave.CollisionResolver.checkLines(p1v, p2v, pov, p0v)[1];
		
		// Calculate the normal of the speed:
		nx = p0.X - p0.oldx;
		ny = p0.Y - p0.oldy;
		ns = Math.sqrt(nx * nx + ny * ny);
		nx /= ns;
		ny /= ns;
		
		// Now apply the Vector2 with the offset:
		var mid = vec3.create((p0.X + v.x) * 0.5, (p0.Y + v.y) * 0.5, 0);
		p0.X = (v.x - nx*2);
		p0.Y = (v.y - ny*2);
		p0.slowDown();
	}
	
	///// Everything's fine, now test and resolve collisions:
	
	ax = p1.X - p2.X;
	ay = p1.Y - p2.Y;
	len = Math.sqrt(ax * ax + ay * ay);
	ax /= len;
	ay /= len;

	bx = p1.X - p0.X;
	by = p1.Y - p0.Y;
	
	var ac = ax * bx + ay * by;
	
	AdotB = 0 > ac ? 0 : ac;
	
	ac = Flave.CollisionResolver.distance(p1.X, p1.Y,p2.X, p2.Y);
	
	AdotB = AdotB < ac ? AdotB : ac;
	
	px = (ax * AdotB);
	py = (ay * AdotB);
	
	// Test and resolve the collision:
	if (Flave.CollisionResolver.distance(p0.X, p0.Y, p1.X - px, p1.Y - py) < p0.rad) {
		///// Penetration Calcs:
		dx = (p1.X - px) - p0.X;
		dy = (p1.Y - py) - p0.Y;
		dis = Math.sqrt (dx * dx + dy * dy);
		if(dis == 0) dx = dis = 1; // Delta cannot be 0!
		dx /= dis;
		dy /= dis;
		pen = (p0.rad - dis);
		
		///// Particle Calcs:
		if(!p0.fixed){					
			if(c1.p1.fixed && c1.p2.fixed)
				pen *= 1;
			
			p0.X -= dx * pen;
			p0.Y -= dy * pen;
		} else pen *= 4;
		
		
		
		///// Constraint Calcs:
		
		// Calculate the percentage offset [0-1]:
		perc2 = AdotB / c1.getLen();
		perc1 = 1-perc2;
		
		// Apply it:
		if(!c1.p1.fixed){
			if(c1.p2.fixed) perc1 = 1;
			c1.p1.X += dx * (pen * 0.5 * perc1);
			c1.p1.Y += dy * (pen * 0.5 * perc1);
		} else perc2 = 1;
		
		if(!c1.p2.fixed){
			c1.p2.X += dx * (pen * 0.5 * perc2);
			c1.p2.Y += dy * (pen * 0.5 * perc2);
		}
	}
}

Flave.CollisionResolver.resolveConstraintConstraint = function(line1, line2) {
	// not yet
}

// Check if two lines intersect (code taken from http://www.gamedev.pastebin.com/f49a054c1)
// Returns if they collide, the intersection point and the distance along each line
Flave.CollisionResolver.checkLines = function(ptA, ptB, ptC, ptD) {
	var r, s, d;
	
	var x1 = ptA.x, y1 = ptA.y,
		x2 = ptB.x, y2 = ptB.y,
		x3 = ptC.x, y3 = ptC.y,
		x4 = ptD.x, y4 = ptD.y;
	
    //Make sure the lines aren't parallel
    if ((y2 - y1) / (x2 - x1) != (y4 - y3) / (x4 - x3))
    {
        d = (((x2 - x1) * (y4 - y3)) - (y2 - y1) * (x4 - x3));
        if (d != 0)
        {
            r = (((y1 - y3) * (x4 - x3)) - (x1 - x3) * (y4 - y3)) / d;
            s = (((y1 - y3) * (x2 - x1)) - (x1 - x3) * (y2 - y1)) / d;
            if (r >= 0 && r <= 1)
            {
				if (s >= 0 && s <= 1)
                {
                    // result.InsertSolution(x1 + r * (x2 - x1), y1 + r * (y2 - y1));
					return [true, vec3.create(x1 + r * (x2 - x1), y1 + r * (y2 - y1), 0), r, s]; // penetrated, position, scale along first line, scale along second line
                }
				else return [false];
            }
			else return [false];
        }
    }
	
	return [false];
}

// Check if two lines intersect (code taken from http://www.gamedev.pastebin.com/f49a054c1)
// Returns if they collide, the intersection point and the distance along each line
Flave.CollisionResolver.checkLinesP = function(x1, y1, x2, y2, x3, y3, x4, y4){
	var ptA = vec3.create(x1, y1, 0);
	var ptB = vec3.create(x2, y2, 0);
	var ptC = vec3.create(x3, y3, 0);
	var ptD = vec3.create(x4, y4, 0);
	
    return Flave.CollisionResolver.checkLines(ptA, ptB, ptC, ptD);
}

// TODO: When the ray is shortened by a collision, remove it from
//       the cells it isn't present anymore
// Checks for collision between a ray and a particle
// @param p0 The particle to check
// @param ray The ray to check
Flave.CollisionResolver.rayOnParticle = function(p0, ray){
	// Do not test if line is the ray's caster:
	if(ray.Caster == p0)
		return [false];
	
	var oex = ray.ex;
	var oey = ray.ey;
	var olh = ray.lastHit;
	
	var x1_ = ray.sx, y1_ = ray.sy, x2_ = ray.ex, y2_ = ray.ey,
		x3_ = p0.X, y3_ = p0.Y, r3_ = p0.rad;
	
	var v1, v2;
    //Vector2 from point 1 to point 2
    v1 = vec3.create(x2_ - x1_, y2_ - y1_, 0);
    //Vector2 from point 1 to the circle's center
    v2 = vec3.create(x3_ - x1_, y3_ - y1_, 0);

   	var dot = v1.X * v2.X + v1.Y * v2.Y;
    var proj1 = vec3.create(((dot / (vec3.length(v1))) * v1.X), ((dot / (vec3.length(v1))) * v1.Y), 0);

    var midpt = vec3.create(x1_ + proj1.X, y1_ + proj1.Y, 0);
    var distToCenter = (midpt.X - x3_) * (midpt.X - x3_) + (midpt.Y - y3_) * (midpt.Y - y3_);
    
	if (distToCenter > r3_ * r3_) return [false];
	
    if (distToCenter == r3_ * r3_)
    {
        //ray.ex = midpt.x;
		//ray.ey = midpt.y;
        return [false];
    }
    var distToIntersection;
    if (distToCenter == 0)
    {
        distToIntersection = r3_;// * r3_;
    }
    else
    {
        distToCenter = Math.sqrt(distToCenter);
        distToIntersection = Math.sqrt(r3_ * r3_ - distToCenter * distToCenter);
    }
    var lineSegmentLength = 1 / vec3.length(v1);
   	vec3.scale(v1, lineSegmentLength, v1);
    vec3.scale(v1, distToIntersection, v1);
	
	var sol, hit;
	
	// If you want inner circle collision checking...
   	var solution1 = vec3.add(midpt, v1);
    if ((solution1.X - x1_) * v1.X + (solution1.Y - y1_) * v1.Y > 0)
    {
        //result.InsertSolution(solution1);
		/*ray.ex = solution1.x;
		ray.ey = solution1.y;
		
		ray.lastHit = p0;*/
		sol = solution1;
		hit = true;
    }
    var solution2 = vec3.subtract(midpt, v1);
    if ((solution2.X - x1_) * v1.X + (solution2.Y - y1_) * v1.Y > 0)
    {
        //result.InsertSolution(solution2);
		/*ray.ex = solution2.x;
		ray.ey = solution2.y;
		
		ray.lastHit = p0;*/
		sol = solution2;
		hit = true;
    }
	
	
	var dx = ray.sx - ray.ex;
	var dy = ray.sy - ray.ey;
	
	var dox = ray.sx - oex;
	var doy = ray.sy - oey;
	
	var dis = Math.sqrt(dx * dx + dy * dy);
	
	if(Math.sqrt(dox * dox + doy * doy) < dis){
		sol.x = oex;
		sol.y = oey;
		hit = false;
	} else if(dis > ray.Range){
		// ray.updateBeam(ray.sx, ray.sy, ray.Direction, ray.Range);
	}
	
	return [hit, sol];
}

// TODO: When the ray is shortened by a collision, remove it from
//       the cells it isn't present anymore
// Perform collision check against a constraint and a ray
// @param c0 The constraint to check
// @param ray The ray to check
Flave.CollisionResolver.rayOnConstraint = function(c0, ray) {
	var result = Flave.CollisionResolver.checkLinesP(ray.sx, ray.sy, ray.ex, ray.ey, c0.p1.X, c0.p1.Y, c0.p2.X, c0.p2.Y);
	
	//var oex = ray.ex;
	//var oey = ray.ey;
	
	if(result[0] == true){
		ray.ex = result[1].X;
		ray.ey = result[1].Y;
		ray.lastHit = c0;
	}
	
	return result;
}

Flave.CollisionResolver.distance = function(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}