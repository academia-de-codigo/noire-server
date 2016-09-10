var Hapi = require('hapi');
var Hoek = require('hoek');
var Package = require('../package.json');

var internals = {
    response: {
        version: Package.version
    }
};

internals.init = function() {

    var server = new Hapi.Server();
    server.connection({
        port: process.env.PORT || 8000
    });

    server.route({
        path: '/version',
        method: 'GET',
        handler: function(request, reply) {

            return reply(internals.response);
        }
    });

    server.start(function(err) {

        Hoek.assert(!err, err);
        console.log('Server started at: ' + server.info.uri);

    });

};

internals.init();
