import _ from 'lodash';

function isLookingLikeMongooseDocument(obj) {
  return typeof obj.toObject === 'function';
}

function convertObjectIds(obj) {
  return _.mapValues(obj, value => {
    if (value && value.constructor && value.constructor.name === 'ObjectID') {
      return value.toString();
    }
    return value;
  });
}

const api = {

  cleanMongooseDocument(mongoose_doc) {
    if (!mongoose_doc) {
      return null;
    }

    let lean = mongoose_doc;

    if (isLookingLikeMongooseDocument(mongoose_doc)) {
      lean = mongoose_doc.toObject();
    }

    const omitted = _.omit(lean, '__v');
    return convertObjectIds(omitted);
  },

};

export default api;

