# PageEditor-VSCode

A Visual Studio Code extension that works as an external editor for the [Page Editor](https://github.com/VanDng/Page-Editor).

# Todo
- [ ] Follow this [topic](https://github.com/microsoft/vscode/issues/4873). The crowd is waiting for an API enabling to disable VSCode Editor on read-only mode.

# Package

A note for myself for packaging the extension.

1/ Make sure the necessary libraries belongs to the `dependencies` section, not `devDependencies`. Otherwise, the extension won't work after installing.

<img src="https://user-images.githubusercontent.com/20492454/156875705-00dd06bd-74a5-4f8a-8196-7ca7b5977f98.png" height="400">

If a library sits on a wrong seat, uninstall it with the command `npm uninstall <lib-name>` and then install it again with the command `npm install <lib-name>` (alright, no flag!) at the root directory of the extension.

2/ Install vsce package with the command `npm install -g vsce`, the `-g` flag is a shorthand for the global configuration which sets the package install location to the folder where you installed NodeJS, so do not care about where you run the command.

3/ At the root directory of the extension, run the command `vsce package`. When the command completes, the package of the extension will be dropped at the root directory.

<img src="https://user-images.githubusercontent.com/20492454/156876464-c2ea2f6a-f633-49fa-93e0-5c8a69171806.png" height="400">

4/ Open Visual Studio Code and install the extension with steps below:

<img src="https://user-images.githubusercontent.com/20492454/156876410-f4d100b6-2949-44b6-a94a-41fea2df74eb.png" height="400">
