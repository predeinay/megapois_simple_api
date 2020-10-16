const db = require("../dbcon");

module.exports = (params, cb = () => {}) => {
  let details = 0

  db.exec(`select * from dbo.acc_transaction(@account_num)`,
  [ { name : "account_num", value : params.getParams[2] } ], (err, rowCount, transactions) => {
    if (!err) {
      for (const transaction of transactions) {
        if (transaction.pay_amount != 0) continue;

        const queryParams = [
          { name: "account_num", value: transaction.account_num },
          { name: "month", value: new Date(transaction.trans_date).toISOString() }
        ]
        db.exec(`select * from dbo.acc_transaction_detail(@account_num, @month)`, queryParams, (err, rowCount, transactionDetails) => {
          if (err) {
            cb(err, []);
            return;
          }
          transaction.detail = transactionDetails

          details++
          if (transactions.length - 1 === details) cb(err, transactions)
        });
      }
    } else {
      cb(err, transactions);
    }
  });
}
