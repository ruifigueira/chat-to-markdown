import * as assert from 'assert';
import { convertChatToMarkdown } from '../chat-to-markdown';
import * as fs from 'fs';
import * as path from 'path';

function readTestDataFile(filename: string): string {
    return fs.readFileSync(
        path.join(__dirname, '..', '..', 'test-data', filename),
        'utf8'
    ).replace(/\r\n/g, '\n'); // Normalize line endings
}

suite('Chat to Markdown Conversion', () => {
    const simpleChatJson = JSON.parse(readTestDataFile('simple-chat.json'));

    test('should convert simple chat to markdown correctly', () => {
        const markdown = convertChatToMarkdown(simpleChatJson);
        const expectedMarkdown = readTestDataFile('simple-chat.expected.md');

        assert.strictEqual(
            markdown.trim(),
            expectedMarkdown.trim(),
            'Generated markdown should match the expected markdown'
        );
    });
});
