import { username, password, rabbitUri } from "./common/config";
import * as request from 'request-promise';
import { notifySlack } from "./notifications";
import { names } from './common/messages.json';

/*
Módulo que envia requisições http ao management-pluguin do rabbitMQ
*/

export async function checkRabbit (): Promise<any> {

    const auth = "Basic " + new Buffer( username + ":" + password ).toString( "base64" );
    const rabbitOptions = {
        uri: rabbitUri,
        headers: {
            'User-Agent': 'Request-Promise',
            "Authorization": auth
        },
        json: true
    };

    try {
        return await request.get( rabbitOptions );
    } catch ( erro ) {
        let message = `Erro ao enviar um GET ao pluguin-management do RabbitMQ: ${erro.message}`;
        setTimeout(
            async function () {
                await notifySlack( message, names.note );
            }, 60000 ); // se der erro, força aguardar 1 minuto.
    }
}
