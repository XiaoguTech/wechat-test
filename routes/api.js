var express = require('express');
var router = express.Router();
// validate the permalink
router.post('/api/newAlert', function(req, res){
    res.status(200).json({message: req});
    return;
});

module.exports = router;