const vscode = require('vscode');

let _singleInstance = null;

class StatusBar {
    #_statusBar = null;

    constructor(context) {
        if (_singleInstance == null) {
            this.#_statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
            context.subscriptions.push(this.#_statusBar);
            _singleInstance = this;
        }
        return _singleInstance;
    }

    SetText(text) {
        const icon = '$(live-share)'
        this.#_statusBar.text = icon + ' ' + text;
    }

    Show() {
        this.#_statusBar.show();
    }

    Hide() {
        this.#_statusBar.hide();
    }
}

module.exports = {
    StatusBar
}