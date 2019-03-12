import { rabbitInterval } from './common/config';
import { checkRabbit } from './rabbit';
import { lowPublish } from './lowPublish';
import * as conf from './common/config';

//verifica se o ambiente está configurado corretamente
checkEnv();

console.log( "[  BOT   ] Serviço de Monitoramento iniciado." );

/**
 * Verifica se o Rabbit está recebendo dados normalmente
 */
async function VerificaRabbit () {
    let status: any = await checkRabbit(); // verifica o fluxo atual no Rabbit
    let publishRate = status[ 0 ].message_stats.publish_details.rate; // captura o valor do fluxo.
    // se o fluxo estiver bem abaixo do normal ( em média cerca de ~ 200 ) verifica e trata o caso.
    if ( publishRate < 15 ) {
        await lowPublish( publishRate );
    }

}

/**
 * starta um loop infinito para repetir o procedimento acima sem parar
*/
setInterval( VerificaRabbit, rabbitInterval );


async function checkEnv () {
    let ok: boolean = true;
    if ( conf.password == undefined ) {
        console.log( "[  CONF  ] Password não configurado" );
        ok = false;
    }
    if ( conf.rabbitUri == undefined ) {
        console.log( "[  CONF  ] URL do Rabbit não configurada" );
        ok = false;
    }
    if ( conf.rancherAccessKey == undefined ) {
        console.log( "[  CONF  ] Access Key não configurado" );
        ok = false;
    }
    if ( conf.rancherSecretKey == undefined ) {
        console.log( "[  CONF  ] SecretKey não configurado" );
        ok = false;
    }
    if ( conf.rancherServiceId == undefined ) {
        console.log( "[  CONF  ] ServiceID não configurado" );
        ok = false;
    }
    if ( conf.rancherUrl == undefined ) {
        console.log( "[  CONF  ] URL do Rancher não configurada" );
        ok = false;
    }
    if ( conf.slackChannel == undefined ) {
        console.log( "[  CONF  ] Canal do slack não configurado" );
        ok = false;
    }
    if ( conf.slackWebHook == undefined ) {
        console.log( "[  CONF  ] WebHook do slack não configurado" );
        ok = false;
    }
    if ( conf.username == undefined ) {
        console.log( "[  CONF  ] Usuario do Rabbit não configurado" );
        ok = false;
    }
    if ( conf.rabbitHost == undefined ) {
        console.log( "[  CONF  ] Servidor do Rabbit não configurado" );
        ok = false;
    }
    if ( conf.rabbitApiPort == undefined ) {
        console.log( "[  CONF  ] Porta do Rabbit não configurada" );
        ok = false;
    }
    if ( !ok ) {
        console.log( "[EnvERROR] Falha na configuração do ambiente. saindo!" );
        process.exit( 1 );
    }
}
