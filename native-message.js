const {
    Server
} = require("socket.io");

const _namespace = "/page-editor";
var _server = null;
var _socket = null;

var _procConnectionStateChanged = null;
let _incommingMessageHandlers = [];

IsConnected = function () {
    if (_socket == null) {
        return false;
    } else {
        return true;
    }
}

Start = function () {
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

                _procConnectionStateChanged?.("Connected");

                _socket.on("disconnect", (reason) => {
                    _socket = null;
                    _procConnectionStateChanged?.("Disconnected");
                });

                _incommingMessageHandlers?.forEach(handler => {
                    _socket.of(namespace).on(handler.message, (content) => {
                        handler.proc(content);
                    });
                });
            }
        });

        _server.listen(4001);

        _procConnectionStateChanged?.('Started');
    } catch (error) {
        console.error(error);
        _server?.close();
        _server = null;
    }
}

Stop = function () {
    try {
        _server?.disconnectSockets();
        _server?.close();
    } catch (error) {
        console.error(error);
    }

    _server = null;

    _procConnectionStateChanged?.('Stopped');
}

Send = function (message, content, responseProc) {
    // _socket?.timeout(3000).emit(message, content,
    //     (err) => {
    //         console.log('Message \'' + message + '\' timeout');
    //     },
    //     (response) => {
    //         responseProc(response);
    //     });
    _socket?.emit(message, content,
            // (err) => {
            //     console.log('Message \'' + message + '\' timeout');
            // },
            (response) => {
                responseProc(response);
            });
}

IncommingMessageHandler = function (message, proc) {
    _incommingMessageHandlers.push({
        message: message,
        proc: proc
    })
}

OnConnectionStateChanged = function (proc) {
    _procConnectionStateChanged = proc;
}

module.exports = {
    IsConnected,
    Start,
    Stop,
    Send,
    IncommingMessageHandler,
    OnConnectionStateChanged
}