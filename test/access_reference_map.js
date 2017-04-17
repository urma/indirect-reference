const AccessReferenceMap = require('../');
const assert = require('assert');
const crypto = require('crypto');

function randomValue() {
  return crypto.randomBytes(16).toString('hex');
}

describe('AccessReferenceMap', function() {
  describe('#constructor()', function() {
    it('should use default values with no parameters', function() {
      const map = new AccessReferenceMap();
      assert.ok(map);
      assert.ok(map.encoding);
      assert.ok(map.width);
    });

    it('should respect encoding parameter, when provided', function() {
      const map = new AccessReferenceMap({ encoding: 'ascii' });
      assert.ok(map);
      assert.strictEqual(map.encoding, 'ascii');
    });

    it('should respect width parameter, when provided', function() {
      const map = new AccessReferenceMap({ width: 64 });
      assert.ok(map);
      assert.strictEqual(map.width, 64);
    });
  });

  describe('#getUniqueReference()', function() {
    it('should generate values with the correct encoding', function() {
      const map = new AccessReferenceMap({ encoding: 'hex' });
      assert.ok(map.getUniqueReference());
      assert.ok(map.getUniqueReference().match(/^[0-9a-f]+$/));
    });

    it('should generate values with the correct width', function() {
      const map = new AccessReferenceMap({ encoding: 'ascii', width: 64 });
      const byteWidth = Buffer.from([ 0x00 ]).toString(map.encoding).length;
      assert.ok(map.getUniqueReference());
      assert.strictEqual(map.getUniqueReference().length, map.width * byteWidth);
    });
  });

  describe('#addDirectReference(reference)', function() {
    it('should return an indirect reference in the expected format', function() {
      const map = new AccessReferenceMap();
      const byteWidth = Buffer.from([ 0x00 ]).toString(map.encoding).length;
      const indirectReference = map.addDirectReference(randomValue());
      assert.ok(indirectReference);
      assert.strictEqual(indirectReference.length, map.width * byteWidth);
    });

    it('should return the same indirect reference for the same direct reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.ok(indirectReference);
      assert.strictEqual(map.addDirectReference(directReference), indirectReference);
    });

    it('should return the direct reference when provided the indirect reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.ok(indirectReference);
      assert.strictEqual(map.getDirectReference(indirectReference), directReference);
    });
  });

  describe('#removeDirectReference(reference)', function() {
    it('should remove an existing direct reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.ok(map.removeDirectReference(directReference));
    });

    it('should fail with a non-existing direct reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.ifError(map.removeDirectReference(randomValue()));
    });

    it('should return the indirect reference when removing a direct reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.strictEqual(map.removeDirectReference(directReference), indirectReference);
    });

    it('should fail to remove the same direct reference twice', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.strictEqual(map.removeDirectReference(directReference), indirectReference);
      assert.ifError(map.removeDirectReference(directReference));
    });
  });

  describe('#update(references)', function() {
    it('should add a collection of direct references', function() {
      const map = new AccessReferenceMap();
      const directReferences = [ randomValue(), randomValue(), randomValue(), randomValue() ];
      assert.doesNotThrow(() => {
        map.update(directReferences)
      });
    });

    it('should add all provided direct references in map', function() {
      const map = new AccessReferenceMap();
      const directReferences = [ randomValue(), randomValue(), randomValue(), randomValue() ];
      map.update(directReferences);
      assert.ok(directReferences.every((reference, index, list) => {
        return map.getIndirectReference(reference);
      }));
    });

    it('should not add duplicate direct references', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const directReferences = [ directReference, directReference, directReference, directReference ];
      map.update(directReferences);
      directReferences.forEach((reference) => {
        assert.strictEqual(map.getIndirectReference(reference), map.getIndirectReference(directReferences[0]));
      });
    });
  });

  describe('#iterator()', function() {
    it('should return all the direct references in a map', function() {
      const map = new AccessReferenceMap();
      const directReferences = [ randomValue(), randomValue(), randomValue(), randomValue() ];
      map.update(directReferences);
      for(let element of map.iterator()) {
        assert.ok(directReferences.includes(element));
      }
    });
  });

  describe('#getDirectReference(indirect)', function() {
    it('should return the direct reference when provided a valid indirect reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.strictEqual(map.getDirectReference(indirectReference), directReference);
    });

    it('should return null when provided an invalid indirect reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      assert.ifError(map.getDirectReference(randomValue()));
    });
  });

  describe('#getIndirectReference(direct)', function() {
    it('should return the direct reference when provided a valid indirect reference', function() {
      const map = new AccessReferenceMap();
      const directReference = randomValue();
      const indirectReference = map.addDirectReference(directReference);
      assert.strictEqual(map.getIndirectReference(directReference), indirectReference);
    });

    it('should return null when provided an invalid indirect reference', function() {
      const map = new AccessReferenceMap();
      const indirectReference = randomValue();
      assert.ifError(map.getIndirectReference(randomValue()));
    });
  });
});
