if ( process.env.NODE_ENV != 'production' ) {
    require( 'dotenv' ).config();
}
import { checkEnv } from './common/config';
import { checkRabbit } from './rabbit';
import { lowPublish } from './lowPublish';

//verifica se o ambiente está configurado corretamente
checkEnv();

console.log( "[  BOT   ] Serviço de Monitoramento iniciado." );

/**
 * Verifica se o Rabbit está recebendo dados normalmente
 */
async function VerificaRabbit () {
    while ( true ) {
        let status: any = await checkRabbit(); // verifica o fluxo atual no Rabbit
        let publishRate = status[ 0 ].message_stats.publish_details.rate; // captura o valor do fluxo.
        // se o fluxo estiver bem abaixo do normal ( em média cerca de ~ 200 ) verifica e trata o caso.
        if ( publishRate < 15 ) {
            await lowPublish( publishRate );
        }
    }

}



/**
 * starta um loop infinito para repetir o procedimento acima sem parar
*/
VerificaRabbit();
