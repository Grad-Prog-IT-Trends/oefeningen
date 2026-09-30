/* Talking to the model. The agent loop doesn't care which company's model it
   uses: each adapter below translates our tool definitions into that
   provider's format, and translates the reply back into one shape:

     { message, text, toolCalls: [{ id, name, input }] }

   Compare the two adapters. Gemini calls it functionDeclarations and
   functionCall, Anthropic calls it tools and tool_use. Different names,
   exactly the same mechanism.                                               */

export class ApiError extends Error {
  constructor(provider, status, details) {
    super(`${provider} API error ${status ?? "(no connection)"}`);
    this.provider = provider;
    this.status = status;          // null when the server could not be reached
    this.details = details;
  }
}

async function post(provider, url, headers, body) {
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body)
    });
  } catch {
    throw new ApiError(provider, null, "");
  }
  if (!res.ok) throw new ApiError(provider, res.status, await res.text());
  return res.json();
}

/* ---------------- Gemini ---------------- */

const gemini = {
  name: "Gemini",
  defaultModel: "gemini-3.5-flash",
  keyName: "GEMINI_API_KEY",

  startConversation(question) {
    return [{ role: "user", parts: [{ text: question }] }];
  },

  async ask({ systemPrompt, tools, conversation }) {
    const modelId = process.env.MODEL || this.defaultModel;
    const data = await post("Gemini",
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
      { "x-goog-api-key": process.env.GEMINI_API_KEY },
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: conversation,
        tools: [{ functionDeclarations: tools.map(t => ({
          name: t.name, description: t.description, parameters: t.input_schema
        })) }],
        // Google recommends a higher thinking level for agent loops, otherwise
        // the model sometimes stops calling tools too early
        generationConfig: { thinkingConfig: { thinkingLevel: "medium" } }
      });

    const candidate = data.candidates && data.candidates[0];
    if (!candidate) throw new ApiError("Gemini", "empty", JSON.stringify(data));

    // the whole content object goes back into the conversation unchanged,
    // because it also holds the model's thinking steps
    const message = candidate.content || { role: "model", parts: [] };
    const parts = message.parts || [];
    return {
      message,
      text: parts.filter(p => p.text).map(p => p.text).join("\n").trim(),
      toolCalls: parts.filter(p => p.functionCall).map((p, i) => ({
        id: p.functionCall.id || `call_${i}`,
        name: p.functionCall.name,
        input: p.functionCall.args || {}
      }))
    };
  },

  toolResultsMessage(results) {
    return {
      role: "user",
      parts: results.map(({ call, result }) => ({
        functionResponse: { name: call.name, id: call.id, response: { result } }
      }))
    };
  }
};

/* ---------------- Anthropic ---------------- */

const anthropic = {
  name: "Anthropic",
  defaultModel: "claude-sonnet-5",
  keyName: "ANTHROPIC_API_KEY",

  startConversation(question) {
    return [{ role: "user", content: question }];
  },

  async ask({ systemPrompt, tools, conversation }) {
    const data = await post("Anthropic",
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      {
        model: process.env.MODEL || this.defaultModel,
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: conversation
      });

    const blocks = data.content || [];
    return {
      message: { role: "assistant", content: blocks },
      text: blocks.filter(b => b.type === "text").map(b => b.text).join("\n").trim(),
      toolCalls: blocks.filter(b => b.type === "tool_use").map(b => ({
        id: b.id, name: b.name, input: b.input || {}
      }))
    };
  },

  toolResultsMessage(results) {
    return {
      role: "user",
      content: results.map(({ call, result }) => ({
        type: "tool_result", tool_use_id: call.id, content: JSON.stringify(result)
      }))
    };
  }
};

export const models = { gemini, anthropic };
