const Lab = require('lab');
const Sinon = require('sinon');
const HomeCtrl = require('modules/home/controllers/home');

const { describe, expect, it } = (exports.lab = Lab.script());

describe('Web Controller: home', () => {
    it('gets the home page', () => {
        // setup
        const fakeView = Sinon.stub().withArgs('pages/home');
        const h = { view: fakeView };

        // exercise
        HomeCtrl.get(null, h);

        // validate
        expect(fakeView.calledOnce).to.be.true();
    });
});
