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
	}
	common.dbQuery(db,{"orgID":alertQuery.orgID},null,null,(err, org)=>{
		if(org == false){
			console.log("没找到,插入一条");
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
		}else{
			console.log("找到组织");
			var sameFlag = false;//判断是否有相同规则
			var changeFlag =false;//判断是否对org[0]做修改
			for(var i in org[0].alertIDArray){
				var IdObj = org[0].alertIDArray[i];
				// 具有相同规则的alert,只需要push alertArray
				if(IdObj.alertID == alertQuery.alertID){
					// console.log("找到相同alertID");
					// 处理报警内容中的时间是否相同
					if(IdObj.alertArray[i].time == alertQuery.time){
						console.log("时间相同不更新");
						sameFlag = true;
						break;
					}
					// 针对大于100的情况进行处理
					if(IdObj.alertArray.length >100){
						console.log("alertID数组大于100");
					}
					// 插入记录，更新临时记录org
					console.log("alertID数组插入一条数据");
					var newObj = {};
					newObj.time = alertQuery.time;
					newObj.isRead = alertQuery.isRead;
					newObj.message = alertQuery.message;
					newObj.value = alertQuery.value;
					org[0].alertIDArray[i].alertArray.push(newObj);
					sameFlag = true;
					changeFlag = true;
					break;
				}
			}
			// 该组织下没有这个报警规则，插入新的报警规则及其内容
			if(sameFlag == false){
				// 没有报警
				console.log("新增报警规则");
				var newAlertIdobj = {};
				newAlertIdobj.alertID = alertQuery.alertID;
				var newObjArray=[],newObj = {};
				newObj.time = alertQuery.time;
				newObj.isRead = alertQuery.isRead;
				newObj.message = alertQuery.message;
				newObj.value = alertQuery.value;
				newObjArray.push(newObj);
				newAlertIdobj.alertArray = newObjArray;
				org[0].alertIDArray.push(newAlertIdobj);
				changeFlag = true;
			}
			// 直接修改org，最终根据orgID查询到对应记录，更新数据库
			if(changeFlag == true){
				db.remove({"orgID":alertQuery.orgID}, {}, function (err, numRemoved) {});
				db.insert((org[0]), (err, ret) => {});
			}
			res.send(util.inspect(org[0],{depth:null}));
		}
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