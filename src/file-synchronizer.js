// const vscode = require('vscode');
// const fs = require("fs");
// const path = require('path');

// const { Log } = require('./log.js');
// const NativeMessage = require("./native-message.js");

//  export class FileSynchronizer {
// //     #_log = new Log('FileSynchronizer');
// //     #_isPulling = false;
// //     #_workingDirectory = false;
//  }
    
//     SetWorkingDirectory(workingDirectory) {
//         this.#_workingDirectory = workingDirectory;
//         this.#_log.Info('Working directory set \'' + this.#_workingDirectory + '\'');
//     }
    
//     Pull() {
//         if (this.#_isPulling) {
//             return;
//         }
    
//         this.#_isPulling = true;
    
//         this.#_log.Info('Begin Pull');
    
//         await Promise.allSettled([PullScriptFiles(), PullConfigFiles()]);
    
//         this.#_log.Info('End Pull');
    
//         this.#_isPulling = false;
//     }
    
//     Push(action, beforeFilePath, afterFilePath) {
//         let isConfigFilePush = false;
    
//         if (beforeFilePath != null) {
//             if (beforeFilePath.startsWith(path.join(path.sep, '.pageeditor'))) {
//                 isConfigFilePush = true;
//             }
//         } else if (afterFilePath != null) {
//             if (afterFilePath.startsWith(path.join(path.sep, '.pageeditor'))) {
//                 isConfigFilePush = true;
//             }
//         } else {
//             this.#_log.Error('Could not determine push type');
//             return;
//         }
    
//         let pushContent = null;
    
//         if (action === 'add') {
//             let fileFullPath = path.join(this.#_workingDirectory, afterFilePath);
    
//             let fileContent = await ReadFile(fileFullPath);
//             if (fileContent == 'undefined') {
//                 console.error('File content is undefined. Cancel the action');
//                 return;
//             }
    
//             pushContent = {
//                 action: action,
//                 before: null,
//                 after: {
//                     path: afterFilePath,
//                     content: fileContent
//                 }
//             }
//         } else if (action === 'delete') {
//             pushContent = {
//                 action: action,
//                 before: {
//                     path: beforeFilePath
//                 },
//                 after: null
//             }
//         } else if (action === 'rename') {
//             pushContent = {
//                 action: action,
//                 before: {
//                     path: beforeFilePath
//                 },
//                 after: {
//                     path: beforeFilePath
//                 }
//             }
//         } else if (action === 'modify') {
//             let fileFullPath = path.join(this.#_workingDirectory, beforeFilePath);
    
//             let fileContent = await ReadFile(fileFullPath);
//             if (fileContent == 'undefined') {
//                 console.error('File content is undefined. Cancel the action');
//                 return;
//             }
    
//             fileContent = Base64Encode(fileContent);
    
//             pushContent = {
//                 action: action,
//                 before: null,
//                 after: {
//                     path: beforeFilePath,
//                     content: fileContent
//                 }
//             }
//         } else {
//             this.#_log.Info('Action \'' + action + '\' is not defined');
//         }
    
//         if (isConfigFilePush) {
//             PushConfigFile(pushContent);
//         } else {
//             PushScriptFile(pushContent);
//         }
    
//         this.#_log.Info('Push end');
//     }
    
//     async function PushScriptFile(pushContent) {
//         await PushFile('PushScriptFile', pushContent);
//     }
    
//     async function PushConfigFile(pushContent) {
//         await PushFile('PushConfigFile', pushContent);
//     }
    
//     async function PushFile(message, pushContent) {
//         this.#_log.Info('File pushing...');
//         this.#_log.Info('Push action: \'' + message + '\'');
//         this.#_log.Info('Push content: ' + JSON.stringify(pushContent));
    
//         let pushResult = null;
    
//         let tryCount = 0;
//         while (tryCount < 3) {
//             NativeMessage.Send(message, pushContent, function (response) {
//                 pushResult = response;
//             });
    
//             this.#_log.Info('Push request sent');
    
//             // It takes some time for the other side to prepare the response.
//             // Do not rush.
//             await Wait(5000);
    
//             if (pushResult != null) {
//                 break;
//             } else {
//                 this.#_log.Info('Could not reach Page Editor on Goole Chrome. Trying again...');
//                 tryCount++;
//             }
//         }
    
//         if (pushResult === true) {
//             this.#_log.Info('Push sucess');
//         }
    
//         this.#_log.Info('File pushing completed');
//     }
    
//     async function PullScriptFiles() {
//         await PullFiles('ExternalScriptChange', this.#_workingDirectory);
//     }
    
//     async function PullConfigFiles() {
//         let rootPath = path.join(this.#_workingDirectory, '.pageeditor');
//         await PullFiles('PullConfigFiles', rootPath);
//     }
    
//     async function PullFiles(command, rootPath) {
//         let fileJson = null;
    
//         this.#_log.Info('Pulling command \'' + command + '\'. Root path \'' + rootPath + '\'');
    
//         let tryCount = 0;
//         while (tryCount < 3) {
//             NativeMessage.Send(command, "", function (response) {
//                 fileJson = response;
//             });
    
//             this.#_log.Info('Pull request sent');
    
//             // It takes some time for the other side to prepare the response.
//             // Do not rush.
//             await Wait(5000);
    
//             if (fileJson != null) {
//                 break;
//             } else {
//                 this.#_log.Info('Could not reach Page Editor on Goole Chrome. Trying again...');
//                 tryCount++;
//             }
//         }
    
//         if (fileJson == null) {
//             this.#_log.Info('Could not pull any data');
//             return false;
//         } else {
//             await ExtractFiles(fileJson, rootPath);
//             return true;
//         }
//     }
    
//     async function ExtractFiles(fileDictionaryJson, rootPath) {
//         this.#_log.Info('Extracting files');
    
//         let obj = JSON.parse(fileDictionaryJson);
    
//         let fileDictionary = obj.fileDictionary;
    
//         this.#_log.Info('There\'re ' + fileDictionary.length + ' files');
    
//         Promise.all(fileDictionary.map(async (file) => {
    
//             //
//             // Directory check
//             //
    
//             let dirPath = path.join(rootPath, path.dirname(file.path))
    
//             if (fs.existsSync(dirPath) == false) {
//                 await fs.mkdir(dirPath, {
//                     recursive: true
//                 }, (err) => {
//                     console.error(err);
//                 });
//             }
    
//             //
//             // File extraction
//             //
    
//             let filePath = path.join(rootPath, file.path);
//             let fileContent = Base64Decode(file.content);
    
//             await fs.writeFile(filePath, fileContent, function (err) {
//                 if (err) {
//                     console.error(err);
//                 }
//             });
//         }));
    
//         this.#_log.Info('File extraction complete');
//     }
    
//     async function ReadFile(path) {
//         let fileContent = 'undefined';
    
//         fileContent = fs.readFileSync(path, {
//             encoding: 'utf8',
//             flag: 'r'
//         });
    
//         return fileContent;
//     }
    
//     function Wait(time) {
//         return new Promise(resolve => {
//             setTimeout(() => {
//                 resolve();
//             }, time);
//         });
//     }

// }

