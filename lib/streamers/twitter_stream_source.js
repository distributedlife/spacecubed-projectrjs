var moment = require('moment');
var NTwitter = require('ntwitter');

var twitter = new NTwitter({
  consumer_key: process.env.FIREHOSE_OAUTH_CONS_KEY,
  consumer_secret: process.env.FIREHOSE_OAUTH_CONS_SEC,
  access_token_key: process.env.FIREHOSE_OAUTH_TOKEN,
  access_token_secret: process.env.FIREHOSE_OAUTH_TOKEN_SEC
});

var unpack_coordinates = function(packed) {
  return {
    lng: packed.coordinates[0],
    lat: packed.coordinates[1]
  };
};

var map_tweet_to_event = function(tweet, then) {
  return {
    provider: 'Twitter',
    username: tweet.user.screen_name,
    name: tweet.user.name,
    profile_image: tweet.user.profile_image_url,
    text: tweet.text,
    at: tweet.created_at,
    coordinates: tweet.coordinates ? unpack_coordinates(tweet.coordinates) : null,
    place: tweet.place,
    recorded_at: moment().toDate()
  };
};

var log_error = function(data, err) {
  console.log("++ Twitter -- ERROR -- %s", err);
};
var log_data = function(endpoint, screen_name, text) {
  console.log("-- Twitter (%s) -- @%s: %s", endpoint, screen_name, text);
};

var valid = function(data) {
  return (data.user && data.text);
};

var insert_into_db = function(data, db, endpoint) {
  if (!valid(data)) {
    return;
  }

  log_data(endpoint, data.user.screen_name, data.text);

  db.collection('tweets', function(err, tweets_collection) {
    tweets_collection.insert(data);
  });
  db.collection('events', function(err, events_collection) {
    events_collection.insert(map_tweet_to_event(data));
  });
};

var start_streaming = function(db, endpoint, params) {
  twitter.stream(endpoint, params, function(stream) {
    stream.on('error', log_error);
    stream.on('data', function(data) {
      insert_into_db(data, db, endpoint);
    });
  });
};

exports.track_current_user = function(db, terms) {
  start_streaming(db, 'user', { 'with': 'followings', 'track': terms });
};
