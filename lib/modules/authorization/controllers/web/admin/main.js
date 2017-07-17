var Promise = require('bluebird');
var HSError = require('../../../../../error');
var UserService = require('../../../services/user');
var RoleService = require('../../../services/role');
var ResourceService = require('../../../services/resource');
var PartialHelper = require('./helpers/partial');


exports.getMain = function(request, reply) {

    request.log(['admin', 'get', 'debug']);

    var getUserCount = UserService.count();
    var getRoleCount = RoleService.count();
    var getResourceCount = ResourceService.count();

    Promise.join(getUserCount, getRoleCount, getResourceCount, function(userCount, roleCount, resourceCount) {

        return reply.view('pages/admin', {
            getAdminPartial: PartialHelper.getPartialHelper(request.params.partial),
            count: {
                users: userCount,
                roles: roleCount,
                resources: resourceCount
            }
        });

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
