var Package = require('../../../package.json');

exports.get = function(request, reply) {

    return reply.view('pages/home', {
        version: Package.version
    });
};
