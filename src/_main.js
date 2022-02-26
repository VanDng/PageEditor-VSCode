// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const Timers = require('timers');

const MessageBox = require('./message-box.js');
const NativeMessage = require("./native-message.js");
const FileSynchronizer = require('./file-synchronizer');
const FileWatcher = require('./file-watcher.js');
const { StatusBar } = require('./status-bar');
const  Log  = require('./log.js');
const Utility = require('./utility.js');

const _log = new Log('PGE-Main');
let _statusBar = null;
let _fileSynchronizer = null;
let _fileWatcher = null;

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
    //
    // VS Commands
    //

    let disposable = vscode.commands.registerCommand('pageeditor.preparePGEWorkingspace', PreparePGEWorkingspace);
    context.subscriptions.push(disposable);

    //
    // Status bar
    //

    _statusBar = new StatusBar(context);
    _statusBar.SetText('Not Ready');

    //
    // Native message
    //

    NativeMessage.AddEventListener('connection_state_changed', function(state) {
        if (state === 'connected') {
            _statusBar.SetText('Connected');

        } else {
            _statusBar.SetText('Disconnected');
        }
    });

    //
    // File Synchronizer
    //

    _fileSynchronizer = new FileSynchronizer();

    //
    // File watcher
    //

    _fileWatcher = new FileWatcher(context);

    _fileWatcher.AddEventListener('add', function(e) {
        _log.Info(JSON.stringify(e));
        //Synchronization.Push('add', path);
    });

    _fileWatcher.AddEventListener('delete', function(e) {
        _log.Info(JSON.stringify(e));
        //Synchronization.Push('delete', path);
    });

    _fileWatcher.AddEventListener('rename', function(e) {
        _log.Info(JSON.stringify(e));
        //Synchronization.Push('rename', path1, path2);
    });

    _fileWatcher.AddEventListener('modify', function(e) {
        _log.Info(JSON.stringify(e));
        //Synchronization.Push('modify', path);
    });
}

function Begin() {
    let workspacePath = GetWorkspacePath();

    _statusBar.Show();
    NativeMessage.Open();
    _fileWatcher.Begin(workspacePath);
    _fileSynchronizer.Begin(workspacePath);
}

function End() {
    _statusBar.Hide();
    NativeMessage.Close();
    _fileWatcher.End();
    _fileSynchronizer.End();
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
    let pageEditorWorkspace = null;

    // Try to take the only first valid workspace.
    if (vscode.workspace.workspaceFolders !== undefined) {
        vscode.workspace.workspaceFolders.every(workspaceFolder => {
            const fsPath = workspaceFolder.uri.fsPath;

            let pageEditorDir = path.join(fsPath, ".pageeditor");
            if (Utility.DirExist(pageEditorDir)) {
                pageEditorWorkspace = fsPath;
                return false; // break
            }

            return true; // continue
        });
    }

    return pageEditorWorkspace;
}

module.exports = {
    activate,
    deactivate
}