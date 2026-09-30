/* Starts the classroom demo:

     npm run a        scenario A: the loop just works
     npm run c        scenario C: no brake and no escalation rule
     npm run c-rem    scenario C: with the check in the system behind the tool

   Add :log (npm run c:log) to save a recording in logs/.

   This file only wires things together. The agent itself is in src/agent/. */

import { runAgent } from "../agent/loop.js";
import { toolDefinitions, createToolRunner } from "../agent/tools.js";
import { models, ApiError } from "../agent/models.js";
import { scenarios } from "./scenarios.js";
import { printHeader, createStepPrinter, printWarnings } from "./print.js";
import { loadEnv, saveRecording } from "./files.js";

await loadEnv();

// which scenario?
const scenarioName = (process.argv[2] || "a").toLowerCase();
const scenario = scenarios[scenarioName];
if (!scenario) {
  console.log("Kies een scenario: a, c of c-rem. Bijvoorbeeld: npm run c-rem");
  process.exit(1);
}

// which model, and is there a key?
const providerName = (process.env.PROVIDER || "gemini").toLowerCase();
const model = models[providerName];
if (!model) {
  console.error(`Onbekende provider "${providerName}". Zet PROVIDER=gemini of PROVIDER=anthropic in .env.`);
  process.exit(1);
}
if (!process.env[model.keyName]) {
  console.error(`Geen ${model.keyName} gevonden in .env. ` +
    (providerName === "gemini" ? "Draai eerst: npm run setup" : "Zet je sleutel in .env."));
  process.exit(1);
}

printHeader({
  title: scenario.title,
  modelLabel: `${model.name}, ${process.env.MODEL || model.defaultModel}`,
  toolNames: toolDefinitions.map(t => t.name),
  refundNeedsApproval: scenario.refundNeedsApproval
});

// run the agent, and print and record every step it takes
const steps = [];
const printStep = createStepPrinter();

try {
  await runAgent({
    model,
    systemPrompt: scenario.systemPrompt,
    question: scenario.question,
    tools: toolDefinitions,
    runTool: createToolRunner({ refundNeedsApproval: scenario.refundNeedsApproval }),
    onStep: step => { printStep(step); steps.push(step); }
  });

  printWarnings(steps);
  if (process.argv.includes("--log")) await saveRecording(`${scenarioName}-${Date.now()}`, steps);
} catch (error) {
  if (!(error instanceof ApiError)) throw error;
  console.error("\n" + explain(error));
  process.exitCode = 1;   // no process.exit() right after a fetch: that can crash Node on Windows
}

/* Turns an API error into something a beginner can act on. */
function explain(error) {
  if (error.status === null) {
    return `Geen verbinding met ${error.provider}. Controleer je internet.\n` +
      "Geen netwerk in de les? Speel een eerdere opname af met: npm run herspeel";
  }
  const hints = {
    400: "Meestal betekent dit dat de sleutel niet klopt. Draai npm run setup opnieuw.",
    401: "De sleutel wordt niet aanvaard. Controleer hem in .env.",
    403: "De sleutel wordt niet aanvaard. Controleer hem in .env.",
    404: "Dit model bestaat niet (meer). Kijk naar MODEL in .env, of laat het leeg.",
    429: "Je zit aan de limiet. Wacht een minuut, of zet MODEL=gemini-3.5-flash-lite in .env."
  };
  return `${error.provider} gaf fout ${error.status}. ${hints[error.status] || ""}\n` +
    String(error.details).slice(0, 600);
}
