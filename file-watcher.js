const vscode = require('vscode');

let _isDirty = []
let _eventListeners = new Map();

let _isStopped = true;
let _workingDirectory = null;

SetWorkingDirectory = function (workingDirectory) {
    _workingDirectory = workingDirectory;
}

Initialize = function (vsContext) {
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
            EventInvoker('add', file.fsPath);
        });
    });
    vsContext.subscriptions.push(onCreateEvent);

    const onSaveTextEvent = vscode.workspace.onDidSaveTextDocument(function (e) {
        const index = _isDirty.indexOf(e.uri.path);
        if (index > -1) {
            _isDirty.splice(index, 1);
        }
        EventInvoker('modify', e.uri.fsPath);
    });
    vsContext.subscriptions.push(onSaveTextEvent);

    const onDeleteEvent = vscode.workspace.onDidDeleteFiles(function (e) {
        e.files.forEach((file) => {
            EventInvoker('delete', file.fsPath);
        });
    });
    vsContext.subscriptions.push(onDeleteEvent);

    const onRenameEvent = vscode.workspace.onDidRenameFiles(function (e) {
        e.files.forEach((file) => {
            EventInvoker('rename', file.oldUri.fsPath, file.newUri.fsPath);
        });
    });
    vsContext.subscriptions.push(onRenameEvent);
}

Start = function () {
    _isStopped = false;
}

Stop = function () {
    _isStopped = true;
}

// Events: delete, add, rename, modify
OnEvent = function (event, callback) {
    _eventListeners.set(event, callback);
}

function EventInvoker(event, arg1, arg2) {
    if (_isStopped) {
        return;
    } else if (_workingDirectory != null &&
        (arg1 != null && arg1.includes(_workingDirectory) == false) ||
        (arg2 != null && arg2.includes(_workingDirectory) == false)) {
        return;
    } else {

        if (arg1 != null) {
            arg1 = arg1.replace(_workingDirectory, '');
        }

        if (arg2 != null) {
            arg2 = arg2.replace(_workingDirectory, '');
        }

        if (_eventListeners.has(event)) {
            let callback = _eventListeners.get(event);
            callback(arg1, arg2);
        }
    }
}

module.exports = {
    SetWorkingDirectory,
    Initialize,
    Start,
    Stop,
    OnEvent
}