const { Server } = require("socket.io");
const Log = require('./log.js');

const _log = new Log('NativeMessage');

const _namespace = "/page-editor";
let _server = null;
let _socket = null;

let _eventListeners = [];
let _messageEventListeners = [];

let _disconnectStateTimer = null;

function IsConnected() {
    if (_socket == null) {
        return false;
    } else {
        return true;
    }
}

function Open() {
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

                InvokeConnectionStateEvent('connected');

                _socket.on("disconnect", (reason) => {
                    _socket = null;
                   
                    InvokeConnectionStateEvent('disconnected');
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

    InvokeConnectionStateEvent('disconnected', true);

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

// Connection state is a special event though, it has a special invoking condition.
function InvokeConnectionStateEvent(connectionState, immediate = false) {
    if (connectionState === 'connected') {
        if (_disconnectStateTimer != null) {
            clearInterval(_disconnectStateTimer);
            _disconnectStateTimer = null;
        }

        InvokeEventLisnter({
            event: 'connection_state_changed',
            content: connectionState
        });
    } else {
        if (immediate) {
            InvokeEventLisnter({
                event: 'connection_state_changed',
                content: connectionState
            });
        } else {
            _disconnectStateTimer = setInterval(() => {
                InvokeEventLisnter({
                    event: 'connection_state_changed',
                    content: connectionState
                });
            }, 3000);
        }
    }
}

module.exports = {
    IsConnected,
    Open,
    Close,
    Send,
    AddMessageListener,
    AddEventListener
}