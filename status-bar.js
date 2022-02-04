const vscode = require('vscode');

let _statusBar = null;

Create = function()
{
    _statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    return _statusBar;
}

SetMessage = function(message)
{
    const icon = '$(live-share)'
	_statusBar.text = icon + ' ' + message;
}

Show = function()
{
    _statusBar.show();
}

Hide = function()
{
    _statusBar.hide();
}

module.exports = {
    Create,
    SetMessage,
    Show,
    Hide
}