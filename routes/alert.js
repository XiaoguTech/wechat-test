var express = require('express');
var router = express.Router();
var fs=require('fs');

/* GET alert page. */
router.get('/', function(req, res, next) {
  var orgID="test";
  var db = req.app.db;  
  if(req.session.user!=null){
    db.alerts.find({"orgID":orgID},function(err,data){
      var jsonObj=data[0];
      var alertIDArray=jsonObj["alertIDArray"];
      for(var obj in alertIDArray){
        var count=0;
        for(var item in alertIDArray[obj].alertArray){
          if(alertIDArray[obj].alertArray[item].isRead==false){
            count++;
          }
        }
        alertIDArray[obj].length=count;
      }
      res.render('alert', { title: 'alert',user: req.session.user,alertIDArray:alertIDArray});    
    });    
  }else{
    res.redirect('/login');     
  }
});

module.exports = router;
