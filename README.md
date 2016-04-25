# mongoose-cleaner

Clean out mongo/mongoose specific data from documents.

# Usage

Import this module. Invoke `cleanMongooseDocument()` on the document in question and it will return the cleaned counterpart.

Example

```javascript
import mongoose_cleaner from '@springworks/mongoose-cleaner';

const cleaned_document = mongoose_cleaner.cleanMongooseDocument(doc);
```
