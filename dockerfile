
FROM node:20.10.0-alpine3.18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci


FROM node:20.10.0-alpine3.18 AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM node:20.10.0-alpine3.18 AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20.10.0-alpine3.18 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER nodeuser
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
