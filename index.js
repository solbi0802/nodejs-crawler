const puppeteer = require("puppeteer");
const fs = require("fs");
const { default: axios } = require("axios");

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://unsplash.com");
    const result = await page.evaluate(() => {});
  } catch (e) {
    console.error(e);
  }
};
crawler();
