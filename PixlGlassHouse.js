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

/*
Afficher temperature: Avec calibration ? Commande ventilateur.
Afficher heure : Commande lumiere.

Capteur humidite ? Soil Hygrometer Moisture Detection Sensor Module 
https://www.switchelectronics.co.uk/soil-hygrometer-moisture-detection-sensor-module?gclid=Cj0KCQiAnsqdBhCGARIsAAyjYjT4Bs4C78_yLsJvAJDjwZolnmGS0iDT0SQ2yxkyWuyEhoM8rn385V4aAqHLEALw_wcB

Une LED sur le boitier par fil de commande.
Meme espacement qu'une breadboard de facon a la positionner derriere le boitier,
ce qui simplifie le cablage, et facilite une led/sortie.

Connecteur "choc box".
Goulettes pour passage de fils propres. Il faut pouvoir faire facilement passer beaucoup de fils.

Forcer allumage/eteignage du ventilateur et des lumieres avec BLE (Optionnel).
*/
var intervalScreen = null;
var intervalRelay = null;

var shiftTemperature = -2;

// Backlight at startup.
var ledState = true;
LED1.set();

// Global Led.
var ledGlobal = 0;

var errorMessage = "OK";

const baseY = 0;
const fontSize = 9;

function DisplayTemperature() {
	var temperatureNum = E.getTemperature() + shiftTemperature;
	var temperatureStr = temperatureNum.toFixed(2) + "°C";
  var offsetStr = " (" + shiftTemperature  + "°C)";
	g.drawString("Temperature:" + temperatureStr + offsetStr, 0, baseY);
}

const offsetYTime = baseY + fontSize * 1;

function DisplayTime() {
	g.drawString("Time:", 0, offsetYTime);

  const dt = new Date();
  var fmtHours = dt.getHours().toString().padStart(2, '0');
  var fmtMinutes = dt.getMinutes().toString().padStart(2, '0');
  var fmtSeconds = dt.getSeconds().toString().padStart(2, '0');
  var tmStr = fmtHours + ":" + fmtMinutes + ":" + fmtSeconds;
	g.drawString(tmStr, 60, offsetYTime);
}

const plot_size = 8;

function DisplayPlot(ledValue, offsetX, offsetY) {
  if(ledValue == 0)
    g.drawRect(offsetX, offsetY + plot_size, offsetX + plot_size, offsetY);
  else
    g.fillRect(offsetX, offsetY + plot_size, offsetX + plot_size, offsetY);
}

const offsetYLeds = baseY + fontSize * 2;

function DisplayRelayLeds() {
	g.drawString("Item1:", 0, offsetYLeds);
  DisplayPlot(ledRelay1, 40, offsetYLeds);
	g.drawString("Item2:", 60, offsetYLeds);
  DisplayPlot(ledRelay2, 100, offsetYLeds);
}

function DisplayBleControl() {
  var dataStr = String.fromCharCode.apply(this, eventData);
	g.drawString("BLE: " + dataStr, 0, baseY + fontSize * 3);
}

function DisplayConnection() {
  if(connection_address != null) {
    if(disconnection_reason != null) {
      connection_text = "Invalid connection";
    } else {
      connection_text = "Connected to " + connection_address;
    }
  } else {
    if(disconnection_reason != null) {
      connection_text = "Disconnected:" + disconnection_reason;
    } else {
      connection_text = "Invalid disconnection";
    }
  }
	g.drawString(connection_text, 0, baseY + fontSize * 4);
}

function DrawSwitch(message, value, offsetX, offsetY) {
	g.drawString(message, offsetX, offsetY);
  DisplayPlot(value, offsetX + 20, offsetY);
}

const offsetYSwitches = baseY + fontSize * 5;

function DisplaySwitches() {
  switch8 = digitalRead(D8); 
  switch9 = digitalRead(D9); 
  switch10 = digitalRead(D10); 
  switch11 = digitalRead(D11); 
  DrawSwitch("Btn1", switch8, 0, offsetYSwitches);
  DrawSwitch("Btn2", switch9, 33, offsetYSwitches);
  DrawSwitch("Btn3", switch10, 66, offsetYSwitches);
  DrawSwitch("Btn4", switch11, 99, offsetYSwitches);
}

