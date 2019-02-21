const express = require('express');
const momentTimezone = require('moment-timezone');
const scraper = require('./scripts/Scraper.js');
const dbClient = require('./scripts/dbClient.js');

const moment = momentTimezone.tz('America/Vancouver');

const app = express();
let blocked = false;
let lastTime;
app.set('views', `${__dirname}/views/`);
app.set('view engine', 'pug');

app.get('/Departments', (req, res) => {
  dbClient.getDepartments((deps) => {
    res.render('departments', { departments: deps });
  });
});
app.get('/Courses', (req, res) => {
  if (req.query.code) {
    dbClient.getCoursesByCode(req.query.code, (courses) => {
      if (courses === 'Not found :(') {
        res.send('No course with this code.');
      } else {
        res.render('courses', { code: req.query.code, courses });
      }
    });
  } else {
    res.sendStatus(503);
  }
});
app.get('/Sections', (req, res) => {
  if (req.query.code) {
    dbClient.getSectionsByCode(req.query.code, (sections) => {
      if (sections === 'Not found :(') {
        res.send('No section with this code.');
      } else {
        res.render('sections', { code: req.query.code, sections });
      }
    });
  } else {
    res.sendStatus(503);
  }
});

app.get('/fullSectionUpdate', (req, res) => {
  if (!blocked) {
    console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Request for full section scrape from: ${req.ip}`);
    blocked = true;
    scraper.updateAllSectionData(() => {
      blocked = false;
    });
    res.sendStatus(202);
  } else {
    res.sendStatus(503);
  }
});


app.get('/sectionData', (req, res) => {
  console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Request for updated section info by code: ${req.query.code} from: ${req.ip}`);
  dbClient.getSectionsByCode(req.query.code, (sections) => {
    scraper.readSectionPage(sections[0].URL, sections[0].Code, () => {
      dbClient.getSectionsByCode(req.query.code, (section) => {
        res.send(JSON.stringify(section, null, 4));
      });
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/html/index.html`);
  console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Site access from: ${req.ip}`);
});
app.get('/getLastScrapeTime', (req, res) => {
  if (!blocked) {
    dbClient.getLastTime(returnResult);
  } else {
    returnResult(lastTime);
  }
  function returnResult(result) {
    if (result) {
      lastTime = result;
      res.send(momentTimezone.tz(result.endDate, 'America/Vancouver').format('MM:DD:YY:hh:mm A'));
    } else {
      res.send('No previous scrapes.');
    }
  }
});
app.get('/scrapeStatus', (req, res) => {
  res.send(blocked);
});
app.get('/scrape', (req, res) => {
  if (!blocked) {
    dbClient.getLastTime((result) => {
      lastTime = result;
    });
    blocked = true;
    res.sendStatus(202);
    const startTime = new Date().toLocaleString();
    console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Scrape request received from: ${req.ip} for ${req.query.size || 'all'} departments.`);
    scraper.mine(req.query.size, () => {
      const endTime = new Date().toLocaleString();
      dbClient.timeInsert(startTime, endTime);
      blocked = false;
    });
  } else {
    console.log(`Scrape Rejected: ${req.ip}`);
    res.sendStatus(503);
  }
});

app.get('/getDepartments', (req, res) => {
  dbClient.getDepartments(returnResult);
  function returnResult(result) {
    res.send(JSON.stringify(result, null, 4));
  }
  console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; All Department Request from: ${req.ip}`);
});

app.get('/getDepartmentByCode', (req, res) => {
  if (req.query.code) {
    console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Request for Department by code: ${req.query.code} from: ${req.ip}`);
    dbClient.getDepartmentByCode(req.query.code, returnResult);
  } else {
    res.send('No code!');
  }

  function returnResult(result) {
    res.send(JSON.stringify(result, null, 4));
  }
});

app.get('/getCoursesByCode', (req, res) => {
  if (req.query.code) {
    console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Request for Courses by code: ${req.query.code} from: ${req.ip}`);
    dbClient.getCoursesByCode(req.query.code, returnResult);
  } else {
    res.send('No code!');
  }

  function returnResult(result) {
    res.send(JSON.stringify(result, null, 4));
  }
});

app.get('/getSectionsByCode', (req, res) => {
  if (req.query.code) {
    console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}; Request for Sections by code: ${req.query.code} from: ${req.ip}`);
    dbClient.getSectionsByCode(req.query.code, returnResult);
  } else {
    res.send('No code!');
  }
  function returnResult(result) {
    res.send(JSON.stringify(result, null, 4));
  }
});
const port = 8080;
app.listen(port);

console.log(`${moment.format('YYYY:MM:DD:hh:mm:ss A')}: Magic happens on port ${port}`);

exports = module.exports = app;
