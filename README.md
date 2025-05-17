# Chat to Markdown

A Visual Studio Code extension that converts chat.json files (exported using `workbench.action.chat.export`) into markdown files.

## Features

- Right-click on a `.json` file in the explorer or editor to convert it to markdown
- Automatically opens the converted markdown file
- Preserves the role and content of each chat message

## Usage

1. Export your chat conversation to a JSON file using the VS Code command `Export Chat to JSON`
2. Right-click on the exported `.json` file in the explorer or editor
3. Select "Convert to Markdown" from the context menu
4. The markdown file will be created in the same location with a `.md` extension

## Requirements

- Visual Studio Code version 1.100.0 or higher

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release:
- Basic conversion of chat.json to markdown
- Context menu integration
