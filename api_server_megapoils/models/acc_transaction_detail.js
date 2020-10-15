const db = require("../dbcon");

module.exports = (params, cb = () => {}) => {
  const parameters = params.getParams

  db.exec(`select * from dbo.acc_transaction(@account_num)`,
  [ { name : "account_num", value : parameters[2] } ], (err, rowCount, rows) => {
    if (!err && rowCount > 0) {
      const withoutPayAmount = rows.filter(row => row.pay_amount === 0)
      const response = []

      if (withoutPayAmount.length) {
        for (const transaction of withoutPayAmount) {
          const queryParams = [
            { name: "account_num", value: transaction.account_num },
            { name: "month", value: new Date(transaction.trans_date).toISOString() }
          ]

          db.exec(`select * from dbo.acc_transaction_detail(@account_num, @month)`, queryParams, (err, rowCount, rows) => {
            if (!err && rowCount > 0) {
              response.push({
                ...transaction, 
                detail: rows
              })
            } else {
              response.push({
                ...transaction,
                detail: []
              })
            }
            
            if (response.length === withoutPayAmount.length) {
              cb(err, response)
            }
          });
        }
      } else {
        cb(err, rows)
      }
    } else {
      cb(err,rows);
    }
  });
}
