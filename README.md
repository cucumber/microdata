![Node.js CI](https://github.com/cucumber/microdata/workflows/Node.js%20CI/badge.svg)

# Microdata

This module converts a DOM to Microdata in [JSON-LD](https://json-ld.org/) format.

This can be used to extract "interesting" pieces of information from a DOM annotated with
[Microdata](https://html.spec.whatwg.org/multipage/microdata.html) attributes, such as
`itemscope`, `itemtype` and `itemprop`.

The library supports [all types](https://schema.org/docs/full.html) from [schema.org](https://schema.org/).

## Example

Given a sample DOM:

```html
<!DOCTYPE html>
<div itemscope itemtype="http://schema.org/Person">
  <span itemprop="name">Jane Doe</span>
</div>
```

We can extract the `Person` on that page to a [JSON-LD](https://json-ld.org/) compliant JavaScript object:

```javascript
const { microdata } = require('@cucumber/microdata')
const { Person } = require('schema-dts')

const person = microdata('http://schema.org/Person', document)
console.log(person.name) // "Jane Doe"
```

If you are using TypeScript you can cast the result to a type from [schema-dts](https://github.com/google/schema-dts):

```typescript
import { microdata } from '@cucumber/microdata'
import { Person } from 'schema-dts'

const person = microdata('http://schema.org/ItemList', document) as Person
console.log(person.name) // "Jane Doe"
```

## Custom value extraction

In some cases you may want finer grained control over how values are extracted from the DOM. For example,
you may have a [CodeMirror](https://codemirror.net/) editor sitting inside of an element:

```html
<div itemtype="http://schema.org/Text">
  <!-- CodeMirror here -->
</div>
``` 

You can pass a custom `extractValue` function as the last argument to `microdata` or `microdataAll`:

```typescript
const data = microdata(
  someSchemaType, 
  someElement,
  element => element.querySelector('.CodeMirror')?.CodeMirror?.getValue()
)
```

This function may return `undefined`. In that case, the default lookup mechanisms will be used.

## Custome types

We recommend using the official types defined by schema.org if you can. Sometimes however, you may want to
define your own types if the official types are insufficient.

You can see an example of how this is done in [test/microdataTest.ts](test/microdataTest.ts).

## Usage in testing

This library can be used to write assertions against web pages.
It works with any UI library as it only inspects the DOM. The only requirement
is that the HTML has Microdata in it.

Here is an example from a hypothetical TODO list application:

```typescript
const itemList = microdata('http://schema.org/ItemList', element) as ItemList
const todos = itemList.itemListElement as Text[]
assert.deepStrictEqual(todos, ['Get milk', 'Feed dog'])
```

## Credit

This library is based on the excellent, but abandoned [microdata](https://github.com/nathan7/microdata). It's been ported to TypeScript, and some bug fixes have
been applied to make it compliant with JSON-LD.
