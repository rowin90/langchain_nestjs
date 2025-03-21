import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
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

const agent = createReactAgent({ llm: model, tools: [getWeather] });

const inputs = {
  messages: [{ role: 'user', content: 'what is the weather in SF?' }],
};

// 调用 graph
(async function () {
  const stream = await agent.stream(inputs, { streamMode: 'values' });

  for await (const { messages } of stream) {
    console.log(messages);
  }
})();
// Returns the messages in the state at each step of execution
