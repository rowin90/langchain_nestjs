/**
 * Starter LangGraph.js Template
 * Make this code your own!
 */
import { StateGraph, START } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  BaseMessage,
  AIMessage,
  BaseMessageLike,
} from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

import { ChatOpenAI } from '@langchain/openai';
import { ToolMessage, HumanMessage } from '@langchain/core/messages';

import 'dotenv/config';

import { SerpAPI } from '@langchain/community/tools/serpapi';
import { Calculator } from '@langchain/community/tools/calculator';

const serpTool = new SerpAPI(process.env.SERP_KEY);
const calculatorTool = new Calculator();

const tools = [serpTool, calculatorTool];
const llm = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  },
});
const llmWithTools = llm.bindTools(tools);

const StateAnnotation = Annotation.Root({
  messages: Annotation<AIMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});

const chatbot = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  const ai_messages = await llmWithTools.invoke(state.messages);
  return {
    messages: [ai_messages],
  };
};

const tool_executor = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  // 提取数据状态中的 tool_calls
  const tool_calls = state.messages.at(-1).tool_calls;

  // 根据找到的 tool_calls去获取需要执行什么工具
  const tools_by_name = tools.reduce((acc, tool) => {
    acc[tool.name] = tool;
    return acc;
  }, {});

  // 执行工具得到对应的结果
  const messages = [];
  for (const tool_call of tool_calls) {
    const tool = tools_by_name[tool_call.name];
    const result = await tool.invoke(tool_call.args);
    messages.push(new ToolMessage(result, tool_call.id, tool_call.name));
  }
  return {
    messages: messages,
  };
};

export const route = (
  state: typeof StateAnnotation.State,
): '__end__' | 'tool_executor' => {
  const ai_message = state.messages.at(-1);
  // Loop back
  if ('tool_calls' in ai_message && ai_message.tool_calls.length > 0) {
    return 'tool_executor';
  }

  return '__end__';
};

// Finally, create the graph itself.
const builder = new StateGraph(StateAnnotation)
  .addNode('llm', chatbot)
  .addNode('tool_executor', tool_executor)
  // 添加边
  .addEdge(START, 'llm')
  .addConditionalEdges('llm', route)
  .addEdge('tool_executor', 'llm');

export const graph = builder.compile();

// 调用 graph
(async function () {
  const res = await graph.invoke({
    messages: [
      new HumanMessage(
        'I have 18 US dollars, how much is it equivalent to in RMB?',
      ),
    ],
  });

  res.messages.forEach((m) => {
    console.log('=>(graph.ts 72) m', m.content);
  });
})();

graph.name = 'tool Agent';
