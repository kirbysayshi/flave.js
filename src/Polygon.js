if(typeof(Flave) === "undefined") Flave = {};

Flave.Polygon = function(_spots, _color, _alpha){
	if(!_color) _color = 0;
	if(!_alpha) _alpha = 0.5
	
	// The spots to draw a polygon around
	this.spots = _spots;
	
	// The color used to draw the polygon
	this.color = _color;
	this.alpha = _alpha;
	
	// User defined data
	this.userDef = {};
	
	// FIXME: these need to be broken out... probably
	// FIXME: enter frame call will need to be called from main loop
	//window.addEventListener("enterFrame", loop, false);
	window.addEventListener("mouseOver", over, false);
	window.addEventListener("mouseOut", out, false);
	window.addEventListener("click", click, false);
}

Flave.Polygon.prototype.clearGarbage = function(){
	this.spots.splice(0, this.spots.length);
	this.spots = null;
	//window.removeEventListener("enterFrame", loop, false);
}

Flave.Polygon.prototype.loop = function(e){
	this.redraw();
}

Flave.Polygon.prototype.over = function(e){
	
}

Flave.Polygon.prototype.out = function(e){
	
}

Flave.Polygon.prototype.click = function(e){
	
}

Flave.Polygon.prototype.redraw = function(ctx){
	if(this.spots.length < 2)
		return;
	
	ctx.strokeStyle = "rgba(0,0,1,1)";
	ctx.fillStyle = this.color;
	ctx.moveTo(this.spots[0].X, this.spots[0].Y);
	
	for(var i = 0; i < this.spots.length; i++){
		if(this.spots[i].callBack() != true) {
			//parent["removePoly"](this);
			return;
		}
		ctx.lineTo(this.spots[i].X, this.spots[i].Y);
	}
	
	ctx.lineTo(this.spots[0].X, this.spots[0].Y);
	ctx.stroke();
	ctx.fill();
}

Flave.Polygon.prototype.drawSel = function(){
	if(this.spots.length < 2)
		return;
	
	ctx.strokeStyle = "rgba(0,0,1,1)";
	ctx.fillStyle = ID.IsKeyDown[ID.CTRL] ? "#ff0000" : "#ffff00";
	ctx.moveTo(this.spots[0].X, this.spots[0].Y);
	
	for(var i = 0; i < this.spots.length; i++){
		if(this.spots[i].callBack() != true) {
			//parent["removePoly"](this);
			return;
		}
		ctx.lineTo(this.spots[i].X, this.spots[i].Y);
	}
	
	ctx.lineTo(this.spots[0].X, this.spots[0].Y);
	ctx.stroke();
	ctx.fill();
}

Flave.Polygon.prototype.genString = function(){
	var out = "n," + this.color + ",";
	
	for(var i = 0; i < this.spots.length; i++){
		//out += this.spots[i]._handler + (i == this.spots.length-1 ? "" : ",");
		out += (i == this.spots.length-1 ? "" : ",");
	}
	
	return "|" + out;
}