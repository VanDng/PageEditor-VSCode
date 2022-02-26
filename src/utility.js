const fs = require("fs");

/*
Base64 Encoding is really tricky.
Pheww. Omg.

https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
*/

// function Base64Encode(plain) {
//     const codeUnits = new Uint16Array(plain.length);
//     for (let i = 0; i < codeUnits.length; i++) {
//         codeUnits[i] = plain.charCodeAt(i);
//     }
//     return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
// }
    
// function Base64Decode(b64) {
//     const binary = atob(b64)
//     const bytes = new Uint8Array(binary.length);
//     for (let i = 0; i < bytes.length; i++) {
//       bytes[i] = binary.charCodeAt(i);
//     }
//     return String.fromCharCode(...new Uint16Array(bytes.buffer));
// }

function Base64Encode(data) {
    let buff = Buffer.from(data);
    let base64data = buff.toString('base64');
    return base64data;
}

function Base64Decode(data) {
    let buff = Buffer.from(data, 'base64');
    let text = buff.toString('utf8');
    return text;
}

// https://stackoverflow.com/questions/2648293/how-to-get-the-function-name-from-within-that-function
function FunctionName(func)
{
    // Match:
    // - ^          the beginning of the string
    // - function   the word 'function'
    // - \s+        at least some white space
    // - ([\w\$]+)  capture one or more valid JavaScript identifier characters
    // - \s*        optionally followed by white space (in theory there won't be any here,
    //              so if performance is an issue this can be omitted[1]
    // - \(         followed by an opening brace
    //
    var result = /^function\s+([\w\$]+)\s*\(/.exec( func.toString() )

    return  result  ?  result[ 1 ]  :  '' // for an anonymous function there won't be a match
}

function DirExist(dirPath) {
    return fs.readdirSync(dirPath).length !== 0;
}

function DirCreate(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function FileWrite(filePath, fileContent) {
    fs.writeFileSync(filePath, fileContent);
}

function FileRead(filePath) {
    return fs.readFileSync(filePath, {
        encoding: 'utf8',
        flag: 'r'
    });
}
module.exports = {
    Base64Decode,
    Base64Encode,
    FunctionName,
    DirExist,
    DirCreate,
    FileWrite,
    FileRead
}