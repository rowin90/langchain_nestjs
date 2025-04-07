/**
 *
 * * 注意需要修改 package.json 文件中的 type 为 module !!!
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { loadMcpTools } from '@langchain/mcp-adapters';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

// Create transport for stdio connection
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const dirname = import.meta.url;
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.resolve(path.dirname(fileURLToPath(dirname)), './mcp.server.js')],
});

// Initialize the client
const client = new Client({
  name: 'math-client',
  version: '1.0.0',
});

(async function main() {
  try {
    console.log('=>建立链接');
    // Connect to the transport
    await client.connect(transport);

    console.log('=>开始获取 tool');
    // Get tools
    const tools = await loadMcpTools('math', client);
    console.log('=>获取tool', tools);

    // Create and run the agent
    console.log('=>agent 开始');
    const agent = createReactAgent({ llm: model, tools });
    const agentResponse = await agent.invoke({
      messages: [{ role: 'user', content: "what's (3 + 5) x 12?" }],
    });
    console.log('=>agent 结束');
    console.log(agentResponse);
  } catch (e) {
    console.error(e);
  } finally {
    // Clean up connection
    await client.close();
  }
})();
