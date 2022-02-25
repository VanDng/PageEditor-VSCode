const vscode = require('vscode');

 const _messagePrefix = '[Page Editor]';

function Info(message)
{
    vscode.window.showInformationMessage(this.Formatter(message));
}

function Error(message)
{
    vscode.window.showErrorMessage(this.Formatter(message));
}

function Warn(message)
{
    vscode.window.showWarningMessage(this.Formatter(message));
}

function Formatter(message)
{
    return _messagePrefix + ' ' + message;
}

module.exports = {
    Info,
    Error,
    Warn,
    Formatter
}