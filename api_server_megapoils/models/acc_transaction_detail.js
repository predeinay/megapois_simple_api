const db = require("../dbcon");

async function getTransactions(account_num) {
  return new Promise((resolve, reject) => {
    db.exec(`select * from dbo.acc_transaction(@account_num)`,
    [{ name : "account_num", value : account_num } ], async (err, rowCount, transactions) => {
      !err ? resolve(transactions) : reject(err)
    })
  })
}

async function accTransactionDetail(queryParams) {
  return new Promise((resolve, reject) => {
    db.exec(`select * from dbo.acc_transaction_detail(@account_num, @month)`, queryParams, (err, rowCount, transactionDetails) => {
      !err ? resolve(transactionDetails) : reject(err)
    });
  })
}

module.exports = async (params, cb = () => {}) => {
  try {
    const transactions = await getTransactions(params.getParams[2])
  
    for (const transaction of transactions) {
      if (transaction.pay_amount != 0) continue
  
      const date = new Date(transaction.trans_month)

      const queryParams = [
        { name: "account_num", value: transaction.account_num },
        { name: "month", value: new Date(date.setDate(date.getDate() + 1)).toISOString() }
      ]
  
      transaction.detail = await accTransactionDetail(queryParams)
    }

    cb('', transactions)
  } catch (err) {
    cb(err, [])
  }
}
