var interval = null;

var ledState = false;

var shift = -2;

function DisplayTemperature() {
	g.clear();
	g.setFontBitmap();
	g.drawString("Temperature:", 0, 0);
	g.setFontVector(30);
	var t = E.getTemperature() + shift;
	g.drawString(t.toFixed(2), 20, 10);
	g.setFontBitmap();
	g.drawString("Offset:" + shift, 85, 55);
	g.flip();
}

function switchLed() {
  if(ledState) {
    ledState = false;
    LED1.reset();
  } else {
    ledState = true;
    LED1.set();
  }
}

function restart() {
  interval = setInterval(DisplayTemperature,1000);
  setWatch(callMenu, BTN1, {repeat:true, edge:"rising"});
}

// First menu
var mainmenu = {
  "" : {
    "title" : "-- Menu --"
  },
  "Backlight" : switchLed,
  "Calibrate" : {
    value : shift,
    min:-20, max:+20, step:1,
    onchange : v => { shift=v; }
  },
  "Exit" : function() {
    Pixl.menu();
    restart();
  },
};

function callMenu() {
  Pixl.menu(mainmenu);
  clearInterval(interval);
}

restart();
