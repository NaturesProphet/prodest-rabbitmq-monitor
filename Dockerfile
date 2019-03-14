FROM registry.es.gov.br/espm/infraestrutura/containers/node:10.15.3

RUN mkdir -p /usr/realtime-bot
WORKDIR /usr/realtime-bot

COPY package.json /usr/realtime-bot
COPY tsconfig.json /usr/realtime-bot
COPY src /usr/realtime-bot/src
RUN npm install --only=production
RUN npm install typescript
RUN npm run build


CMD ["npm","run", "start:prod"]
