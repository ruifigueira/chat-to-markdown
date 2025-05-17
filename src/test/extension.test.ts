import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Convert chat.json to markdown', async () => {
        // Create a temporary workspace folder
        const workspaceFolder = path.join(__dirname, '../../test-workspace');
        if (!fs.existsSync(workspaceFolder)) {
            fs.mkdirSync(workspaceFolder, { recursive: true });
        }

        // Copy test JSON file to workspace
        const sourceJsonFile = path.join(__dirname, '../../examples/chat.json');
        const targetJsonFile = path.join(workspaceFolder, 'chat.json');
        fs.copyFileSync(sourceJsonFile, targetJsonFile);

        // Get the URI for the test file
        const uri = vscode.Uri.file(targetJsonFile);

        // Execute the command
        await vscode.commands.executeCommand('chat-to-markdown.convert', uri);

        // Check if markdown file was created
        const mdFile = targetJsonFile.replace(/\.json$/, '.md');
        assert.strictEqual(fs.existsSync(mdFile), true);

        // Read expected output
        const expectedMdFile = path.join(__dirname, '../../examples/chat.md');
        const expectedContent = fs.readFileSync(expectedMdFile, 'utf8');
        
        // Check content matches expected output
        const actualContent = fs.readFileSync(mdFile, 'utf8');
        assert.strictEqual(actualContent.trim(), expectedContent.trim());

        // Clean up
        fs.rmSync(workspaceFolder, { recursive: true, force: true });
    });
});
