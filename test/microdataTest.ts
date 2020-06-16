import { JSDOM } from 'jsdom'
import { microdata } from '../src/microdata'
import { Event, ItemList, Person, Text, Thing } from 'schema-dts'
import assert from 'assert'

type Tree = Thing & {
  '@type': 'Tree'
  value: Text
  children?: ItemList
}

describe('microdata', () => {
  it('converts primitive types', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
    <div itemscope itemtype="http://schema.org/Event">
        <div>
            Maximum attendees: <span itemprop="maximumAttendeeCapacity" itemtype="http://schema.org/Integer">35</span>.
        </div>
    </div>
    `)
    const event: Event = microdata(
      'http://schema.org/Event',
      dom.window.document.documentElement
    )

    assert.strictEqual(event.maximumAttendeeCapacity, 35)
  })

  it('creates a nested list', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
<ol>
    <li itemscope itemtype="http://schema.cucumber.io/Tree">
        <span itemprop="value" itemtype="http://schema.org/Text">Europe</span>
        <ol itemscope itemtype="http://schema.cucumber.io/TreeList">
            <li itemscope itemprop="children" itemtype="http://schema.cucumber.io/Tree">
                <span itemprop="value" itemtype="http://schema.org/Text">France</span>
                <ol itemscope itemtype="http://schema.cucumber.io/TreeList">
                    <li itemscope itemprop="children" itemtype="http://schema.cucumber.io/Tree">
                        <span itemprop="value" itemtype="http://schema.org/Text">Toulouse</span>
                    </li>
                    <li itemscope itemprop="children"  itemtype="http://schema.cucumber.io/Tree">
                        <span itemprop="value" itemtype="http://schema.org/Text">Paris</span>
                    </li>
                </ol>
            </li>
            <li itemscope itemprop="children" itemtype="http://schema.cucumber.io/Tree">
                <span itemprop="value" itemtype="http://schema.org/Text">Spain</span>
            </li>
        </ol>
    </li>
</ol>
    `)

    const expected = {}
    assert.deepStrictEqual(
      microdata(
        'http://schema.cucumber.io/Tree',
        dom.window.document.documentElement
      ),
      expected
    )
  })

  it('can use a custom function to look up value from element', () => {
    const dom = new JSDOM(`<!DOCTYPE html>
<div itemscope itemtype="http://schema.org/Person">
  <div itemprop="givenName" itemtype="http://schema.org/Text">
    <span>Ignore this</span>
    <span class="use-this">Aslak</span>
  </div>
  <span itemprop="familyName" itemtype="http://schema.org/Text">Hellesøy</span>
</div>
`)
    // @ts-ignore
    const { givenName, familyName } = microdata<Person>(
      'http://schema.org/Person',
      dom.window.document.documentElement,
      element => element.querySelector('.use-this')?.textContent
    )

    assert.deepStrictEqual(
      { givenName, familyName },
      { givenName: 'Aslak', familyName: 'Hellesøy' }
    )
  })
})
