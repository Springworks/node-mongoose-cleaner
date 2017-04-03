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

function removeIds(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (prop === 'id') {
        delete obj[prop];
      }
      else if (typeof obj[prop] === 'object') {
        removeIds(obj[prop]);
      }
    }
  }
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
        virtuals: true,
      });
    }

    delete lean.__v;
    lean = convertObjectIds(lean);
    removeIds(lean);
    return lean;
  },

};

export default api;

