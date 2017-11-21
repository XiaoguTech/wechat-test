var express = require('express');
var router = express.Router();

/* GET alert page. */
router.get('/', function(req, res, next) {
  if(req.session.user!=null){
    res.render('metric', { title: 'alert' });    
  }else{
    res.redirect('/login');     
  }
});

module.exports = router;
