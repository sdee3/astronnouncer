FROM node:24-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm i --omit=dev && npm i pm2 -g

COPY build ./build
COPY public ./public
COPY .env ./

EXPOSE 3000

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/astronnouncer.db

CMD ["sh", "-c", "pm2 start build/index.js --name=DiscordBot && pm2 save && pm2 logs"]
