var ledState = true;
LED1.set();

function switchLed() {
  if(ledState) {
    ledState = false;
    LED1.reset();
  } else {
    ledState = true;
    LED1.set();
  }
}

var shiftTemperature = 10;


function disableMenu() {
  ClearBtnWatches();
  Pixl.menu();
  restart();
}

var menuDefinition = {
  "" : {
    "title" : "-- Menu --"
  },
  "Backlight" : switchLed,
  "Calibrate" : {
    value : shiftTemperature,
    min:-20, max:+20, step:1,
    onchange : v => { shiftTemperature = v; }
  },
  "Exit" : disableMenu,
};

function callMenu() {
  g.clear();
  Pixl.menu(menuDefinition);
  Pixl.btnWatches.forEach(clearWatch);
  Pixl.btnWatches = [
	setWatch(function() { m.move(-1); }, BTN1, {repeat:1}),
	setWatch(function() { m.move(1); }, BTN4, {repeat:1}),
	setWatch(function() { m.select(); }, BTN3, {repeat:1})
  ];
	  //ClearBtnWatches();
}

function restart() {
  watchBTN1 = setWatch(callMenu, BTN1, {repeat:true, edge:"rising"});
}

restart();