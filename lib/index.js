var crypto = require('crypto');
var _un    = require('underscore');

var alphanumericAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.';

function indexResolver(alphabet) {
    alphabet = alphabet || alphanumericAlphabet;

    var alphabetMap = {};
    var alphabetLen = alphabet.length;

    for (var i=0; i < alphabetLen; i += 1) {
        var cur = alphabet[i];
        alphabetMap[cur] = i;
    }

    var alphaKeys    = Object.keys(alphabetMap);

    function resolver(id, notFound) {
        var index = alphabetMap[id];
        if (index)
            return index;
        // Handle null, undefined, 0 cases
        return index === 0 ? index: notFound;
    }

    function rollForNextInSequence(chr) {
        var index = resolver(chr, -1);
        if (index < 0)
            return [];

        var before = alphaKeys.slice(0, index);
        var after  = alphaKeys.slice(index + 1, alphaKeys.length);

        return _un.flatten(after, before);
    }

    // Now for the rest of the invalid slots
    // add an extra slot past the known slots
    var slotCount = 1 + alphaKeys.length;

    return {
        resolver:               resolver,
        slotCount:              slotCount,
        rollForNextInSequence:  rollForNextInSequence,
    };
}


function generator(alphabet) {
    var resolution  = indexResolver(alphabet);
    var resolver    = resolution.resolver;
    var rollForNext = resolution.rollForNextInSequence

    function Trie() {
        this.children = {};
        this.data     = undefined;
        this.eos      = false;
    }

    Trie.prototype = function() {
        this.resolver = resolver;
    }

    Trie.prototype.suggestions = function(key, thresholdEnough) {
        thresholdEnough |= 0; // cast it to an int

        var notFound = null;
        var retr = this.get(key, notFound);
        if (retr === notFound)
            return [key];

        // suffix checks now
        var keyLen = key.length;

        for (var terminal=key.length - 1; terminal >= 0; terminal -= 1) {
            var prefix = key.slice(0, terminal + 1);
            var terminalChar = key[terminal];

            var nextSeq = rollForNext(terminalChar);

            var allSuggestions = [];
            for (var i=0, len=nextSeq.length; i < len; i += 1) {
                var suggestions = this.suggestions(prefix + nextSeq[i], thresholdEnough);
                if (suggestions && suggestions.length >= 1) {
                    allSuggestions = _un.flatten([allSuggestions, suggestions]);
                }

                if (allSuggestions.length >= thresholdEnough)
                    return allSuggestions;
            }

            if (allSuggestions.length >= 1)
                return allSuggestions;
        }

        return [];
    }

    function __findOrMutate(tr, key, notFound, ensureExists) {
        var cur = tr;
        var par = null;
        var curIndex = -1;

        for (var i=0, len=key.length; i < len; i += 1) {
            var curKey = key[i];
            curIndex  = resolver(curKey, -1);

            var children = cur.children;
            var exists   = curIndex in children;
            if (!exists) {
                if (!ensureExists)
                    return notFound;

                var freshChild = new Trie(); 
                children[curIndex] = freshChild;
            }

            par = cur;
            cur = children[curIndex];
            // TODO:
            // if (!cur) { console.log('BUG on: found an invalid TrieNode'); }
        }

        return {
            cur:        cur,
            curIndex:   curIndex,
            par:        par,
        }
    }

    Trie.prototype.get = function(key, notFound) {
        var ownNotFound = crypto.randomBytes(6);
        var retr = __findOrMutate(this, key, ownNotFound, false);

        var exists = (retr && retr !== ownNotFound)
        if  (!exists)
            return notFound;
            
        var cur = retr.cur;
        if (!cur)
            return notFound;

        return cur.eos ? cur.data : notFound;
    }

    function __findAndMutate(tr, key, value, deletion) {
        var ownNotFound = crypto.randomBytes(6);
        var retr = __findOrMutate(tr, key, ownNotFound, !deletion);

        var onFail = deletion ? value : false;

        var exists = (retr && retr !== ownNotFound)
        if  (!exists)
            return onFail;

        var par = retr.par;
        var cur = retr.cur;

        if (!par)
            return onFail;

        if (!deletion) {
            cur.eos  = true;
            cur.data = value;
            return cur;
        } else {
            console.log('cur', cur, cur.eos);
            if (!(cur && cur.eos))
                return onFail;

            var curIndex = retr.curIndex;
            delete(par.children, curIndex);

            var vacated = cur.data;
            cur.data = undefined;
            cur.eos  = false;

            return vacated;
        }
    }

    Trie.prototype.set = function(key, value) {
        return __findAndMutate(this, key, value, false);
    }

    Trie.prototype.pop = function(key, alternate) {
        return __findAndMutate(this, key, alternate, true);
    }

    return Trie;
}

exports.alphanumericAlphabet = alphanumericAlphabet;
exports.generator            = generator;
