const crypto = require('crypto');

/* Class constants */
AccessReferenceMap.prototype.DEFAULT_ENCODING = 'hex';
AccessReferenceMap.prototype.DEFAULT_WIDTH = 16;
AccessReferenceMap.prototype.DEFAULT_OPTIONS = {
  encoding: AccessReferenceMap.prototype.DEFAULT_ENCODING,
  width: AccessReferenceMap.prototype.DEFAULT_WIDTH,
};

function AccessReferenceMap(options) {
  const actualOptions = Object.assign(this.DEFAULT_OPTIONS, options);
  this.encoding = actualOptions.encoding;
  this.width = actualOptions.width;
  this.dtoi = new Map();
  this.itod = new Map();
}

AccessReferenceMap.prototype.getUniqueReference = function() {
  return crypto.randomBytes(this.width).toString(this.encoding);
};

AccessReferenceMap.prototype.addDirectReference = function(directReference) {
  if (this.dtoi.has(directReference)) {
    return this.dtoi.get(directReference);
  }

  const indirectReference = this.getUniqueReference();
  this.itod.set(indirectReference, directReference);
  this.dtoi.set(directReference, indirectReference);
  return indirectReference;
};

AccessReferenceMap.prototype.removeDirectReference = function(directReference) {
  const indirectReference = this.dtoi.get(directReference);
  if (indirectReference) {
    this.itod.delete(indirectReference);
    this.dtoi.delete(directReference);
  }
  return indirectReference;
};

AccessReferenceMap.prototype.update = function(directReferences) {
  this.dtoi.clear();
  this.itod.clear();
  directReferences.forEach((directReference) => {
    this.addDirectReference(directReference);
  });
};

AccessReferenceMap.prototype.iterator = function() {
  return this.dtoi.keys();
};

AccessReferenceMap.prototype.getDirectReference = function(indirectReference) {
  return this.itod.get(indirectReference);
};

AccessReferenceMap.prototype.getIndirectReference = function(directReference) {
  return this.dtoi.get(directReference);
};

module.exports = AccessReferenceMap;
