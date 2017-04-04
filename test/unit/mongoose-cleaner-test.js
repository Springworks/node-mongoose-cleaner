import mongoose from 'mongoose';
import autorestoredSandbox from '@springworks/test-harness/autorestored-sandbox';
import cleaner from '../../src/mongoose-cleaner';

const ObjectId = mongoose.Schema.Types.ObjectId;

const MockSchema = new mongoose.Schema({
  foo: { type: String, required: false },
  other_id: { type: ObjectId, required: false },
  nested: [
    {
      nested_foo: { type: String, required: false },
    },
  ],
  nested_object_ids_level_1: {
    nested_object_id_level_1: { type: ObjectId, required: false },
    nested_object_ids_level_2: {
      nested_object_id_level_2: { type: ObjectId, required: false },
    },
  },
});

MockSchema.path('foo').get(value => {
  return `${value}-added-by-getter`;
});

const MongooseCleanerModel = mongoose.model('MongooseCleanerModel', MockSchema);

function createMongooseDocument(params) {
  return new MongooseCleanerModel(params);
}

function assertNoIdProperties(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      prop.should.not.equal('id');
      if (typeof obj[prop] === 'object') {
        assertNoIdProperties(obj[prop]);
      }
    }
  }
}

function assertNoObjectIdProperties(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] && obj[prop].constructor) {
        obj[prop].constructor.name.should.not.equal('ObjectID');
      }
      if (typeof obj[prop] === 'object') {
        assertNoObjectIdProperties(obj[prop]);
      }
    }
  }
}

describe('test/unit/mongoose-cleaner-test.js', () => {
  const sinon_sandbox = autorestoredSandbox();

  describe('cleanMongooseDocument', () => {

    describe('with a DB document having only one ObjectId', () => {
      const params = { foo: 'bar' };
      let document;

      beforeEach(() => {
        document = createMongooseDocument(params);
        document.__v = 4;
      });

      beforeEach(() => {
        sinon_sandbox.spy(document, 'toObject');
      });

      it('should return document as pure Javascript object', () => {
        const cleaned = cleaner.cleanMongooseDocument(document);
        cleaned._id.should.have.type('string');
        cleaned.should.have.keys('_id', 'foo');
      });

      it('should apply getters when doing toObject()', () => {
        const cleaned = cleaner.cleanMongooseDocument(document);
        document.toObject.should.be.calledOnce();
        document.toObject.firstCall.args[0].should.have.properties({
          getters: true,
          virtuals: true,
        });
        cleaned.should.have.property('foo', 'bar-added-by-getter');
        cleaned.should.not.have.property('id');
      });

    });

    describe('with a DB document having another ObjectId property', () => {
      let document;

      beforeEach(() => {
        document = createMongooseDocument({
          other_id: '537f844b2883b0d8c825270d',
        });
      });

      it('should convert ObjectId property to String', () => {
        const cleaned = cleaner.cleanMongooseDocument(document);
        cleaned.other_id.should.have.type('string');
      });

    });

    describe('with a DB document having a nested array of documents', () => {
      let document;

      beforeEach(() => {
        document = createMongooseDocument({
          nested: [
            {
              nested_foo: 'hello',
            },
            {
              nested_foo: 'bar',
            },
          ],
        });
      });

      it('should not have `id` anywhere on the document', () => {
        const cleaned = cleaner.cleanMongooseDocument(document);
        assertNoIdProperties(cleaned);
      });

    });

    describe('with a DB document having a nested ObjectID:s', () => {
      let document;

      beforeEach(() => {
        document = createMongooseDocument({
          nested_object_ids_level_1: {
            nested_object_id_level_1: '537f844b2883b0d8c825270d',
            nested_object_ids_level_2: {
              nested_object_id_level_2: '337e844b2883b1d1c89527ad',
            },
          },
        });
      });

      it('should not have `id` anywhere on the document', () => {
        const cleaned = cleaner.cleanMongooseDocument(document);
        assertNoObjectIdProperties(cleaned);
      });

    });

    describe('when DB document omitted', () => {

      it('should return null, but not fail', () => {
        const cleaned = cleaner.cleanMongooseDocument(null);
        should.not.exist(cleaned);
      });

    });

  });

});
