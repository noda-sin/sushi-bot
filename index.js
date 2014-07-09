var util    = require('util')

var config  = require('config')
  , Twitter = require('twit')
  , Bitly   = require('bitly')

var eventService = require('event-service');

var KEYWORDS = [ 'ヒカリエ', 'dena' ]
  , SUSHI    = '🍣';

var postEventToTwitter = function(event, callback) {

  var twitter = new Twitter(config.twitter)
    , bitly   = new Bitly(config.bitly.user_name, config.bitly.api_key);

  var eventToString = function(event, callback) {
    bitly.shorten(event.event_url, function(err, res) {
      var url;
      if (err) {
        url = event.event_url;  
      } else {
        url = res.data.url;
      }
      callback(SUSHI + ' が食えるぞ！急ぐのじゃ！' + '[' + event.title  + '] ' + url);
    });
  };

  eventToString(event, function(eventString) {
    twitter.post('statuses/update', { status: eventString }, callback);
  });
};

(function run() {
  eventService(KEYWORDS, function(err, events) {
    console.log(events);
    if (err) {
      console.error(err);
      return;
    }
    events.forEach(function(event) {
      postEventToTwitter(event, function(err) {
        if (err) {
          console.error(err);
        }
      });
    });
  });
})();