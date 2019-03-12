/*
Modulo que reinicia o serviço do logstash-rabbit no rancher
*/
import * as request from 'request-promise';

import {
    rancherAccessKey,
    rancherSecretKey,
    rancherProjectId,
    rancherServiceId,
    rancherUrl
} from "./common/config";

/**
 * Função que reinicia um serviço no Rancher
 * @param timeout tempo de espera em milisegundos
 */
async function restart ( timeout: number ): Promise<any> {


    const requestOptions = {
        method: 'POST',
        uri: `${rancherUrl}/${rancherProjectId}/services/${rancherServiceId}?action=restart`,
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
                console.log( `[RANCHER ] Reiniciando o serviço ${rancherServiceId} no rancher` );
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

export { restart };
