const vscode = require('vscode');

class FileWatcher {
    #_eventListeners = [];
    
    #_isStopped = true;
    #_workingDirectory = null;

    constructor(context) {
        const self = this;

        const onCreateEvent = vscode.workspace.onDidCreateFiles((e) => {
            e.files.forEach((file) => {
                self.#InvokerEventListener({
                    event: 'add',
                    newFile: file.fsPath
                });
            });
        });
        context.subscriptions.push(onCreateEvent);
    
        const onSaveTextEvent = vscode.workspace.onDidSaveTextDocument(function (e) {
            self.#InvokerEventListener({
                event: 'modify',
                oldFile: e.uri.fsPath
            });
        });
        context.subscriptions.push(onSaveTextEvent);
    
        const onDeleteEvent = vscode.workspace.onDidDeleteFiles(function (e) {
            e.files.forEach((file) => {
                self.#InvokerEventListener({
                    event: 'delete', 
                    oldFile: file.fsPath
                });
            });
        });
        context.subscriptions.push(onDeleteEvent);
    
        const onRenameEvent = vscode.workspace.onDidRenameFiles(function (e) {
            e.files.forEach((file) => {
                self.#InvokerEventListener({
                    event: 'rename', 
                    oldFile: file.oldUri.fsPath,
                    newFile: file.newUri.fsPath
                });
            });
        });
        context.subscriptions.push(onRenameEvent);
    }
    
    Begin = function (workingDirectory) {
        this.#_isStopped = false;
        this.#_workingDirectory = workingDirectory;
    }
    
    End = function () {
        this.#_isStopped = true;
    }
    
    AddEventListener(event, handler) {
        this.#_eventListeners.push({
            event: event,
            handler: handler
        })
    }
    
    #InvokerEventListener(e) {
        const event = e.event;
        let oldFile = (e.oldFile === 'undefined') ? null : e.oldFile;
        let newFile = (e.newFile === 'undefined') ? null : e.newFile;

        if (this.#_isStopped) {
            return;

        // Only care about events from the specified working directory.
        } else if (this.#_workingDirectory != null &&
            (oldFile != null && oldFile.includes(this.#_workingDirectory) == false) ||
            (newFile != null && newFile.includes(this.#_workingDirectory) == false)) {
            return;
            
        } else {
    
            if (oldFile != null) {
                oldFile = oldFile.replace(this.#_workingDirectory, '');
            }
    
            if (newFile != null) {
                newFile = newFile.replace(this.#_workingDirectory, '');
            }
    
            this.#_eventListeners.forEach(async (handler) => {
                if (handler.event == event) {
                    handler.handler({
                        oldFile: oldFile,
                        newFile: newFile
                    })
                }
            });
        }
    }
}

module.exports = FileWatcher;