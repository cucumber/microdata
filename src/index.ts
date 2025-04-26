export function microdataAll<T>(
  itemtype: string,
  scope: Scope,
  extractValue: ExtractValue = () => undefined
): ReadonlyArray<T> {
  const itemScopes = scope.querySelectorAll(
    `[itemscope][itemtype="${itemtype}"]`
  )
  return Array.from(itemScopes).map((scope) => extract(scope, extractValue))
}

export function microdata<T>(
  itemtype: string,
  scope: Scope,
  extractValue: ExtractValue = () => undefined
): T | null {
  const itemScope = scope.querySelector(`[itemscope][itemtype="${itemtype}"]`)
  return itemScope === null ? null : extract<T>(itemScope, extractValue)
}

/**
 * Converts an object to an array
 * @param o an object, array, null or undefined
 * @return an array of 0, 1 or more elements
 */
export function toArray<T>(
  o: T | readonly T[] | undefined | null
): readonly T[] {
  if (o === null || o === undefined) return []
  return Array.isArray(o) ? o : [o as T]
}

function extract<T>(scope: Element, extractValue: ExtractValue): T {
  const itemType = scope.getAttribute('itemtype')

  if (itemType === null) {
    throw new Error(`Missing itemtype on element ${scope.outerHTML}`)
  }

  const microdata = { '@type': new URL(itemType).pathname.slice(1) }
  const children = Array.from(scope.children)
  let child: Element | undefined = undefined

  while ((child = children.shift())) {
    const key = child.getAttribute('itemprop')
    if (key) {
      add(microdata, key, value(child, extractValue))
    }
    if (child.getAttribute('itemscope') === null)
      prepend(children, child.children)
  }

  return microdata as unknown as T
}

function add(microdata: any, key: string, value: any) {
  if (value === null) return

  const prop = microdata[key]
  if (prop == null) microdata[key] = value
  else if (Array.isArray(prop)) prop.push(value)
  else microdata[key] = [prop, value]
}

function value(element: Element, extractValue: ExtractValue) {
  if (element.getAttribute('itemscope') !== null) {
    return extract(element, extractValue)
  }
  const attributeName = attributeNameByTagName[element.tagName.toLowerCase()]
  const extractedValue = extractValue(element)
  const rawValue =
    extractedValue === undefined
      ? attributeName
        ? element.getAttribute(attributeName)
        : element.textContent
      : extractedValue

  if (rawValue === null) {
    throw new Error(`Unable to extract value`)
  }

  if (typeof rawValue === 'boolean') {
    return rawValue
  }

  const stringValue = rawValue
    .trim()
    .split(/\n/)
    .map((s) => s.trim())
    .join(' ')
  const itemType = element.getAttribute('itemtype')
  switch (itemType) {
    case null:
      return stringValue
    case 'https://schema.org/Text':
    case 'https://schema.org/DateTime':
    case 'https://schema.org/Date':
    case 'https://schema.org/Time':
    case 'https://schema.org/CssSelectorType':
    case 'https://schema.org/PronounceableText':
    case 'https://schema.org/URL':
    case 'https://schema.org/XPathType':
      return stringValue
    case 'https://schema.org/Number':
    case 'https://schema.org/Float':
    case 'https://schema.org/Integer':
      return Number(stringValue)
    case 'https://schema.org/Boolean':
      return stringValue === 'true'
    case 'https://schema.org/False':
      return false
    case 'https://schema.org/True':
      return true
    default:
      throw new Error(
        `Unable to extract value. Change itemtype to a primitive type or add itemscope on element ${element.outerHTML}`
      )
  }
}

function prepend(target: Element[], addition: HTMLCollection) {
  ;[].unshift.apply(target, [].slice.call(addition))
}

// https://html.spec.whatwg.org/multipage/microdata.html#values
const attributeNameByTagName: { [key: string]: string } = {
  meta: 'content',
  audio: 'src',
  embed: 'src',
  iframe: 'src',
  img: 'src',
  source: 'src',
  track: 'src',
  video: 'src',
  a: 'href',
  area: 'href',
  link: 'href',
  object: 'data',
  data: 'value',
  meter: 'value',
  time: 'datetime',
}

type ExtractValue = (element: Element) => string | boolean | undefined | null
type Scope = Document | Element
