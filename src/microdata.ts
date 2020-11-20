export function microdataAll<T>(
  itemtype: string,
  scope: Element,
  extractValue: ExtractValue = () => undefined
): ReadonlyArray<T> {
  const itemScopes = scope.querySelectorAll(
    `[itemscope][itemtype="${itemtype}"]`
  )
  return [...itemScopes].map((scope) => extract(scope, extractValue))
}

export function microdata<T>(
  itemtype: string,
  scope: Element,
  extractValue: ExtractValue = () => undefined
): T {
  const itemScope = scope.querySelector(`[itemscope][itemtype="${itemtype}"]`)
  return itemScope === null ? null : extract(itemScope, extractValue)
}

function extract(scope: Element, extractValue: ExtractValue): any {
  const itemType = scope.getAttribute('itemtype')

  if (itemType === null) {
    throw new Error(`Missing itemtype on element ${scope.outerHTML}`)
  }

  const microdata = { '@type': new URL(itemType).pathname.slice(1) }
  const children = [...scope.children]
  let child: Element | undefined = undefined

  while ((child = children.shift())) {
    const key = child.getAttribute('itemprop')
    if (key) {
      add(microdata, key, value(child, extractValue))
    }
    if (child.getAttribute('itemscope') === null)
      prepend(children, child.children)
  }

  return microdata
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
  const rawStringValue =
    extractValue(element) ||
    (attributeName ? element.getAttribute(attributeName) : element.textContent)
  const stringValue = rawStringValue
    .trim()
    .split(/\n/)
    .map((s) => s.trim())
    .join(' ')
  const itemType = element.getAttribute('itemtype')
  switch (itemType) {
    case null:
      return stringValue
    case 'http://schema.org/Text':
    case 'http://schema.org/DateTime':
    case 'http://schema.org/Date':
    case 'http://schema.org/Time':
    case 'http://schema.org/CssSelectorType':
    case 'http://schema.org/PronounceableText':
    case 'http://schema.org/URL':
    case 'http://schema.org/XPathType':
      return stringValue
    case 'http://schema.org/Number':
    case 'http://schema.org/Float':
    case 'http://schema.org/Integer':
      return Number(stringValue)
    case 'http://schema.org/Boolean':
    case 'http://schema.org/False':
    case 'http://schema.org/True':
      return Boolean(stringValue)
    default:
      throw new Error(
        `Unable to extract value. Change itemtype to a primitive type or add itemscope on element ${element.outerHTML}`
      )
  }
}

function prepend(target: Element[], addition: HTMLCollection) {
  ;[].unshift.apply(target, [].slice.call(addition))
}

const attributeNameByTagName: { [key: string]: string } = {
  meta: 'content',
  audio: 'src',
  embed: 'src',
  iframe: 'src',
  img: 'src',
  source: 'src',
  video: 'src',
  a: 'href',
  area: 'href',
  link: 'href',
  object: 'data',
  time: 'datetime',
}

type ExtractValue = (element: Element) => string | undefined
