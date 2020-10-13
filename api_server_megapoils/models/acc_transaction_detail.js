const db = require("../dbcon");

module.exports = (params, cb = () => {}) => {
  const parameters = params.getParams

  if (parameters.length === 4) {
    const date = new Date(parameters[3])
    if (!(date instanceof Date && !isNaN(date))) {
      cb("wrong date format", [])
      return
    }
  }

  db.exec(`select * from dbo.acc_transaction(@account_num)`,
  [ { name : "account_num", value : parameters[2] } ],  (err, rowCount, rows) => {
    if (!err && rowCount > 0) {
      const withoutPayAmount = rows.filter(row => row.pay_amount === 0)
      const response = []

      if (withoutPayAmount.length) {
        withoutPayAmount.forEach(transaction => {
          const queryParams = [
            {name: "account_num", value: transaction.account_num},
            {name: "month", value: parameters.length > 3 ? parameters[3] : ""}
          ]

          db.exec(`select * from dbo.acc_transaction_detail(@account_num, @month)`, queryParams, (err, rowCount, rows) => {
            if (!err && rowCount > 0) response.push(...rows)
          });
        })
      }

      cb(err, response)
    } else {
      cb(err,rows);
    }
  });
}
