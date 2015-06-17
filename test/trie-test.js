var assert = require('assert');
var trier  = require('../lib/alphanum-trie');

describe('Initializer test', function() {
    it('# With no alphabet', function(done) {
        var trie = trier();
        trie.set('12', '3');
        assert(trie.get('12', null), '3', 'expecting a successful retrieval');

        console.log('trie', trie);
        var t2 = trier();
        console.log('t2', t2);

        var suggestions = trie.set('odeke-em', 5); 
        var suggestions = trie.suggestions('odeke-em', 5); 
        console.log(suggestions);

        done();
    });
});

describe('Get, Set, Pop test', function() {
    it('# With no alphabet', function(done) {
        done();
    });
});
