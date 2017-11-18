const Path = require('path');
const Lab = require('lab');
const Sinon = require('sinon');
const ProfileCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/web/profile'));

const { describe, expect, it } = exports.lab = Lab.script();

describe('Web Controller: profile', () => {

    it('gets the profile page', () => {

        // setup
        const fakeView = Sinon.stub().withArgs('pages/profile');
        const h = { view: fakeView };

        // exercise
        ProfileCtrl.get(null, h);

        // validate
        expect(fakeView.calledOnce).to.be.true();
    });
});
