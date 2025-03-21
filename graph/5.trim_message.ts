import { ChatOpenAI } from '@langchain/openai';
import {
  RemoveMessage,
  AIMessage,
  HumanMessage,
  trimMessages,
} from '@langchain/core/messages';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
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

const messages = [
  new HumanMessage('你好，我叫慕小课，我喜欢游泳打篮球，你喜欢什么呢'),
  new AIMessage(
    '你好，慕小课！我对很多话题感兴趣，比如探索新知识和帮助解决问题。你最喜欢游泳还是篮球呢',
  ),
  new AIMessage(
    '你好，慕小课！我喜欢探讨各种话题和帮助解答问题。你对游泳和篮球的兴趣很广泛，有没有特别喜欢的运动方式或运动员呢？',
  ),
];

(async function () {
  const updateMsg = await trimMessages(messages, {
    maxTokens: 80,
    tokenCounter: llm,
    strategy: 'first',
    endOn: 'human',
    allowPartial: true,
  });
  console.log('=>(5.trim_message.ts 56) updateMsg', updateMsg);
})();

// Returns the messages in the state at each step of execution
