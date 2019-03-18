const db = require("../dbcon");

module.exports = (params, cb = () => {}) => {
    
    console.log(`acc_transaction : ${params.getParams[2]}`);

    db.exec("select * from dbo.acc_transaction(@account_num)", 
        [ { name : "account_num", value : params.getParams[2] } ],  (err, rowCount, rows) => {
        cb(err,rows);
    }); 

}