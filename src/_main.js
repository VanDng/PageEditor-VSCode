// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const Timers = require('timers');

const MessageBox = require('./message-box.js');
const NativeMessage = require("./native-message.js");
//const FileSynchronizer = require('./file-synchronizer');
const FileWatcher = require('./file-watcher.js');
const { StatusBar } = require('./status-bar');
const  Log  = require('./log.js');
const Utility = require('./utility.js');

// Global variables
const _log = new Log('PGE-Main');
let _statusBar = null;
let _fileSynchronizer = null;
let _fileWatcher = null;

let _isExtensionDeactivated = false;
let _isExtensionStarted = false;
let _isExtensionConnected = false;
let _isPreparingPGEWorkingspace = false;

function activate(context) {
    Initialize(context);

    let workspacePath = GetWorkspacePath();
    if (workspacePath == null) {
        _log.Info('Workspace not matched. Extension stopped.')
    } else {
        Begin();
        _log.Info('Workspace matched. Extension started. Workspace path \'' + workspacePath + '\'');
    }
}

function deactivate() {
    End();
}

function Initialize(context) {
    let disposable = vscode.commands.registerCommand('pageeditor.preparePGEWorkingspace', PreparePGEWorkingspace);
    context.subscriptions.push(disposable);

    //
    // Status bar
    //

    _statusBar = new StatusBar(context);

    //
    // Native message
    //

    // NativeMessage.AddEventListener('connection_state_changed', function(state) {
    //     if (state === 'Connected') {
    //         _statusBar.SetText('Connected');

    //         if (_isExtensionStarted) {
    //             Synchronization.Pull();
    //         }
    //     } else {
    //         _statusBar.SetText('Disconnected');
    //     }
    // });

    //
    // File watcher
    //

    // _fileWatcher = new FileWatcher();

    // FileWatcher.Initialize(context);

    // FileWatcher.OnEvent('add', function(path) {
    //     Synchronization.Push('add', path);
    // });

    // FileWatcher.OnEvent('delete', function(path) {
    //     Synchronization.Push('delete', path);
    // });

    // FileWatcher.OnEvent('rename', function(path1, path2) {
    //     Synchronization.Push('rename', path1, path2);
    // });

    // FileWatcher.OnEvent('modify', function(path) {
    //     Synchronization.Push('modify', path);
    // });

    // Start checking periodically.
    // If there's something wrong, all functions are stopped.

    
}

function Begin() {

}

function End() {
    _isExtensionDeactivated = true;
    NativeMessage.Close();
}

async function PreparePGEWorkingspace() {
    if (_isPreparingPGEWorkingspace) return;
    _isPreparingPGEWorkingspace = true;

    _log.Info('');

    let pageEdirtorDir = path.join(GetWorkspacePath(), ".pageeditor");
    _log.Info('PGE Directory \'' + pageEdirtorDir + '\'');

    if (Utility.DirExist(pageEdirtorDir)) {
        _log.Info('.pageeditor directory has been existed already');
    } else {
        Utility.DirCreate(pageEdirtorDir);
        _log.Info('.pageeditor directory created');
    }

    MessageBox.Info('Workingspace is ready');

    _isPreparingPGEWorkingspace = false;
}

function GetWorkspacePath() {
    // Try to take the only first valid workspace.
    if (vscode.workspace.workspaceFolders !== undefined) {
        vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
            const fsPath = workspaceFolder.uri.fsPath;

            let pageEditorDir = path.join(fsPath, ".pageeditor");

            if (Utility.DirExist(pageEditorDir)) {
                return pageEditorDir;
            }
        });
    }

    return null;
}

module.exports = {
    activate,
    deactivate
}