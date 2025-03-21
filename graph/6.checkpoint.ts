import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import 'dotenv/config';

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  },
});

const getWeather = tool(
  (input) => {
    if (['sf', 'san francisco'].includes(input.location.toLowerCase())) {
      return "It's 60 degrees and foggy.";
    } else {
      return "It's 90 degrees and sunny.";
    }
  },
  {
    name: 'get_weather',
    description: 'Call to get the current weather.',
    schema: z.object({
      location: z.string().describe('Location to get the weather for.'),
    }),
  },
);

const checkpointer = new MemorySaver();

const agent = createReactAgent({
  llm: model,
  tools: [getWeather],
  checkpointer,
});

// 调用 graph
(async function () {
  const res = await agent.invoke(
    {
      messages: [
        { role: 'user', content: '我叫晓晓宝，喜欢打篮球，你喜欢什么' },
      ],
    },
    {
      configurable: { thread_id: 1 },
    },
  );
  console.log('=>(6.checkpoint.ts 48) res', res);

  const res1 = await agent.invoke(
    {
      messages: [{ role: 'user', content: '我叫什么' }],
    },
    {
      configurable: { thread_id: 1 },
    },
  );
  console.log('=>(6.checkpoint.ts 48) res', res1);
})();
// Returns the messages in the state at each step of execution
