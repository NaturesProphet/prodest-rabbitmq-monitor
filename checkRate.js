var checkRate = new Promise( function ( resolve, reject ) {
    request( reqOptions ).then( function ( res ) {
        resolve( res.message_stats.publish_details.rate );
    } ).catch( function ( err ) {
        console.log( err.message );
        reject( err );
    } );
} );

module.exports = checkRate;
