import { username, password, rabbitUri, rabbitInterval } from "./common/config";
import * as request from 'request-promise';


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

    }


    return new Promise(
        async function ( resolve, reject ) {
            try {
                const response = await request.get( rabbitOptions );
                setTimeout(
                    function () {
                        resolve( response );
                    }, rabbitInterval );
            }
            catch ( erro ) {
                setTimeout(
                    function () {
                        reject( erro );
                    }, rabbitInterval );
            }
        }
    );
}