function DisplayError() {
	g.drawString(errorMessage, 0, baseY + fontSize * 6);
}

function displayScreen() {
	g.clear();
	g.setFontBitmap();
	g.setFontVector(fontSize);
  DisplayTemperature();
  DisplayTime();
  DisplayRelayLeds();
  DisplayBleControl();
  DisplayConnection();
  DisplaySwitches();
  DisplayError();
  g.flip();
  UpdateLed();
}

// This is only to demonstrate that the switch logic is working.
function UpdateLed() {
  digitalWrite(D0, ledGlobal);
  ledGlobal = 1 - ledGlobal;
}

var ledRelay1 = 0;
var ledRelay2 = 1;

// This is only for testing.
function loopRelayLeds() {
  digitalWrite(D1, ledRelay1);
  digitalWrite(D2, ledRelay2);
  ledRelay1 = 1 - ledRelay1;
  ledRelay2 = 1 - ledRelay2;
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

var menuObject = null;

function disableMenu() {
  if(menuObject == null) {
    errorMessage = errorMessage + ";**";
    // Possibly called twice by the menu.
    return;
  }
  Pixl.menu();
  restart();
  menuObject = null;
}

// This menu is called when pressing button 1.

/*
Ajouter dans le menu:
Temperature mini pour le ventilateur
Mode test du ventilateur (on par defaut)
Debut/fin eclairage
Mode test de l'eclairage (on par defaut)
*/

var fanTestMode = true;

var fanTemperature = 30;

var submenuFan = {
  "" : {
    "title" : "-- Fan --"
  },
  "Test mode" : {
    value : fanTestMode,
    format : fanTestMode => fanTestMode ? "On" : "Off",
    onchange : v => { fanTestMode = v; }
  },
  "Temperature" : {
    value : fanTemperature,
    min : 10, max : 50, step : 1,
    onchange : v => { fanTemperature = v; }
  },
  "< Back" : function() { E.showMenu(menuDefinition); },
};

var lightsTestMode = true;

var lightsStartHour = 0;
var lightsEndHour = 24;

var submenuLights = {
  "" : {
    "title" : "-- Lights --"
  },
  "Test mode" : {
    value : lightsTestMode,
    format : lightsTestMode => lightsTestMode ? "On" : "Off",
    onchange : v => { lightsTestMode = v; }
  },
  "Start hour" : {
    value : lightsStartHour,
    min : 0, max : 24, step : 1,
    onchange : v => { lightsStartHour = v; }
  },
  "End hour" : {
    value : lightsEndHour,
    min : 0, max : 24, step : 1,
    onchange : v => { lightsEndHour = v; }
  },
  "< Back" : function() { E.showMenu(menuDefinition); },
};

var menuDefinition = {
  "" : {
    "title" : "-- Menu --"
  },
  "Backlight" : switchLed,
  "Fan" :  function() { E.showMenu(submenuFan); },
  "Light" :  function() { E.showMenu(submenuLights); },
  "Calibrate" : {
    value : shiftTemperature,
    min : -20, max : +20, step : 1,
    onchange : v => { shiftTemperature = v; }
  },
  "Exit" : disableMenu,
};

E.showMenu = (function(menudata) {
  if (Pixl.btnWatches) {
    Pixl.btnWatches.forEach(clearWatch);
    Pixl.btnWatches = undefined;
  }
  g.clear();g.flip(); // clear screen if no menu supplied
  if (!menudata) return;
  if (!menudata[""]) menudata[""]={};
  g.setFontBitmap();g.setFontAlign(-1,-1,0);
  var w = g.getWidth()-9;
  var h = g.getHeight();
  menudata[""].x=9;
  menudata[""].x2=w-2;
  menudata[""].preflip=function() {
    g.drawImage(E.toString(8,8,1,
      0b00010000,
      0b00111000,
      0b01111100,
      0b11111110,
      0b00010000,
      0b00010000,
      0b00010000,
      0b00010000
    ),0,4);
    g.drawImage(E.toString(8,8,1,
      0b00010000,
      0b00010000,
      0b00010000,
      0b00010000,
      0b11111110,
      0b01111100,
      0b00111000,
      0b00010000
    ),0,h-12);
    g.drawImage(E.toString(8,8,1,
      0b00000000,
      0b00001000,
      0b00001100,
      0b00001110,
      0b11111111,
      0b00001110,
      0b00001100,
      0b00001000
    ),w+1,h-12);
    //g.drawLine(7,0,7,h);
    //g.drawLine(w,0,w,h);
  };
  var m = require("graphical_menu").list(g, menudata);
  Pixl.btnWatches = [
    /*
    setWatch(function() { m.move(-1); }, BTN1, {repeat:1}),
    setWatch(function() { m.move(1); }, BTN4, {repeat:1}),
    setWatch(function() { m.select(); }, BTN3, {repeat:1})
    */
    setWatch(function() { m.move(-1); }, D8, {repeat:1}),
    setWatch(function() { m.move(1); }, D9, {repeat:1}),
    setWatch(function() { m.select(); }, D10, {repeat:1})
  ];
  return m;
});

function callMenu() {
  clearInterval(intervalScreen);
  intervalScreen = null;
  clearInterval(intervalRelay);
  intervalRelay = null;

  g.clear();
  menuObject = E.showMenu(menuDefinition);
}

// Sent as a string from BLE.
var eventData = [];

NRF.setServices({
  0xEDCB : {
    0xBA98 : {
      maxLen : 31,
      description: "GlassHouseControl",
      writable  : true,
      onWrite : function(evt) {
        eventData = evt.data;
      }
    }
  }
},
{ advertise: [ 'EDCB' ]});

var connection_address = null;
var disconnection_reason = "Off";

NRF.on('connect', function(addr) {
  connection_address = addr;
  disconnection_reason = null;
});

NRF.on('disconnect', function(reason) {
  connection_address = null;
  disconnection_reason = reason;
});

function restart() {
  intervalScreen = setInterval(displayScreen, 1000);
  intervalRelay = setInterval(loopRelayLeds, 5000);
  // watchBTN2 = setWatch(callMenu, BTN2, {repeat:true});
  watchBTN2 = setWatch(callMenu, D11, {repeat:true});
}

restart();

//compressed = "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";

// require("Storage").write(".splash",E.toArrayBuffer(atob(compressed)));

/*
function getImage() {
  return require("heatshrink").decompress(atob("..."));
}
function draw() {
  g.drawImage(getImage());
}
*/

// Uncaught Error: Can't have palette on >8 bit images

//decompressed = require("heatshrink").decompress(atob(compressed));

//require("Storage").write(".splash",E.toArrayBuffer(compressed));

/*
uncompressed = "gEAB////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4AAAAAAAAB///////////x//8P+H/D/h//////////j///8f+P/H/j/////////n////5/4/8f+P////////H/////n/z/x/4////////n/////8f/P/H/n///////z//////z/5/8/+f//////x//////+f/P/n/z//////5P//////Z/5/8/+f/////85//////vP/v/3/z/////+fP/////37/9/8/+f/////P5//AP/7/f/P/n/z/////3/P/P8/5/z/5/8/+f////5/5/P/z8/+f/f/v/3////8//vn/+ef/3/7/5/8/////P/9z//3P/8/+f/f/v////3//N//8n//v/n/z/5////5//8f//j//7/9/+//f///+f//H//4//+f/P/n/j////gAAB//+AAAAAAAAAA////z//8f//j//9/+//f/P///8//+H//6f//f/v/3/7////P//J//+z//3/7/9/+////z//mf//uf/9/+//f/v///8//zn//7z//f/v/3/7////P/55//++f/3/7/9/+////z/8+f//vz/9/+//f/v///8/+/n//7+f/f/v/3/7////P/f5//+/z/3/7/9/+////z/v+f//v+f9/+//f/v///8/3/n//7/z/f/v/3/7////P7/5//+/+f3/7/9/+////z9/+f//v/z9/+//f/v///88//n//7/+ff/v/3/7////Of/5//+//z3/7/9/+////zP/+f//v/+d/+//f/v///8n//n//7//7f/v/3/7////D//5//+///H/7/9/+////x//+f//v//x/+//f/v///8AAAAAAAAAAAAAAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==";

require("Storage").write(".splash",E.toArrayBuffer(uncompressed));
*/

/*
require("Storage").write(".splash",E.toArrayBuffer(atob("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")));
*/

