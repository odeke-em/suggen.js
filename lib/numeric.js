var lib = require('./');
var numericTrie = lib.generator('0123456789');

module.exports = function() {
    return numericTrie();
}
