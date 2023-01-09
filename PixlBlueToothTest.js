
function TimeString() {
var t = new Date(); // get the current date and time
  g.clear();

  // Draw the time
  g.setFontVector(30);
  var time = t.getHours()+":"+("0"+t.getMinutes()).substr(-2);
  var seconds = ("0"+t.getSeconds()).substr(-2);
  return time + ":" + seconds;
}


function Message(msg, position){
	g.setFontBitmap();
  var szH = 9;
  var yOffset = szH / 2 - 1;
  var xEnd = 126;
  g.setColor(1);
  g.drawRect( 0, szH * position, xEnd, szH * (position + 1));
  g.setColor(0);
  g.fillRect( 1, szH * position+1, xEnd-1, szH * (position + 1)-1);
  g.setColor(-1);
  g.setFontAlign(-1, -1, 0);
	g.drawString(msg, 2, szH * position + yOffset);
  g.flip();
}

var writtenEvent = null;

// These two services are detected with BLE Scanner and nRF Connect.
NRF.setServices({
  0xBCDE : {
    0xABCD : { // Characteristic
      value : "Hello", // Read with BLE Scanner and nRF Connect.
      // Correctly updated by updateServices
      // Why is it possible to update it from the client ?
      description: "My Characteristic1",
      readable : true
    }
  },
  0xEDCB : {
    0xBA98 : { // Characteristic
	  maxLen : 20,
      description: "My Characteristic3",
      writable  : true, // Detected as writeable.
      onWrite : function(evt) {
        writtenEvent = evt;
      }
    }
  }
},
{ advertise: [ 'BCDE', 'EDCB' ]});

options = {
  name: "MyEspruinoPixl", // Default value is "Bangle.xxxx"
  showName: true,
  interval: 5000,
  manufacturer: 0x0590,
  manufacturerData: ["Manuf"]
};
 
NRF.setAdvertising({
    0x180F : [95] // Service data 0x180F = 95
  },
  options);

var counter = 0;

function intervalHandler()
{
  Message("counter: " + counter + " " + TimeString(), 3);
  g.flip();
  counter++;
  // TODO: Temperature offset should be adjusted.
  temperature = E.getTemperature() - 4;
  try {
    // Not visible ?
    NRF.setAdvertising({
      // 0xBCDE : [Math.round(temperature)]
      0xBCDE : [0x99]
    });
  }
  catch (exc) {
      Message("exc1=" + exc, 2);
  }
  Message("Temperature: " + temperature.toFixed(1), 5);
  Message("BTNs: "
          + BTN1.read() + " "
          + BTN2.read() + " "
          + BTN3.read() + " "
          + BTN4.read(), 6);

  try {
      NRF.updateServices({
      0xBCDE : {
        0xABCD : {
          // Cannot send too much bytes.
          value : [0x01, counter % 256]
        }
      }
    });
  }
  catch (exc) {
    Message("exc2=" + counter + ":" + exc, 2);
  }

  if(writtenEvent != null ) {
    // It refreshes the full display because BLE connections
    // logs extra data on the screen.
    Message("evt=" + writtenEvent.data[0], 1);
    // Bytes array ?
    // var tp = typeof evt;
    // "data".
    // One char only ?
    var tp = Object.keys(writtenEvent);
    Message("evt.data=" + writtenEvent.data + ":" + tp, 4);
    }
}

setInterval(intervalHandler, 1000);

g.clear();
g.flip();
LED.set();
Message("Go",0);

NRF.on('connect', function(addr) {
  console.log("Connection. addr=", addr);
  Message("Connect", 0);
});

NRF.on('disconnect', function(reason) {
  Message("reason=" + reason, 1);
});

