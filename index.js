const xlsx = require('xlsx')
const axios = require('axios') // ajax 라이브러리
const cheerio = require('cheerio') // html 파싱

const workbook = xlsx.readFile('xlsx/data.xlsx')

// 시트별로 따로 코딩
for (const name of workbook.sheetNames) {
  const ws1 = workbook.Sheets[name]
  console.log('ws1',ws1)
}
const ws = workbook.Sheets.sheetName
console.log(ws['!ref']) // A1:B11 -> A2:B11
ws['!ref'] = ws['!ref'].split(':').map((v, i) => {
  if (i === 1) {
    return 'A2'
  }
  return v
}).join(':')
const records = xlsx.utils.sheet_to_json(ws, {header: 'A'})
console.log('records', records)
