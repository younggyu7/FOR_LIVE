# 한 번에 빌드: 화면(Node) → 서버(NestJS, TypeScript 컴파일) → 실행 이미지(Node, 화면을 함께 담음). docker compose up --build가 쓴다.
FROM node:20-alpine AS web
WORKDIR /web
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
ENV NEXT_PUBLIC_API=server
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /src
COPY backend/package.json ./
RUN npm install --no-audit --no-fund
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=server /src/package.json ./
COPY --from=server /src/node_modules ./node_modules
COPY --from=server /src/dist ./dist
COPY --from=web /web/out ./static
ENV LOCAL_DIR=/app/local STATIC_DIR=/app/static
EXPOSE 8080
CMD ["node", "dist/main.js"]
