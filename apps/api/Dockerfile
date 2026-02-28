FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY .env ./.env

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
