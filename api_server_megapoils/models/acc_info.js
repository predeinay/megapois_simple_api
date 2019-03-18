const db = require("../dbcon");

module.exports = (params, cb = () => {}) => {
    
    console.log(`acc_info : ${params.getParams[2]}`);

    db.exec("select * from dbo.acc_info(@account_num)", 
        [ { name : "account_num", value : params.getParams[2] } ],  (err, rowCount, rows) => {
        cb( err ? err : (rows[0] ? null : "Account not found"), rows ? rows[0] : null );
    }); 

}