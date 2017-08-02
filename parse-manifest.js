'use strict';
const fs = require('fs');

var manifest = fs.readFileSync('./samples/manifest-1.js', 'utf8');

var lines = manifest.split('\n');
var length = lines.length;
console.log(length);

var end;

lines.reverse().some((l,i) => {
  const matched = l.match(/(^}$)|(^};$)/gi);
  if(matched) {
    end = {
      line: length - i,
      string: matched[0]
    };
    return true;
  }
  return false;
});

console.log(end);



