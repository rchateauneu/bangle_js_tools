var busy = false;

function flag() {
  if (busy) {
    digitalPulse(LED1,1,[10,200,10,200,10]);
    return;
  }
  busy = true;
  var gatt;
  NRF.requestDevice({ filters: [{ name: 'Flag' }] })
  .then(function(device) {
    console.log("Found");
    digitalPulse(LED2,1,10);
    return device.gatt.connect();
  }).then(function(g) {
    console.log("Connected");
    digitalPulse(LED3,1,10);
    gatt = g;
    return gatt.getPrimaryService(
        "3e440001-f5bb-357d-719d-179272e4d4d9");
  }).then(function(service) {
    return service.getCharacteristic(
        "3e440002-f5bb-357d-719d-179272e4d4d9");
  }).then(function(characteristic) {
    return characteristic.writeValue(1);
  }).then(function() {
    digitalPulse(LED2,1,[10,200,10,200,10]);
    gatt.disconnect();
    console.log("Done!");
    busy=false;
  }).catch(function(e) {
    digitalPulse(LED1,1,10);
    console.log("ERROR",e);
    busy=false;
  });
}

setWatch(flag, BTN, {repeat:true});

NRF.setServices({}, { uart : false });
NRF.setAdvertising({}, {showName:false, connectable:false, discoverable:false});

// https://www.espruino.com/Bangle.js+Development
// You can work along using the Bangle.js online Emulator
// however you won't get access to the sensors, Bluetooth, speaker, or vibration motor!