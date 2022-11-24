// import * as deviceOrientation from "./DeviceOrientationControls.js"



var s = function(sel) {
    return document.querySelector(sel);
  };

  var sId = function(sel) {
    return document.getElementById(sel);
  };


// Get debug elements and map them
let elDebug = sId('debug');
let elDump = elDebug.querySelector('.dump');

let els = {
position: {
    x: elDebug.querySelector('.position .x .data'),
    y: elDebug.querySelector('.position .y .data')
},
force: elDebug.querySelector('.force .data'),
pressure: elDebug.querySelector('.pressure .data'),
distance: elDebug.querySelector('.distance .data'),
angle: {
    radian: elDebug.querySelector('.angle .radian .data'),
    degree: elDebug.querySelector('.angle .degree .data')
},
direction: {
    x: elDebug.querySelector('.direction .x .data'),
    y: elDebug.querySelector('.direction .y .data'),
    angle: elDebug.querySelector('.direction .angle .data')
}
};

// initialize joysticks settings
let joysticks = {
    static: {
        zone: document.querySelector('.nippleStatic'),
        mode: 'static',
        position: {left: '50%', top: '50%'},
        color: 'white'
    }
    };

let joystick;
let nbEvents = 0;

export default class MobileControls{

/**
 * Constructor: Create variables necessary for MobileControls
 * @method
 */



    constructor(){
        this.deviceMotionInitialized = false;


          //create joystick button 
          this.createNipple('static');

        
    }

/**
 * Detect if the device is an Android device
 * @method
 * @returns {Boolean} true if the device is a mobile device
 */
    detectAndroid() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        
        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });


    }
/**
 * Detect if the device is an IOS mobile device
 * @method
 * @returns {Boolean} true if the device is a mobile device
 */

    detectiOS() {
        return [
          'iPad Simulator',
          'iPhone Simulator',
          'iPod Simulator',
          'iPad',
          'iPhone',
          'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
      }
    /**
 * Initialize the device montion controls.
 * @method
 * @param {Object} the object that will be controlled by device motion
 * @returns {Boolean} true if the device motion controls were initialized 
 */

    initDeviceMotionControls(camera){
      
        if (!this.deviceMotionInitialized) {

            // confirm("Mobile Version")
             if ( this.detectiOS() && window.deviceMotionGranted) {
                 console.log(this);
                this.permissionIOS();

                
             }
             else {
                 window.deviceMotionGranted = true;
                 console.log(this);
                 this.deviceMotionInitialized = true;
             }

             this.controls = new THREE.DeviceOrientationControls( camera );
            console.log("Controls DeviceOrientationControls")
            }
 
    }

        /**
 * Requests device motion access to the user
 * @method
 * @returns  Updates window.deviceMotionGranted after request permission from the user. 
 */

    permissionIOS(){
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          // Handle iOS 13+ devices.
          DeviceMotionEvent.requestPermission()
            .then((state) => {
              if (state === 'granted') {   
              // confirm("Permission is granted for DeviceMotionEvent");
              window.deviceMotionGranted = true;
            } else {
                console.error('Request to access the orientation was rejected');
                window.deviceMotionGranted = false;
    
            }
            })
            .catch(console.error);
            }
        }

        /**
         * Create Nipple button for movement controls on mobile devices.
         * @method
         */          
        createNipple(evt) {
            var type = typeof evt === 'string' ?
                evt : evt.target.getAttribute('data-type');
            if (joystick) {
              joystick.destroy();
            }

            joystick = nipplejs.create(joysticks[type]);
            bindNipple();
          }



}


function bindNipple() {
    joystick.on('start end', function(evt, data) {
      dump(evt.type);
      debug(data);
    }).on('move', function(evt, data) {
      debug(data);
    }).on('dir:up plain:up dir:left plain:left dir:down ' +
          'plain:down dir:right plain:right',
          function(evt, data) {
      dump(evt.type);
    }
         ).on('pressure', function(evt, data) {
      debug({
        pressure: data
      });
    });
  }


// Dump data
function dump(evt) {
    setTimeout(function() {
      if (elDump.children.length > 4) {
        elDump.removeChild(elDump.firstChild);
      }
      var newEvent = document.createElement('div');
      newEvent.innerHTML = '#' + nbEvents + ' : <span class="data">' +
        evt + '</span>';
      elDump.appendChild(newEvent);
      // console.log('#' + nbEvents + ' : <span class="data">' +
      // evt + '</span>');  
    //   console.log(document.getElementById('degree-data').innerText);

      if(evt == "end"){
        // document.getElementById('radian-data').innerHTML="0";
        document.getElementById('degree-data').innerHTML="0";
        // console.log(document.getElementById('degree-data').innerText);
      }
      nbEvents += 1;
    }, 0);
  }


// Print data into elements
function debug(obj) {
    function parseObj(sub, el) {
    for (var i in sub) {
        if (typeof sub[i] === 'object' && el) {
        parseObj(sub[i], el[i]);
        } else if (el && el[i]) {
        el[i].innerHTML = sub[i];
        }
    }
    }
    setTimeout(function() {
    parseObj(obj, els);
    }, 0);
}

        
