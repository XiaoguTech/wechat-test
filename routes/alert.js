var express = require('express');
var util = require('util');
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
        alertIDArray[obj].notreadLength=count;
        alertIDArray[obj].ReadLength=alertIDArray[obj].alertArray.length-count;
      }
      res.render('alert', { title: '报警信息',user: req.session.user,alertIDArray:alertIDArray});    
    });    
  }else{
    res.redirect('/login');     
  }
});
/*
只有数据库中有当前orgID的数据时才能进行操作
 */
router.get('/setstate',function(req,res){
  var timeStamp = req.query.timestamp;
  var alertId = req.query.alertid;
  var isRead = req.query.isread;
  var db = req.app.db.alerts;
  var orgId = req.session.user;
  // 通过user即orgID找到数据库中的对应内容,目前先修改result内容，然后最终将result写入数据库中
  db.findOne({"orgID":orgId},function(err,result){
    if(result == null){
      // 没有找到
      return res.status(200).json({
        message:"not found orgID",
        orgID:orgId
      });
    }else{
      // 找到
      var alertIDArray = result.alertIDArray;
      var alertIDArrayIndex = alertIDArray.findIndex(function(element){
        return element.alertID === alertId;
      });
      if(alertIDArrayIndex === -1){
        // 没有找到
        return res.status(200).json({message:"没有找到"});
      }else{
        // 找到
        var alertArray = alertIDArray[alertIDArrayIndex].alertArray;
        var alertArrayIndex = alertArray.findIndex(function(element){
          return element.time <= timeStamp;
        });
        if (alertArrayIndex === -1){
          // 没找到
          return res.status(200).json({message:"没找到timestamp时间之前的警报"});
        }else{
          // 找到，将alertArrayIndex开始到alertArray.length的元素的isRead置为0
          for(var i = alertArrayIndex;i<alertArray.length;++i){
            result.alertIDArray[alertIDArrayIndex].alertArray[i].isRead = isRead;
          }
          db.remove({"orgID":orgId}, {}, function (err, numRemoved) {
          });
          db.insert(result, (err, ret) => {
          });
          res.status(200).json(result);
        }
      }
    }
  });
});
module.exports = router;
