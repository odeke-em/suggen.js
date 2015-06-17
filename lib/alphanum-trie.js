var lib = require('./');
var alnum = lib.generator(lib.alphanumericAlphabet);

module.exports = function() {
    return new alnum();
}
