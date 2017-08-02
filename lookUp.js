const fs = require('fs');
const path = require('path');
/*
[
  'src',
  'static',
  'raw-assets',
  'config.json',
  'scripts'
]
 */
module.exports = function lookUp(directoryList) {
  return traverseUp(directoryList, process.cwd(), 0);
}

function traverseUp(directoryList, dir, level) {
  if(level === 4) return false;
  if(fs.readdirSync(dir)
    .filter(p => directoryList
    .some(f => p.includes(f))).length === directoryList.length
  ) {
    return dir;
  }
  else return traverseUp(directoryList, path.resolve(dir, '../'), level + 1)
}