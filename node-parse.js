const vm = require('vm');
const util = require('util');
const fs = require('fs');

// Sandbox es6, es7 keynames
const regex = [
  function(file) {
    return file.replace(/export default/gi, 'exportDefault');
  },
  function(file) {
    // find: /^(?=import).*?(?=from)$/gi,
    // replace: '"'
  }
  // {
  //   find: /(require).*?([a-z]+)/gi,
  //   replace: 'requiredFile = '
  // }
];


const file = fs.readFileSync('samples/manifest-1.js', 'utf-8');
const lines = file.split('\n');

// ignore comments
lines
.filter(l => !(/ ?\/\//i.test(l)))
.reduce(line => {
  
}, [])

// const getObjectGroup = [
//   /[a-z]+ {0,}\:{0,}/i,
//   /$/
// ]

//
// const sandbox = {
//   animal: 'cat',
//   count: 2
// };

// const script = new vm.Script('count += 1; name = "kitty";');

// const context = new vm.createContext(sandbox);

// console.log(util.inspect(sandbox));