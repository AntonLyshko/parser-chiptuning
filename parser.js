const puppeteer = require('puppeteer');
const fs = require('fs');
const translate = require('translate');


const start = async () => {
  await MarkCollect();
  await linkCollect();
  await PageStiller();
  await modalParser();
  await enginesParser();
  await textTranslaterCS();
  await textTranslaterEN();
  await textTranslaterRU();
};

translate.engine = 'yandex';
translate.key =
  'trnsl.1.1.20200514T200851Z.8056391e9c7f8972.1ec63ab4af8055a7d578d854afc0ee02c9151a1d';

function Car(nameModel, nameEngine, model, engines) {
  this.nameModel = nameModel;
  this.nameEngine = nameEngine;
  this.model = model;
  this.engines = engines;
}

function Link(url, model, engine) {
  this.url = url;
  this.model = model;
  this.engine = engine;
}
function Model(mark, value, text) {
  this.mark = mark;
  this.value = value;
  this.text = text;
}
function Engine(model, value, text) {
  this.model = model;
  this.value = value;
  this.text = text;
}

function Text(desc1, desc2) {
  this.desc1 = desc1;
  this.desc2 = desc2;
}



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

const rename = (srcFolder) => {
  fs.readdir(srcFolder, (err, files) => {
    let outFolder = srcFolder + '/result/';
    files.forEach((file, i) => {
      let fileName = file.toLowerCase();
      fs.rename(srcFolder + file, outFolder + fileName, err => {
        if (err) throw err;
        console.log("rename completed!");
      });
    });
  });

}

