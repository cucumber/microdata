import { JSDOM } from 'jsdom'
import { microdata } from '../src/microdata'
import { Event, LiveBlogPosting, Person } from 'schema-dts'
import assert from 'assert'

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

  context('smoke tests', () => {
    it('extracts data from modified https://github.com/nathan7/microdata tests', () => {
      const dom = new JSDOM(`<!DOCTYPE html>
      <section itemscope itemtype="http://schema.org/Person">
        <h1>Contact Information</h1>
        <dl>
          <dt>Name</dt>
          <dd itemprop="name">Mark Pilgrim</dd>
          <dt>Position</dt>
          <dd>
            <span itemprop="jobTitle">Developer advocate</span> for
            <span itemprop="affiliation">Google, Inc.</span>
          </dd>
          <dt>Mailing address</dt>
          <dd itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
            <span itemprop="streetAddress">P.O. Box 562</span>
            <br>
            <span itemprop="addressLocality">Anytown</span>,
            <span itemprop="addressRegion">PA</span>
            <span itemprop="postalCode">12345</span>
            <br>
            <span itemprop="addressCountry">USA</span>
          </dd>
          <dt>Home address</dt>
          <dd itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
            <span itemprop="streetAddress">100 Main Street</span>
            <br>
            <span itemprop="addressLocality">Anytown</span>,
            <span itemprop="addressRegion">PA</span>
            <span itemprop="postalCode">19999</span>
            <br>
            <span itemprop="addressCountry">USA</span>
          </dd>
        </dl>
        <h1>My Digital Footprints</h1>
        <ul>
          <li>
            <a itemprop="url">weblog</a>
          </li>
          <li>
            <a href="http://www.google.com/profiles/pilgrim" itemprop="url">Google profile</a>
          </li>
          <li>
            <a href="http://www.reddit.com/user/MarkPilgrim" itemprop="url">Reddit.com profile</a>
          </li>
          <li>
            <a href="http://www.twitter.com/diveintomark" itemprop="url">Twitter</a>
          </li>
        </ul>
        <a href="http://www.oreillynet.com/pub/au/2385">I also wrote books published by <span itemprop="affiliation">O'Reilly</span></a>
      </section>
    `)
      const person: Person = microdata(
        'http://schema.org/Person',
        dom.window.document.documentElement
      )
      const expectedPerson: Person = {
        '@type': 'Person',
        name: 'Mark Pilgrim',
        jobTitle: 'Developer advocate',
        affiliation: ['Google, Inc.', "O'Reilly"],
        address: [
          {
            '@type': 'PostalAddress',
            streetAddress: 'P.O. Box 562',
            addressLocality: 'Anytown',
            addressRegion: 'PA',
            postalCode: '12345',
            addressCountry: 'USA',
          },
          {
            '@type': 'PostalAddress',
            streetAddress: '100 Main Street',
            addressLocality: 'Anytown',
            addressRegion: 'PA',
            postalCode: '19999',
            addressCountry: 'USA',
          },
        ],
        url: [
          'http://www.google.com/profiles/pilgrim',
          'http://www.reddit.com/user/MarkPilgrim',
          'http://www.twitter.com/diveintomark',
        ],
      }
      assert.deepStrictEqual(person, expectedPerson)
    })

    it('extracts data from https://schema.org/BlogPosting', function() {
      const dom = new JSDOM(`
        <div itemid="http://techcrunch.com/2015/03/08/apple-watch-event-live-blog" itemscope itemtype="http://schema.org/LiveBlogPosting">
          <div itemprop="about" itemscope itemtype="http://schema.org/Event">
            <span itemprop="startDate" content="2015-03-09T13:00:00-07:00">March 9, 2015 1:17 PM</span>
            <meta itemprop="name" content="Apple Spring Forward Event" />
          </div>
          <meta itemprop="coverageStartTime" content="2015-03-09T11:30:00-07:00" />
          <meta itemprop="coverageEndTime" content="2015-03-09T16:00:00-07:00" />
          <h1 itemprop="headline">Apple Spring Forward Event Live Blog</h1>
          <p itemprop="description">Welcome to live coverage of the Apple Spring Forward …</p>
          <div itemprop="liveBlogUpdate" itemscope itemtype="http://schema.org/BlogPosting">
            <h2 itemprop="headline">See the new flagship Apple Retail Store in West Lake, China.</h2>
            <p><span itemprop="datePublished" content="2015-03-09T13:17:00-07:00">March 9, 2015 1:17 PM</span></p>
          </div>
          <div itemprop="liveBlogUpdate" itemscope itemtype="http://schema.org/BlogPosting">
            <h2 itemprop="headline">iPhone is growing at nearly twice the rate of the rest of the smartphone market.</h2>
            <p><span itemprop="datePublished" content="2015-03-09T13:13:00-07:00">March 9, 2015 1:13 PM</span></p>
            <img itemprop="image" src="http://images.apple.com/live/2015-mar-event/images/573cb_xlarge_2x.jpg"/>
          </div>
        </div>
      `)

      const liveBlogPosting: LiveBlogPosting = microdata(
        'http://schema.org/LiveBlogPosting',
        dom.window.document.documentElement
      )

      const expectedLiveBlogPosting: LiveBlogPosting = {
        '@type': 'LiveBlogPosting',
        about: {
          '@type': 'Event',
          startDate: 'March 9, 2015 1:17 PM',
          name: 'Apple Spring Forward Event',
        },
        coverageStartTime: '2015-03-09T11:30:00-07:00',
        coverageEndTime: '2015-03-09T16:00:00-07:00',
        headline: 'Apple Spring Forward Event Live Blog',
        description: 'Welcome to live coverage of the Apple Spring Forward …',
        liveBlogUpdate: [
          {
            '@type': 'BlogPosting',
            headline:
              'See the new flagship Apple Retail Store in West Lake, China.',
            datePublished: 'March 9, 2015 1:17 PM',
          },
          {
            '@type': 'BlogPosting',
            headline:
              'iPhone is growing at nearly twice the rate of the rest of the smartphone market.',
            datePublished: 'March 9, 2015 1:13 PM',
            image:
              'http://images.apple.com/live/2015-mar-event/images/573cb_xlarge_2x.jpg',
          },
        ],
      }
      assert.deepStrictEqual(liveBlogPosting, expectedLiveBlogPosting)
    })
  })
})
