const chokidar = require('chokidar');
// let workspaceFolderPath = vscode.workspace.workspaceFolders[0].uri;

// watcher = chokidar.watch(workspaceFolderPath, 
// {
//     ignoreInitial: true
// }).on('all', (event, path) => {
//     if (event === 'unlink' || event === 'unlinkDir')
//     {
//         console.log('Delete ' + path);
//     }
//     else if (event === 'add' || event === 'addDir')
//     {
//         console.log('Add ' + path);
//     }
//     else if (event === 'change')
//     {
//         console.log('Change ' + path);
//     }
//     else
//     {}
// });