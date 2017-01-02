'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Boom = require('boom');
var HSError = require('../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('hapi-starter errors', function() {

    it('do nothing if error is boom', function(done) {

        var boomError = Boom.notFound();

        expect(HSError.toBoom(boomError)).to.equals(boomError);
        done();
    });

    it('wrap error with 505 boom', function(done) {

        var errorMessage = 'Error Message';
        var error = new Error(errorMessage);

        var boomError = HSError.toBoom(error);

        expect(boomError.isBoom).to.be.true();
        expect(boomError.data).to.equals(errorMessage);
        expect(boomError.output.statusCode).to.equals(500);
        done();
    });

    it('wrap auth errors with 401 boom', function(done) {

        expect(HSError.toBoom(HSError.AUTH_INVALID_USERNAME).output.statusCode).to.equals(401);
        expect(HSError.toBoom(HSError.AUTH_INVALID_PASSWORD).output.statusCode).to.equals(401);
        done();
    });

    it('wrap not found errors with 404 boom', function(done) {

        expect(HSError.toBoom(HSError.RESOURCE_NOT_FOUND).output.statusCode).to.equals(404);
        done();
    });

    it('wrap conflict errors with 409 boom', function(done) {

        expect(HSError.toBoom(HSError.RESOURCE_DUPLICATE).output.statusCode).to.equals(409);
        expect(HSError.toBoom(HSError.RESOURCE_RELATION).output.statusCode).to.equals(409);
        done();
    });
});
