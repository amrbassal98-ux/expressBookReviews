FROM node:20-alpine AS builder
WORKDIR /app/final_project
COPY final_project/package*.json ./
RUN npm ci --only=production
COPY final_project/ .

FROM node:20-alpine
WORKDIR /app/final_project
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
COPY --from=builder /app/final_project .
USER appuser
EXPOSE 5000
CMD ["node", "index.js"]
