const Lab = require('@hapi/lab');
const Boom = require('@hapi/boom');
const NSError = require('errors/nserror');

const { describe, expect, it } = (exports.lab = Lab.script());

describe('Errors', () => {
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
        expect(NSError.AUTH_INVALID_CREDENTIALS().output.statusCode).to.equals(401);
        expect(NSError.AUTH_INVALID_TOKEN().output.statusCode).to.equals(401);
    });

    it('wrap not found errors with 404 boom', () => {
        expect(NSError.RESOURCE_NOT_FOUND().output.statusCode).to.equals(404);
    });

    it('wrap conflict errors with 409 boom', () => {
        expect(NSError.RESOURCE_DUPLICATE().output.statusCode).to.equals(409);
        expect(NSError.RESOURCE_RELATION().output.statusCode).to.equals(409);
        expect(NSError.RESOURCE_STATE().output.statusCode).to.equals(409);
    });

    it('wrap server errors with 500 boom', () => {
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

    it('matches error type to string generated boom errors', () => {
        // setup
        let error1 = NSError.AUTH_ERROR();
        let error2 = NSError.AUTH_CRYPT_ERROR();

        // verify
        expect(NSError.AUTH_ERROR.match(error1)).to.be.true();
        expect(NSError.AUTH_CRYPT_ERROR.match(error2)).to.be.true();
        expect(NSError.AUTH_ERROR.match(error2)).to.be.false();
        expect(NSError.AUTH_CRYPT_ERROR.match(error1)).to.be.false();
    });

    it('matched error type of object generated boom errors', () => {
        // setup
        let error1 = NSError.AUTH_INVALID_CREDENTIALS();
        let error2 = NSError.RESOURCE_NOT_FOUND();

        // verify
        expect(NSError.AUTH_INVALID_CREDENTIALS.match(error1)).to.be.true();
        expect(NSError.RESOURCE_NOT_FOUND.match(error2)).to.be.true();
        expect(NSError.AUTH_INVALID_CREDENTIALS.match(error2)).to.be.false();
        expect(NSError.RESOURCE_NOT_FOUND.match(error1)).to.be.false();
    });

    it('does not match generic error', () => {
        expect(NSError.AUTH_ERROR.match(Error())).to.be.false();
        expect(NSError.RESOURCE_NOT_FOUND.match(Error())).to.be.false();
    });

    it('does not match non error objects', () => {
        expect(NSError.AUTH_ERROR.match({})).to.be.false();
        expect(NSError.RESOURCE_NOT_FOUND.match({})).to.be.false();
    });

    it('creates errors with custom error message', () => {
        // setup
        const message = 'a custom error message';

        // verify
        expect(NSError.AUTH_ERROR(message).message).to.equals(message);
        expect(NSError.RESOURCE_NOT_FOUND(message).message).to.equals(message);
    });

    it('creates bad implementation on unknown errors', () => {
        // verify
        expect(NSError.create({}).output.statusCode).to.equals(500);
        expect(NSError.create([]).output.statusCode).to.equals(500);
    });
});
