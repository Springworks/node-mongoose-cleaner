import mongoose from 'mongoose';
import cleaner from '../../src/mongoose-cleaner';

const ObjectId = mongoose.Schema.Types.ObjectId;

const MockSchema = new mongoose.Schema({
  foo: { type: String, required: false },
  other_id: { type: ObjectId, required: false },
});
const MongooseCleanerModel = mongoose.model('MongooseCleanerModel', MockSchema);

function createMongooseDocument(params) {
  return new MongooseCleanerModel(params);
}

describe('test/unit/mongoose-cleaner-test.js', () => {

  describe('cleanMongooseDocument', () => {

    describe('with a DB document having only one ObjectId', () => {
      const params = { foo: 'bar' };
      let document;

      beforeEach(() => {
        document = createMongooseDocument(params);
        document.__v = 4;
      });

      it('should return document as pure Javascript object', () => {
        const cleaned = cleaner.cleanMongooseDocument(document);
        cleaned.should.have.properties(params);
        cleaned._id.should.have.type('string');
        cleaned.should.have.keys([
          '_id',
          'foo',
        ]);
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

    describe('when DB document omitted', () => {

      it('should return null, but not fail', () => {
        const cleaned = cleaner.cleanMongooseDocument(null);
        should.not.exist(cleaned);
      });

    });

  });

});
