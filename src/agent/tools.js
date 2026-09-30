/* The tools the agent can use. Every tool has two halves:

   - a definition: what the model gets to see. A name, a description in plain
     language and the inputs it needs. This is literally all the model knows
     about Bliep's systems.
   - an implementation: the code that runs when the model asks for the tool.
     The model never sees this part.

   The tool names and texts are in Dutch because the model talks to Dutch
   customers, and because they match the cards from the role-play.           */

import * as bliep from "../bliep/systems.js";

export const toolDefinitions = [
  {
    name: "bestelling_opzoeken",
    description: "Geeft status, datum, bedrag en producten van een Bliep-bestelling.",
    input_schema: {
      type: "object",
      properties: { ordernummer: { type: "string", description: "Formaat BLP-nnnnn" } },
      required: ["ordernummer"]
    }
  },
  {
    name: "trackingstatus_opvragen",
    description: "Geeft de positie van het pakket volgens de koerier.",
    input_schema: {
      type: "object",
      properties: { trackingnummer: { type: "string" } },
      required: ["trackingnummer"]
    }
  },
  {
    name: "klantgegevens_opzoeken",
    description: "Geeft naam, adres, telefoon en bestelhistoriek van een klant.",
    input_schema: {
      type: "object",
      properties: { email: { type: "string" } },
      required: ["email"]
    }
  },
  {
    name: "terugbetaling_uitvoeren",
    description: "Stort een bedrag terug naar de klant van een bestelling.",
    input_schema: {
      type: "object",
      properties: {
        ordernummer: { type: "string" },
        bedrag: { type: "number" },
        goedkeuring_id: { type: "string", description: "Id van de medewerker die goedkeurde." }
      },
      required: ["ordernummer", "bedrag"]
    }
  }
];

/* Connects each tool name to the Bliep system it calls. */
export function createToolRunner({ refundNeedsApproval = false } = {}) {
  const implementations = {
    bestelling_opzoeken:     input => bliep.findOrder(input.ordernummer),
    trackingstatus_opvragen: input => bliep.trackParcel(input.trackingnummer),
    klantgegevens_opzoeken:  input => bliep.findCustomer(input.email),
    terugbetaling_uitvoeren: input => bliep.refund(input, { refundNeedsApproval })
  };

  return function runTool(name, input) {
    const implementation = implementations[name];
    return implementation ? implementation(input) : { error: "unknown tool" };
  };
}
