var http = require('http');
var util = require('util');
var express = require('express');
var fs=require('fs');
var querystring=require('querystring');
var router = express.Router();
var session = require('express-session');
var filestore=require('session-file-store')(session);
var bodyParser=require('body-parser');

//session
router.use(session({
  secret: 'BrokenArrow',
  resave: false,
  saveUninitialized:false,
  store:new filestore(),
  cookie:{
    maxAge:10*1000
  }
}));

router.use(function (req, res, next) {
  if (!req.session.user) {
    req.session.user = null;
  } 
  next();
})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login',function(req,res){
  var openid=req.query.openid;
  var openExist=false;
  if(req.session.user!=null){
    res.redirect('/');
  }
  else{
    fs.readFile('./data/openid.db',function(err,data){
      if(err){
        throw err;
      }
      var jsonObj=JSON.parse(data);
      var openList=jsonObj["open"];
      for(var obj in openList){
        if(openList[obj].openid==openid){
          req.session.user=openList[obj].username;
          openExist=true;
          break;
        }
      }
      if(openExist){
        res.redirect('/');
      }
      else{
        res.render('login',{ title: 'Express'});    
      }
    });
  }
});

router.post('/checkLogin',function(req,res){
  var uname=req.body['username'];
  var pwd=req.body['password'];
  fs.readFile('./data/user.db',function(err,data){
    var status=400;    
    if(err){
      throw err;
    }
    var jsonObj=JSON.parse(data);
    var userList=jsonObj["user"];
    for(var obj in userList){
      if(userList[obj].username==uname && userList[obj].password==pwd){
        status=200;
        req.session.user=uname;
        break;
      }
    }
    res.status(status);
    res.end();
  });
});

router.get('/logout',function(req,res){
  req.session.user=null;
  res.redirect('/');
});

module.exports = router;
