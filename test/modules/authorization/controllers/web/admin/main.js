const Path = require('path');
const Lab = require('lab');
const Sinon = require('sinon');
const MainCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/web/admin/main'));
const UserService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/user'));
const RoleService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/role'));
const ResourceService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/resource'));

const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

describe('Web Controller: main', () => {

    let requestStub;

    beforeEach(() => {

        requestStub = { log: Sinon.stub(), params: {} };
    });

    it('gets the main admin page', async (flags) => {

        // setup
        const stubView = Sinon.stub().withArgs('pages/admin', Sinon.match.object);
        const fakeToolkit = { view: stubView };
        const count = { users: 2, roles: 3, resources: 4 };
        const countUsersStub = Sinon.stub(UserService, 'count').resolves(count.users);
        const countRolesStub = Sinon.stub(RoleService, 'count').resolves(count.roles);
        const countResourcesStub = Sinon.stub(ResourceService, 'count').resolves(count.resources);
        flags.onCleanup = function() {
            countUsersStub.restore();
            countRolesStub.restore();
            countResourcesStub.restore();
        };

        // exercise
        await MainCtrl.getMain(requestStub, fakeToolkit);

        // validate
        expect(requestStub.log.calledOnce).to.be.true();
        expect(countUsersStub.calledOnce).to.be.true();
        expect(countRolesStub.calledOnce).to.be.true();
        expect(countResourcesStub.calledOnce).to.be.true();
        expect(fakeToolkit.view.calledOnce).to.be.true();
        expect(stubView.getCall(0).args[1].getAdminPartial).to.be.a.function();
        expect(stubView.getCall(0).args[1].count).to.equals(count);
    });
});

