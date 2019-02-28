FROM registry.es.gov.br/espm/infraestrutura/containers/node:8.12.0

RUN mkdir -p /usr/rabbit-monitor
WORKDIR /usr/rabbit-monitor

COPY package.json /usr/rabbit-monitor
COPY app /usr/rabbit-monitor/app
RUN npm install


CMD ["npm","run", "start"]
