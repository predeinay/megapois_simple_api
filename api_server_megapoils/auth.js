const conf = require('./conf');

module.exports = (headers) => {
    return headers['authorization'] === conf.secret;
}