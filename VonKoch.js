Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.clear();

var w=g.getWidth();
var h=g.getHeight();

var cx=w/2;
var cy=h/2;
var r = h/2;

console.log("Start log", w, h);

var ax = cx + r * Math.sin(0.0);
var ay = cy + r * Math.cos(0.0);
var bx = cx + r * Math.sin(2*Math.PI/3.0);
var by = cy + r * Math.cos(2*Math.PI/3.0);
var cx = cx + r * Math.sin(-2*Math.PI/3.0);
var cy = cy + r * Math.cos(-2*Math.PI/3.0);
var ratio = Math.sqrt(3.0)/2.0;

function dra(x1,y1,x2,y2,depth)
{
  //console.log("In func:", depth, x1,y1,x2,y2);
  depth--;
  if(depth == 0) {
    g.drawLine(x1,y1,x2,y2);
    return;
  }

  let vx = (x2-x1)/3;
  let vy = (y2-y1)/3;
  let hx = -vy*ratio;
  let hy = vx*ratio;
  let xi = x1 + (vx * 1.5) + hx;
  let yi = y1 + (vy * 1.5) + hy;
  let x11 = x1+vx;
  let y11 = y1+vy;
  let x22 = x2-vx;
  let y22 = y2-vy;

  dra(x1,y1,x11,y11,depth);
  dra(x11,y11,xi,yi,depth);
  dra(xi,yi,x22,y22,depth);
  dra(x22,y22,x2,y2,depth);
}

console.log("Params:", ax,ay,bx,by);
var dp = 5;
dra(ax,ay,bx,by,dp);
dra(bx,by,cx,cy,dp);
dra(cx,cy,ax,ay,dp);

g.drawString("Hello", 10, 10);