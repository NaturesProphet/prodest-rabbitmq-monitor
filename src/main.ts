if ( process.env.NODE_ENV != 'production' ) {
    require( 'dotenv' ).config();
}
import { checkEnv, env } from './common/config';
import { checkRabbit } from './rabbit';
import { lowPublish } from './lowPublish';
import { notifySlack } from "./notifications";
import { names } from './common/messages.json';

//verifica se o ambiente está configurado corretamente
checkEnv();

console.log( "[  BOT   ] Serviço de Monitoramento iniciado." );

/**
 * Verifica se o Rabbit está recebendo dados normalmente
 */
async function VerificaRabbit () {
    while ( true ) {
        try {
            let status: any;
            status = await checkRabbit(); // verifica o fluxo atual no Rabbit
            let publishRate = status[ 0 ].message_stats.publish_details.rate; // captura o valor do fluxo.
            if ( env != 'production' ) {
                console.log( `Publish rate: ${publishRate} msgs/s` );
            }
            // se o fluxo estiver bem abaixo do normal ( em média cerca de ~ 200 ) verifica e trata o caso.
            if ( publishRate < 15 ) {
                await lowPublish( publishRate );
            }
        } catch ( erro ) {
            let message = `Erro ao enviar um GET ao pluguin-management do RabbitMQ: ${erro.message}`;
            await notifySlack( message, names.note );
        }
    }
}



/**
 * starta um loop infinito para repetir o procedimento acima sem parar
*/
VerificaRabbit();
