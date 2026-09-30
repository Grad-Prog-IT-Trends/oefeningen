/* The agent loop. This is the whole idea of an AI agent:

     1. send the conversation and the list of tools to the model
     2. if the model asks for a tool, run it
     3. add the result to the conversation
     4. repeat, until the model answers without asking for a tool

   The model itself only does one thing: it reads the conversation and decides
   what comes next, a tool call or an answer. Running the tools, keeping the
   conversation and deciding when to stop all happen here, in ordinary code.

   `onStep` is not part of the agent. It lets the demo watch every step so it
   can print and record it.                                                    */

const MAX_ROUNDS = 6;   // same limit as the six cards in the lab

export async function runAgent({ model, systemPrompt, question, tools, runTool, onStep = () => {} }) {
  const conversation = model.startConversation(question);
  onStep({ type: "question", text: question });

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // 1. the model reads everything so far and decides what to do next
    const reply = await model.ask({ systemPrompt, tools, conversation });
    conversation.push(reply.message);

    // 4. no tool requested: the model is done and this is the answer
    if (reply.toolCalls.length === 0) {
      onStep({ type: "answer", text: reply.text });
      return { finished: true };
    }

    if (reply.text) onStep({ type: "thinking", text: reply.text });

    // 2. our code runs the requested tools, the model cannot do that itself
    const results = [];
    for (const call of reply.toolCalls) {
      const result = runTool(call.name, call.input);
      onStep({ type: "tool_call", round, name: call.name, input: call.input, result });
      results.push({ call, result });
    }

    // 3. the results go into the conversation, so the model sees them next round
    conversation.push(model.toolResultsMessage(results));
  }

  onStep({ type: "max_rounds", rounds: MAX_ROUNDS });
  return { finished: false };
}
