const puppeteer = require('puppeteer');
const fs = require('fs');

function PageInfo(
  id,
  fullName,
  desc,
  imgUrl,
  fullDesc,
  numbers,
  chartPower,
  chartTorque
) {
  this.id = id;
  this.fullName = fullName;
  this.desc = desc;
  this.imgUrl = imgUrl;
  this.fullDesc = fullDesc;
  this.numbers = numbers;
  this.chartPower = chartPower;
  this.chartTorque = chartTorque;
}

const mark = 'BMW';

const PageStiller = async () => {
  var result = [];
  console.log('I`m awake');
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1500, height: 720 });
    let rawdata = fs.readFileSync(`./links/${mark}_link.json`);
    const data = await JSON.parse(rawdata);
    for (let i = 0; i < data.length; i++) {
      let el = data[i];
      let model = el.model;
      model = await model.toLowerCase();
      model = await model.replace(' ', '_');
      let engine = el.engine;
      engine = engine.toLowerCase();
      engine = engine.replace(' ', '_');
      if (el.engine == '') {
        console.log(i + ' / ' + data.length + ' empty');
        continue;
      }
      await page.goto(el.url);
      await page.screenshot({ path: 'example.png' });
      // Title
      let fullName = await page.$eval(
        '.configurator-detail__head__content h3',
        (item) => item.textContent
      );
      // First description
      let desc = await page.$$eval(
        '.configurator-detail__head__content p',
        (elements) => elements.map((item) => item.innerText)
      );
      desc = await desc.join(',');
      // Preview img
      await page.waitForSelector('.img.nomobile');
      let preview = await page.$('.img.nomobile');
      await preview.screenshot({
        path: `./previews/${model}.png`,
      });
      // Full description
      let fullDesc = await page.$eval(
        '#tab1.configurator-detail__modification p',
        (item) => item.innerText
      );
      // Numbers
      let numbers = await page.$$eval(
        '#tab1 .configurator-detail__modification__table__row li',
        (elements) => elements.map((item) => item.innerText)
      );
      // Chart Power
      await page.waitForSelector('#chartPower');
      let chartPower = await page.$('#chartPower');
      await chartPower.screenshot({
        path: `./chartPower/${model}${engine}.png`,
      });
      // Chart Power
      await page.waitForSelector('#chartTorque');
      let chartTorque = await page.$('#chartTorque');
      await chartTorque.screenshot({
        path: `./chartTorque/${model}${engine}.png`,
      });

      let imgUrl = `url_/previews/${model}.png`;
      let urlChartPower = `url_/chartPower/${model}${engine}.png`;
      let urlChartTorque = `url_/chartTorque/${model}${engine}.png`;
      let id = model + engine;

      let pageInfo = new PageInfo(
        id,
        fullName,
        desc,
        imgUrl,
        fullDesc,
        numbers,
        urlChartPower,
        urlChartTorque
      );
      result.push(pageInfo);
      console.log(i + ' / ' + data.length);
    }
    let finalData = JSON.stringify(result);
    fs.writeFile(`./pages/${mark}'_page.json'`, finalData, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  } catch (err) {
    console.log(err);
  }
};

const start = async () => {
  await PageStiller();
};

start();
