import { ChatOpenAI } from '@langchain/openai';
import {
  RemoveMessage,
  AIMessage,
  HumanMessage,
} from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { BaseMessage, BaseMessageLike } from '@langchain/core/messages';
import {
  Annotation,
  messagesStateReducer,
  StateGraph,
  START,
  END,
} from '@langchain/langgraph';

export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[], BaseMessageLike[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  userName: Annotation<string>,

  // additionalField: Annotation<string>,
});

import 'dotenv/config';

const llm = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  },
});

const chatbot = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  const ai_messages = await llm.invoke(state.messages);
  return {
    messages: [ai_messages],
  };
};

/**
 * 删除人类消息
 * @param state
 * @param _config
 */
const deleteHumanMsg = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  const human_message = state['messages'][0];
  return { messages: [new RemoveMessage({ id: human_message.id })] };
};

/**
 * 更新ai消息
 * @param state
 * @param _config
 */
const updateAiMsg = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  const ai_message = state['messages'].at(-1);
  return {
    messages: [
      new AIMessage({
        id: ai_message.id,
        content: '更新后的AI消息' + ai_message.content,
      }),
    ],
  };
};

const builder = new StateGraph(StateAnnotation)
  .addNode('chatbot', chatbot)
  .addNode('deleteHumanMsg', deleteHumanMsg)
  .addNode('updateAiMsg', updateAiMsg)
  .addEdge(START, 'chatbot')
  .addEdge('chatbot', 'deleteHumanMsg')
  .addEdge('deleteHumanMsg', 'updateAiMsg')
  .addEdge('updateAiMsg', END);

export const graph = builder.compile();

// 调用 graph
(async function () {
  const res = await graph.invoke({
    messages: [new HumanMessage('你好，你是？')],
  });
  console.log('=>(4.remove_message.ts 96) res', res);
})();
// Returns the messages in the state at each step of execution
