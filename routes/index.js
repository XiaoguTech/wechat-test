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
    req.session.openid=null;
  } 
  next();
})

router.get('/', function(req, res, next) {
  res.render('index', { user: req.session.user });
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
          req.session.openid=openList[obj].openid;
          openExist=true;
          break;
        }
      }
      if(openExist){
        res.redirect('/');
      }
      else{
        res.render('login',{ openid:openid});    
      }
    });
  }
});

router.post('/checkLogin',function(req,res){
  var uname=req.body['username'];
  var pwd=req.body['password'];
  var openid=req.body['openid'];
  fs.readFile('./data/user.db',function(err,data){
    var status=400;    
    if(err){
      throw err;
    }
    var jsonObj=JSON.parse(data);
    var userList=jsonObj["user"];
    for(var obj in userList){
      if(userList[obj].username==uname && userList[obj].token==pwd){
        fs.readFile('./data/openid.db',function(err,data){
          if(err){
            throw err;
          }
          var jsonObj=JSON.parse(data);
          var obj={};
          obj.username=uname;
          obj.openid=openid;
          jsonObj.open.push(obj);
          fs.writeFile('./data/openid.db',JSON.stringify(jsonObj),function(err){
            if(err){
                throw err;
            }
            console.log("A new openid is saved");
          });
        })
        status=200;
        req.session.user=uname;
        req.session.openid=openid;        
        break;
      }
    }
    res.status(status);
    res.end();
  });
});

router.get('/logout',function(req,res){
  if(req.session.openid!=null && req.session.openid!=""){
    fs.readFile('./data/openid.db',function(err,data){
      if(err){
        throw err;
      }
      var jsonObj=JSON.parse(data);
      var openList=jsonObj['open'];
      var num=-1;// 该用户在 openid 数据库的位置 
      for(var obj in openList){
        if(openList[obj].openid==req.session.openid){
          num=obj;
          break;
        }
      }
      if(num!=-1){
        openList.splice(num,1);
        jsonObj.open=openList;
        fs.writeFile('./data/openid.db',JSON.stringify(jsonObj),function(err){
          if(err){
              throw err;
          }
          console.log("An openid has been deleted");
        });
      }
      req.session.user=null;
      req.session.openid=null;  
      res.redirect('/');
    })
  }else{
    req.session.user=null;
    req.session.openid=null; 
    res.redirect('/');
  }


});

module.exports = router;
