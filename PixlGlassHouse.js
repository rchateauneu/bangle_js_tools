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
var interval = null;


var shift = -2;

// Backlight at startup.
var ledState = true;
LED1.set();

// Global Led.
var ledGlobal = 0;

function DisplayTemperature() {
	g.setFontBitmap();
	g.setFontVector(10);
	g.drawString("Temperature:", 0, 10);
	var temperatureNum = E.getTemperature() + shift;
	var temperatureStr = temperatureNum.toFixed(2) + "°C";
	g.drawString(temperatureStr, 70, 10);
	g.drawString("Temperature offset:" + shift  + "°C", 0, 55);
}

function DisplayTime() {
	g.setFontBitmap();
	g.setFontVector(10);
	g.drawString("Time:", 0, 20);

  const dt = new Date();
  var fmtHours = dt.getHours().toString().padStart(2, '0');
  var fmtMinutes = dt.getMinutes().toString().padStart(2, '0');
  var fmtSeconds = dt.getSeconds().toString().padStart(2, '0');
  var tmStr = fmtHours + ":" + fmtMinutes + ":" + fmtSeconds;
	g.drawString(tmStr, 70, 20);
}


function UpdateLed() {
  digitalWrite(D0, ledGlobal);
  //digitalWrite(D1, ledGlobal);
  //digitalWrite(D2, ledGlobal);
  //analogWrite(A1, (1 - ledGlobal) / 2);
  //analogWrite(A2, 0.01 * ledGlobal);
  ledGlobal = 1 - ledGlobal;
}

var ledsLight = 0;
var ledsMax = 255;
var ratioLimit = 0.1; // Maximum value.
var ledsDirection = true;

function loopLeds() {
  /*
  analogWrite(A1, 0.0);
  analogWrite(A2, 0.2);
  */
  if(ledsDirection) {
    analogWrite(A1, ratioLimit * (ledsLight / ledsMax));
    analogWrite(A2, ratioLimit * (ledsMax - ledsLight) / ledsMax);
  } else {
    analogWrite(A2, ratioLimit * (ledsLight / ledsMax));
    analogWrite(A1, ratioLimit * (ledsMax - ledsLight) / ledsMax);
  }

  ledsLight += 1;
  if(ledsLight >= ledsMax) {
    ledsLight = 0;
    ledsDirection = !ledsDirection;
  }
}


function displayScreen() {
	g.clear();
  DisplayTemperature();
  DisplayTime();
  g.flip();
  UpdateLed();
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
  interval = setInterval(displayScreen, 1000);
  interval = setInterval(loopLeds, 10);
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