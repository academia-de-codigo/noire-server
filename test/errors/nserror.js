const Lab = require('lab');
const Boom = require('boom');
const NSError = require('../../lib/errors/nserror');

const { describe, expect, it } = exports.lab = Lab.script();

describe('hapi-starter errors', () => {

    it('do nothing if error is boom', () => {

        // exercise
        let boomError = NSError.create(Boom.notFound());

        // verify
        expect(boomError).to.equals(boomError);
    });

    it('adds timestamps to errors created from boom', () => {

        // exercise
        let boomError = NSError.create(Boom.notFound());

        // verify
        expect(boomError.data).to.exist();
        expect(boomError.data.timestamp).to.be.a.number();
    });

    it('wrap error object with 500 boom', () => {

        // setup
        let errorMessage = 'Error Message';

        // exercise
        let boomError = NSError.create(new Error(errorMessage));

        // verify
        expect(boomError.isBoom).to.be.true();
        expect(boomError.message).to.equals(errorMessage);
        expect(boomError.output.statusCode).to.equals(500);
    });

    it('adds timestamps to errors created from error objects ', () => {

        // setup
        let errorMessage = 'Error Message';

        // exercise
        let boomError = NSError.create(new Error(errorMessage));

        // verify
        expect(boomError.data).to.exist();
        expect(boomError.data.timestamp).to.be.a.number();
    });

    it('wrap string with 500 boom', () => {

        // setup
        let errorMessage = 'Error Message';

        // exercise
        let boomError = NSError.create(errorMessage);

        // verify
        expect(boomError.isBoom).to.be.true();
        expect(boomError.message).to.equals(errorMessage);
        expect(boomError.output.statusCode).to.equals(500);
    });

    it('adds timestamps to errors created from strings', () => {

        // setup
        let errorMessage = 'Error Message';

        // exercise
        let boomError = NSError.create(errorMessage);

        // verify
        expect(boomError.data).to.exist();
        expect(boomError.data.timestamp).to.be.a.number();
    });

    it('wraps auth errors with 401 boom', () => {

        expect(NSError.AUTH_INVALID_USERNAME().output.statusCode).to.equals(401);
        expect(NSError.AUTH_INVALID_PASSWORD().output.statusCode).to.equals(401);
    });

    it('wrap not found errors with 404 boom', () => {

        expect(NSError.RESOURCE_NOT_FOUND().output.statusCode).to.equals(404);
    });

    it('wrap conflict errors with 409 boom', () => {

        expect(NSError.RESOURCE_DUPLICATE().output.statusCode).to.equals(409);
        expect(NSError.RESOURCE_RELATION().output.statusCode).to.equals(409);
        expect(NSError.RESOURCE_STATE().output.statusCode).to.equals(409);
    });

    it('wrap server erors with 500 boom', () => {

        expect(NSError.AUTH_ERROR().output.statusCode).to.equals(500);
        expect(NSError.AUTH_CRYPT_ERROR().output.statusCode).to.equals(500);
        expect(NSError.RESOURCE_FETCH().output.statusCode).to.equals(500);
        expect(NSError.RESOURCE_DELETE().output.statusCode).to.equals(500);
        expect(NSError.RESOURCE_INSERT().output.statusCode).to.equals(500);
        expect(NSError.RESOURCE_UPDATE().output.statusCode).to.equals(500);
    });

    it('adds timestamps to object generated boom errors', () => {

        // exercise
        let boomError = NSError.RESOURCE_NOT_FOUND();

        // verify
        expect(boomError.data).to.exist();
        expect(boomError.data.timestamp).to.be.a.number();
    });

    it('adds timestamps to string generated boom errors', () => {

        // exercise
        let boomError = NSError.AUTH_ERROR();

        // verify
        expect(boomError.data).to.exist();
        expect(boomError.data.timestamp).to.be.a.number();
    });

    it('does not add timestamp if already present', () => {

        // setup
        let error = Boom.notFound();
        error.data = { timestamp: -1 };

        // exercise
        let boomError = NSError.create(error);

        // verify
        expect(boomError.data.timestamp).to.equals(-1);
    });
});
