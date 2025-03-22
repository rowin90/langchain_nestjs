/**
 * 子图实现类 多Agent功能
 */
import { ChatOpenAI } from '@langchain/openai';
import { RunnableConfig } from '@langchain/core/runnables';
import { z } from 'zod';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { StateGraph } from '@langchain/langgraph';
import { BaseMessage, BaseMessageLike } from '@langchain/core/messages';
import { Annotation, messagesStateReducer,START,END } from '@langchain/langgraph';
import { toolsCondition } from '@langchain/langgraph/prebuilt';
import { ChatPromptTemplate ,MessagesPlaceholder,SystemMessagePromptTemplate} from '@langchain/core/prompts'
import { StringOutputParser} from '@langchain/core/output_parsers'

import 'dotenv/config';

const reduce_str = (left: string | null, right: string | null) => {
  if (right) {
    return right;
  }
  return left;
};

const AgentState = Annotation.Root({
  query: Annotation<string[]>({
    // 原始问题
    reducer: reduce_str,
    default: () => [],
  }),
  live_content: Annotation<string[]>({
    // 直播间文案
    reducer: reduce_str,
    default: () => [],
  }),
  // live_content_messages: Annotation<BaseMessage[], BaseMessageLike[]>({
  //   reducer: messagesStateReducer,
  //   default: () => [],
  // }),
  xhs_content: Annotation<string[]>({
    // 小红书文案
    reducer: reduce_str,
    default: () => [],
  }),
  // xhs_content_messages: Annotation<BaseMessage[], BaseMessageLike[]>({
  //   reducer: messagesStateReducer,
  //   default: () => [],
  // }),
});

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  },
});

const chatbot_live = (state:typeof AgentState.State,config:RunnableConfig){
  const prompt =  ChatPromptTemplate.fromTemplate(`
    你是一个拥有10年经验的直播文案专家，请根据用户提供的产品整理一篇直播带货脚本文案。
    
    问题:{query}
   
  `)

  const chain = prompt.pipe(model).pipe(new StringOutputParser())
  const res = await chain.invoke({
    query:state.query,
  },config)

  return {
    live_content:res
  }
}


const chatbot_live_agent = new StateGraph(AgentState)
  .addNode('chatbot_live',chatbot_live)

  .addEdge(START,'chatbot_live')



const chatbot_xhs = (state:typeof AgentState.State,config:RunnableConfig){
  const prompt =  ChatPromptTemplate.fromTemplate(`
    你是一个小红书文案大师，请根据用户传递的商品名，生成一篇关于该商品的小红书笔记文案，注意风格活泼，多使用emoji表情。
    
    问题:{query}
   
  `)

  const chain = prompt.pipe(model).pipe(new StringOutputParser())
  const res = await chain.invoke({
    query:state.query,
  },config)

  return {
    xhs_content_messages:res
  }
}


const parallel_node = (state:typeof AgentState.State,config:RunnableConfig){
  return state
}


const inputs = {
  messages: [{ role: 'user', content: 'what is the weather in SF?' }],
};

// 调用 graph
// (async function () {
//   const stream = await agent.stream(inputs, { streamMode: 'values' });
//
//   for await (const { messages } of stream) {
//     console.log(messages);
//   }
// })();
// Returns the messages in the state at each step of execution
