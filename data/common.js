var path = require('path');
var fs = require('fs');

// 查询
exports.dbQuery = function (db, query, sort, limit, callback){
    if(sort && limit){
        db.find(query).sort(sort).limit(parseInt(limit)).exec(function (err, results){
            callback(null, results);
        });
    }else{
        db.find(query).exec(function (err, results){
            callback(null, results);
        });
    }
};
/*
db.kb.update({_id: common.getId(req.body.doc_id)}, {$inc: {kb_votes: vote}}, function (err, numReplaced){
    // insert session id into table to stop muli-voters
    db.votes.insert({doc_id: req.body.doc_id, session_id: req.sessionID}, function (err, newDoc){
        res.writeHead(200, {'Content-Type': 'application/text'});
        res.end('Vote successful');
    });
});
*/


