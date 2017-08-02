/*
Options:
  -c -> component folder
  -t -> test folder
  -r -> React index route file

  -co redux,transitionGroup
  
  -cp -> copies existing component (recursively) and renames it (Or Adds generic ComponentName) and add test route and file
*/
'use strict';
const fs = require('fs');
const inquirer = require('inquirer');
const args = require('args');
const path = require('path');
const mkdirpSync = require('mkdirp').sync;
const lookUp = require('./lookUp');
const {
  defaultComponentProps
} = require('./templates/extras/props');

const {
  getFolderStructure,
  getAllFilesRecursively,
  getFileFolders,
  getComponentJSFolders,
  makeFolderStructure,
  findPath,
  isFile,
  isFolder
} = require('./file-helpers');

const VALID_FLAGS = ['t', 'test', 'c', 'components', 'd', 'decorate', 'p', 'cp'];

const decorateOpts = {
  description: 'decorate/wrap component with additional methods/hooks such as redux and transition group hooks (redux,transitionGroup',
  init: opts => opts,
  defaultValue: 'redux,transitionGroup'
};

const componentsOpts = {
  description: 'path to components folder',
  init: path => path === '' ? findPath('components') : path,
  defaultValue: ''
}

const testsOpts = {
  description: 'path to test folder',
  init: path => path === '' ? findPath('test') : path,
  defaultValue: ''
}

const copyComponent = {
  description: 'path to component folder/file to copy',
  init: path => path === '' ? findPath('existingCompontent') : path,
  defaultValue: ''
}

args
.options([
  Object.assign({ name: 'test', }, testsOpts),
  Object.assign({ name: 't' }, testsOpts),
  Object.assign({ name: 'components' }, componentsOpts),
  Object.assign({ name: 'c' }, componentsOpts),
  Object.assign({ name: 'decorate' }, decorateOpts),
  Object.assign({ name: 'd'}, decorateOpts),
  Object.assign({ name: ['p', 'cp']}, copyComponent),
])

var flags = args.parse(process.argv);

const globalState = {
  projectDirectory: '',
  componentName: '',
  componentsFolder: null,
  testFolder: null,
  decorateOpts: '',
  copyPath: null
}

