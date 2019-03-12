/*
Modulo que envia notificações ao slack e printa informações no terminal
*/
import * as request from 'request-promise';
import { slackChannel, slackWebHook } from './common/config';


export async function notifySlack ( message: string, name: string ): Promise<any> {
    let icon: string = "";
    switch ( name ) {
        case "Uhul":
            icon = ":uhul:"
            console.log( `[   OK   ] ${message}` );
            break;
        case "Alerta":
            icon = ":warning:";
            console.log( `[ Alerta ] ${message}` );
            break;
        case "Falha":
            icon = ":bomb:";
            console.log( `[ Falha  ] ${message}` );
            break;
        case "Nota":
            icon = ":fuckthatshit:";
            console.log( `[  Nota  ] ${message}` );
            break;
    }

    const payload = {
        "channel": slackChannel,
        "icon_emoji": icon,
        "username": name,
        "text": message
    }

    const requestOptions = {
        method: 'POST',
        uri: `${slackWebHook}`,
        body: payload,
        json: true
    };

    try {
        return await request.post( requestOptions );
    } catch ( erro ) {
        console.log( `Erro ao tentar enviar uma notificação ao slack: ${erro.message}` );
    }
}
