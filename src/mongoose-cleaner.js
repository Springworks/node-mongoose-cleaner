function isLookingLikeMongooseDocument(obj) {
  return typeof obj.toObject === 'function';
}

function transformIds(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] && obj[prop].constructor && obj[prop].constructor.name === 'ObjectID') {
        obj[prop] = obj[prop].toString();
      }
      else if (prop === 'id') {
        delete obj[prop];
      }
      else if (typeof obj[prop] === 'object') {
        transformIds(obj[prop]);
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
    transformIds(lean);
    return lean;
  },

};

export default api;

