const env: string = String( process.env.NODE_ENV );

const rabbitInterval: number = Number( process.env.RABBIT_INTERVAL ) || 5000;
const rancherInterval: number = Number( process.env.RANCHER_INTERVAL ) || 180000;

const rancherAccessKey: string = String( process.env.RANCHER_ACCESS_KEY );
const rancherSecretKey: string = String( process.env.RANCHER_SECRET_KEY );
const rancherUrl: string = String( process.env.RANCHER_URL );

const rancherProjectIdlog1: string = String( process.env.PROJECT_ID_LOGSTASH1 );
const rancherServiceIdlog1: string = String( process.env.SERVICE_ID_LOGSTASH1 );
const rancherProjectIdlog2: string = String( process.env.PROJECT_ID_LOGSTASH2 );
const rancherServiceIdlog2: string = String( process.env.SERVICE_ID_LOGSTASH2 );

const slackWebHook: string = String( process.env.SLACK_WEB_HOOK );
const slackChannel: string = String( process.env.SLACK_CHANNEL );

const rabbitHost: string = String( process.env.RABBIT_HOST );
const rabbitApiPort: number = Number( process.env.RABBIT_API_PORT );
const rabbitUri: string = `http://${rabbitHost}:${rabbitApiPort}/api/vhosts`;
const username: string = String( process.env.RABBIT_USER );
const password: string = String( process.env.RABBIT_PASSWORD );
const limiarReset: number = Number( process.env.LIMIAR_RESET ) || 30;

async function checkEnv () {
    let ok: boolean = true;
    if ( password == undefined ) {
        console.log( "[  CONF  ] Password não configurado" );
        ok = false;
    }
    if ( rabbitUri == undefined ) {
        console.log( "[  CONF  ] URL do Rabbit não configurada" );
        ok = false;
    }
    if ( rancherAccessKey == undefined ) {
        console.log( "[  CONF  ] Access Key não configurado" );
        ok = false;
    }
    if ( rancherSecretKey == undefined ) {
        console.log( "[  CONF  ] SecretKey não configurado" );
        ok = false;
    }
    if ( rancherServiceIdlog1 == undefined ) {
        console.log( "[  CONF  ] ServiceID Logstash 1 não configurado" );
        ok = false;
    }
    if ( rancherServiceIdlog2 == undefined ) {
        console.log( "[  CONF  ] ServiceID Logstash 2 não configurado" );
        ok = false;
    }
    if ( rancherUrl == undefined ) {
        console.log( "[  CONF  ] URL do Rancher não configurada" );
        ok = false;
    }
    if ( slackChannel == undefined ) {
        console.log( "[  CONF  ] Canal do slack não configurado" );
        ok = false;
    }
    if ( slackWebHook == undefined ) {
        console.log( "[  CONF  ] WebHook do slack não configurado" );
        ok = false;
    }
    if ( username == undefined ) {
        console.log( "[  CONF  ] Usuario do Rabbit não configurado" );
        ok = false;
    }
    if ( rabbitHost == undefined ) {
        console.log( "[  CONF  ] Servidor do Rabbit não configurado" );
        ok = false;
    }
    if ( rabbitApiPort == undefined ) {
        console.log( "[  CONF  ] Porta do Rabbit não configurada" );
        ok = false;
    }
    if ( !ok ) {
        console.log( "[EnvERROR] Falha na configuração do ambiente. saindo!" );
        process.exit( 1 );
    }
}

export {
    rabbitInterval, rancherInterval, rancherAccessKey, rancherSecretKey,
    rancherProjectIdlog1, rancherServiceIdlog1, rancherProjectIdlog2, rancherServiceIdlog2,
    rancherUrl, slackWebHook, slackChannel, username, password, rabbitUri, env, rabbitHost,
    rabbitApiPort, checkEnv, limiarReset
}
