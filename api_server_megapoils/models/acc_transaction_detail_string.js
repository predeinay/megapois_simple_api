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

      const trans_month = new Date(transaction.trans_month)
      const date = {
        day: trans_month.getDate() < 10 ? `0${trans_month.getDate()}` : trans_month.getDate(),
        month: trans_month.getMonth() + 1 < 10 ? `0${trans_month.getMonth() + 1}`: trans_month.getMonth() + 1,
        year: trans_month.getFullYear()
      }

      const queryParams = [
        { name: "account_num", value: transaction.account_num },
        { name: "month", value: `${date.year}${date.month}${date.day}` }
      ]
  
      transaction.detail = await accTransactionDetail(queryParams)
    }

    cb('', transactions)
  } catch (err) {
    cb(err, [])
  }
}
