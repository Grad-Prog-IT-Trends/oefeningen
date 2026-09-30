/* Reading .env and saving recordings. Plumbing for the demo. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { info } from "./print.js";

export const PROJECT_DIR = new URL("../../", import.meta.url);
export const RECORDINGS_DIR = new URL("logs/", PROJECT_DIR);

/* Reads .env without an extra package. Format: KEY=value, one per line.
   Lines starting with # are skipped. */
export async function loadEnv() {
  try {
    const content = await readFile(new URL(".env", PROJECT_DIR), "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* no .env, fall back to the environment */ }
}

export async function saveRecording(name, steps) {
  await mkdir(RECORDINGS_DIR, { recursive: true });
  await writeFile(new URL(`${name}.json`, RECORDINGS_DIR), JSON.stringify(steps, null, 2), "utf8");
  info(`Opname bewaard in logs/${name}.json. Afspelen kan met: npm run herspeel`);
}
