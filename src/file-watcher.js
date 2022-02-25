const vscode = require('vscode');

class FileWatcher {
    #_isDirty = [];
    #_eventListeners = [];
    
    #_isStopped = true;
    #_workingDirectory = null;

    constructor(workingDirectory) {
        this.#_workingDirectory = workingDirectory;
    }
    
    Initialize(context) {
        // vsContext.subscriptions.push(
        //     vscode.workspace.onDidChangeTextDocument(function (e) {
        //         if (!_isDirty.includes(e.document.uri.path)) {
        //             _isDirty.push(e.document.uri.path);
        //             EventInvoker('modify', e.document.uri.fsPath);
        //         }
        //     })
        // );
    
        const onCreateEvent = vscode.workspace.onDidCreateFiles(function (e) {
            e.files.forEach((file) => {
                this.#InvokerEventListener('add', file.fsPath);
            });
        });
        context.subscriptions.push(onCreateEvent);
    
        const onSaveTextEvent = vscode.workspace.onDidSaveTextDocument(function (e) {
            const index = this.#_isDirty.indexOf(e.uri.path);
            if (index > -1) {
                this.#_isDirty.splice(index, 1);
            }
            this.#InvokerEventListener('modify', e.uri.fsPath);
        });
        context.subscriptions.push(onSaveTextEvent);
    
        const onDeleteEvent = vscode.workspace.onDidDeleteFiles(function (e) {
            e.files.forEach((file) => {
                this.#InvokerEventListener('delete', file.fsPath);
            });
        });
        context.subscriptions.push(onDeleteEvent);
    
        const onRenameEvent = vscode.workspace.onDidRenameFiles(function (e) {
            e.files.forEach((file) => {
                this.#InvokerEventListener('rename', file.oldUri.fsPath, file.newUri.fsPath);
            });
        });
        context.subscriptions.push(onRenameEvent);
    }
    
    Start = function () {
        this.#_isStopped = false;
    }
    
    Stop = function () {
        this.#_isStopped = true;
    }
    
    AddEventListener(event, handler) {
        this.#_eventListeners.push({
            event: event,
            handler: handler
        })
    }
    
    #InvokerEventListener(event, oldFile, newFile) {
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
                if (handler.event === event) {
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