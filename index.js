const parse = require('csv-parse/lib/sync')
const fs = require('fs')
const puppeteer = require('puppeteer')

const csv = fs.readFileSync('csv/data.csv')
const records = parse(csv.toString('utf-8'))

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: process.env === 'production' })
    await Promise.all(records.map(async (r, i) => {
      try {
        const page = await browser.newPage()
        await page.goto(r[1])
        const scoreEl = await page.$('.score.score_left .star_score')
        if (scoreEl) {
          const text = await page.evaluate(tag => tag.textContent,scoreEl)
          console.log(r[0], '평점', text.trim())
        }
        await page.waitFor(3000)
        await page.close()
      } catch (e) {
        console.error(e)
      }
    }))
    await browser.close()
  } catch (e) {
    console.error(e)
  }

  // await page.waitFor(3000)
  // await page.goto('https://google.com')
  // await page.waitFor(1000)
  // await page.close()
  // await browser.close()
}

crawler()
