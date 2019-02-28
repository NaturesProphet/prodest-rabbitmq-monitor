[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

# RabbitMQ Monitor

Serviço feito para monitorar o fluxo de dados dentro do RabbitMQ através da api de seu management-plugin, e então poder tomar providências nos casos de queda do produtor ou do consumidor. 

## Aplicação

Neste caso, os serviços estão todos em Docker, hospedados em um servidor Rancher. Em casos de quedas o serviço notifica a equipe via Slack e sai reiniciando os envolvidos, mantendo a equipe informada do processo todo.  
A intenção é estabilizar nossas pilhas de serviço no rancher, nao sendo mais necessário a presença na prodest para reiniciar os logstashs em caso de queda da Geocontrol, que até então, derrubava o logstash 1 junto.

## Variáveis de ambiente para a utilização correta
```bash
NODE_ENV                        # Ajuste para 'production' quando for pra vera.
RABBIT_HOST                     # Servidor do RabbitMQ
RABBIT_API_PORT                 # Porta do RabbitMQ
RABBIT_USER                     # Usuário do RabbitMQ
RABBIT_PASSWORD                 # Senha do RabbitMQ
SLACK_WEB_HOOK                  # WebHook configurado no slack apps
SLACK_CHANNEL                   # Canal no slack onde serão enviadas as mensagens de eventos
RANCHER_ACCESS_KEY              # chave do rancher
RANCHER_SECRET_KEY               # token do rancher
PROJECT_ID_LOGSTASH_1           # ProjectId do logstash 1 (logstash-rabbit)
SERVICE_ID_LOGSTASH_1           # serviceId do logstash 1 (logstash-rabbit)
PROJECT_ID_LOGSTASH_2           # ProjectId do logstash 2 (logstash-pipeline)
SERVICE_ID_LOGSTASH_2           # serviceId do logstash 2 (logstash-pipeline)
RANCHER_URL                     # uri da api do rancher
```

