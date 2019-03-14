if ( process.env.NODE_ENV != 'production' ) {
    require( 'dotenv' ).config();
}
import { checkEnv, env, limiarReset } from './common/config';
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
    let count: number = 0; // contagem de verificações de fluxo que retornaram 0
    while ( true ) {
        try {

            let status: any;
            status = await checkRabbit(); // verifica o fluxo atual no Rabbit
            let publishRate = status[ 0 ].message_stats.publish_details.rate; // captura o valor do fluxo.

            if ( env != 'production' ) {
                console.log( `Publish rate: ${publishRate} msgs/s` );
            }


            // se o fluxo estiver bem abaixo do normal ( em média cerca de ~ 200 ) verifica e trata o caso.
            if ( publishRate < 15 && publishRate > 0 ) {
                await lowPublish( publishRate );
            }


            // se o fluxo está parado, mas abaixo do limiar, avisa o slack.
            if ( publishRate == 0 ) {
                count++;
                let msg = `A Velocidade de publish está em 0. Sequência: ${count}\n` +
                    `Quando a sequência atingir ${limiarReset} reiniciarei o logstash-rabbit`;
                await notifySlack( msg, names.alert );
            }


            // se o fluxo está parado e atingiu o limiar, reseta o logstash-rabbit
            if ( count == limiarReset && publishRate == 0 ) {
                count = 0;
                await lowPublish( publishRate );
            }


            //se o fluxo está voltando sozinho e a contagem está abaixo do limiar, reseta a contagem
            if ( publishRate != 0 && count > 0 ) {
                let msg = `O fluxo está se normalizando novamente. Não reiniciarei o logstash agora.\n`
                    + `Publish rate: ${publishRate}`;
                count = 0;
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
