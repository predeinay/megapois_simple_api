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
  
      const queryParams = [
        { name: "account_num", value: transaction.account_num },
        { name: "month", value: new Date(transaction.trans_month).toISOString() }
      ]
  
      transaction.detail = await accTransactionDetail(queryParams)
    }
    
    cb('', transactions)
  } catch (err) {
    cb(err, [])
  }



  // db.exec(`select * from dbo.acc_transaction(@account_num)`,
  // [ { name : "account_num", value : params.getParams[2] } ], async (err, rowCount, transactions) => {
  //   if (!err && rowCount) {
  //     for (const transaction of transactions) {
  //       // details++
  //       if (transaction.pay_amount != 0) continue;

  //       const queryParams = [
  //         { name: "account_num", value: transaction.account_num },
  //         { name: "month", value: new Date(transaction.trans_month).toISOString() }
  //       ]

  //       const r = await accTransactionDetail(queryParams)
  //       transactions.detail = r
  //       console.log(transactions.detail)

  //       // db.exec(`select * from dbo.acc_transaction_detail(@account_num, @month)`, queryParams, (err, rowCount, transactionDetails) => {
  //       //   if (err) {
  //       //     cb(err, []);
  //       //     return;
  //       //   }
  //       //   transaction.detail = transactionDetails

  //       //   console.log(transactions.length, details)
  //       //   if (transactions.length - 1 === details) cb(err, transactions)
  //       // });
  //     }

  //     // if (transactions.length - 1 === details) cb(err, transactions)
  //     cb(err, transactions)
  //   } else {
  //     cb(err, transactions);
  //   }
  // });
}
