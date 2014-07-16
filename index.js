var util     = require('util')
  , punycode = require('punycode');

var config  = require('config')
  , Twitter = require('twit')
  , Bitly   = require('bitly')

var eventService = require('event-service');

var KEYWORDS    = [ 'ヒカリエ' ]
  , SUSHI       = punycode.decode('9i8h')
  , PLACEFILTER = function(string) {

  var have = function(string, key) {
    return string.toLowerCase().indexOf(key) > -1;
  };

  return (have(string, 'ヒカリエ') || have(string, '東京都渋谷区渋谷2-21-1')) &&
         (have(string, 'dena')   || have(string, 'ディー・エヌ・エー'));
};

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
  eventService({
    keywords: KEYWORDS,
    placeFilter: PLACEFILTER
  }, function(err, events) {
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
