
FROM node:20.10.0-alpine3.18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install


FROM node:20.10.0-alpine3.18 AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM node:20.10.0-alpine3.18 AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20.10.0-alpine3.18 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
