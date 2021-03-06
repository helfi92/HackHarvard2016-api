var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var db = require('./models/db');

//------------- Austin Code -------------
var Twitter     = require('twitter-node-client').Twitter;
var methods     = require('./routes/twitter-methods');
var request = require('request');
//---------------------------------------

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'bigly', cookie: { maxAge: 60000 }}));

var verifyUser = function (req, res, next) {
  console.log('session: ' + req.session.loggedIn);
  if (req.session.loggedIn) {
    console.log('user is logged in');
    next();
  } else {
    res.send('show login form');
  }
};

app.use('/', routes);
app.use('/users', verifyUser, users);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




//(function(){

    var client = new Twitter({
        consumerKey: 'XzA3f2YJ6Xa3AwpzdOIq5SGkD',
        consumerSecret: 'T4frvemszEPap3Qg4KbHd1zdMcFu1Z3UGRg0Iq8qnukxJQpYvT',
        accessToken: '3711303135-bCQUDfVCIVidYGYPztWI7ZROZfooGvgQsjqHWHs',
        accessTokenSecret: 'ghYuEx8gLF06XuaH6vp6sDFTiP1oJ6sP1otRGQbjy2BFc'
    });

    var twitterAPICall = function(methodObj) {
        return function(req, res) {
            var params = req.query,
                callback = params.callback,
                method = methodObj.method,
                resource = methodObj.resource,
                data = {};

                delete params.callback;
                params.q = decodeURIComponent(params.q);

            if (Object.keys(req.params).length === 1) {
                if (typeof req.params.id !== 'undefined') {
                    resource = resource.replace(/:id/, req.params.id);
                }

                if (typeof req.params.slug !== 'undefined') {
                    resource = resource.replace(/:slug/, req.params.slug);
                }
            }

            client.getCustomApiCall('/' + resource + '.json', params, function(error, response, body) {
                res.status(response.statusCode).send({
                    "error": response.statusMessage
                });
            }, function(data) {
                data = JSON.parse(data);
                var twitter_data = {
                  tweets: [],
                  sentiment: ''
                };
                var myPromises = [];
                var num_statuses = data.statuses.length
                for (i=0; i<num_statuses; i++) {
                  //sentiment_val = getSentiment(tweet_text);
                  twitter_data.tweets.push({
                    date: data.statuses[i].created_at,
                    profile_img: data.statuses[i].user.profile_image_url,
                    user_name: data.statuses[i].user.name,
                    text: data.statuses[i].text
                  })

                  clean_text = encodeURIComponent(data['statuses'][i]['text']);
                  console.log('tweets: ' + clean_text);

                  myPromises[i] = new Promise(function(resolve, reject) {
                    request('https://api.havenondemand.com/1/api/sync/analyzesentiment/v2?text=' +
                      clean_text + '&apikey=a9be8e20-a1c5-4d33-868f-d88fa374481b',
                        function (error, response, body) {
                          //Check for error
                          if(error){
                              reject(err);
                              return console.log('Error:', error);
                          }
                          //Check for right status code
                          if(response.statusCode !== 200){
                              return console.log('Invalid Status Code Returned:', response.statusCode);
                          }

                          agg_data = JSON.parse(body).sentiment_analysis[0]['aggregate'];
                          console.log(agg_data)
                          agg_score = agg_data['score']
                          console.log('agg score' + agg_score)

                          resolve(agg_score);
                    });
                  });
                }

                var total_score = 0;
                Promise.all(myPromises).then(function(values) {
                  console.log('result' + values);
                  var total = values.reduce(function(prev, curr) {
                    return prev + curr;
                  });
                  total = total/num_statuses;
                  console.log('total: ', total);
                  twitter_data.sentiment = total;
                  res.set('Content-Type', 'application/json')
                  res.send(callback + '(' + JSON.stringify(twitter_data) + ');');
                }, function(reason) {
                  console.log(reason);
                });

            });

        }
    }

    for (var i in methods) {
        if (methods[i].method === 'GET') {
            app.get('/' + methods[i].resource, twitterAPICall(methods[i]));
        } else if (methods[i].method === 'POST') {
            app.post('/' + methods[i].resource, twitterAPICall(methods[i]));
        }
    }

    var server = app.listen(process.env.PORT || 8081, function() {
        var host = server.address().address,
            port = server.address().port;

            console.log("Twitter API app listening at http://%s:%s", host, port);
    });
//})();




module.exports = app;
