/* This is to understand why we can write only a single byte with BLE. */

var eventData = "NOTHING";

NRF.setServices({
  0xEDCB : {
    0xBA98 : {
      maxLen : 20,
      description: "MyCharacter",
      writable  : true,
      onWrite : function(evt) {
        eventData = evt.data;
      }
    }
  }
},
{ advertise: [ 'EDCB' ]});

var counter = 0;

function intervalHandler()
{
  console.log("counter: " + counter + " Data=" + eventData);
  counter++;
}

setInterval(intervalHandler, 1000);

g.clear();
g.flip();
LED.set();

NRF.on('connect', function(addr) {
  console.log("Connection. addr=", addr);
});

NRF.on('disconnect', function(reason) {
  console.log("reason=" + reason);
});

