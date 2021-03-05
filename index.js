const puppeteer = require('puppeteer')
const xlsx = require('xlsx')
const addToSheet = require('./AddToSheet')

const workbook = xlsx.readFile('xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록
const records = xlsx.utils.sheet_to_json(ws)

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: process.env === 'production' }) // headless : 크롬 안 띄우고 백그라운드에서 실행
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36')
    addToSheet(ws, 'C1', 's', '평점')
    for (const [i, r] of records.entries()) {
      console.log('r', r)
      await page.goto(r.링크)
      console.log(await page.evaluate('navigator.userAgent'))
      const text = await page.evaluate(() => {
        const score = document.querySelector('.score.score_left .star_score')
        if (score) {
          return score.textContent
        }
      })
      if (text) {
        console.log(r.제목, '평점', text.trim())
        const newCell = 'C' + (i + 2)
        addToSheet(ws, newCell, 'n', parseFloat(text.trim()))
      }
      await page.waitFor(3000)
    }
    await page.close()
    await browser.close()
    xlsx.writeFile(workbook, 'xlsx/result.xlsx')
  } catch (e) {
    console.error(e)
  }
}

crawler()
