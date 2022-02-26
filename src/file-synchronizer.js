const vscode = require('vscode');
const path = require('path');

const Log = require('./log.js');
const NativeMessage = require("./native-message.js");
const Utility = require('./utility.js');

const _log = new Log('FileSynchronizer');

class FileSynchronizer {
    #_isStop = false;
    #_workingDirectory = null;

    constructor() {
    }

    Begin(workingDirectory) {
        this.#_isStop = false;
        this.#_workingDirectory = workingDirectory;
        _log.Info('Working directory set \'' + this.#_workingDirectory + '\'');
    }

    End() {
        this.#_isStop = true;
    }
    
    Pull() {
        const pulls = [
            this.#PullFiles('ExternalScriptFetch')
        ];

        return new Promise((resolve, reject) => {
            if (this.#_isStop) resolve();

            Promise.allSettled(pulls).then(results => {
                resolve();
            });
        });
    }

    #PullFiles(command) {
        return new Promise((resolve, reject) => {

            NativeMessage.Send(command, '').then((fileJson) => {

                this.#ExtractFileFromJson(fileJson, this.#_workingDirectory).then(() => {
                    resolve();
                });

            });

        });
    }

    #ExtractFileFromJson(fileJson, rootPath) {
        return new Promise((resolve, reject) => {

            let files = JSON.parse(fileJson);    
            let promise = Promise.allSettled(files.map(async (file) => {
        
                //
                // Directory check
                //
        
                let dirPath = path.join(rootPath, path.dirname(file.path))
        
                if (!Utility.DirExist(dirPath)) {
                    Utility.DirCreate(dirPath);
                }
        
                //
                // File extraction
                //
        
                let filePath = path.join(rootPath, file.path);
                let fileContent = Utility.Base64Decode(file.content);
        
                Utility.FileWrite(filePath, fileContent);
            }));

            promise.then(() => resolve());
        });
    }
    
    Push(action, oldRelativeFilePath, newRelativeFilePath) {
        
        let pushContent = {
            action: action
        };

        let filePath;
        let fileContent;
        let fileContentBase64;

        switch (action) {
            case 'add':
                filePath = path.join(this.#_workingDirectory, newRelativeFilePath);
                fileContent = Utility.FileRead(filePath);
                fileContentBase64 = Utility.Base64Encode(fileContent);

                pushContent.newFile = {
                    path: newRelativeFilePath,
                    content: fileContentBase64
                }
                break;

            case 'delete':
                pushContent.oldFile = {
                    path: oldRelativeFilePath
                }
                break;

            case 'modify':
                filePath = path.join(this.#_workingDirectory, oldRelativeFilePath);
                fileContent = Utility.FileRead(filePath);
                fileContentBase64 = Utility.Base64Encode(fileContent);

                pushContent.oldFile = {
                    path: oldRelativeFilePath,
                    content: fileContentBase64
                }
                break;

            case 'rename':
                pushContent.oldFile = {
                    path: oldRelativeFilePath
                }

                pushContent.newFile = {
                    path: newRelativeFilePath
                }
                break;
        }

        _log.Info('Push content \'' + JSON.stringify(pushContent) + '\'');

        this.#PushFile(pushContent).then((result) => {

            _log.Info('Push result \'' + result +'\'');

        });
    }

    #PushFile(pushContent) {
        return new Promise((resolve, reject) => {

            NativeMessage.Send('ExternalFileChange', pushContent).then((result) => {

                resolve(result);

            });

        });
    }
}

module.exports = FileSynchronizer