// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { ChatData, convertChatToMarkdown } from './chat-to-markdown';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('chat-to-markdown.convert', async (uri: vscode.Uri) => {
        try {
            // If uri is not provided, try to get the active editor
            if (!uri) {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    throw new Error('No file selected');
                }
                uri = activeEditor.document.uri;
            }

            // Read and parse the JSON file
            const fileContent = await vscode.workspace.fs.readFile(uri);
            const chatData = JSON.parse(fileContent.toString()) as ChatData;

            // Convert the chat data to markdown
            const markdownContent = convertChatToMarkdown(chatData);

            // Create markdown file path
            const markdownPath = uri.with({ path: uri.path.replace(/\.json$/, '.md') });

            // Write the markdown file
            await vscode.workspace.fs.writeFile(markdownPath, Buffer.from(markdownContent));

            // Open the markdown file
            const doc = await vscode.workspace.openTextDocument(markdownPath);
            await vscode.window.showTextDocument(doc);

            // Show success message
            vscode.window.showInformationMessage(`Successfully converted ${path.basename(uri.fsPath)} to markdown!`);

        } catch (error) {
            vscode.window.showErrorMessage(`Error converting file: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
