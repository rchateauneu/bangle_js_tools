// This is for signaling what happens.
function the_fill(state) {
  if(state == 0) {
    g.setColor(255,0,0);
    state = 1;
  } else if(state == 1) {
    g.setColor(0,255,0);
    state = 2;
  } else if(state == 2) {
    g.setColor(0,0,255);
    state = 3;
  } else if(state == 3) {
    g.clear(true);
    state = 0;
  }

  if(state != 0) {
    g.fillCircle(100,100,50);
    setTimeout(function(){
          the_fill(state);
        }, 250);
    }
}

function flag() {
  g.clear(true);
  the_fill(0);
}

// This works.
setWatch(flag, BTN, {repeat:true});

if(false) {
  // This works and return about five services.
  NRF.findDevices(function(devices) {
    console.log("Devices");
    console.log(devices);
  }, 10000);
}

if(false) {
  // Does nothing.
  NRF.on('servicesDiscover', function(services) {
    console.log("Services");
    console.log(services);
  }, 10000);
}

//require("ble_eddystone").advertise("goo.gl/B3J0Oc");

// These two services are detected with BLE Scanner and nRF Connect.
NRF.setServices({
  0xBCDE : {
    0xABCD : { // Characteristic
      value : "Hello", // Read with BLE Scanner and nRF Connect.
      description: "My Characteristic1",
      readable : true
    }
  },
  0xEDCB : {
    0xABCD : { // Characteristic
      value : "0123456789", // Read with BLE Scanner and nRF Connect.
      description: "My Characteristic2",
      readable : true
    },
    0xBA98 : { // Characteristic
      description: "My Characteristic3",
      writable  : true, // Detected as writeable.
      onWrite : function(evt) {
        // Never displayed.
        console.log("evt=", evt);
        // Better make things as simple as possible.
        // flag();
      }
    }
  }
},
{ advertise: [ 'BCDE', 'EDCB' ]});

options = {
  name: "DevName", // Default value is "Bangle.xxxx"
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

// Does not display anything when connected, but runs on the background.
setInterval(
  function()
  {
    console.log("counter=", counter);
    g.flip();
    counter++;
    NRF.setAdvertising({
      0xBCDE : [Math.round(E.getTemperature())]
    });
    NRF.updateServices({
      0xBCDE : {
        0xABCD : {
          value : "World"
        }
      }
    });
  },
  10000);

// Just logs "-> Bluetooth"
NRF.on('connect', function(addr) {
  // Not called.
  console.log("Connection. addr=", addr);
  //if (addr!="69:2d:94:d0:9d:97 public")
  //  NRF.disconnect();
});

NRF.on('disconnect', function(reason) {
  // It still logs "<- Bluetooth"
  // This displays: "reason=19"
  console.log("reason=", reason);
});

NRF.on('HID', function() {
  console.log("Bluetooth HID");
});

NRF.on('security', function(status) {
  console.log("Bluetooth status=", status);
});



/*
packets=10;
NRF.setScan(function(d) {
  packets--;
  if (packets<=0)
    NRF.setScan(); // stop scanning
  else
    console.log(d); // print packet info
});
*/