// Component Name passed down
if(args.sub.length > 1) {
  console.error('The following are unsupported args', args.sub.slice(1, args.sub.length).join(', '));
  return;
}
new Promise((resolve, reject) => {
  if(validateFlags(flags)) {

    // Look for project directory (jam3 prj flavour)
    const prjDirectory = lookUp([
      'src',
      //'static',
      //'raw-assets',
      //'config.json',
      'package.json',
      //'scripts'
    ]);

    if(flags.cp) {
      (!isFolder(flags.cp)
        ? inquirer.prompt([
            {
              type: 'input',
              name: 'folderToCopy',
              message: 'Cannot find folder to copy, enter path to folder:',
              validate: isFolder
            }
          ])
        : Promise.resolve(flags.cp)
      )
      .then(copyFolder => {
          globalState.copyPath = copyFolder;

          if(args.sub.length === 0) {
            inquirer.prompt([
              {
                type: 'input',
                name: 'needCopyPath',
                message: 'Must specifiy destination folder to copy to',
                validate: p => Boolean(p)
              }
            ])
            .then(() => resolve(prjDirectory))
            .catch(console.error);
          }
          else if(args.sub[0].split('/') > 1) {
            globalState.componentName = args.sub[0].split('/').pop();
            globalState.componentsFolder = args.sub[0];
          }

          resolve(prjDirectory);
      })
      .catch(console.error);
    }
    else {
      globalState.copyPath = flags.cp;

      resolve(prjDirectory);
    }
  }
  else {
    console.error('Invalid flags');
    reject('Invalid flags');
  }
})
.then(prjDirectory => {
  // if not found, ask user
  return isFolder(prjDirectory)
    ? prjDirectory
    : inquirer.prompt([
      {
        type: 'input',
        name: 'projectDirectory',
        message: 'Cannot find project directory, enter path to directory:',
        validate: isFolder
      }
    ])
    .then(({projectDirectory}) => projectDirectory)
})
.then(projectDirectory => {
  // Check if project directory found first (check up to 4 lvls up/down, ignore node_modules), else need to ask user
  const componentName = args.sub.length > 0 ? args.sub[0] : 'Component';
  console.log('componentName:', componentName);
  globalState.projectDirectory = projectDirectory;

  // Template, eventually want to include different types
  // const componentType = 'component';
  globalState.componentName = `${componentName[0].toUpperCase()}${componentName.substring(1)}`;
  const componentsFolder = globalState.componentsFolder ? globalState.componentsFolder : path.join(globalState.projectDirectory, 'src', 'components');
  const testFolder = path.join(globalState.projectDirectory, 'src', 'test');

  const prompts = [];

  // Just prior to completing the scaffolding, ask user about output params and paths for components and tests, whether its correct or needs to be changed
  if(componentsFolder === null || !isFolder(componentsFolder)) {
    prompts.push({
      type: 'input',
      name: 'componentsFolder',
      message: 'Is this the path to the components folder? (if right, press enter or type path)',
      default: componentsFolder,
      validate: fPath => Boolean(isFolder(fPath) ? fPath : mkdirpSync(fPath))
    })
  }
  else {
    globalState.componentsFolder = componentsFolder;
  }

  if(testFolder === null || !isFolder(testFolder)) {
    prompts.push({
      type: 'input',
      message: 'Is this the path to the Test folder? (if right, press enter or type path)',
      name: 'testFolder',
      default: testFolder,
      validate: fPath => Boolean(isFolder(fPath) ? fPath : mkdirpSync(fPath))
    })
  }
  else {
    globalState.testFolder = testFolder;
  }

  // changes will be saved in .scaff-settings
  return prompts.length > 0
    ? inquirer
      .prompt(prompts)
      .then(answers => {
        globalState.componentsFolder = answers.componentsFolder;
        globalState.testFolder = answers.testFolder;
      })
    : null
})
.then(() => {
  const { componentName, componentsFolder, testFolder, copyPath } = globalState;
  const componentFileStrings = [];

  try {
    const templatePath = copyPath ? copyPath : path.join(__dirname, 'templates', 'Component');

    // // Get templates Component folder
    const folderStructure = getFolderStructure(templatePath);

    console.log('copyPath', templatePath);

    // Copy templates to components folder
    makeFolderStructure(componentsFolder, folderStructure,
      copyPath
        ? [{
          type: 'replaceContent',
          originalFolderName: folderStructure.folderName,
          originalFileName: folderStructure.folderName,
          renameFolder: componentName,
          renameFile: componentName,
          // Need to replace every reference to the original Component with renamed Component 
          regex: [{
            extra: folderStructure.folderName,
            re: new RegExp(folderStructure.folderName, 'g'),
            with: componentName
          }]
        }]
        : [{
            type: 'templateFile',
            originalFolderName: folderStructure.folderName,
            renameFolder: componentName,
            originalFileName: folderStructure.folderName,
            renameFile: componentName,
            useWithTemplate: {
              componentName,
              staticProps: defaultComponentProps
            },
            // Need to replace every reference to the original Component with renamed Component 
            regex: [{
              re: new RegExp(folderStructure.folderName, 'g'),
              with: componentName
            }]
        }]
    );
  }
  catch(err) {
    console.error(err);
    return;
  }

  // componentFileStrings.map()
  console.log(`
    Added ${componentName} to ${componentsFolder}
    Added the test to ${testFolder}
  `);
})
.then(() => {

})
.catch(console.error);
// scaffold component to components folder
// @args componentName, template, props = defaultProps, state = defaultState, opts = {}
// scaffComponent(globalState.componentsPath, template);

function validateFlags(flags) {
  return Object.keys(flags).every(
    flag => VALID_FLAGS.includes(flag.toLowerCase())
  );
}

/*
  Enter scaff in Command Line
  - scaff sees if package.json exists in current folder, else it searches upwards until package.json file is found (max 5 levels up)
  - once it finds it, it searches for components folder
  - then it searches for test folder
*/

/*

1) check which params are passed in
- test path

- components path
*/

/*
2) if components folder found, it scaffolds a basic component:
    ComponentName
      ComponentName.js
      style.scss
*/
const defaultProps = {};
const defaultState = {};

function scaffComponent(componentName, template, props = defaultProps, state = defaultState, opts = {}) {
  // Check if we need to include Transition hook
  // if(opts.transitionHooks)

  // add style.scss

  // add index.js if it needs redux hooks

  const destination = './';
  const fileType = 'js'; // 'jsx' 'ts' etc.

  fs.writeFileSync(path.join(destination, `${componentName}.${fileType}`), template, 'utf8');
}

/*
3)if test folder found, it adds a test component file in test folder

    test
      ComponentName Folder
        index.js
        style.scss

  then adds componentName path to manifest js (if it exists) 
*/
function scaffTestComponent(componentName, template, props = defaultProps, state = defaultState, opts = {}) {
  // get template

  // 
}

