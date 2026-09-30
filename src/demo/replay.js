/* Replays a saved run, at a readable pace and without internet.
   A safety net: record your runs at home with :log, and if the network
   drops in class, show your own recording instead.

     npm run herspeel            the latest recording
     npm run herspeel c          the latest recording of scenario c
     npm run herspeel:snel c     the same, without pauses
     node src/demo/replay.js logs/c-1731412345678.json    a specific file    */

import { readFile, readdir } from "node:fs/promises";
import { RECORDINGS_DIR } from "./files.js";
import { createStepPrinter, printWarnings, info } from "./print.js";

const args = process.argv.slice(2);
const fast = args.includes("--snel");
const choice = args.find(a => !a.startsWith("--"));
const wait = ms => new Promise(resolve => setTimeout(resolve, fast ? 0 : ms));

async function findRecording(choice) {
  if (choice && choice.endsWith(".json")) return { path: choice, label: choice };

  let files = [];
  try { files = await readdir(RECORDINGS_DIR); } catch { /* no logs/ yet */ }

  const timestamp = file => Number(file.match(/-(\d+)\.json$/)[1]);
  const latest = files
    .filter(file => /-\d+\.json$/.test(file))
    .filter(file => !choice || file.replace(/-\d+\.json$/, "") === choice)
    .sort((x, y) => timestamp(x) - timestamp(y))
    .at(-1);

  return latest && { path: new URL(latest, RECORDINGS_DIR), label: "logs/" + latest };
}

const recording = await findRecording(choice);
if (!recording) {
  console.log("Geen opname gevonden" + (choice ? ` voor scenario ${choice}` : "") + ".");
  console.log("Neem er eerst een op, bijvoorbeeld met: npm run c:log");
  process.exit(1);
}

const steps = JSON.parse(await readFile(recording.path, "utf8"));
info(`\nOpname: ${recording.label}\n`);

const printStep = createStepPrinter();
for (const step of steps) {
  await wait(step.type === "question" ? 0 : 1500);
  printStep(step);
}

printWarnings(steps);
info("\n(dit was een opname, geen live call)");
