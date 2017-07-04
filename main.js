/*
Options:
  -c -> component folder
  -t -> test folder
  -r -> React index route file

  -co redux,transitionGroup
  
  -cp -> copies existing component (recursively) and renames it (Or Adds generic ComponentName) and add test route and file
*/
const args = require('args');
const path = require('path');

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
  description: 'path to component folder/file',
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
  Object.assign({ name: 'd'}, decorateOpts)
])

var flags = args.parse(process.argv);

validateFlags(flags);

const globalState = {
  componentName: '',
  testPath: '',
  componentsPath: '',
  decorateOpts: ''
}

// Component Name passed down
if(args.sub.length <= 1) {
  console.log('componentName:', args.sub[0]);

  const componentName = args.sub[0] || 'Component';

  // flags
  // flags.test;
  // flags.components;
  // flags.decorateOpts;

  // Template, eventually want to include different types
  const componentType = 'component';
  const template = fs.readFileSync(`./templates/${component}.js`, 'utf8');

  // Just prior to completing the scaffolding, ask user about output params and paths for components and tests, whether its correct or needs to be changed
  // changes will be saved in .scaff-settings

  // scaffold component to components folder
  // @args componentName, template, props = defaultProps, state = defaultState, opts = {}
  scaffComponent(globalState.componentsPath, template);

  // 
}
else if (args.sub.length > 1) {
  console.error('The following are unsupported args', args.sub.slice(1, args.sub.length).join(', '));
  return;
}

function validateFlags(flags) {
  console.log(flags);
}

function findPath(type) {
  if(type === 'test') {
    // console.log('finding test folder');

    return './src/test';
  }
  else if(type === 'components') {
    // console.log('finding components folder');
    return './src/components';
  }
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

