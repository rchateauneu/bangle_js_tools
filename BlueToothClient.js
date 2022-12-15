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

setWatch(flag, BTN, {repeat:true});

// New code to define services
NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value : [0],
      maxLen : 1,
      writable : true,
      onWrite : function(evt) {
        // When the characteristic is written, raise flag
        flag();
      }
    }
  }
}, { uart : false });
// Change the name that's advertised
NRF.setAdvertising({}, {name:"Flag"});

// Eventually, it prints: "BLE Connected, queueing BLE restart for later".