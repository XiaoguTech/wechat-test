var express = require('express');
var path = require('path');
var fs = require('fs');
var util = require("util")
var router = express.Router();
var common = require('../data/common');
// alert test
router.post('/test', function(req, res){
		var db = req.app.db;
		db.alerts.insert((req.body), (err, ret) => {});
		console.log(util.inspect(req.body,{depth:null}));
    res.send(util.inspect(req.body,{depth:null}));
});
router.get('/test', function(req, res){
	var db = req.app.db;
	db.alerts.insert((req.query), (err, ret) => {});
	console.log(util.inspect(req.query,{depth:null}));
  res.send(util.inspect(req.query,{depth:null}));
});
module.exports = router;