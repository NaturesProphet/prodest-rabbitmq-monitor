if ( process.env.NODE_ENV != 'production' ) {
    require( 'dotenv' ).config();
}
import { checkEnv, env, limiarReset } from './common/config';
import { checkRabbit } from './rabbit';
import { anomalousPublish } from './anomalousPublish';
import { notifySlack } from "./notifications";
import { names } from './common/messages.json';
import { restartLogstash2 } from './rancher';

//verifica se o ambiente está configurado corretamente
checkEnv();

console.log( "[  BOT   ] Serviço de Monitoramento iniciado." );

/**
 * Verifica se o Rabbit está recebendo dados normalmente
 */
async function VerificaRabbit () {

    let publishErrorCount: number = 0; // contagem de verificações de fluxo de entrada que retornaram 0
    let DeliveryErrorCount = 0; // contagem de verificações de fluxo de saída que retornaram 0
    let limiarResetConsumer = 50; // limite de fluxos de saída zerados antes de um restart do logstash2

    while ( true ) {
        try {

            let status: any;
            status = await checkRabbit(); // verifica o fluxo atual no Rabbit
            let publishRate = status[ 0 ].message_stats.publish_details.rate; // captura o valor do fluxo de entrada.
            let deliveryRate = status[ 0 ].message_stats.deliver_details.rate; // captura o valor do fluxo de saída.

            if ( env != 'production' ) {
                console.log( `\nPublish rate: ${publishRate} msgs/s` );
                console.log( `Delivery rate: ${deliveryRate} msgs/s` );
            }


            // se o fluxo estiver fora do normal ( em média cerca de ~ 200 ) verifica e trata o caso.
            if ( ( publishRate < 15 && publishRate > 0 ) || publishRate > 500 ) {
                await anomalousPublish( publishRate );
            }


            // se o fluxo está parado, mas abaixo do limiar, avisa o slack.
            if ( publishRate == 0 ) {
                publishErrorCount++;
                let msg = `O fluxo de dados da Geocontrol está parado. Sequência para restart: ${publishErrorCount}/${limiarReset}`;
                await notifySlack( msg, names.alert );
            }


            // se o fluxo está parado e atingiu o limiar, reseta o logstash-rabbit
            if ( publishErrorCount == limiarReset && publishRate == 0 ) {
                publishErrorCount = 0;
                await anomalousPublish( publishRate );
            }


            //se o fluxo está voltando sozinho e a contagem está abaixo do limiar, reseta a contagem
            if ( publishRate != 0 && publishErrorCount > 0 ) {
                let msg = `O fluxo está se normalizando novamente. Não será necessário reiniciar o logstash agora.\n`
                    + `Publish rate: ${publishRate}`;
                await notifySlack( msg, names.ok );
                publishErrorCount = 0;
            }


            //se o fluxo de consumo zerou, reinicia o logstash-pipeline
            if ( deliveryRate == 0 ) {
                if ( DeliveryErrorCount == 5 ) { // após 5 medidas zeradas, restarta o logstash2
                    restartLogstash2();
                    let msg = `O logstash-pipeline caiu. um pedido de restart foi enviado.`;
                    await notifySlack( msg, names.bug );
                }
                DeliveryErrorCount++;
            }

            if ( deliveryRate != 0 && DeliveryErrorCount > 5 ) {
                let msg = `O logstash pipeline está de volta. todos os sistemas funcionando! Delivery Rate: ${deliveryRate}`
                await notifySlack( msg, names.ok );
                DeliveryErrorCount = 0;
            }

            if ( deliveryRate == 0 && DeliveryErrorCount == limiarResetConsumer ) {
                restartLogstash2();
                let msg = 'O logstash-pipeline ainda não voltou. Outro pedido de restart foi enviado ao rancher';
                await notifySlack( msg, names.alert );
                DeliveryErrorCount = 6;
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
