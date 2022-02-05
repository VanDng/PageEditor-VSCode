const vscode = require('vscode');

let _statusBar = null;

Initialize = function(vsContext)
{
    _statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    vsContext.subscriptions.push(_statusBar);

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
    Initialize,
    SetMessage,
    Show,
    Hide
}