const request = require( 'request-promise' );
const restartRancher = require( 'restart-rancher' );
const sleep = require( 'sleep' ).sleep;
const slackWebHook = process.env.SLACK_WEB_HOOK
const slack = require( 'slack-notify' )( slackWebHook );
const slackChannel = process.env.SLACK_CHANNEL;
const rabbitHost = process.env.RABBIT_HOST;
const rabbitApiPort = process.env.RABBIT_API_PORT;
const rabbitUri = `http://${rabbitHost}:${rabbitApiPort}/api/vhosts`;
const username = process.env.RABBIT_USER;
const password = process.env.RABBIT_PASSWORD;
const rancher_access_key = process.env.RANCHER_ACCESS_KEY;
const rancher_secret_key = process.env.RANCHER_SECRET_KEY;
const rancher_project_id_1 = process.env.PROJECT_ID_LOGSTASH_1;
const rancher_service_id_1 = process.env.SERVICE_ID_LOGSTASH_1;
const rancher_project_id_2 = process.env.PROJECT_ID_LOGSTASH_2;
const rancher_service_id_2 = process.env.SERVICE_ID_LOGSTASH_2;
const rancher_url = process.env.RANCHER_URL;

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
/////////// Token de autenticação Basic auth do RabbitMQ gerado com as credenciais /////////
var auth = "Basic " + new Buffer.from( username + ":" + password ).toString( "base64" );
var rabbitOptions = {
    uri: rabbitUri,
    headers: {
        'User-Agent': 'Request-Promise',
        "Authorization": auth
    },
    json: true
};
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// Configuração para restartar o logstash-rabbit //////////////////////
const rancherOptions1 = {
    RANCHER_ACCESS_KEY: rancher_access_key,
    RANCHER_SECRET_KEY: rancher_secret_key,
    PROJECT_ID: rancher_project_id_1,
    SERVICE_ID: rancher_service_id_1,
    RANCHER_URL: rancher_url
}
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// Configuração para restartar o logstash-pipeline ////////////////////
const rancherOptions2 = {
    RANCHER_ACCESS_KEY: rancher_access_key,
    RANCHER_SECRET_KEY: rancher_secret_key,
    PROJECT_ID: rancher_project_id_2,
    SERVICE_ID: rancher_service_id_2,
    RANCHER_URL: rancher_url
}
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Função que verifica continuamente as velocidades de publish e delivery e executa ações de correção
 */
async function main () {
    while ( true ) { // é feio mas necessário. ninguém reclama quando ve um while(true) em arduinos..
        var res = null;
        try {
            res = await request( rabbitOptions );
            var publishRate = res[ 0 ].message_stats.publish_details.rate;
            var deliveryRate = res[ 0 ].message_stats.deliver_details.rate;
            // deixa a gente ver a mágica em ambiente dev
            if ( process.env.NODE_ENV != 'production' ) {
                console.log( "Publish Rate: " + publishRate );
                console.log( "Consumo " + deliveryRate );
                console.log( '----------------------------' )
            }

            if ( publishRate < 30 ) {
                await lowPublish( publishRate );
            }

            if ( deliveryRate < 30 ) {
                await lowDelivery( deliveryRate );
            }

        } catch ( erro ) {
            console.log( `A requisição falhou\n${erro.message}` );
        }

        sleep( 5 );
    }
}



/**
 * Executa notificações no slack e restarts no rancher em caso de quedas de velocidade de publish
 * @param {*} publishRate velocidade de fluxo que chega da Geocontrol via logstash
 */
