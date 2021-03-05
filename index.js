const parse = require('csv-parse/lib/sync')
const fs = require('fs')
const puppeteer = require('puppeteer')
const stringify = require('csv-stringify/lib/sync')
const csv = fs.readFileSync('csv/data.csv')
const records = parse(csv.toString('utf-8'))

const crawler = async () => {
  try {
    const result = []
    const browser = await puppeteer.launch({ headless: process.env === 'production' }) // headless : 크롬 안 띄우고 백그라운드에서 실행
    await Promise.all(records.map(async (r, i) => {
      try {
        const page = await browser.newPage()
        await page.goto(r[1])
        const scoreEl = await page.$('.score.score_left .star_score')
        if (scoreEl) {
          const text = await page.evaluate(tag => tag.textContent, scoreEl)
          result[i] = [r[0], r[1], text.trim()]
        }
        await page.waitFor(10000)
        await page.close()
      } catch (e) {
        console.error(e)
      }
    }))
    await browser.close()
    const str = stringify(result)
    fs.writeFileSync('csv/result.csv', str)
  } catch (e) {
    console.error(e)
  }
}

crawler()
