// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { Server } = require("socket.io");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let myStatusBarItem = vscode.StatusBarItem;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	Initialize(context);	
}

function Initialize(context)
{
	let disposable = vscode.commands.registerCommand('pageeditor.activatePageEditor', function () {
		vscode.window.showInformationMessage('Hello World from PageEditor!');
	});
	context.subscriptions.push(disposable);

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	myStatusBarItem.show();
	context.subscriptions.push(myStatusBarItem);

	setStatus('Disconnected');

	NativeMessage();
}

function setStatus(message)
{
	const icon = '$(live-share)'
	myStatusBarItem.text = icon + ' ' + message;
}

function NativeMessage()
{
	const namespace = "/page-editor";

	const io = new Server({
		path: namespace
	});

	io.on("connection", (socket) => {
		console.log("a client connected");
		console.log(socket.id);

		socket.of(namespace).on("hello", (msg) => {
			console.log('Got a message \'' + msg + '\'')
		  });
	});

	io.on("disconnected", (socket) => {
		console.log("a client disconnected");
		console.log(socket.id);
	});

	io.listen(4001);
	console.log('listening on port 4001');
}

function deactivate() {

}

module.exports = {
	activate,
	deactivate
}