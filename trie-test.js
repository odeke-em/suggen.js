var trie = require('./lib/alphanum-trie.js');

var nt = trie();
var added = nt.set('animal', 'flux');
var val = nt.pop('hehe', 10);

console.log('nt', nt);
console.log('v', val);
console.log(nt.get('animal', null));
console.log(nt.pop('animal', null));
console.log(nt.pop('animal', null));
console.log(nt.get('xanimal', 10));
console.log(nt.get('192456', 10));
console.log(nt.set('192456', nt));
