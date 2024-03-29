import { notifySlack } from "./notifications";
import { names, fluxoanomalo, queda, voltou, down, rancherFail } from './common/messages.json';
import { rancherInterval } from "./common/config";
import { restartLogstash1 } from "./rancher";
import { checkRabbit } from "./rabbit";

/*
Módulo que trata os eventos de baixo publish e quedas de publish (Quedas da geocontrol)
*/


/**
 * Executa notificações no slack e restarts no rancher em caso de quedas de velocidade de publish
 * @param publishRate velocidade de fluxo que chega da Geocontrol via logstash
 */
export async function anomalousPublish ( publishRate: number ) {

    if ( publishRate != 0 ) {
        let msg = `${fluxoanomalo}${publishRate} msgs/s`;
        await notifySlack( msg, names.alert );
    } else if ( publishRate == 0 ) {

        let msg = queda;
        await notifySlack( msg, names.bug );

        let resetCount: number = 0; // contador de tentativas de reconexão
        let rate: number = 0;
        while ( rate == 0 ) {
            console.log( "debug: CAIU NO WHILE" );
            try {
                await restartLogstash1( rancherInterval ); // reinicia o serviço e aguarda 3 minutos
            } catch ( erro ) {
                let message = `${rancherFail}${erro.message} Tentativa ${resetCount++}`;
                await notifySlack( message, names.note );
            }
            try {
                let status: any = await checkRabbit();
                rate = Number( status[ 0 ].message_stats.publish_details.rate );
                console.log( "debug: rate dentro do while " + rate );
                let deliveryRate = status[ 0 ].message_stats.deliver_details.rate;
                if ( rate > 0 ) {
                    let message = `${voltou}Velocidade de publish: ${rate} msgs/s ` +
                        `Velocidade de Delivery: ${deliveryRate} msgs/s`;
                    await notifySlack( message, names.ok );
                    resetCount = 0;
                } else {
                    let message = `${down}${resetCount++}`;
                    await notifySlack( message, names.note );
                    //volta ao inicio do while e tenta denovo até voltar
                }
            } catch ( erro ) {
                let message = `Erro ao enviar um GET ao pluguin-management do RabbitMQ: ${erro.message}`;
                await notifySlack( message, names.note );
            }
        }
    }
}
