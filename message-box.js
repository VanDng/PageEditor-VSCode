const vscode = require('vscode');

const messagePrefix = '[Page Editor]';

function MessageFormatter(message)
{
    return messagePrefix + ' ' + message;
}

ShowInformationMessage = function(message)
{
    vscode.window.showInformationMessage(MessageFormatter(message));
}

ShowErrorMessage = function(message)
{
    vscode.window.showErrorMessage(MessageFormatter(message));
}

ShowWarningMessage = function(message)
{
    vscode.window.showWarningMessage(MessageFormatter(message));
}

module.exports = {
    ShowInformationMessage,
    ShowErrorMessage,
    ShowWarningMessage
}