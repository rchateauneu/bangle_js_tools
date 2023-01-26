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

Connecteur "chock box".
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

var baseY = 9;
var fontSize = 9;

function DisplayTemperature() {
	g.drawString("Temperature:", 0, baseY - fontSize);
	var temperatureNum = E.getTemperature() + shiftTemperature;
	var temperatureStr = temperatureNum.toFixed(2) + "°C";
	g.drawString(temperatureStr, 75, 0);
	g.drawString("Temperature offset:" + shiftTemperature  + "°C", 0, baseY);
}

function DisplayTime() {
  var offsetYTime = baseY + fontSize * 1;
	g.drawString("Time:", 0, offsetYTime);

  const dt = new Date();
  var fmtHours = dt.getHours().toString().padStart(2, '0');
  var fmtMinutes = dt.getMinutes().toString().padStart(2, '0');
  var fmtSeconds = dt.getSeconds().toString().padStart(2, '0');
  var tmStr = fmtHours + ":" + fmtMinutes + ":" + fmtSeconds;
	g.drawString(tmStr, 75, offsetYTime);
}

function DisplayOneLed(ledValue, offsetX, offsetY) {
  var plot_size = 8;
  if(ledValue == 0)
    g.drawRect(offsetX, offsetY + plot_size, offsetX+plot_size, offsetY);
  else
    g.fillRect(offsetX, offsetY + plot_size, offsetX+plot_size, offsetY);
}

function DisplayRelayLeds() {
  var offsetYLeds = baseY + fontSize * 2;
	g.drawString("Item1:", 0, offsetYLeds);
  DisplayOneLed(ledRelay1, 40, offsetYLeds);
	g.drawString("Item2:", 60, offsetYLeds);
  DisplayOneLed(ledRelay2, 100, offsetYLeds);
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

function DisplayError() {
	g.drawString(errorMessage, 0, baseY + fontSize * 5);
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
    setWatch(function() { m.move(-1); }, BTN1, {repeat:1}),
    setWatch(function() { m.move(1); }, BTN4, {repeat:1}),
    setWatch(function() { m.select(); }, BTN3, {repeat:1})
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
  watchBTN2 = setWatch(callMenu, BTN2, {repeat:true});
}

restart();
