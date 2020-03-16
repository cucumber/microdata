# Microdata

This module converts a DOM to Microdata in [JSON-LD](https://json-ld.org/) format.

This can be used to extract "interesting" pieces of information from a DOM annotated with
[Microdata](https://html.spec.whatwg.org/multipage/microdata.html) attributes, such as
`itemscope`, `itemtype` and `itemprop`.

## Example

Given a sample DOM:

```html
<!DOCTYPE html>
<div itemscope itemtype="http://schema.org/Event">
  <div>
    Maximum attendees: <span itemprop="maximumAttendeeCapacity" itemtype="http://schema.org/Integer">35</span>.
  </div>
</div>
```

We can convert it to a JavaScript object:

```javascript
const event = microdata('http://schema.org/Event', document)
console.log(event.maximumAttendeeCapacity); // 35
```
