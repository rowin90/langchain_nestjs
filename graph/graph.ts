/**
 * Starter LangGraph.js Template
 * Make this code your own!
 */
import { StateGraph, START } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
import { StateAnnotation } from './state';

const callModel = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  return {
    messages: [
      {
        role: 'assistant',
        content: `Hi there! How are you?`,
      },
    ],
    userName: 'youyou',
  };
};

const customAdd = () => {
  return {
    messages: [
      {
        role: 'assistant',
        content: `my name is youyou`,
      },
    ],
  };
};

export const route = (
  state: typeof StateAnnotation.State,
): '__end__' | 'callModel' => {
  console.log('state.messages :', state.messages.length);
  if (state.messages.length > 5) {
    return '__end__';
  }
  // Loop back
  return 'callModel';
};

// Finally, create the graph itself.
const builder = new StateGraph(StateAnnotation)
  // Add the nodes to do the work.
  // Chaining the nodes together in this way
  // updates the types of the StateGraph instance
  // so you have static type checking when it comes time
  // to add the edges.
  .addNode('callModel', callModel)
  .addNode('customAdd', customAdd)
  // Regular edges mean "always transition to node B after node A is done"
  // The "__start__" and "__end__" nodes are "virtual" nodes that are always present
  // and represent the beginning and end of the builder.
  .addEdge(START, 'callModel')
  .addEdge('callModel', 'customAdd')
  // Conditional edges optionally route to different nodes (or end)
  .addConditionalEdges('customAdd', route);

export const graph = builder.compile();

// 调用 graph
(async function () {
  const res = await graph.invoke({ messages: [], userName: 'haha' });

  console.log('=>(demo.ts 26) username', res.userName);
  res.messages.forEach((m) => {
    console.log('=>(graph.ts 72) m', m.content);
  });
})();

graph.name = 'New Agent';
