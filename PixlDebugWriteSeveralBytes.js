ldfghajkdfghljkfdhNRF.setServices({
  0xEDCB : {
    0xBA98 : {
      description: "MyCharact",
      writable  : true,
      onWrite : function(evt) {
        console.log("evt.data=" + evt.data);
      }
    }
  }
},
{ advertise: [ 'EDCB' ]});

options = {
  name: "MyEspruinoPixl",
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
  counter++;
}

setInterval(intervalHandler, 1000);

g.clear();
g.flip();
LED.set();

NRF.on('connect', function(addr) {
  console.log("Connection. addr=", addr);
  Message("Connect", 0);
});

NRF.on('disconnect', function(reason) {
  Message("reason=" + reason, 1);
});

