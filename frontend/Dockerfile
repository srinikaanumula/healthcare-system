FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/serve-build.js ./serve-build.js
COPY package*.json ./
RUN npm install express

EXPOSE 3000
ENV PORT=3000

CMD ["node", "serve-build.js"]
