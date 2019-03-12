const env: String = String( process.env.NODE_ENV );

const rabbitInterval: number = Number( process.env.RABBIT_INTERVAL ) || 5000;
const rancherInterval: number = Number( process.env.RANCHER_INTERVAL ) || 180000;

const rancherAccessKey: string = String( process.env.RANCHER_ACCESS_KEY );
const rancherSecretKey: string = String( process.env.RANCHER_SECRET_KEY );
const rancherProjectId: string = String( process.env.PROJECT_ID );
const rancherServiceId: string = String( process.env.SERVICE_ID );
const rancherUrl: string = String( process.env.RANCHER_URL );

const slackWebHook: String = String( process.env.SLACK_WEB_HOOK );
const slackChannel: String = String( process.env.SLACK_CHANNEL );

const rabbitHost: string = String( process.env.RABBIT_HOST );
const rabbitApiPort: number = Number( process.env.RABBIT_API_PORT );
const rabbitUri: string = `http://${rabbitHost}:${rabbitApiPort}/api/vhosts`;
const username: string = String( process.env.RABBIT_USER );
const password: string = String( process.env.RABBIT_PASSWORD );


export {
    rabbitInterval, rancherInterval, rancherAccessKey, rancherSecretKey,
    rancherProjectId, rancherServiceId, rancherUrl, slackWebHook, slackChannel,
    username, password, rabbitUri
}
