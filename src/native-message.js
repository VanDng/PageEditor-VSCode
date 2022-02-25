const { Server } = require("socket.io");
const Log = require('./log.js');

const _log = new Log('NativeMessage');

const _namespace = "/page-editor";
let _server = null;
let _socket = null;

let _eventListeners = [];
let _messageEventListeners = [];

function IsConnected() {
    if (_socket == null) {
        return false;
    } else {
        return true;
    }
}

function Initilize() {
    if (_server) {
        return;
    }

    try {

        _server = new Server({
            path: _namespace
        });

        _server.on("connection", (socket) => {
            const socketCount = _server.of(_namespace).sockets.size;
            if (socketCount > 0) {
                socket.disconnect();
            } else {
                _socket = socket;

                InvokeEventLisnter({
                    event: 'connection_state_changed',
                    content: 'connected'
                });

                _socket.on("disconnect", (reason) => {
                    _socket = null;
                   
                    InvokeEventLisnter({
                        event: 'connection_state_changed',
                        content: 'disconnected'
                    });
                });

                _messageEventListeners?.forEach(async (handler) => {
                    _socket.of(_namespace).on(handler.message, (content) => {
                        handler.handler(content);
                    });
                });
            }
        });

        _server.listen(4001);

    } catch (error) {
        _log.Error(error);
        _server?.close();
        _server = null;
    }
}

function Close() {
    try {
        _server?.disconnectSockets();
        _server?.close();
    } catch (error) {
        _log.Error(error);
    }

    _server = null;
}

function Send(message, messageContent) {
    return new Promise((resolve, reject) => {
        _socket?.emit(message, messageContent, (response) => {
            resolve(response);
        });
    });
}

function AddMessageListener(message, handler) {
    _messageEventListeners.push({
        message: message,
        handler: handler
    })
}

function AddEventListener(event, handler) {
    _eventListeners.push({
        event: event,
        handler: handler
    });
}

function InvokeEventLisnter(event) {
    _eventListeners.forEach(async (handler) => {
        if (handler.event === event.event) {
            handler.handler(event.content);
        }
    });
}

module.exports = {
    IsConnected,
    Initilize,
    Close,
    Send,
    AddMessageListener,
    AddEventListener
}