const MarkCollect = async () => {
  var result = [];
  console.log('start to play');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.autochip.eu/cs_cz/chiptuning/');
  console.log('Get to the page');
  await page.waitFor(2500)
  let marks = await page.$$eval('#quick_znacka option', (options) =>
    options.map((item) => item.value)
  );
  for (let indexMark = 0; indexMark < marks.length; indexMark++) {
    if (marks[indexMark] == '') {
      console.log(indexMark + ' / ' + marks.length + ' empty');
      continue;
    }
    result.push(marks[indexMark]);
    console.log(
      ' ' + ' ' + indexMark + ' / ' + marks.length + ' Engine: ' + marks[indexMark]
    )
  }
  let data = JSON.stringify(result);
  fs.writeFile(__dirname + `/links/Marks_list.json`, data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
};

const enginesParser = async () => {
  console.log('engine parser');
  let rawdata = await fs.readFileSync(__dirname + `/links/Marks_list.json`);
  let markList = await JSON.parse(rawdata);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.autochip.eu/cs_cz/chiptuning/');
  console.log('Get to the page');
  for (let i = 0; i < markList.length; i++) {
    let result = [];
    let mark = markList[i];
    if (fs.existsSync(`./engines/${mark}_engines.json`)) {
      console.log('I have it, PASS');
      continue;
    } else {
      console.log('there is no such a file');
    }

    await page.select('#quick_znacka', mark);
    await page.waitFor(2500)
    console.log('Selected a mark');
    let modelsValue = await page.$$eval('#quick_model option', (options) =>
      options.map((item) => item.value)
    );
    for (let indexModel = 0; indexModel < modelsValue.length; indexModel++) {
      if (modelsValue[indexModel] == '') {
        console.log('empty');
        continue;
      }
      await page.select('#quick_model', modelsValue[indexModel]);
      await page.waitFor(2500)
      var enginesValue = await page.$$eval('#quick_motor option', (options) =>
        options.map((item) => item.value)
      );
      var enginesText = await page.$$eval('#quick_motor option', (options) =>
        options.map((item) => item.textContent)
      );
      for (let i = 0; i < enginesValue.length; i++) {
        if (enginesValue[i] == '') {
          console.log('empty');
          continue;
        }
        modelsValue[indexModel] = modelsValue[indexModel].replace(' ', '_');
        modelsValue[indexModel] = modelsValue[indexModel].toLowerCase();
        let engine = new Engine(
          modelsValue[indexModel],
          enginesValue[i],
          enginesText[i]
        );
        result.push(engine);
        console.log(' ' + ' ' + i + ' / ' + enginesValue.length);
      }
      console.log(indexModel + ' / ' + modelsValue.length);
    }
    let data = JSON.stringify(result);
    fs.writeFile(`./engines/${mark}_engines.json`, data, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  }

};

const modalParser = async () => {
  console.log('modalParser');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.autochip.eu/cs_cz/chiptuning/');
  let rawdata = await fs.readFileSync(__dirname + `/links/Marks_list.json`);
  let markList = await JSON.parse(rawdata);
  console.log('Get to the page');
  for (let i = 0; i < markList.length; i++) {
    let result = [];
    let mark = markList[i];
    if (fs.existsSync(`./models/${mark}_models.json`)) {
      console.log('I have it, PASS');
      continue;
    } else {
      console.log('there is no such a file');
    }
    await page.select('#quick_znacka', mark);
    await page.waitFor(2500)
    let modelsValue = await page.$$eval('#quick_model option', (options) =>
      options.map((item) => item.value)
    );
    let modelsText = await page.$$eval('#quick_model option', (options) =>
      options.map((item) => item.textContent)
    );
    for (let i = 0; i < modelsValue.length; i++) {
      if (modelsValue[i] == '') {
        console.log('empty' + ' ' + i + ' / ' + modelsValue.length);
        continue;
      }
      modelsValue[i] = modelsValue[i].replace(' ', '_');
      modelsValue[i] = modelsValue[i].toLowerCase();
      let model = new Model(mark.toLowerCase(), modelsValue[i], modelsText[i]);
      result.push(model);
      console.log(i + ' / ' + modelsValue.length);

    }
    let data = JSON.stringify(result);
    fs.writeFile(`./models/${mark}_models.json`, data, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  }

};

const linkCollect = async () => {
  console.log('start to collect');

  let rawdata = await fs.readFileSync(__dirname + `/links/Marks_list.json`);
  let markList = await JSON.parse(rawdata);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.autochip.eu/cs_cz/chiptuning/');
  await page.waitFor(1000)
  console.log('Get to the page');
  for (let i = 0; i < markList.length; i++) {
    var result = [];
    let mark = markList[i];
    if (fs.existsSync(`./links/${mark}_link.json`)) {
      console.log('I have it, PASS');
      continue;
    } else {
      console.log('there is no such a file');
    }
    await page.select('#quick_znacka', mark);
    console.log('Selected a mark');
    await page.waitFor(5000)
    let models = await page.$$eval('#quick_model option', (options) =>
      options.map((item) => item.value)
    );
    for (let indexModel = 0; indexModel < models.length; indexModel++) {
      if (models[indexModel] == '') {
        console.log(indexModel + ' / ' + models.length + ' empty');
        continue;
      }
      await page.select('#quick_model', models[indexModel]);
      await page.waitFor(1000)
      var engines = await page.$$eval('#quick_motor option', (options) =>
        options.map((item) => item.value)
      );
      for (let i = 0; i < engines.length; i++) {
        if (engines[i] == '') {
          console.log(i + ' / ' + engines.length + ' empty');
          continue;
        }
        page.select('#quick_motor', engines[i]);
        await page.waitFor(1000)
        const url = await page.$eval('a.btn-generic', (item) => item.href);
        let link = new Link(url, models[indexModel], engines[i]);
        result.push(link);
        console.log(
          ' ' + ' ' + i + ' / ' + engines.length + ' Engine: ' + engines[i]
        );
      }
      console.log(
        indexModel + ' / ' + models.length + ' Model: ' + models[indexModel]
      );
    }
    if (fs.existsSync(`./links/${mark}_link.json`)) {
      console.log('PASS');
      continue;
    } else {
      let data = JSON.stringify(result);
      fs.writeFile(`./links/${mark}_link.json`, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
      })
    }
  }
};

const textTranslaterEN = async () => {
  console.log('translation english');
  let object = {};
  let rawdata = fs.readFileSync(`./pages/${mark}_page.json`);
  let pages = JSON.parse(rawdata);
  for (let i = 0; i < pages.length; i++) {
    let item = pages[i];
    let id = item.id;
    let desc = await translate(item.desc, {
      from: 'cs',
      to: 'en',
    });
    let fullDesc = await translate(item.fullDesc, {
      from: 'cs',
      to: 'en',
    });
    object[id] = {
      '1': desc,
      '2': fullDesc,
    };
    console.log(i + ' / ' + pages.length);
  }
  let data = JSON.stringify(object);
  fs.writeFile(`./text/${mark}_text_en.json`, data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
};

const textTranslaterRU = async () => {
  console.log('translation russian');
  let object = {};
  let rawdata = fs.readFileSync(`./pages/${mark}_page.json`);
  let pages = JSON.parse(rawdata);
  for (let i = 0; i < pages.length; i++) {
    let item = pages[i];
    let id = item.id;
    let desc = await translate(item.desc, { from: 'cs', to: 'ru' });
    let fullDesc = await translate(item.fullDesc, {
      from: 'cs',
      to: 'ru',
    });
    object[id] = {
      '1': desc,
      '2': fullDesc,
    };
    console.log(i + ' / ' + pages.length);
  }
  let data = JSON.stringify(object);
  fs.writeFile(`./text/${mark}_text_ru.json`, data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
};

const textTranslaterCS = async () => {
  console.log('translation czech');
  let object = {};
  let rawdata = fs.readFileSync(`./pages/${mark}_page.json`);
  let pages = JSON.parse(rawdata);
  for (let i = 0; i < pages.length; i++) {
    let item = pages[i];
    let id = item.id;
    let desc = item.desc;
    let fullDesc = item.fullDesc;
    object[id] = {
      '1': desc,
      '2': fullDesc,
    };
    console.log(i + ' / ' + pages.length);
  }
  let data = JSON.stringify(object);
  fs.writeFile(`./text/${mark}_text_cs.json`, data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
};

const PageStiller = async () => {


  console.log('Page stiller awake');
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1500, height: 720 });
    fs.readdir(`./links`, async (err, files) => {
      for (let i = 0; i < files.length; i++) {
        const el = files[i];
        var result = [];
        let urlChartPower;
        let urlChartTorque;
        let imgUrl;
        let fullName;
        let mark = el.replace(/\.[^.]+$/, "").split('_').shift();

        if (fs.existsSync(`./pages/${mark}_page.json`)) {
          console.log('I have it, PASS');
          continue;
        } else {
          console.log('there is no such a file');
        }


        let rawdata = fs.readFileSync(`./links/${el}`);
        const data = await JSON.parse(rawdata);

        for (let i = 0; i < data.length; i++) {
          try {
            let el = data[i];
            if (el.model == '' || el.engine == '') {
              console.log(i + ' / ' + data.length + ' empty');
              continue;
            }
            let model = el.model;
            model = await model.toLowerCase();
            model = await model.replace(' ', '_');
            let engine = el.engine;
            engine = engine.toLowerCase();
            engine = engine.replace(' ', '_');
            await page.goto(el.url);
            await page.waitFor(2500)
            // Title
            if ((await page.$('.configurator-detail__head__content h3')) !== null) {
              fullName = await page.$eval(
                '.configurator-detail__head__content h3',
                (item) => item.textContent
              );
            } else {
              continue;
            }
            // First description
            let desc = await page.$$eval(
              '.configurator-detail__head__content p',
              (elements) => elements.map((item) => item.innerText)
            );
            desc = await desc.join(',');
            // Preview img
            await page.waitForSelector('.img.nomobile');
            let preview = await page.$('.img.nomobile');
            imgUrl = `./previews/${model}.png`;
            await preview.screenshot({
              path: imgUrl,
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
            if ((await page.$('#chartPower')) !== null) {
              await page.waitForSelector('#chartPower');
              let chartPower = await page.$('#chartPower');
              urlChartPower = `./chartPower/${model}${engine}.png`;
              await chartPower.screenshot({
                path: urlChartPower,
              });
            } else {
              urlChartPower = '';
            }
            // Chart Power
            if ((await page.$('#chartTorque')) !== null) {
              await page.waitForSelector('#chartTorque');
              let chartTorque = await page.$('#chartTorque');
              urlChartTorque = `./chartTorque/${model}${engine}.png`;
              await chartTorque.screenshot({
                path: urlChartTorque,
              });
            } else {
              urlChartTorque = '';
            }

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
            console.log(i + ' / ' + data.length + ' ' + mark);
          } catch (err) {
            console.log('Some Error I dont care');
            continue;
          }
        }
        let finalData = JSON.stringify(result);
        fs.writeFile(`./pages/${mark}_page.json`, finalData, (err) => {
          if (err) throw err;
          console.log('Data written to file');
        });
      }
    });
  } catch (err) {
    console.log(err);

  }
};

start();
