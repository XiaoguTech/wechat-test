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


