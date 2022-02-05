// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const fs = require("fs");
const path = require('path');
const {
	clearInterval
} = require('timers');

const MessageBox = require('./message-box.js');
const NativeMessage = require("./native-message.js");
const StatusBar = require('./status-bar');
const Synchronization = require('./synchronization');
const FileWatcher = require('./file-watcher.js');
const IntervalExecutor = require('./interval-executor.js');

// Global variables
let _isExtensionDeactivated = false;
let _isExtensionStarted = false;
let _isExtensionConnected = false;
let _isInitializing = false;

var isDirty = [];

function activate(context) {
	//
	// Commands
	//

	let disposable = vscode.commands.registerCommand('pageeditor.initializeWorkingDirectory', InitializeWorkingDirectory);
	context.subscriptions.push(disposable);

	//
	// Status bar
	//

	StatusBar.Initialize(context);

	//
	// Native message
	//

	NativeMessage.OnConnectionStateChanged(function (state) {
		if (state === 'Disconnected' || state === 'Started' || state === 'Stopped') {
			StatusBar.SetMessage('Disconnected. Waiting...');
		}

		if (state === 'Connected') {
			StatusBar.SetMessage('Connected');

			if (_isExtensionStarted) {
				Synchronization.Pull();
			}
		}
	});

	//
	// File watcher
	//

	FileWatcher.Initialize(context);

	FileWatcher.OnEvent('add', function (path) {
		Synchronization.Push('add', path);
	});

	FileWatcher.OnEvent('delete', function (path) {
		Synchronization.Push('delete', path);
	});

	FileWatcher.OnEvent('rename', function (path1, path2) {
		Synchronization.Push('rename', path1, path2);
	});

	FileWatcher.OnEvent('modify', function (path) {
		Synchronization.Push('modify', path);
	});

	// Start checking periodically.
	// If there's something wrong, all functions are stopped.

	ActivationChecker();
}

function deactivate() {
	_isExtensionDeactivated = true;
	NativeMessage.Stop();
}

async function InitializeWorkingDirectory() {
	_isInitializing = true;

	console.log('Initialization begin');

	if (IsWorkspaceAvailable() == false) {
		MessageBox.ShowErrorMessage('Command can not be executed outside of a workspace')
	} else if (IsSingleWorkspace() == false) {
		MessageBox.ShowErrorMessage('Not support multiple workspace');
	} else if (IsEmptyDirectory()) {
		MessageBox.ShowErrorMessage('An empty workspace required');
	} else {
		MessageBox.ShowInformationMessage('Initializing...');

		let pageEdirtorDir = path.join(GetWorkspaceDirectoryPath(), ".pageeditor");

		if (fs.existsSync(pageEdirtorDir)) {
			console.log('.pageeditor directory has been existed');
		} else {
			await fs.mkdir(pageEdirtorDir, (err) => {
				if (err) {
					console.error(err);
				}
			});
			console.log('.pageeditor directory created');
		}

		MessageBox.ShowInformationMessage('Initialization complete');
	}

	console.log('Initialization end');

	_isInitializing = false;
}

function ActivationChecker() {
	IntervalExecutor.Execute(5000, async function() {
		if (_isInitializing) {
			return;
		}

		if (_isExtensionDeactivated) {
			clearInterval(this);
			return;
		}

		if (IsPageEditorWorkspace()) {
			if (IsSingleWorkspace()) {
				if (!_isExtensionStarted) {
					await InitializeWorkingDirectory();
					StartExtension(true);
				}
			} else {
				if (_isExtensionStarted) {
					StartExtension(false);
				}
			}
		}
	});
}

function IsWorkspaceAvailable() {
	return vscode.workspace.workspaceFolders !== undefined;
}

function IsSingleWorkspace() {
	return (vscode.workspace.workspaceFolders !== undefined &&
		vscode.workspace.workspaceFolders.length == 1);
}

function IsPageEditorWorkspace() {
	if (vscode.workspace.workspaceFolders !== undefined) {
		let pageEditorWorkspaceCount = 0;

		vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
			const fsPath = workspaceFolder.uri.fsPath;

			let pageEditorDir = path.join(fsPath, ".pageeditor");

			if (fs.existsSync(pageEditorDir)) {
				pageEditorWorkspaceCount++;
			}
		});

		if (pageEditorWorkspaceCount > 0) {
			return true;
		}
	}

	return false;
}

function IsEmptyDirectory() {
	return fs.readdirSync(GetWorkspaceDirectoryPath()).length === 0;
}

function GetWorkspaceDirectoryPath() {
	return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

function StartExtension(state) {
	_isExtensionStarted = state;

	if (_isExtensionStarted) {
		StatusBar.Show();
		Synchronization.SetWorkingDirectory(GetWorkspaceDirectoryPath());
		FileWatcher.SetWorkingDirectory(GetWorkspaceDirectoryPath());
		FileWatcher.Start();
		NativeMessage.Start();
	} else {
		StatusBar.Hide();
		FileWatcher.Stop();
		NativeMessage.Stop();
	}
}

module.exports = {
	activate,
	deactivate
}