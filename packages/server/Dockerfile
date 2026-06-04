FROM node:20-alpine
WORKDIR /app

RUN npm install -g @retrofit-ui/server

COPY retrofit.config.js .

CMD ["retrofit-server", "start"]
