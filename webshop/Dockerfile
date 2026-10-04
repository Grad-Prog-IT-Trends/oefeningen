# Het recept voor het image van de webshop. Docker voert dit van boven naar beneden uit.
# Je kent dit uit IT Landscape. In les 4 hoef je hier niets aan te veranderen.

# Vertrek van een klein image met Node 22 erin.
FROM node:22-alpine

# Alles gebeurt in de map /app in de container.
WORKDIR /app

# Eerst alleen package.json en package-lock.json, dan npm ci. Zo onthoudt Docker deze
# stap (cache) zolang je dependencies niet veranderen, en bouwt het image sneller.
COPY package*.json ./
RUN npm ci --omit=dev

# Dan de rest van de code. Wat in .dockerignore staat, gaat niet mee.
COPY . .

# Niet als root draaien: de gebruiker node bestaat al in het image.
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
