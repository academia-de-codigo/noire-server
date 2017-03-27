var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var HomeCtrl = require('../../../lib/controllers/web/home');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('Web Controller: home', function() {

    it('gets the home page', function(done) {

        var request = {
            params: {},
            log: function() {}
        };

        var reply = function() {};
        reply.view = function(page) {
            expect(page).to.equals('pages/home');
            done();
        };

        HomeCtrl.get(request, reply);
    });
});
