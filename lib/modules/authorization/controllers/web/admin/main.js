/**
 * The main admin page controller
 */

const Path = require('path');
const UserService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/user'));
const RoleService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/role'));
const ResourceService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/resource'));
const PartialHelper = require('./helpers/partial');

/**
 * Renders the main admin page view
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the view response
 */
exports.getMain = async function(request, h) {

    request.log(['admin', 'get', 'debug']);

    const [userCount, roleCount, resourceCount] = await Promise.all([
        UserService.count(),
        RoleService.count(),
        ResourceService.count()
    ]);

    return h.view('pages/admin', {
        getAdminPartial: PartialHelper.getPartialHelper(request.params.partial),
        count: {
            users: userCount,
            roles: roleCount,
            resources: resourceCount
        }
    });
};
