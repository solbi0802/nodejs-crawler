const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");

// 폴더 만들기
fs.readdir("imgs", (err) => {
  if (err) {
    console.error("imgs 폴더가 없어서 imgs폴더를 생성합니다.");
    fs.mkdirSync("imgs");
  }
});

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://unsplash.com");
    let result = [];
    while (result.length <= 30) {
      const imgArray = await page.evaluate(() => {
        window.scrollTo(0, 0);
        let imgs = [];
        const imgEls = document.querySelectorAll("figure");
        console.log("img", imgEls);
        if (imgEls.length) {
          imgEls.forEach((v) => {
            let img = v.querySelector("img.YVj9w"); // 사이트 바뀌었을 때 클래스 적절히 바꾸기
            if (img && img.src) {
              imgs.push(img.src);
            }
            v.parentElement.removeChild(v);
          });
        }
        window.scrollBy(0, 100);
        setTimeout(() => {
          window.scrollBy(0, 200);
        }, 500);
        return imgs;
      });
      result = result.concat(imgArray);
      await page.waitForSelector("figure");
      console.log("새 이미지 태그 로딩 완료!");
    }
    console.log("result", result);
    result.forEach(async (src) => {
      const imgResult = await axios.get(src.replace(/\?.*$/, ""), {
        responseType: "arraybuffer",
      });
      fs.writeFileSync(`imgs/${new Date().valueOf()}.jpeg`, imgResult.data);
    });
    await page.close();
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};
crawler();
