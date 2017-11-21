var path = require('path');
var fs = require('fs');
var express = require('express');
var router = express.Router();


	// 读取json文件
var dataFile = path.join(__dirname, '..', 'data', 'url.json');
var rawData = fs.readFileSync(dataFile, 'utf8');
var loadedURL = JSON.parse(rawData);


/* GET metric page. */
router.get('/', function(req, res) {
  if(req.session.user!=null){
      // console.log(loadedURL.metric);
    res.render('metric', {
      title: '图表显示',
      result: loadedURL.metric,
      normalMenu: loadedURL.normalMenu,
      alertMenu: loadedURL.alertMenu,
      user: req.session.user
    });
  }
  else{
    res.redirect('/login'); 
  }
});
// /metric/normal/:id
router.get('/monitor/:id', function(req, res) {
  if(req.session.user!=null){
      var categoryId = req.params.id-1;
      res.render('metric', {
        title: '监控'+(categoryId+1)+'显示',
        result: loadedURL.normalMenu[categoryId].metric,
        normalMenu: loadedURL.normalMenu,
        alertMenu: loadedURL.alertMenu,
        user: req.session.user
      });
      // res.send(loadedURL.normalMenu[categoryId].metric);
  }else{
    res.redirect('/login');     
  }

});
// alert
router.get('/alert/:id', function(req, res) {
  if(req.session.user!=null){
    var categoryId = req.params.id-1;
    res.render('metric', {
      title: '报警'+(categoryId+1)+'显示',
      result: loadedURL.alertMenu[categoryId].metric,
      normalMenu: loadedURL.normalMenu,
      alertMenu: loadedURL.alertMenu,
      user: req.session.user
    });
  }else{
    res.redirect('/login');     
    
  }
});

module.exports = router;
