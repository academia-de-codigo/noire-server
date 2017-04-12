var HSError = require('../../../error');
var UserService = require('../../../services/user');
var RoleService = require('../../../services/role');
var MainCtrl = require('./main');
var UserListCtrl = require('./user-list');
var RoleListCtrl = require('./role-list');
var PartialHelper = require('./partial');

var internals = {};

internals.handlers = {
    main: MainCtrl.getMain,
    users: UserListCtrl.listUsers,
    roles: RoleListCtrl.listRoles
};

exports.get = function(request, reply) {

    var handler = internals.handlers[request.params.partial] || internals.handlers.main;
    return handler(request, reply);
};

exports.getUser = function(request, reply) {

    request.log(['admin', 'getUser', 'debug']);

    UserService.findById(request.params.id).then(function(user) {

        return reply.view('pages/admin', {
            getAdminPartial: PartialHelper.getPartialHelper('user'),
            user: user
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.getRole = function(request, reply) {

    request.log(['admin', 'getRole', 'debug']);

    RoleService.findById(request.params.id).then(function(role) {

        return reply.view('pages/admin', {
            getAdminPartial: PartialHelper.getPartialHelper('role'),
            role: role
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
