var express = require('express');
var router = express.Router();
var sha=require('sha1');

var config={
    wechat:{
      appID:'wxdb3fd49799fafa0f',
      appSecret:'22d4ef99ea1984a33b44d18ee90f9d0a',
      token:'xiaogu'
    }
}

//GET 方法用于验证是否为微信服务器发起的请求
router.get('/', function(req, res, next) {
    if (checkSignature(req)) {
        res.send(200, req.query.echostr);
    } else {
        res.send(200, 'fail');
    }
});

router.post('/',function(req,res,next){
    //日志
    console.log(req.body);    
    res.on('data',function(chunk){
      console.log(chunk);
    });
    res.end('Hello World');
});

function checkSignature(req){
    var token=config.wechat.token;
    var signature=req.query.signature;
    var nonce=req.query.nonce;
    var timestamp=req.query.timestamp;
    var echostr=req.query.echostr;
    //按字典排序，拼接字符串
    var str=[token,timestamp,nonce].sort().join('');
    //字符串加密
    var sha=sha1(str);
    if(sha===signature){
        return true;
    }
    else{
        return false;
    }
}

module.exports = router;



  