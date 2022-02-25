class Log {

    /*
    BEGIN STATIC
    */

    static IsShutupAnnoyingLog = false;
    static OriginalLogError = console.error;
    static OriginalLogInfo = console.log;
    static IsLogModeChanging = false;

    static ShutupAnnoyingLog(shutup) {
        if (Log.IsLogModeChanging) return;

        Log.IsLogModeChanging = true;

        if (shutup == true) {
            Log.IsShutupAnnoyingLog = true;

            console.error = function(...data) {};
            console.log = function(...data) {};
        } else {
            Log.IsShutupAnnoyingLog = false;

            console.error = Log.OriginalLogError;
            console.log = Log.OriginalLogInfo;
        }

        Log.IsLogModeChanging = false;
    }

    /*
    END STATIC
    */

    constructor(moduleName) {
        Log.ShutupAnnoyingLog(true)

        this._moduleName = moduleName;
    }

    Info(message, isAnnoyingLog = false) {
        if (Log.IsShutupAnnoyingLog == true && isAnnoyingLog === true) {
            // Nothing
        } else {
            Log.OriginalLogInfo(this.#BuildLogMessage(message));
        }
    }

    InfoEx(message, style, isAnnoyingLog = false) {
        if (Log.IsShutupAnnoyingLog == true && isAnnoyingLog === true) {
            // Nothing
        } else {
            Log.OriginalLogInfo('%c' + this.#BuildLogMessage(message), style);
        }
    }

    Error(message, isAnnoyingLog = false) {
        if (Log.IsShutupAnnoyingLog == true && isAnnoyingLog === true) {
            // Nothing
        } else {
            Log.OriginalLogError(this.#BuildLogMessage(message));
        }
    }

    #BuildLogMessage(message) {
        let date = new Date();
        let dateString = date.toLocaleTimeString();

        return '[' + dateString + '][' + this._moduleName + '] ' + message;
    }
}

module.exports = Log;