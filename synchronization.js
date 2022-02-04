const vscode = require('vscode');
const fs = require("fs");
const path = require('path');

const NativeMessage = require("./native-message.js");

let _isSynchronizing = false;
let _workingDirectory = false;

SetWorkingDirectory = function(workingDirectory)
{
    _workingDirectory = workingDirectory;
    console.log('Synchronization working directory set \'' + _workingDirectory + '\'');
}

Pull = async function()
{
	if (_isSynchronizing)
	{
		return;
	}

	_isSynchronizing = true;

    console.log('Pulling...');

    await PullScriptFiles();
    await PullConfigFiles();
	
    console.log('Pull complete');

	_isSynchronizing = false;
}

async function PullScriptFiles()
{
    await PullFiles('GetScriptFiles', _workingDirectory);
}

async function PullConfigFiles()
{
    let rootPath = path.join(_workingDirectory, '.pageeditor');
    await PullFiles('GetConfigFiles', rootPath);
}

async function PullFiles(command, rootPath)
{
    let fileJson = null;

    console.log('Pulling command \'' + command + '\'. Root path \'' + rootPath + '\'');

	let tryCount = 0;
	while(tryCount < 3)
	{
		NativeMessage.Send(command, "", function(response)
		{
			fileJson = response;
		});

        console.log('Pull request sent');

        // It takes some time for the other side to prepare the response.
        // Do not rush.
		await Wait(2000);

		if (fileJson != null)
		{
			break;
		}
		else
		{
			tryCount++;
		}
	}

	if (fileJson == null)
	{
        console.log('Could not pull any data');
        return false;
	}
    else
    {
        await ExtractFiles(fileJson, rootPath);
        return true;
    }
}

async function ExtractFiles(fileDictionaryJson, rootPath)
{
    console.log('Extracting files');

    let obj = JSON.parse(fileDictionaryJson);

    let fileDictionary = obj.fileDictionary;

    console.log('There\'re ' + fileDictionary.length + ' files');

    Promise.all(fileDictionary.map(async (file) => {

        //
        // Directory check
        //

        let dirPath = path.join(rootPath, file.dir)

        if (fs.existsSync(dirPath) == false)
        {
            await fs.mkdir(dirPath, { recursive: true }, (err) => {
				console.error(err);
			});
        }

        //
        // File extraction
        //

        let fileName = file.name + '.' + file.extension;
        let filePath = path.join(dirPath, fileName);
        let fileContent = Base64Decode(file.content);

        await fs.writeFile(filePath, fileContent, function (err) {
            if (err)
            {
                console.error(err);
            }
        });
    }));

    console.log('File extraction complete');
}

function Base64Encode(data)
{
    let buff = Buffer.from(data);
    let base64data = buff.toString('base64');
    return base64data;
}

function Base64Decode(data)
{
    let buff = Buffer.from(data, 'base64');
    let text = buff.toString('ascii');
    return text;
}


function Wait(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

module.exports = {
    SetWorkingDirectory,
    Pull
}