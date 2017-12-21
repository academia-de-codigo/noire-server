const Path = require('path');
const Lab = require('lab');
const Sinon = require('sinon');
const ProfileCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/web/profile'));

const { beforeEach, describe, expect, it } = exports.lab = Lab.script();

describe('Web Controller: profile', () => {

    let requestStub;

    beforeEach(() => {

        requestStub = { log: Sinon.stub() };

    });

    it('gets the profile page', () => {

        // setup
        const fakeView = Sinon.stub().withArgs('pages/profile');
        const h = { view: fakeView };

        // exercise
        ProfileCtrl.get(requestStub, h);

        // validate
        expect(requestStub.log.calledOnce).to.be.true();
        expect(fakeView.calledOnce).to.be.true();
    });
});