async function lowPublish ( publishRate ) {

    if ( publishRate != 0 ) {
        try {
            var msg = `Fluxo anômalo na entrada da Geocontrol: ${publishRate} msgs/s`;
            await notifySlack( msg, 'alert' );
        } catch ( erro ) {
            console.log( msg );
            console.log( `falhou ao enviar essa mensagem ao slack. ${erro.message}` );
        }
    } else if ( publishRate == 0 ) {
        var msg = `A GEOCONTROL CAIU! ( Corram para as colinas! ). ` +
            `Vou reiniciar o logstash-rabbit agora...`;
        try {
            await notifySlack( msg, 'bug' );
        } catch ( erro ) {
            console.log( msg );
            console.log( `falhou ao enviar essa mensagem ao slack. ${erro.message}` );
        }

        var rate = publishRate;
        while ( rate == 0 ) {
            await restartRancher( rancherOptions1 );
            sleep( 180 ); // aguarda 3 minutos para ter certeza que o rancher ja voltou

            // verifica o fluxo no RabbitMQ novamente para ver se a geocontrol já voltou
            try {
                var res = await request( rabbitOptions );
                rate = res[ 0 ].message_stats.publish_details.rate;
                if ( rate == 0 ) {
                    try {

                        var msg = `A Geocontrol ainda não voltou! ` +
                            `vou reiniciar o logstash-rabbit novamente`;

                        notifySlack( msg, 'note' );

                    } catch ( erro ) {
                        console.log( msg )
                        console.log( `falhou ao enviar essa mensagem ao slack. ${erro.message}` );
                    }
                } else {
                    try {
                        var msg = `A Geocontrol se reconectou! todos os sistemas funcionando. ` +
                            `Velocidade de publish: ${rate} msgs/s ` +
                            `Velocidade de Delivery: ` +
                            `${res[ 0 ].message_stats.deliver_details.rate} msgs/s`;
                        notifySlack( msg, 'success' );
                    } catch ( erro ) {
                        console.log( msg )
                        console.log( `falhou ao enviar essa mensagem ao slack. ${erro.message}` );
                    }
                }
            } catch ( erro ) {
                try {
                    var msg = `Eu enviei um comando para reiniciar o logstash-rabbit no rancher, ` +
                        `e após esperar por 3 minutos, fui consultar a situação no RabbitMQ, ` +
                        `mas obtive o seguinte erro: ${erro}.  Vou tentar reiniciar novamente!`;
                    notifySlack( msg, 'bug' );
                } catch ( erro ) {
                    console.log( msg )
                    console.log( `falhou ao enviar essa mensagem ao slack. ${erro.message}` );
                }
            }
        }

    }
}




/**
 * Executa notificações no slack e restarts no rancher em caso de quedas de velocidade de consumo
 * @param {*} deliveryRate velocidade de fluxo no RabbitMQ sendo consumido em nossa infra interna
 */
async function lowDelivery ( deliveryRate ) {
    if ( deliveryRate != 0 ) {

        await notifySlack( `Fluxo anômalo no consumo interno da pipeline : ${deliveryRate} msgs/s`, 'alert' );

    } else if ( deliveryRate == 0 ) {
        await notifySlack( `O LOGSTASH-PIPELINE CAIU!!!! ( Corram para as colinas! ). ` +
            `Vou reiniciar o logstash-pipeline agora...`, 'bug' );

        var rate = deliveryRate;
        while ( rate == 0 ) {
            await restartRancher( rancherOptions2 );
            sleep( 180 ); // aguarda 3 minutos para ter certeza que o rancher ja voltou

            // verifica o fluxo no RabbitMQ novamente para ver se a pipeline já voltou
            try {
                var res = await request( rabbitOptions );
                rate = res[ 0 ].message_stats.publish_details.rate;
                if ( rate == 0 ) {
                    notifySlack( `O Logstash-Pipeline ainda não voltou! ` +
                        `vou reiniciar o logstash-pipeline novamente`, 'note' );
                } else {
                    notifySlack( `O Logstash-pipeline se reconectou! todos os sistemas funcionando. ` +
                        `Velocidade de publish: ${res[ 0 ].message_stats.publish_details.rate} msgs/s ` +
                        `Velocidade de Delivery: ${rate} msgs/s`, 'success' );
                }
            } catch ( erro ) {
                notifySlack( `Eu enviei um comando para reiniciar o logstash-pipeline no rancher, ` +
                    `e após esperar por 3 minutos, fui consultar a situação no RabbitMQ, ` +
                    `mas obtive o seguinte erro: ${erro}.  Vou tentar reiniciar novamente!`, 'bug' );
            }
        }

    }
}


/**
 * Envia Notificações ao nosso Slack no canal treinamento-bot via web hook
 * @param {*} message string com uma mensagem ao canal no slack
 * @param {*} type tipo de mensagem ( bug, alert, success ou note )
 */
async function notifySlack ( message, type ) {
    switch ( type ) {
        case 'bug':
            console.log( 'bug' )
            await slack.bug( { channel: slackChannel, text: message } );
            break;
        case 'alert':
            slack.alert( { channel: slackChannel, text: message } );
            break;
        case 'success':
            slack.success( { channel: slackChannel, text: message } );
            break;
        case 'note':
            slack.note( { channel: slackChannel, text: message } );
            break;
    }
}



// starta o serviço
main();
