var express = require('express');
var path = require('path');
var fs = require('fs');
var util = require("util")
var router = express.Router();
var common = require('../data/common');


// get all alert info 
router.get('/',function(req,res){
	var db = req.app.db;
	db.alerts.find({},function(err,docs){
	  res.send(util.inspect(docs,{depth:null}));
	})
});


// alert test post req.body
router.post('/test', function(req, res){
	var alertContents = req.body.series;
	// get an alert info,including: orgId,alertId,time,isRead,message,value
	var alertQuery = {};
	for(var i in alertContents){
		alertQuery.orgID = alertContents[i].tags.metric;
		alertQuery.alertID = alertContents[i].tags.alertID;
		alertQuery.time = alertContents[i].values[0][0];
		alertQuery.isRead = false;
		alertQuery.message = alertContents[i].values[0][2];
		alertQuery.value   = alertContents[i].values[0][3];
	}
	// db manupulation: alerts
	var db = req.app.db.alerts;
	if(db == false){
		res.end();
		return ;
	}
	common.dbQuery(db,{"orgID":alertQuery.orgID},null,null,(err, org)=>{
		if(org == false){
			console.log("在数据库中没找到对应的orgID,插入一条orgID及其alertIDArray");
			// define a record
			var orgObj = {};
			orgObj.orgID = alertQuery.orgID;
			var orgObjAlertIDArray = [],
			orgObjAlertIDArrayObj = {},
			orgObjAlertIDArrayObjArray = [],
			orgObjAlertIDArrayObjArrayObj = {};
			orgObjAlertIDArrayObj.alertID = alertQuery.alertID;
			orgObjAlertIDArrayObjArrayObj.time = alertQuery.time;
			orgObjAlertIDArrayObjArrayObj.isRead = alertQuery.isRead;
			orgObjAlertIDArrayObjArrayObj.message = alertQuery.message;
			orgObjAlertIDArrayObjArrayObj.value   = alertQuery.value;
			orgObjAlertIDArrayObjArray.push(orgObjAlertIDArrayObjArrayObj);
			orgObjAlertIDArrayObj.alertArray = orgObjAlertIDArrayObjArray;
			orgObjAlertIDArray.push(orgObjAlertIDArrayObj);
			orgObj.alertIDArray = orgObjAlertIDArray;
			// insert a record
			db.insert((orgObj), (err, ret) => {});
			res.send(util.inspect(orgObj,{depth:null}));
			return ;
		}else{
			console.log("找到对应的orgID");
			var changeFlag = false;
			var alertIDArray = org[0].alertIDArray;
			var alertIDArrayIndex = alertIDArray.findIndex(function(element){
				return element.alertID === alertQuery.alertID;
			});
			if(alertIDArrayIndex === -1){
				console.log("没有找到对应的alertID规则,新增报警规则");
				var newAlertIdobj = {};
				newAlertIdobj.alertID = alertQuery.alertID;
				// add new alertobj array
				var newObjArray=[];
				var newObj = {};
				newObj.time = alertQuery.time;
				newObj.isRead = alertQuery.isRead;
				newObj.message = alertQuery.message;
				newObj.value = alertQuery.value;
				newObjArray.push(newObj);
				newAlertIdobj.alertArray = newObjArray;
				// make change in org[0] record
				org[0].alertIDArray.push(newAlertIdobj);
				// sort rule list using alertID
				org[0].alertIDArray.sort(function(a,b){
					var aAlert = a.alertID.toUpperCase();
					var bAlert = b.alertID.toUpperCase();
					return aAlert<bAlert?-1:1;
				});
				changeFlag = true;
			}else{
				console.log("找到对应的alertID规则");
				var alertArray = alertIDArray[alertIDArrayIndex].alertArray;
				var alertArrayIndex = alertArray.findIndex(function(element){
					return element.time === alertQuery.time;
				});
				if(alertArrayIndex === -1){
					console.log("没有找到相同时间的报警序列");
					if(alertArray.length>=100){
						org[0].alertIDArray[i].alertArray.pop();
					}
					var newObj = {};
					newObj.time = alertQuery.time;
					newObj.isRead = alertQuery.isRead;
					newObj.message = alertQuery.message;
					newObj.value = alertQuery.value;
					org[0].alertIDArray[alertIDArrayIndex].alertArray.unshift(newObj);
					// org[0].alertIDArray[i].alertArray.sort(function(a,b){
					// 	return a.time<b.time?1:-1;
					// });
					changeFlag = true;
				}else{
					console.log("找到相同的时间的报警序列");
					changeFlag =false;
				}
			}
			if (changeFlag === true) {
				db.remove({"orgID":alertQuery.orgID}, {}, function (err, numRemoved) {});
				db.insert((org[0]), (err, ret) => {});
			}
		}
		res.send(util.inspect(org[0],{depth:null}));
		return ;
	});
});

// alert test get req.query
router.get('/test', function(req, res){
	var db = req.app.db;
	db.alerts.insert((req.query), (err, ret) => {});
	console.log(util.inspect(req.query,{depth:null}));
	res.send(util.inspect(req.query,{depth:null}));
});

module.exports = router;