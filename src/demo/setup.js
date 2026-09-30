/* One-time setup: asks for your Gemini key, saves it in .env and checks it works.

     npm run setup                                                              */

import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { PROJECT_DIR } from "./files.js";
import { color as c } from "./print.js";

const ok = text => console.log(c.green + "  ✓ " + c.reset + text);
const fail = text => console.log(c.red + "  ✗ " + c.reset + text);

console.log(c.bold + "\nSetup van de Bliep-demo\n" + c.reset);

// 1. Node version
const majorVersion = Number(process.versions.node.split(".")[0]);
if (majorVersion < 18) {
  fail(`Je hebt Node ${process.versions.node}. Je hebt minstens versie 18 nodig.`);
  console.log("    Installeer de LTS-versie via https://nodejs.org en probeer opnieuw.");
  process.exit(1);
}
ok(`Node ${process.versions.node}`);

// 2. create or update .env
const envPath = new URL(".env", PROJECT_DIR);
let envContent;
try {
  envContent = await readFile(envPath, "utf8");
} catch {
  envContent = await readFile(new URL(".env.example", PROJECT_DIR), "utf8");
}
const currentKey = (envContent.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1]?.trim();

const rl = createInterface({ input: process.stdin, output: process.stdout });
console.log();
if (currentKey) {
  console.log("  Er staat al een sleutel in .env.");
  console.log("  Druk op Enter om die te houden, of plak een nieuwe.");
} else {
  console.log("  Plak je Gemini-sleutel en druk op Enter.");
  console.log("  Nog geen sleutel? Haal er gratis een op via https://aistudio.google.com (Get API key).");
}
const typed = (await rl.question("  > ")).trim().replace(/^["']|["']$/g, "");
rl.close();
console.log();

const key = typed || currentKey;
if (!key) {
  fail("Geen sleutel ingevuld. Draai npm run setup opnieuw als je er een hebt.");
  process.exit(1);
}

envContent = /^GEMINI_API_KEY=.*$/m.test(envContent)
  ? envContent.replace(/^GEMINI_API_KEY=.*$/m, "GEMINI_API_KEY=" + key)
  : envContent.trimEnd() + "\nGEMINI_API_KEY=" + key + "\n";
await writeFile(envPath, envContent, "utf8");
ok("Sleutel bewaard in .env");

// 3. does the key work? Listing the models is free.
//    (No process.exit() after a fetch: that can crash Node on Windows.)
let res;
try {
  res = await fetch("https://generativelanguage.googleapis.com/v1beta/models",
    { headers: { "x-goog-api-key": key } });
} catch {
  res = null;
}

if (!res) {
  fail("Kon Google niet bereiken. Controleer je internet en probeer opnieuw.");
  process.exitCode = 1;
} else if (!res.ok) {
  fail(`Google aanvaardt de sleutel niet (fout ${res.status}).`);
  console.log("    Kopieer hem opnieuw uit aistudio.google.com en draai npm run setup nog eens.");
  process.exitCode = 1;
} else {
  ok("De sleutel werkt");
  console.log("\n  Klaar. Start de eerste demo met:  " + c.bold + "npm run a" + c.reset + "\n");
}
