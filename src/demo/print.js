/* Everything the demo shows in the terminal. A real agent prints nothing, it
   just answers the customer. We print every step so you can follow along.
   The on-screen labels are in Dutch, for the class.                        */

export const color = {
  reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  magenta: "\x1b[35m", cyan: "\x1b[36m"
};
const c = color;

function line(char = "-") {
  console.log(c.dim + char.repeat(72) + c.reset);
}

export function info(text) {
  console.log(c.dim + text + c.reset);
}

export function printHeader({ title, modelLabel, toolNames, refundNeedsApproval }) {
  console.log("\n" + title);
  info("Model: " + modelLabel);
  info("De agent heeft " + toolNames.length + " tools: " + toolNames.join(", "));
  if (refundNeedsApproval) {
    info("De terugbetaal-API weigert deze keer alles zonder goedkeurings-id van een medewerker.");
  }
  console.log();
}

/* Returns a function that prints one step of the agent loop. */
export function createStepPrinter() {
  let toolCallCount = 0;

  return function printStep(step) {
    switch (step.type) {
      case "question":
        line("=");
        console.log(c.bold + "KLANT" + c.reset);
        console.log(step.text);
        line("=");
        break;

      case "thinking":
        console.log(c.dim + "\n  (het model denkt hardop)" + c.reset);
        console.log("  " + step.text.replace(/\n/g, "\n  "));
        break;

      case "tool_call": {
        toolCallCount++;
        const standsOut = step.result && (step.result.uitgevoerd || step.result.geweigerd);
        console.log(c.cyan + c.bold + `\n  ronde ${step.round}  →  tool_use` + c.reset);
        console.log("    " + c.bold + step.name + c.reset + "(" + JSON.stringify(step.input) + ")");
        console.log(c.magenta + "  ←  tool_result" + c.reset);
        console.log((standsOut ? c.yellow : "") + "    " + JSON.stringify(step.result) + c.reset);
        break;
      }

      case "answer":
        console.log();
        line("=");
        console.log(c.green + c.bold + "ANTWOORD AAN DE KLANT" + c.reset);
        console.log(step.text || "(geen tekst)");
        line("=");
        info(`Klaar na ${toolCallCount} tool-call(s).`);
        break;

      case "max_rounds":
        console.log();
        line("=");
        console.log(c.red + c.bold +
          `De lus is gestopt na ${step.rounds} rondes zonder antwoord. Dat is F3.` + c.reset);
        line("=");
        break;
    }
  };
}

/* After a run: was money refunded without anyone approving it? Say so loudly. */
export function printWarnings(steps) {
  const moneyWentOut = steps.some(s => s.type === "tool_call" &&
    s.name === "terugbetaling_uitvoeren" && s.result && s.result.uitgevoerd);
  if (moneyWentOut) {
    console.log("\n" + c.red + c.bold +
      "Er is geld vertrokken zonder dat er iemand naar gekeken heeft. Dat is F2." + c.reset);
  }
}
