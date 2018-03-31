/**
 * Created by 박상만 on 2017-02-27.
 */

var config = require('config-json');//('../appcfg.json');
var mysql   = require('mysql')

//var connectionpool=null;

var OpenProjectDB = {
    Init:function () {
        if(!this.connectionpool){
            config.load('appcfg.json');
            this.connectionpool=mysql.createPool({
                host     : config.get("DB","HOST"),
                port : config.get("DB","PORT"),
                user     : config.get("DB","USER"),
                password : config.get("DB","PW"),
                database : config.get("DB","DB")
            });
            console.log("Create DbConnection Pool")
        }
    },

    runQuery : function(id,sql,callback) {
        if(!this.connectionpool){
            config.load('appcfg.json');
            this.connectionpool=mysql.createPool({
                host     : config.get("DB","HOST"),
                port : config.get("DB","PORT"),
                user     : config.get("DB","USER"),
                password : config.get("DB","PW"),
                database : config.get("DB","DB")
            });
            return;
        }

        try{
            this.connectionpool.getConnection(function (err, connection) {
                if (err) {
                    console.error('CONNECTION error: ', err);
                    callback({
                        errMsg: 'connect error',
                        err: err.code
                    });
                } else {
                    try {
                        try{
                            connection.query(sql, function (err, rows, fields) {
                                if (err) {
                                    console.error(err);
                                    callback({
                                        errMsg: err
                                    });
                                }
                                else {
                                    callback({
                                        errMsg:null,
                                        fields: fields,
                                        rows: rows,
                                        rowsLength: rows.length,
                                        id: id
                                    });
                                }
                            });
                        }
                        finally {
                            connection.release();
                        }
                    } catch (e) {
                        callback({
                            errMsg:"Exception more info err object",
                            result: 'error',
                            err: e
                        });
                    }
                }
            });

        }catch (e){
            callback({
                errMsg:"Exception more info err object",
                result: 'error',
                err: e
            });
        }
    }
}

module.exports = OpenProjectDB;

