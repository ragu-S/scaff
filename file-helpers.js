const lookUp = require('./lookUp');
const fs = require('fs');
const path = require('path');
const mkdirpSync = require('mkdirp').sync;
const template = require('./templates');

const isScriptRE = buildRegEx([
  'js',
  'ts',
  'jsx'
]);

const isCSSRE = buildRegEx([
  'css',
  'less',
  'scss'
]);

// builds a regex object for matching any one of the strings in array
function buildRegEx(reMatchStrings) {
  return new RegExp(
    reMatchStrings
    .reduce(
      (re, fileType, i) => `${re}${i === 0 ? '' : '|' }(${fileType})`, ''
    )
    + ('$')
  );
}

/*
Get all files in folder (including subfolders)
[
  'src/components/SingleComponent/SingleComponent.js',
  'src/components/SingleComponent/style.scss',
  'src/components/Button/AlphaButton/AlphaButton.js',
  'src/components/Button/AlphaButton/rect.svg',
  'src/components/Button/Button.js',
  'src/components/Button/stlye.scss'
]
*/
function getAllFilesRecursively(dir) {
  const allPaths = fs.readdirSync(dir).map(f => path.join(dir, f));
  const folders = allPaths.filter(p => fs.lstatSync(p).isDirectory());
  let files = allPaths.filter(p => !folders.includes(p));
  if(folders.length > 0) {
    files = files.concat(
      folders
      .map(getAllFilesRecursively)
      .reduce((aggr, f) => aggr.concat(f), [])
    );
  }
  return files;
}

function copyFile(outputPath, inputPath) {

}

function templateFile(file, replaceParams) {
  return replaceParams.reduce((fileString, param) => {
    return param.useWithTemplate
      ? template(fileString, param.useWithTemplate)
      : param.regex.reduce((f, p) => f.replace(p.re, p.with), fileString);
  }, file);
}

function makeFolderStructure(outputPath, {absolutePath, folderName, folders, files}, replaceParams = []) {
  const replaceParamFolder = replaceParams.find(r => r.originalFolderName === folderName);
  const folderRenamed = replaceParamFolder && replaceParamFolder.renameFolder ? replaceParamFolder.renameFolder : folderName;

  outputPath = path.join(outputPath, folderRenamed);

  let folderNum = 0;
  let newFolderPath = outputPath;

  // Check if folder already exists
  while(isFolder(newFolderPath)) {
    newFolderPath = outputPath + folderNum;
    folderNum++;
  }

  // Make Folder
  mkdirpSync(newFolderPath);

  // Copy Files
  files.forEach(f => {
    const replaceParamFile = replaceParams.find(r => f.includes(r.originalFileName));
    const fileName = replaceParamFile && replaceParamFile.renameFile
      ? f.replace(replaceParamFile.originalFileName, replaceParamFile.renameFile)
      : f;

    const fileReadPath = path.join(absolutePath, f);
    const fileWritePath = path.join(newFolderPath, fileName);

    // Check if file already exists
    let fileNum = 0;
    let newFilePath = fileWritePath;

    // Check if folder already exists
    while(isFile(newFilePath)) {
      newFilePath = fileWritePath + folderNum;
      fileNum++;
    }

    const readFile = fs.readFileSync(fileReadPath, { encoding: 'utf8' });

    const updatedFile = templateFile(readFile, replaceParams);

    fs.writeFileSync(newFilePath, updatedFile, 'utf8');
  })

  folders.forEach(f => makeFolderStructure(path.join(newFolderPath, f.folderName), f));
}

function getFolderStructure(mainPath) {
  const folderName = getFolderName(mainPath);

  // list all current folder content
  const allPaths = fs.readdirSync(mainPath).map(f => path.join(mainPath, f));

  return allPaths.reduce((folderObject, path) => {
    if(fs.lstatSync(path).isDirectory()) {
      folderObject.folders.push(getFolderStructure(path));
    }
    else {
      folderObject.files.push(path.split('/').pop());
    }
    return folderObject;
  }, {
    folders: [],
    files: [],
    folderName,
    absolutePath: mainPath
  })
}

function getFileFolders(paths) {
  return paths.reduce((unique, t) => {
    const folder = t.split('/').slice(0,-1).join('/');
    if(!unique.includes(folder)) unique.push(folder);
    return unique;
  }, []);
}

function getComponentJSFolders(paths) {
  return paths.filter(p => isScriptRE.exec(p) && p.split('/').slice(-2).join('/').match(/^[A-Z]/))
  .map(p => p.split('/').slice(0,-1).join('/'))
  .reduce((unique, p) => unique.includes(p) ? unique : unique.concat(p), []);
}

function getFolderName(path) {
  return path.split('/').reverse().find(segment => /^[A-Z][a-z]+/.test(segment));
}

function findPath(type) {
  if(type === 'test') {
    // Look for test floder
    return lookUp([
      'src/test',
      'test',
      'tests'
    ])
  }
  else if(type === 'components' || type === 'existingCompontent' ) {
    return lookUp([
      'src/components',
      'components'
    ])
  }
}

function isFile(path) {
  if(!path) return false;
  try {
    return (!fs.lstatSync(path).isDirectory()) ? true : false;
  }
  catch(e) {
    return false;
  }
}

function isFolder(path) {
  if(!path) return false;
  try {
    return fs.lstatSync(path).isDirectory() ? true : false;
  }
  catch(e) {
    return false;
  }
}

module.exports = {
  getFolderStructure,
  getAllFilesRecursively,
  getFileFolders,
  getComponentJSFolders,
  makeFolderStructure,
  findPath,
  isFile,
  isFolder
}