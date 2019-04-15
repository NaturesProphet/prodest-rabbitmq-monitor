/*
Modulo que reinicia o serviço do logstash-rabbit no rancher
*/
import * as request from 'request-promise';
import { names } from './common/messages.json';
import { notifySlack } from './notifications';

import {
    rancherAccessKey,
    rancherSecretKey,
    rancherProjectIdlog1,
    rancherServiceIdlog1,
    rancherUrl,
    rancherProjectIdlog2,
    rancherServiceIdlog2
} from "./common/config";


/**
 * Função que reinicia um serviço no Rancher
 * @param timeout tempo de espera em milisegundos
 */
async function restartLogstash1 ( timeout: number ): Promise<any> {

    const requestOptions = {
        method: 'POST',
        uri: `${rancherUrl}/${rancherProjectIdlog1}/services/${rancherServiceIdlog1}?action=restart`,
        auth: {
            user: rancherAccessKey,
            pass: rancherSecretKey
        },
        body: {
            "rollingRestartStrategy": {
                "batchSize": 1,
                "intervalMillis": 2000
            }
        },
        json: true
    };

    return new Promise(
        async function ( resolve, reject ) {
            try {
                console.log( `[RANCHER ] Reiniciando o serviço ${rancherServiceIdlog1} no rancher` );
                const response = await request.post( requestOptions );
                setTimeout(
                    function () {
                        resolve( response );
                    }, timeout );
            }
            catch ( erro ) {
                setTimeout(
                    function () {
                        reject( erro );
                    }, 60000 ); // se der erro, força aguardar 1 minuto antes de tentar novamente.
            }
        }
    );
}





async function restartLogstash2 () {

    const requestOptions = {
        method: 'POST',
        uri: `${rancherUrl}/${rancherProjectIdlog2}/services/${rancherServiceIdlog2}?action=restart`,
        auth: {
            user: rancherAccessKey,
            pass: rancherSecretKey
        },
        body: {
            "rollingRestartStrategy": {
                "batchSize": 1,
                "intervalMillis": 2000
            }
        },
        json: true
    };


    try {
        await request.post( requestOptions );
        console.log( `[RANCHER ] Reiniciando o serviço ${rancherServiceIdlog2} no rancher` );
    } catch ( erro ) {
        let msg = `Falha ao enviar um POST ao rancher para reiniciar o serviço ${rancherServiceIdlog2}
         ${erro.message}`;
        await notifySlack( msg, names.bug );
    }
}

export { restartLogstash1, restartLogstash2 };
