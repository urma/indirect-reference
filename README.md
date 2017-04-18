# indirect-reference
This is a node.js port of
[OWASP ESAPI AccessReferenceMap](https://static.javadoc.io/org.owasp.esapi/esapi/2.0.1/org/owasp/esapi/AccessReferenceMap.html)
class, which implements indirect mapping between object IDs (which can represent
database records, filesystem entries or any other entities with predictable
identifiers) and random values with user-controllable address space width.
This prevents attackers from guessing identifier values and getting access to
objects outside their scope.

Install with:
```
npm install indirect-reference
```
## Usage Example
```
var AccessReferenceMap = require('indirect-reference');
var accessMap = new AccessReferenceMap({ width: 32 });

/* Add object ID to mapping */
var object = db.fetchObject({ name: 'someValue' });
var indirectReference = accessMap.addDirectReference(object.id);

/* Fetch original object from mapping */
var directReference = accessMap.getDirectReference(indirectReference);
var originalObject = db.fetchObject({ id: directReference });

/* Map a collection of objects */
var objectCollection = db.fetchCollection({ userId: 1234 });
accessMap.update(objectCollection.map((obj) => {
  obj.id
}));

/* Iterate over registred objects */
for(let directReference of accessMap.iterator()) {
  var indirectReference = accessMap.getIndirectReference(directReference)
  console.log(`${directReference} is mapped to ${indirectReference}`);
}
```
## Methods
### constructor(options)
Obtains a new instance of AccessReferenceMap with the provided options, which include:
* `width`, specifies the number of bytes in the generated indirect values (default is 16 bytes)
* `encoding`, specifies the encoding format for the generated indirect values (default is `hex`)

### addDirectReference(directReference)
Adds a direct reference to the mapping, then generates and returns the associated indirect reference
### getDirectReference(indirectReference)
Obtains the original direct object reference from an indirect reference
### getIndirectReference(directReference)
Obtains a safe indirect reference to use in place of a potentially sensitive direct object reference
### iterator
Get an iterator through the direct object references
### removeDirectReference(directReference)
Removes a direct reference and its associated indirect reference from the mapping
### update(directReferences)
Updates the access reference map with a new set of direct references, maintaining any existing indirect
references associated with items that are in the new list
