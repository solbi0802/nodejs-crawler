const puppeteer = require('puppeteer')
const xlsx = require('xlsx')
const addToSheet = require('./AddToSheet')
const fs = require('fs')
const { default: axios } = require('axios')
const workbook = xlsx.readFile('xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록
const records = xlsx.utils.sheet_to_json(ws)

// 포스터 폴더가 없으면  만들어줌
fs.readdir('poster', (err) => {
  if (err) {
    console.error('poster 폴더가 없어서 poster폴더를 생성합니다.')
    fs.mkdirSync('poster')
  }
})
fs.readdir('screenshot', (err) => {
  if (err) {
    console.error('screenshot 폴더가 없어서 screenshot폴더를 생성합니다.')
    fs.mkdirSync('screenshot')
  }
})

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: process.env === 'production', //크롬 안 띄우고 백그라운드에서 실행
      args: ['--window-size=1920,1080']
    })
    const page = await browser.newPage()
    await page.setViewport({
      width: 1920,
      height: 1080
    })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36')
    addToSheet(ws, 'C1', 's', '평점')
    for (const [i, r] of records.entries()) {
      console.log('r', r)
      await page.goto(r.링크)
      console.log(await page.evaluate('navigator.userAgent'))
      const result = await page.evaluate(() => {
        const scoreEl = document.querySelector('.score.score_left .star_score')
        let score = ''
        if (scoreEl) {
          score = score.textContent
        }
        const imgEl = document.querySelector('.poster img')
        let img = ''
        if (imgEl) {
          img = imgEl.src
        }
        return { score, img }
      })
      if (result.score) {
        console.log(r.제목, '평점', result.score.trim())
        const newCell = 'C' + (i + 2)
        addToSheet(ws, newCell, 'n', parseFloat(text.trim()))
      }
      if (result.img) {
        await page.screenshot({
          path: `screenshot/${r.제목}.png`,
          // fullPage: true, 전체화면 캡쳐
          clip: {
            x: 100,
            y: 100,
            width: 300,
            height: 300
          }
        })
        const imgResult = await axios.get(result.img.replace(/\?.*/, ''), {
          responseType: 'arraybuffer', //buffer가 연속적으로 들어있는 자료구조

        })
        fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data)
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
