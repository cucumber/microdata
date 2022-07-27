import { JSDOM } from 'jsdom'
import { microdata, toArray } from '../src/index.js'
import {
  BreadcrumbList,
  CreativeWork,
  Event,
  ListItem,
  Person,
  Text,
} from 'schema-dts'
import assert from 'assert'

type Tree = {
  '@type': 'Tree'
  value: Text
  children?: TreeList
}

type TreeList = {
  '@type': 'TreeList'
  treeListElement: Tree | Tree[]
}

describe('microdata', () => {
  it.only('converts primitive types', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
    <div itemscope itemtype="https://schema.org/Event">
        <div>
            Maximum attendees: <span itemprop="maximumAttendeeCapacity" itemtype="https://schema.org/Integer">35</span>.
            <meta itemprop="isAccessibleForFree" itemtype="https://schema.org/Boolean" content="false"/>Ticket: pay at the entrance.
        </div>
    </div>
    `)
    const event: Event = microdata(
      'https://schema.org/Event',
      dom.window.document.documentElement
    )!

    assert.strictEqual(event.maximumAttendeeCapacity, 35)
    assert.strictEqual(event.isAccessibleForFree, false)
  })

  it('converts objects with dates', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
    <div itemscope itemtype="https://schema.org/CreativeWork">
        <div>
            Maximum attendees: <span itemprop="dateCreated" itemtype="https://schema.org/DateTime">2020-11-20T11:15:52.927Z</span>.
        </div>
    </div>
    `)
    const creativeWork: CreativeWork = microdata(
      'https://schema.org/CreativeWork',
      dom.window.document.documentElement
    )!

    assert.strictEqual(creativeWork.dateCreated, '2020-11-20T11:15:52.927Z')
  })

  it('creates a Tree using custom types', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
<ol>
    <li itemscope itemprop="treeListElement" itemtype="https://schema.cucumber.io/Tree">
        <span itemprop="value" itemtype="https://schema.org/Text">Europe</span>
        <ol itemscope itemprop="children" itemtype="https://schema.cucumber.io/TreeList">
            <li itemscope itemprop="treeListElement" itemtype="https://schema.cucumber.io/Tree">
                <span itemprop="value" itemtype="https://schema.org/Text">France</span>
                <ol itemscope itemprop="children" itemtype="https://schema.cucumber.io/TreeList">
                    <li itemscope itemprop="treeListElement" itemtype="https://schema.cucumber.io/Tree">
                        <span itemprop="value" itemtype="https://schema.org/Text">Toulouse</span>
                    </li>
                    <li itemscope itemprop="treeListElement" itemtype="https://schema.cucumber.io/Tree">
                        <span itemprop="value" itemtype="https://schema.org/Text">Paris</span>
                    </li>
                </ol>
            </li>
            <li itemscope itemprop="treeListElement" itemtype="https://schema.cucumber.io/Tree">
                <span itemprop="value" itemtype="https://schema.org/Text">Spain</span>
            </li>
        </ol>
    </li>
</ol>
    `)

    const expected: Tree = {
      '@type': 'Tree',
      children: {
        '@type': 'TreeList',
        treeListElement: [
          {
            '@type': 'Tree',
            children: {
              '@type': 'TreeList',
              treeListElement: [
                {
                  '@type': 'Tree',
                  value: 'Toulouse',
                },
                {
                  '@type': 'Tree',
                  value: 'Paris',
                },
              ],
            },
            value: 'France',
          },
          {
            '@type': 'Tree',
            value: 'Spain',
          },
        ],
      },
      value: 'Europe',
    }

    assert.deepStrictEqual(
      microdata(
        'https://schema.cucumber.io/Tree',
        dom.window.document.documentElement
      ),
      expected
    )
  })

  it('can use a custom function to look up value from element', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
<div itemscope itemtype="https://schema.org/Person">
  <div itemprop="givenName" itemtype="https://schema.org/Text">
    <span>Ignore this</span>
    <span class="use-this">Aslak</span>
  </div>
  <span itemprop="familyName" itemtype="https://schema.org/Text">Hellesøy</span>
</div>
`)
    const person = microdata<Person>(
      'https://schema.org/Person',
      dom.window.document.documentElement,
      (element) => element.querySelector('.use-this')?.textContent
    )!

    if (typeof person === 'string') throw new Error('Expected a Person object')

    assert.strictEqual(person.givenName, 'Aslak')
    assert.strictEqual(person.familyName, 'Hellesøy')
  })

  it('can extract properties with empty strings', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
<div itemscope itemtype="https://schema.org/Person">
  <div itemprop="givenName" itemtype="https://schema.org/Text"></div>
  <span itemprop="familyName" itemtype="https://schema.org/Text">Hellesøy</span>
</div>
`)
    const person = microdata<Person>(
      'https://schema.org/Person',
      dom.window.document.documentElement
    )!

    if (typeof person === 'string') throw new Error('Expected a Person object')

    assert.strictEqual(person.givenName, '')
    assert.strictEqual(person.familyName, 'Hellesøy')
  })

  it('does not fallback to the default look up when the custom one returns an empty string', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
<div itemscope itemtype="https://schema.org/Person">
  <input type="text" itemprop="givenName" itemtype="https://schema.org/Text" value="" />
</div>
`)
    const person = microdata<Person>(
      'https://schema.org/Person',
      dom.window.document.documentElement,
      (element) => {
        if (element.getAttribute('itemprop') === 'givenName')
          return element.getAttribute('value')
        return undefined
      }
    )!

    if (typeof person === 'string') throw new Error('Expected a Person object')

    assert.strictEqual(person.givenName, '')
  })

  describe('toArray', () => {
    it('converts two children to array with two elements', () => {
      const dom = new JSDOM(`<!DOCTYPE html>
<ol itemscope itemtype="https://schema.org/BreadcrumbList">
  <li itemprop="itemListElement" itemscope
      itemtype="https://schema.org/ListItem">
    <a itemprop="item" href="https://example.com/dresses">
    <span itemprop="name">Dresses</span></a>
    <meta itemprop="position" content="1" />
  </li>
  <li itemprop="itemListElement" itemscope
      itemtype="https://schema.org/ListItem">
    <a itemprop="item" href="https://example.com/dresses/real">
    <span itemprop="name">Real Dresses</span></a>
    <meta itemprop="position" content="2" />
  </li>
</ol>
`)
      const breadcrumbList = microdata<BreadcrumbList>(
        'https://schema.org/BreadcrumbList',
        dom.window.document.documentElement
      )!

      const dressNames = toArray(breadcrumbList.itemListElement).map(
        (e: ListItem) => e.name
      )
      assert.deepStrictEqual(dressNames, ['Dresses', 'Real Dresses'])
    })

    it('converts one child to array with one element', () => {
      const dom = new JSDOM(`<!DOCTYPE html>
<ol itemscope itemtype="https://schema.org/BreadcrumbList">
  <li itemprop="itemListElement" itemscope
      itemtype="https://schema.org/ListItem">
    <a itemprop="item" href="https://example.com/dresses">
    <span itemprop="name">Dresses</span></a>
    <meta itemprop="position" content="1" />
  </li>
</ol>
`)
      const breadcrumbList = microdata<BreadcrumbList>(
        'https://schema.org/BreadcrumbList',
        dom.window.document.documentElement
      )!

      const dressNames = toArray(breadcrumbList.itemListElement).map(
        (e: ListItem) => e.name
      )
      assert.deepStrictEqual(dressNames, ['Dresses'])
    })

    it('converts no childred to array with zero elements', () => {
      const dom = new JSDOM(`<!DOCTYPE html>
<ol itemscope itemtype="https://schema.org/BreadcrumbList">
</ol>
`)
      const breadcrumbList = microdata<BreadcrumbList>(
        'https://schema.org/BreadcrumbList',
        dom.window.document.documentElement
      )!

      const dresses = toArray(breadcrumbList.itemListElement) as ListItem[]
      const dressNames = dresses.map((e: ListItem) => e.name)
      assert.deepStrictEqual(dressNames, [])
    })
  })
})
