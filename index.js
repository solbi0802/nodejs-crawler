const xlsx = require('xlsx')
const axios = require('axios') // ajax 라이브러리
const cheerio = require('cheerio') // html 파싱
const AddToSheet = require('./AddToSheet')
const workbook = xlsx.readFile('xlsx/data.xlsx')

// 시트별로 따로 코딩
// for (const name of workbook.sheetNames) {
//   const ws1 = workbook.Sheets[name]
//   console.log('ws1',ws1)
// }
// 헤더명으로 처리할 떄 사용
// console.log(ws['!ref']) // A1:B11 -> A2:B11
// ws['!ref'] = ws['!ref'].split(':').map((v, i) => {
//   if (i === 1) {
//     return 'A2'
//   }
//   return v
// }).join(':')
const ws = workbook.Sheets.영화목록
const records = xlsx.utils.sheet_to_json(ws)
console.log('records', records)

const crawler = async () => {
  // [argInfo]: 엑셀파일,cell,type,raw
  AddToSheet(ws, 'C1', 's', '평점')
  for (const [i, r] of records.entries()) {
    const response = await axios.get(r.링크)
    if (response.status === 200) {
      const html = response.data
      const $ = cheerio.load(html)
      const text = $('.score.score_left .star_score').text() // textContent
      console.log(r.제목, '평점', text.trim())
      const newCell = 'C' + (i + 2) // C2~C11까지
      AddToSheet(ws, newCell, 'n', parseFloat(text.trim()))
    }
  }
  xlsx.writeFile(workbook, 'xlsx/result.xlsx')
}

crawler()
