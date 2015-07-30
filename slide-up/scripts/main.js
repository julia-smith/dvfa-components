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
    initInteraction(mapid, elementclass);
});

function initInteraction(mapid, elementclass){
  /* Check if viewing on a mobile browser */
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    touch = true;
    var wrapper = document.getElementById("interactive-wrapper");
    wrapper.className += ' touch-device';
  }

  var tooltip = document.getElementsByClassName("map-tooltip")[0];
  var map = document.getElementById(mapid);


  /* Traditional tooltips */
  /*if (!touch) {
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
  }*/

  var elements = document.getElementsByClassName(elementclass);
  for (var i in elements) {
    if (!elements.hasOwnProperty(i)) {
      continue;
    }
    var elem = elements[i];
    if (i !== 'length') {


        /* Traditional tooltips */
        /*elem.addEventListener( 'mouseover', function(e) {
          tooltipInfo(e.target, tooltip);
          tooltip.style.display = 'block';
        });

        elem.addEventListener( 'mouseout', function() {
          tooltip.style.display = 'none';
        });*/

        elem.addEventListener( 'click', function(e) {
          e.preventDefault();
          if(e.handled !== true) {
            var path = e.target;
            $(path).focus();
            
            e.handled = true;
          }
        });

    }
  }
}


function tooltipInfo(elem, tooltip){
  var approved = elem.getAttribute("data-approved");
  var pending = elem.getAttribute("data-pending");
  var name = elem.getAttribute("data-name");
  var html = '<div class="info-window"><table><tbody><tr><td colspan="2">' + name + ' County</td></tr><tr><td>Approved Permits</td><td>' + approved.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr><tr><td>Pending Permits</td><td>' + pending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr></tbody></table></div>';

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
    //trigger click event here to fire panel functions
    $(svgCounty).focus();
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

  /* The below would allow you to put a nice stroke along the selected path; */
  /* however, it's problematic for keyboard navigation through the map.      */

  //var parent = path.parentNode;
  //parent.appendChild(path);
}

function deselectPath(){
  var selected = document.querySelector('.cir-county[data-selected="true"]');
  if (selected) {
	  selected.setAttribute('data-selected', 'false');
  }
}


/************************/
/* FOR INFO PANEL START */
/************************/

function panelInfo(elem){
  var approved = elem.getAttribute("data-approved"),
      pending = elem.getAttribute("data-pending"),
      name = elem.getAttribute("data-name"),
      html = '<div class="info-window"><table><tbody><tr><td></td><td></td></tr><tr><td>Approved Permits</td><td>' + 
              approved.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 
              '</td></tr><tr><td>Pending Permits</td><td>' + 
              pending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 
              '</td></tr></tbody></table></div>';
      html += '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.s</p>'
      
  return html;
}

function displayName(elem) {
  var county = $(elem);
  var hed = $('.panel-hed');

  hed.html('<span>' + county.attr('data-name') + ' County</span>');
  //var hedHeight = hed.outerHeight();

  $('.info-panel').addClass('topper');
  $('.panel-expanded').html(panelInfo(elem));
}

function expandPanel(elem) {
  var $this = $(elem),
      $parent = $this.parent(),
      $expanded = $('.panel-expanded'),
      canvasHeight = $('#map-container').outerHeight(),
      hedHeight = $this.outerHeight(),
      expandedHeight = $expanded.outerHeight(),
      panelHeight = hedHeight + expandedHeight,
      panelPercent = (panelHeight/canvasHeight)*100;

  $parent.toggleClass('expanded');

  if ($parent.hasClass('expanded')){
    if (panelPercent > 100){
      $parent.css({
        'top':0,
        'height':'100%'
      });
      $expanded.css({
        'height': 100-(hedHeight/canvasHeight*100) + '%',
        'overflow': 'auto'
      })
    } else {      
      $parent.css({
        'top':100-panelPercent + '%',
        'height':panelPercent + '%'
      });
    }
    setTimeout(function() { 
      $expanded.attr('tabindex', -1).focus();
    }, 500); //wait for the CSS transition to complete before focusing on the content
  } else {
    $parent.removeAttr('style');
    $expanded.removeAttr('style');
    $expanded.blur();
    $(lastFocused).focus();
  }
}

function hidePanel(){
  $('.info-panel').removeClass('topper').removeClass('expanded').removeAttr('style');
  $(lastFocused).focus();
}

$('.panel-hed').click(function(){
  expandPanel(this);  
});

/* Display the top-level information for the selection on focus */
var lastFocused = $('.cir-county')[0];
$('.cir-county').focus(function(){
  deselectPath(); 
  var $this = $(this);
  var county = $this.attr('data-name') + ' County';
  $this.attr('title', county);
  displayName(this);
  lastFocused = this;
});


/* Expand (slide up) the panel with the 'enter' key on a selected path */
$('.cir-county').keydown(function(e){ 
  var code = e.which;
  // 13 = Return
  if (code === 13) {
    var panel = $('.panel-hed');
    expandPanel(panel);
    $(e.target).unbind('keydown');
  }
});

/* Remove focus from the expanded panel to return focus to the previous path selection */
$('.panel-expanded').keydown(function(e){ 
  var code = (e.keyCode ? e.keyCode : e.which);
  // 13 = Return
  if (code === 13) {
    var panel = $('.panel-hed');
    hidePanel(panel);
  }
});


$('#map-container:not(.cir-county), svg:not(.cir-county)').click(function(e){
  if (e.target !== this) {
    return;
  }

  $('.info-panel').removeClass('topper').removeClass('expanded').removeAttr('style');

  $('#cir-map-select').val("Select a county");
  var info = document.getElementById("cir-map-info");
  info.innerHTML = "";
  deselectPath();
});

$('body').keydown(function(e){ 
  var active = document.activeElement;
});