/*
  cmd to quick scaffold a component, attach it to tests manfiest with path

  scaf
  scaf TransitionGroupComponent (just uses basic component template and adds transition group hooks)
  scaf Button [component folder path] [test folder path]
  scaf Grid
  scaf [component]
  scaf InlineSvg

  Options:
  -m -> manifest file
  -c -> component folder
  -t -> test folder
  -r -> React index route file

  -co redux,transitionGroup
  
  -cp -> copies existing component (recursively) and renames it (Or Adds generic ComponentName) and add test route and file

  scenario:
  1) in project root folder
  2) enter scaf in Command Line
  - scaf sees if package.json exists in current folder, else it searches upwards until package.json file is found (max 5 levels up)
  - once it finds it, it searches for components folder
  - then it searches for test folder

  if components folder found, it scaffolds a basic component:
    ComponentName
      ComponentName.js
      style.scss

  if test folder found, it adds a test component file in test folder

    test
      ComponentName Folder
        index.js
        style.scss

  then adds componentName path to manifest js (if it exists) 

  
 */



// 













