var bodyParser=require('body-parser');
var express = require('express');
var fs=require('fs');
var util = require('util');
var querystring=require('querystring');
var router = express.Router();
var http = require('http');



router.get('/', function(req, res, next) {
  res.render('index', { title: '首页',user: req.session.user });
});


// router.get('/login', function (req, res){
//   res.render('login', {
//   	title: '登录'
//   });
// });

// router.post('/login_action', function (req, res){
// 	res.redirect('/metric');
// });

router.get('/login',function(req,res){
  console.log("login...");
  var openid=req.query.openid;
  console.log(openid);        
  var openExist=false;
  if(req.session.user!=null){
    res.redirect('/');
  }
  else{
    if(openid!=undefined){
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
    else{
      res.render('login');      
    }

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
        if(openid!=undefined){
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
          console.log("Bind and login");
        }else{
          status=200;
          req.session.user=uname;
          console.log("Login but not bind")
        }
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
