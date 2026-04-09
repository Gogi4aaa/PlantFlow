FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
