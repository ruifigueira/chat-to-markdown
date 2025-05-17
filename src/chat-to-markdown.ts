import { Uri } from 'vscode';

export interface ChatMessage {
    parts?: { text?: string }[];
    text?: string;
}

export interface TextResponse {
    value: string;
    supportThemeIcons?: boolean;
    supportHtml?: boolean;
    baseUri?: Uri;
}

interface ToolResultDetails {
    input?: string;
    output?: Array<{ type: string; value: string; }>;
    isError?: boolean;
}

export interface ToolInvocation {
    kind: 'toolInvocationSerialized';
    toolId: string;
    resultDetails?: ToolResultDetails;
    toolSpecificData?: Record<string, unknown>;
    presentation?: 'hidden';
}

export interface CodeBlockUriResponse {
    kind: 'codeblockUri';
    uri: Uri;
    isEdit?: boolean;
}

export type ChatResponsePart = TextResponse | ToolInvocation | CodeBlockUriResponse;

export interface ChatRequest {
    requestId: string;
    message: ChatMessage;
    response: ChatResponsePart[];
    timestamp: number;
}

export interface ChatData {
    requesterUsername: string;
    responderUsername: string;
    requests: ChatRequest[];
}

// Strips f1e_ prefix from tool IDs if present
function stripToolIdPrefix(toolId: string): string {
    return toolId.replace(/^[0-9a-f]{3}_/, '');
}

function formatCodeBlock(content: string, language?: string): string {
    // Don't generate a code block if content is empty or just whitespace
    if (!content?.trim()) {
        return '';
    }

    return `\`\`\`${language || ''}
${content}
\`\`\`
`;
}

function formatToolOutput(output: any[]): string {
    if (!output?.length) {
        return '';
    }
    
    // If output is an array of objects with 'type' and 'value'
    if (output[0]?.type === 'text') {
        // Join text values and preserve newlines
        return output.map(item => item.value).join('\n');
    }
    
    // Format as JSON for other types of output
    return formatCodeBlock(JSON.stringify(output, null, 2), 'json');
}

function formatToolCall(toolResponse: ToolInvocation): string {
    if (!toolResponse.toolId) {
        return '';
    }

    const resultDetails = toolResponse.resultDetails || {};
    const { input, output } = resultDetails;
    const displayToolId = stripToolIdPrefix(toolResponse.toolId);

    // Only generate the details block if we have input, output or toolSpecificData
    const hasInput = !!input;
    const hasOutput = !!output?.length;
    const hasAdditionalInfo = toolResponse.toolSpecificData && Object.keys(toolResponse.toolSpecificData).length > 0;

    if (!hasInput && !hasOutput && !hasAdditionalInfo) {
        return `<details>
<summary>🛠️ Ran ${displayToolId}</summary>
</details>

`;
    }

    const markdown = `<details>
<summary>🛠️ Ran ${displayToolId}</summary>

${hasInput ? `**Input:**
${formatCodeBlock(input, 'json')}` : ''}${hasOutput ? `

**Output:**
${formatToolOutput(output)}` : ''}${hasAdditionalInfo ? `

**Additional Info:**
${formatCodeBlock(JSON.stringify(toolResponse.toolSpecificData, null, 2), 'json')}` : ''}</details>

`;

    return markdown;
}

function handleTextResponse(value: string): string {
    const text = value.trim();
    if (!text || text === '```') {
        return '';
    }
    return text + '\n\n';
}

function handleToolInvocation(resp: ToolInvocation): string {
    return formatToolCall(resp);
}

function handleCodeBlockUri(uri: Uri): string {
    const filename = uri.path.split('/').pop() || uri.path;
    return `📄 ${filename}\n\n`;
}

function processResponsePart(resp: any): string {
    let text = '';

    if (resp.value) {
        text = handleTextResponse(resp.value);
    } else if (resp.kind === 'toolInvocationSerialized' && resp.presentation !== 'hidden') {
        text = handleToolInvocation(resp);
    } else if (resp.kind === 'codeblockUri' && resp.uri) {
        text = handleCodeBlockUri(resp.uri);
    }

    return text;
}

export function convertChatToMarkdown(chatData: ChatData): string {
    // Convert to markdown
    let markdownContent = '';
    
    // Add header with chat information
    markdownContent += `# Chat Conversation\n\n`;
    markdownContent += `Between **${chatData.requesterUsername}** and **${chatData.responderUsername}**\n\n`;
    markdownContent += `---\n\n`;

    // Process each request-response pair
    for (const request of chatData.requests) {
        const timestamp = new Date(request.timestamp).toLocaleString();
        const question = request.message.text || 
            (request.message.parts?.map(p => p.text).filter(Boolean).join('\n') || '');

        markdownContent += `## Question (${timestamp})\n\n${question}\n\n`;

        // Process response parts
        if (request.response) {
            markdownContent += `### Response\n\n`;
            let responseText = '';
            let isLastOutputFile = false;

            for (const resp of request.response) {
                const text = processResponsePart(resp);
                if (!isLastOutputFile && text && responseText.trim()) {
                    responseText = responseText.trimEnd() + '\n\n';
                }
                responseText += text;
            }

            // Trim any trailing newlines but ensure at least one
            markdownContent += responseText.trim() + '\n\n';
        }

        markdownContent += `---\n\n`;
    }

    return markdownContent;
}
