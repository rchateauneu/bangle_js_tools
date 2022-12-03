Bangle.setLCDTimeout(0); // turn off the timeout
Bangle.setLCDPower(1); // keep screen on

var history = new Float32Array(64);

var delta = 1000;
var COLOR_WHITE = 255; // If 8 bits
var COLOR_BLACK = 0;


function processTemperature () {
  temp = E.getTemperature();
  history.set(new Float32Array(history.buffer,4));
  history[history.length-1] = temp;
  console.log("T=", temp);

  g.clear(true);

  g.setFont("6x8:4x5");
  metrics = g.stringMetrics("00.00");
  console.log("Metrics=", metrics);
  var rectX0 = 20;
  var rectY0 = 100;
  var marginX = 20;
  var marginY = 10;
  var rectX1 = rectX0 + metrics.width + marginX;
  var rectY1 = rectY0 + metrics.height + marginY;
  g.setColor(255,0,0);
  g.drawRect(rectX0, rectY0, rectX1, rectY1);
  g.setColor(0,255,0);
  g.fillRect(rectX0+1, rectY0+1, rectX1-1, rectY1-1);
  g.setColor(0,0,0);
  g.drawString(temp.toFixed(2), rectX0 + marginX/2, rectY0 + marginY/2);

  g.setFont("6x8:2x2");
  var r = require("graph").drawLine(g, history, {
    miny: 0,
    axes : true,
    gridy : 10,
    title: "Temperature"
  });

  g.flip();
  Timer = setTimeout(processTemperature,delta);
}

setTimeout(processTemperature, delta);