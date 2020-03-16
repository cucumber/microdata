import { JSDOM } from 'jsdom'
import { microdata } from '../src/microdata'
import { LocalBusiness, Person } from 'schema-dts'
import assert from 'assert'

describe('microdata', () => {
  context(
    'acceptace tests from https://github.com/schemaorg/schemaorg/blob/master/data/examples.txt',
    () => {
      it('makes a http://schema.org/Person', () => {
        const html = `<!DOCTYPE html>
<div itemscope itemtype="http://schema.org/Person">
  <span itemprop="name">Jane Doe</span>
  <img src="janedoe.jpg" itemprop="image" alt="Photo of Jane Doe"/>

  <span itemprop="jobTitle">Professor</span>
  <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
    <span itemprop="streetAddress">
      20341 Whitworth Institute
      405 N. Whitworth
    </span>
    <span itemprop="addressLocality">Seattle</span>,
    <span itemprop="addressRegion">WA</span>
    <span itemprop="postalCode">98052</span>
  </div>
  <span itemprop="telephone">(425) 123-4567</span>
  <a href="mailto:jane-doe@xyz.edu" itemprop="email">
    jane-doe@xyz.edu</a>

  Jane's home page:
  <a href="http://www.janedoe.com" itemprop="url">janedoe.com</a>

  Graduate students:
  <a href="http://www.xyz.edu/students/alicejones.html" itemprop="colleague">
    Alice Jones</a>
  <a href="http://www.xyz.edu/students/bobsmith.html" itemprop="colleague">
    Bob Smith</a>
</div>
`
        const expected: Person = {
          '@type': 'Person',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Seattle',
            addressRegion: 'WA',
            postalCode: '98052',
            streetAddress: '20341 Whitworth Institute 405 N. Whitworth',
          },
          colleague: [
            'http://www.xyz.edu/students/alicejones.html',
            'http://www.xyz.edu/students/bobsmith.html',
          ],
          email: 'mailto:jane-doe@xyz.edu',
          image: 'janedoe.jpg',
          jobTitle: 'Professor',
          name: 'Jane Doe',
          telephone: '(425) 123-4567',
          url: 'http://www.janedoe.com',
        }
        assertMicrodata(html, expected)
      })

      it('makes a http://schema.org/LocalBusiness', () => {
        const html = `<!DOCTYPE html>
<div itemscope itemtype="http://schema.org/LocalBusiness">
  <h1><span itemprop="name">Beachwalk Beachwear &amp; Giftware</span></h1>
  <span itemprop="description"> A superb collection of fine gifts and clothing
  to accent your stay in Mexico Beach.</span>
  <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
    <span itemprop="streetAddress">3102 Highway 98</span>
    <span itemprop="addressLocality">Mexico Beach</span>,
    <span itemprop="addressRegion">FL</span>
  </div>
  Phone: <span itemprop="telephone">850-648-4200</span>
</div>
    `
        const expected: LocalBusiness = {
          '@type': 'LocalBusiness',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Mexico Beach',
            addressRegion: 'FL',
            streetAddress: '3102 Highway 98',
          },
          description:
            'A superb collection of fine gifts and clothing to accent your stay in Mexico Beach.',
          name: 'Beachwalk Beachwear & Giftware',
          telephone: '850-648-4200',
        }
        assertMicrodata(html, expected)
      })
    }
  )
})

function assertMicrodata(html: string, expected: any) {
  const doc = new JSDOM(html).window.document.documentElement
  const itemScope = doc.querySelector(`[itemscope]`)
  const itemtype = itemScope.getAttribute('itemtype')
  assert.deepStrictEqual(microdata(itemtype, doc), expected)
}
