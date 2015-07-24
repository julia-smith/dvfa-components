// jshint devel:true
'use strict';

//from: https://github.com/jfriend00/docReady
(function(funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);

var touch;

docReady(function() {
    initInteraction(mapid, elementclass, maptype);
});

function initInteraction(mapid, elementclass, maptype){
  /* Check if viewing on a mobile browser */
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    touch = true;
    var wrapper = document.getElementById("interactive-wrapper");
    wrapper.className += ' touch-device';
  }

  var tooltip = document.getElementsByClassName("map-tooltip")[0];
  var map = document.getElementById(mapid);

  if (!touch) {
    map.addEventListener( 'mousemove', function(e) {
      var left = e.offsetX==undefined?e.layerX+10:e.offsetX+10;
      var top = e.offsetY==undefined?e.layerY+10:e.offsetY+10;
      if (e.pageX > (window.innerWidth - 200)){
        left = e.offsetX==undefined?e.layerX-tooltip.clientWidth:e.offsetX-tooltip.clientWidth;
      }
      if (e.pageY > (window.innerHeight - 200)){
        top = e.offsetY==undefined?e.layerY-tooltip.clientHeight-10:e.offsetY-tooltip.clientHeight-10;
      }
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    });
  }

  var elements = document.getElementsByClassName(elementclass);
  for (var i in elements) {
    if (!elements.hasOwnProperty(i)) {
      continue;
    }
    var elem = elements[i];
    if (i !== 'length') {

      //if (!touch){
        elem.addEventListener( 'mouseover', function(e) {
          if (maptype == "approved"){
          	tooltipInfo(e.target, tooltip);
          } else {
          	tooltipInfoPerK(e.target, tooltip);
          }          
          tooltip.style.display = 'block';
        });

        elem.addEventListener( 'mouseout', function() {
          tooltip.style.display = 'none';
        });
      //} else {
        elem.addEventListener( 'click', function(e) {
          if(e.handled !== true) {
            var stateID = e.target.id;
            var select = document.getElementById("cir-map-select");           
            if (e.target.getAttribute('data-selected') == 'true'){
              select.value = "Select a county";
              e.target = "";
              stateID = "Select a county";
            } else {
              select.value = stateID;
            }
            updateSelectedPath(e.target);
            updateSelectionInfo(stateID);
            e.handled = true;
          }
        });
      //}
    }
  }
}


function tooltipInfo(elem, tooltip){
  var approved = elem.getAttribute("data-approved");
  var pending = elem.getAttribute("data-pending");
  var name = elem.getAttribute("data-name");
  var html = '<div class="googft-info-window"><table><tbody><tr><td colspan="2">' + name + ' County</td></tr><tr><td>Approved Permits</td><td>' + approved.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr><tr><td>Pending Permits</td><td>' + pending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr></tbody></table></div>';

  var innerTip = document.getElementsByClassName("tooltip-inner")[0];

  innerTip.innerHTML = html;
}


function tooltipInfoPerK(elem, tooltip){
  var approved = elem.getAttribute("data-appperk");
  var pending = elem.getAttribute("data-penperk");
  var name = elem.getAttribute("data-name");
  var pop = elem.getAttribute("data-pop");
  var html = '<div class="googft-info-window"><table><tbody><tr><td colspan="2">' + name + ' County</td></tr><tr><td>Approved Permits</td><td>' + parseFloat(approved).toFixed(3) + '</td></tr><tr><td>Pending Permits</td><td>' + parseFloat(pending).toFixed(3) + '</td></tr><tr><td>Population</td><td>' + pop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr></tbody></table></div>';

  var innerTip = document.getElementsByClassName("tooltip-inner")[0];

  innerTip.innerHTML = html;
}



docReady(function() {
    countySelect();
});

function countySelect(){
  var select = document.getElementById("cir-map-select");
  select.onchange = function(){
    var value = select.value;
    updateSelectionInfo(value);
  }
}

function updateSelectionInfo(value){
  var info = document.getElementById("cir-map-info");
  if (value != "Select a county"){
    var svgCounty = document.getElementById(value);
    var dataCounty = svgCounty.getAttribute("data-name");
    var dataApproved = svgCounty.getAttribute("data-approved").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var html = "<div class='info-inner'><span class='county-group'>" + dataApproved + " active permits</span></div>";
    info.innerHTML = html;
    updateSelectedPath(svgCounty);     
  } else {
    info.innerHTML = "";
    deselectPath();
  }
}

function updateSelectedPath(path){
  deselectPath();   
  if (path.getAttribute('data-selected') == 'true'){
    path.setAttribute('data-selected', 'false');
  } else {
    path.setAttribute('data-selected', 'true');
  } 
  path.setAttribute('data-selected', 'true');
  var parent = path.parentNode;
  parent.appendChild(path);
}

function deselectPath(){
  var selected = document.querySelector('.cir-county[data-selected="true"]');
  if (selected) {
	  selected.setAttribute('data-selected', 'false');
  }
}