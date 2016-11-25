import mapValues from 'lodash.mapvalues';

function isLookingLikeMongooseDocument(obj) {
  return typeof obj.toObject === 'function';
}

function convertObjectIds(obj) {
  return mapValues(obj, value => {
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
      lean = mongoose_doc.toObject({
        getters: true,
        virtuals: false,
      });
    }

    delete lean.__v;
    return convertObjectIds(lean);
  },

};

export default api;

