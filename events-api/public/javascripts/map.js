define(
    ['jquery', 'spotlight'],
    function($, Spotlight) {

  var width = $("#map").width(), height = $("#map").height();
  var origin_lat = -31.937487, origin_lng = 115.841517
  var end_lat = -31.97317, end_lng = 115.880442;
  var lat_width = Math.abs(end_lat - origin_lat), lng_height = Math.abs(end_lng - origin_lng);

  var to_cartesian = function(coords) {
    return {
      x: (Math.abs(end_lat - coords.lat) / lat_width) * width,
      y: (Math.abs(end_lng - coords.lng) / lng_height) * height
    };
  };

  var events = [];
  var spotlights = [];
  var spotlightInterval = 5000;

  var create = function(locatableEvents, spotlightIntervalArg) {
    events = locatableEvents;
    if (spotlightIntervalArg) {
      spotlightInterval = spotlightIntervalArg;
    }
    draw();
  };

  var addEvent = function(event) {
    events.push(event);
    // TODO: Drop off once we hit a certain size (ensure we don't drop off an event this is currently spotlighted
  };

  var draw = function() {
    events.forEach(function(event) {
      drawPin(event);
    });

    setInterval(function(){
      moveSpotlight();
    }, spotlightInterval);
  };

  var drawPin = function(event) {
    var pin = $('<div>o</div>');
    $('#map').append(pin);

    var coords = to_cartesian(event.coordinates);
    console.log(coords);
    pin.css('position', 'absolute');
    pin.css('top', coords.y + 'px');
    pin.css('left', coords.x + 'px');
    pin.css('color', '#fff');
  };

  var moveSpotlight = function() {
    var event = chooseNextEventToSpotlight();
    if(spotlights.length > 0)
      spotlights.pop().die();
    createSpotlight(event);
  };

  var chooseNextEventToSpotlight = function() {
    // TODO: Don't spotlight any of the last ten spotlights.
    return events[Math.floor(Math.random() * events.length)];
  };

  var createSpotlight = function(event) {
    var spotlight = new Spotlight(event, to_cartesian(event.coordinates));
    spotlights.push(spotlight);
    spotlight.shineOnYouCrazyDiamond();
  };

  return {
    addEvent: addEvent,
    create: create
  };
});
