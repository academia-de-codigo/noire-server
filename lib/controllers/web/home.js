var Package = require('../../../package.json');

exports.get = function(request, reply) {

    var user = request.auth.isAuthenticated ? request.auth.credentials : null;

    if (user && user.scope && user.scope.indexOf('admin') !== -1) {
        user.admin = true;
    }

    return reply.view('pages/home', {
        version: Package.version,
        user: user
    });
};
