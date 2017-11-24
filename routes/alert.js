var express = require('express');
var util = require('util');
var router = express.Router();
var fs=require('fs');

/* GET alert page. */
router.get('/', function(req, res, next) {
  var orgID=req.session.user;
  var db = req.app.db;  
  if(req.session.user!=null){
    res.render('alert', { title: '报警信息',user: req.session.user});
  }else{
    res.redirect('/login');     
  }
});

router.get('/refresh',function(req,res){
  var orgID=req.session.user;
  var db = req.app.db;  
  db.alerts.find({"orgID":orgID},function(err,data){
    if(data.length){
      var alertObject={};
      var jsonObj=data[0];
      var alertArray=jsonObj["alertArray"];
      var latestTime=alertArray[0].time;
      var latestMessage=alertArray[0].message;
      for(var obj in alertArray){
        var time=new Date(alertArray[obj].time);
        var showTime=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
        alertArray[obj].time=showTime;
      }
    }
    var formatTime=alertArray[0].time;
    alertObject.alertArray=alertArray;
    alertObject.latestTime=latestTime;
    alertObject.latestMessage=latestMessage;
    alertObject.formatTime=formatTime;
    res.send(alertObject);
  });    

});
/*
return size from timestamp:intenger
 */
router.get('/getNewNum',function(req,res){
  var dTimeStamp = req.query.timestamp;
  var sOrgID = req.session.user;
  var db = req.app.db.alerts;
  db.findOne({"orgID":sOrgID},function(err,result){
    if(result == null){
      // not found orgID
      return res.status(200).json({
        message:"not found your orgID",
        orgID:sOrgID
      });
    }else{
      var aAlert = result.alertArray;
      var iAlertIndex = aAlert.findIndex(function(element){
        return element.time <= dTimeStamp;
      });
      // not found 
      if(iAlertIndex === -1){
        return res.status(200).json({message:"not found"});
      }else{
      // found
        return res.status(200).json({iNewNum:iAlertIndex});
      }
    }
  });
});
module.exports = router;
