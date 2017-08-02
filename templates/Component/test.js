const fs = require('fs');
const path = require('path');
const mkdirpSync = require('mkdirp').sync;

const absolutePath = './Component.js';
const outputPath = './Component-Test.js';
const replaceParams = [{
  re: new RegExp('componentName', 'g'),
  with: 'ComponentTest',
  useTemplate: ''
}];


function templateFile(file, replaceParams) {
  // replaceParams = [{
  //   re: //,
  //   with: ''
  // }]
  return replaceParams.reduce((f, p) => f.replace(p.re, p.with), file);
}

const fileReadPath = path.join(absolutePath);
const fileWritePath = path.join(outputPath);

const readFile = fs.readFileSync(fileReadPath, { encoding: 'utf8' });

const updatedFile = templateFile(readFile, replaceParams);

fs.writeFileSync(fileWritePath, updatedFile, 'utf8');