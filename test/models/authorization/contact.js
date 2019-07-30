const Lab = require('@hapi/lab');
const BaseModel = require('models/base');
const ContactModel = require('models/authorization/contact');

const { describe, expect, it } = (exports.lab = Lab.script());

describe('Model: contact', () => {
    it('extends from base model', () => {
        // exercise
        let contactModel = new ContactModel();

        // verify
        expect(contactModel).to.be.an.instanceof(BaseModel);
    });

    it('should persist to a table named contacts', () => {
        expect(ContactModel.tableName).to.equals('contacts');
    });

    it('should contain a schema', () => {
        expect(ContactModel.jsonSchema).to.be.an.object();
    });
});
