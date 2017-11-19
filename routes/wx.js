var async=require('async');
var express = require('express');
var fs=require('fs');
var http=require('http');
var https=require('https');
var qs=require('querystring');
var rawBody=require('raw-body');
var sha1=require('sha1');
var utils=require('utils');
var xml2js=require('xml2js');

var router = express.Router();

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
    }else {
        res.send(200, 'fail');
    }
});

router.post('/',async function(req,res,next){
    await checkAccessToken();
    var text="";
    var buf="";
    var midObject={};
    req.setEncoding('utf8');
    //二进制转 xml
    req.on('data', function(chunk){ 
        buf += chunk;
        // xml2js 默认将子节点的值变为数组，将 explicitArray 设为 false 即可
        xml2js.parseString(buf,{explicitArray : false},function(err, json) {
            midObject.err=err;
            midObject.json=json;
        });
        if(midObject.err){
            throw midObject.err;
        }else{
            var createTime = new Date().getTime();   
            console.log(midObject.json);         
            if(midObject.json.xml.MsgType === 'event'){
                if(midObject.json.xml.Event === 'subscribe'){
                    text=text+'<xml>'+
                    '<ToUserName><![CDATA['+ midObject.json.xml.FromUserName +']]></ToUserName>'+
                    '<FromUserName><![CDATA['+ midObject.json.xml.ToUserName +']]></FromUserName>'+
                    '<CreateTime>'+createTime+'</CreateTime>'+
                    '<MsgType><![CDATA[text]]></MsgType>'+
                    '<Content><![CDATA[终于等到你，还好我没放弃]]></Content>'+
                    '</xml>';
                }
              }
              else if(midObject.json.xml.MsgType === 'text'){
                text=text+'<xml>'+
                '<ToUserName><![CDATA['+ midObject.json.xml.FromUserName +']]></ToUserName>'+
                '<FromUserName><![CDATA['+ midObject.json.xml.ToUserName +']]></FromUserName>'+
                '<CreateTime>'+createTime+'</CreateTime>'+
                '<MsgType><![CDATA[text]]></MsgType>'+
                '<Content><![CDATA[您好，你的Openid是'+midObject.json.xml.FromUserName+']]></Content>'+
                '</xml>';
              }

            // handleMessage(midObject.json.xml,res);            
        }
    });
    req.on('end', function(chunk){ 
        res.status(200);
        res.contentType('application/xml');
        res.send(text);
    });
});


//验证微信签名
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
    }else{
        return false;
    }
}

//检查 access_token 是否过期，过期则更新
function checkAccessToken(){
    fs.readFile('./data/access_token.db',function(err,data){
        if(err){
            throw err;
        }
        var jsonObj=JSON.parse(data);
        var current_time=new Date();
        var update_time=new Date(jsonObj.update_time);
        //距离上次更新 access_token 已经过去 7000
        if((current_time-update_time)>7000000){
            console.log("Access_token need to be updated");
            getAccessToken();            
        }
    });
}


//获取 access_token
function getAccessToken(){
    var url="https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+config.wechat.appID+"&secret="+config.wechat.appSecret;
    https.get(url, function(res) {
        res.on('data',function(d){
            // process.stdout.write(d);            
            try{
                data=JSON.parse(d);
                if(data.access_token!=undefined){
                    console.log("Got a new access_token: "+data.access_token);
                    updateAccessToken(data.access_token);
                }else{
                    console.log("Fail to get a new access_token!");
                }
            }catch(e){
                console.log("An error happen when the services try to format a response for getting a new access_token");
            }
        })
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

//更新 access_token 文件
function updateAccessToken(access_token){
    var date=new Date();
    var obj={};
    obj.access_token=access_token;
    obj.update_time=date;
    fs.writeFile('./data/access_token.db',JSON.stringify(obj),function(err){
        if(err){
            throw err;
        }
        console.log("A new access_token is saved");
    });
}

// function handleMessage(message,res){
//     if(message.MsgType==='event'){
//         if(message.Event === 'subscribe'){
//             var createTime = new Date().getTime();
//             res.status = 200;
//             res.set()
//             that.type = 'application/xml';
//             return;
//           }
//     }
// }
module.exports = router;



  