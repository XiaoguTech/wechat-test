var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var session = require('express-session');
var filestore=require('session-file-store')(session);
var Nedb = require('nedb');
var common = require('./data/common');
var index = require('./routes/index');
var users = require('./routes/users');
var alertIndex = require('./routes/alert.js');
var metricIndex = require('./routes/metric.js');
var wx=require('./routes/wx')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//session
app.use(session({
  secret: 'BrokenArrow',
  resave: false,
  saveUninitialized:true,
  store:new filestore(),
  cookie:{
    maxAge:1000*60*60 
  }
}));

app.use(function (req, res, next) {
  if (!req.session.user) {
    req.session.user = null;
    req.session.openid=null;
  } 
  next();
})

var hbs = require("hbs");
hbs.registerPartials(__dirname+"/views/partial/");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/alert', alertIndex);
app.use('/metric', metricIndex);
app.use('/wx',wx);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// Using Nedb
// setup the db's
var db = new Nedb();
db = {};
db.users = new Nedb({filename: path.join(__dirname, '/data/users.db'), autoload: true});
db.categorys = new Nedb({filename: path.join(__dirname, '/data/categorys.db'), autoload: true});
// add db to app for routes
app.db = db;



module.exports = app;
