var express = require('express');
var util = require("util")
var router = express.Router();
// alert test
router.post('/testAlert', function(req, res){
		console.log(util.inspect(req,{depth:null}));
    res.end();
    return;
});

module.exports = router;