const fs = require("fs").promises;
const conf = require('../conf');

module.exports = async (params, cb = () => {}) => {
  try {
    if (!conf.invoicesPath) {
      cb('invoicesPath не указан в конфиге', [])
    }

    const files = await fs.readdir(`${conf.invoicesPath}`)
    let filename, invoice

    for (const file of files) {
      if (file.split(".")[0] === params.getParams[2]) {
        invoice = await fs.readFile(`${conf.invoicesPath}/${file}`)
        filename = file
        break
      }
    }

    cb('', {
      name: filename,
      file: invoice,
      size: invoice.byteLength
    })
  } catch (err) {
    cb(err, [])
  }
}
