![Node.js CI](https://github.com/cucumber/microdata/workflows/Node.js%20CI/badge.svg)

# Microdata

This zero-dependency library converts a DOM to [Microdata](https://html.spec.whatwg.org/multipage/microdata.html).

It can be used to extract "interesting" pieces of information from a DOM, such as [Person](https://schema.org/Person),
[Order](https://schema.org/Order), [MusicEvent](https://schema.org/MusicEvent) etc.
 
All you need to do is to add the appropriate `itemscope`, `itemtype` and `itemprop` attributes to your HTML, and this library
will be able to extract the data.

The library supports [all schema.org types](https://schema.org/docs/full.html), and also allows custom Microdata types.

The returned Mircodata uses the [JSON-LD](https://json-ld.org/) format.

## Installation

    npm install @cucumber/microdata

## Example

Given a sample DOM:

```html
<!DOCTYPE html>
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">Jane Doe</span>
</div>
```

We can extract the `Person` on that page to a [JSON-LD](https://json-ld.org/) compliant JavaScript object:

```javascript
const { microdata } = require('@cucumber/microdata')

const person = microdata('https://schema.org/Person', document)
console.log(person.name) // "Jane Doe"
```

If you are using TypeScript you can cast the result to a type from [schema-dts](https://github.com/google/schema-dts):

```typescript
import { microdata } from '@cucumber/microdata'
import { Person } from 'schema-dts'

const person = microdata('https://schema.org/Person', document) as Person
if (typeof person === 'string') throw new Error('Expected a Person object')
console.log(person.name) // "Jane Doe"
```

## Custom value extraction

In some cases you may want finer grained control over how to extract values from the DOM. For example,
you may have a [CodeMirror](https://codemirror.net/) editor sitting inside of an element:

```html
<div itemtype="https://schema.org/Text">
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

## Custom types

We recommend using the official types defined by schema.org if you can. Sometimes however, you may want to
define your own types if the official types are insufficient.

You can see an example of how this is done in [test/microdataTest.ts](test/microdataTest.ts).

## Usage in testing

This library can be used to write assertions against web pages.
It works with any UI library as it only inspects the DOM. The only requirement
is that the HTML has Microdata in it.

Here is an example from a hypothetical TODO list application:

```typescript
import { microdata } from '@cucumber/microdata'

const itemList = microdata('https://schema.org/ItemList', element) as ItemList
const todos = itemList.itemListElement as Text[]
assert.deepStrictEqual(todos, ['Get milk', 'Feed dog'])
```

## Arrays

Some microdata `itemScope`s allow `itemProp` elements that can be specified more than once.
For example, if an `ItemList` has two or more `itemListElement` children, then the `itemListElement`
field in the LD-JSON object will be an `Array`.

However, if there is only one child, it will have the value of that child rather than an array with one element.

And if there are none, the value of that child will be undefined.

The `toArray` function of this library will convert a value to an array with 0, 1 or more elements so you
don't need to worry about this.

```typescript
import { microdata, toArray } from '@cucumber/microdata'

const itemList = microdata('https://schema.org/ItemList', element) as ItemList
const todos = toArray(itemList.itemListElement) as Text[]
assert.deepStrictEqual(todos, ['Get milk', 'Feed dog'])
```

## Credit

This library is based on the excellent, but abandoned [microdata](https://github.com/nathan7/microdata). It's been ported to TypeScript, and some bug fixes have
been applied to make it compliant with JSON-LD.
