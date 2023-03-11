var ledState = true;
LED1.set();

function switchBacklight() {
  if(ledState) {
    ledState = false;
    LED1.reset();
  } else {
    ledState = true;
    LED1.set();
  }
}

// Use internal or external buttons. This is for debugging
var internalButtons = true;

var shiftTemperature = 10;

var intervalScreen = null;
var intervalRelay = null;

var shiftTemperature = -0.5;

// Backlight at startup.
var ledState = true;
LED1.set();

// Global Led.
var ledGlobal = 0;

var errorMessage = "OK";

var fanTestMode = true;

var fanTemperature = 30;

var lightsTestMode = true;

var lightsStartHour = 0;
var lightsEndHour = 24;

const baseY = 0;
const fontSize = 9;

const offsetYTimeTemp = baseY;

function DisplayTemperature() {
  var temperatureNum = E.getTemperature() + shiftTemperature;
  var temperatureStr = temperatureNum.toFixed(2) + "°C";
  g.drawString(temperatureStr + " (" + shiftTemperature  + "°C)", 50, offsetYTimeTemp);
}

function PadZeroes(number) {
	return number.toString().padStart(2, '0');
}

function DisplayTime() {
  const dt = new Date();
  var fmtHours = PadZeroes(dt.getHours());
  var fmtMinutes = PadZeroes(dt.getMinutes());
  var fmtSeconds = PadZeroes(dt.getSeconds());
  var tmStr = fmtHours + ":" + fmtMinutes + ":" + fmtSeconds;
  g.drawString(tmStr, 0, offsetYTimeTemp);
}

const plot_size = 8;

function DisplayPlot(ledValue, offsetX, offsetY) {
  if(ledValue == 0)
    g.drawRect(offsetX, offsetY + plot_size, offsetX + plot_size, offsetY);
  else
    g.fillRect(offsetX, offsetY + plot_size, offsetX + plot_size, offsetY);
}

const offsetYLedFan = baseY + fontSize * 1;

function DisplayTestFlag(theFlag, yFlag) {
  msgFlag = theFlag ? "Test" : "Run";
  g.drawString(msgFlag, 100, yFlag);
}

function DisplayLedFan() {
  g.drawString("Fan:", 0, offsetYLedFan);
  DisplayPlot(ledFan, 35, offsetYLedFan);
  DisplayTestFlag(fanTestMode, offsetYLedFan);
  g.drawString(fanTemperature + "°C", 50, offsetYLedFan);
}

const offsetYLedLights = baseY + fontSize * 2;

function DisplayLedLights() {
  g.drawString("Lights:", 0, offsetYLedLights);
  DisplayPlot(ledLights, 35, offsetYLedLights);
  DisplayTestFlag(lightsTestMode, offsetYLedLights);
  g.drawString(PadZeroes(lightsStartHour) + "H-" + PadZeroes(lightsEndHour) + "H", 50, offsetYLedLights);
}

function DisplayRelayLeds() {
  DisplayLedFan();
  DisplayLedLights();
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

var ledFan = 0;
var ledLights = 1;

// This is only for testing.
function loopRelayLeds() {
  if(fanTestMode) {
    ledFan = 1 - ledFan;
  } else {
	  var temperatureNum = E.getTemperature() + shiftTemperature;
	  ledFan = fanTemperature >= temperatureNum;
  }
  digitalWrite(D1, ledFan);

  if(fanTestMode) {
    ledLights = 1 - ledLights;
  } else {
	  currentHour = dt.getHours();
	  if(lightsStartHour < lightsEndHour) {
		  inRange = lightsStartHour <= currentHour && currentHour <= lightsEndHour;
	  } else {
		  inRange = lightsEndHour <= currentHour && currentHour <= lightsStartHour;
      }
      ledLights = inRange ? 1 : 0;
  }
  digitalWrite(D2, ledLights);
}

function switchBacklight() {
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
    min : 10, max : 50, step : 0.5,
    onchange : v => { fanTemperature = v; }
  },
  "< Back" : function() { E.showMenu(menuDefinition); },
};

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
  "Backlight" : switchBacklight,
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
    if(internalButtons) {
	  Pixl.btnWatches = [
		  setWatch(function() { m.move(-1); }, BTN1, {repeat:1}),
		  setWatch(function() { m.move(1); }, BTN4, {repeat:1}),
		  setWatch(function() { m.select(); }, BTN3, {repeat:1})
      ];
	} else {
	  Pixl.btnWatches = [
		  setWatch(function() { m.move(-1); }, D8, {repeat:1}),
		  setWatch(function() { m.move(1); }, D9, {repeat:1}),
		  setWatch(function() { m.select(); }, D10, {repeat:1})
      ];
	}
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
  if(internalButtons)
    watchBTN2 = setWatch(callMenu, BTN2, {repeat:true});
  else
    watchBTN2 = setWatch(callMenu, D11, {repeat:true});
}

// https://www.espruino.com/Custom+Boot+Screen
//require("Storage").write(".splash","");
restart();


