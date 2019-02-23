const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const moment = require('moment');
const dbClient = require('./dbClient.js');

const base_uri = 'https://courses.students.ubc.ca';
module.exports.mine = (size, callback) => {
  let departments = [];
  let courses = [];
  let sections = [];
  console.log('Beginning scrape...');
  console.time('scrape');
  console.log('Beginning department collection...');
  getDepartments().then((deps) => {
    departments = deps;
    console.log(`Found ${deps.length} departments.`);
    console.log('Beginning course collection...');
    return deps;
  }).then(getCourses).then((crs) => {
    console.log(`found ${crs.length} courses.`);
    console.log('Beginning section collection...');
    courses = crs;
    return crs;
  })
    .then(getSections)
    .then((sects) => {
      sections = sects;
      console.log(`found ${sects.length} sections.`);
      console.log('Done scrape.');
      console.timeEnd('scrape');
      return sects;
    })
    .then(() => {
      console.log('deduplicating sections..');
      const cleanSections = deleteDuplicates(sections);
      console.log('Starting DB inserts...');
      console.time('dbInsert');
      fullDBInsert(departments, courses, cleanSections).then(() => {
        console.log('Done db inserts.');
        console.timeEnd('dbInsert');
        callback();
      }).catch((errors) => {
        console.log('db insert failure.');
        console.timeEnd('dbInsert');
        console.log(errors);
        callback();
      });
    });

  const fullDBInsert = (departments, courses, sections) => new Promise((resolve, reject) => {
    const Promises = [];
    departments.forEach((dep) => {
      Promises.push(dbClient.departmentInsert(dep));
    });
    courses.forEach((course) => {
      Promises.push(dbClient.courseInsert(course));
    });
    sections.forEach((section) => {
      Promises.push(dbClient.sectionInsert(section));
    });
    Promise.all(Promises.map(p => p.catch(e => e))).then((results) => {
      if (results.find(e => e !== undefined) !== undefined) {
        reject(results.filter(e => e !== undefined));
      } else {
        resolve();
      }
    });
  });

  function getDepartments() {
    const departments = [];
    return new Promise((resolve, reject) => {
      const url = 'https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=0';
      request(url, (error, response, html) => {
        if (!error) {
          const $ = cheerio.load(html);
          if (size) {
            console.log(`getting ${size} departments..`);
            table = $('#mainTable tr').slice(0, size);
          } else {
            console.log('getting all departments..');
            table = $('#mainTable tr');
          }

          table.each(function () {
            if ($(this).children('td').eq(0).children('a')
              .attr('href') != undefined) {
              const department = {
                code: $(this).children('td').eq(0).text()
                  .trim(),
                url: $(this).children('td').eq(0).children('a')
                  .attr('href'),
                name: $(this).children('td').eq(1).text()
                  .trim(),
                faculty: $(this).children('td').eq(2).text()
                  .trim(),
                courses: null,
              };
              departments.push(department);
            }
          });
          resolve(departments);
        } else {
          console.log(`error getting page: ${error}`);
          resolve();
        }
      });
    });
  }

  function getCourses(departments) {
    const courses = [];
    return new Promise((resolve, reject) => {
      async.forEach(departments, (dep, callback) => {
        request(base_uri + dep.url, (error, response, html) => {
          if (!error) {
            const $ = cheerio.load(html);
            table = $('#mainTable tr');
            table.each(function () {
              if ($(this).children('td').eq(0).children('a')
                .attr('href')) {
                const course = {
                  code: $(this).children('td').eq(0).text()
                    .trim(),
                  url: $(this).children('td').eq(0).children('a')
                    .attr('href'),
                  name: $(this).children('td').eq(1).text()
                    .trim(),
                };
                courses.push(course);
              }
            });
            callback();
          } else {
            console.log(`error getting page: ${error}`);
            callback();
          }
        });
      }, () => {
        resolve(courses);
      });
    });
  }

  const getSectionsSubset = (courses) => {
    const sections = [];
    return new Promise((resolve, reject) => {
      async.eachSeries(courses, (course, callback) => {
        request(base_uri + course.url, (error, response, html) => {
          if (!error) {
            const $ = cheerio.load(html);
            table = $('.section-summary tr');
            table.each(function () {
              if ($(this).children('td').eq(1).children('a')
                .attr('href')) {
                const section = {
                  status: $(this).children('td').eq(0).text()
                    .trim(),
                  code: $(this).children('td').eq(1).text()
                    .trim(),
                  url: $(this).children('td').eq(1).children('a')
                    .attr('href'),
                  type: $(this).children('td').eq(2).text()
                    .trim(),
                  term: $(this).children('td').eq(3).text()
                    .trim(),
                  days: $(this).children('td').eq(5).text()
                    .trim(),
                  startTime: $(this).children('td').eq(6).text()
                    .trim(),
                  endTime: $(this).children('td').eq(7).text()
                    .trim(),
                  courseCode: course.code,
                };
                if (section.startTime && section.endTime) {
                  end = moment(section.endTime, 'HH:mm');
                  start = moment(section.startTime, 'HH:mm');
                  length = moment.duration(end.diff(start)).asMinutes();
                  section.length = `${length} minutes`;
                  sections.push(section);
                } else {
                  sections.push(section);
                }
              }
            });
            callback();
          } else {
            console.log(`error getting page: ${error}`);
            callback();
          }
        });
      }, () => {
        resolve(sections);
      });
    });
  };
  async function getSections(courses) {
    const split = 100;
    const len = courses.length / split;
    const promises = [];
    const coursesSplits = [];
    coursesSplits.push((courses.slice(0, len)));
    for (let i = 1; i < split - 1; i++) {
      coursesSplits.push(courses.slice(len * i, len * (i + 1)));
    }
    coursesSplits.push(courses.slice(len * (split - 1), courses.length));
    coursesSplits.forEach((courseSplit) => {
      promises.push(getSectionsSubset(courseSplit));
    });
    const sectionList = await Promise.all(promises);
    let sections = [];
    sections = [].concat.apply(sections, sectionList);
    return sections;
  }
};
const deleteDuplicates = (sections) => {
  const deletedSects = sections.filter((sect) => {
    const dups = sections.filter(sect1 => sect1.code === sect.code);
    let index;
    if (dups.length > 1) {
      const indices = [];
      dups.forEach(dup => indices.push(sections.indexOf(dup)));
      index = indices[0];
    } else {
      index = sections.indexOf(sect);
    }
    return sections.indexOf(sect) === index;
  });
  console.log(`Old Size: ${sections.length}\nNew Size: ${deletedSects.length}`);
  console.log(`Size diff: ${sections.length - deletedSects.length}`);
  return deletedSects;
};

let fullSectionCounter = 0;
const readSectionPage = (url, code) => new Promise((resolve, reject) => {
  request(base_uri + url, (error, response, html) => {
    if (!error) {
      const $ = cheerio.load(html);
      title = $('.table-striped').children('thead').children('tr').children('th')
        .eq(0);
      seatingtable = $('table').eq(3);
      if (title.text() === 'Term') {
        const SectionPage = {
          code,
          building: $('.table-striped').children('tbody').children('tr').children('td')
            .eq(4)
            .text(),
          room: $('.table-striped').children('tbody').children('tr').children('td')
            .eq(5)
            .text()
            .trim(),
          teacher: $('.table-striped').next().children('tbody').children('tr')
            .children('td')
            .eq(1)
            .text()
            .trim(),
          totalSeatsRemaining: seatingtable.children('tbody').children('tr').eq(0).children('td')
            .eq(1)
            .children('strong')
            .text()
            .trim(),
          currentlyRegistered: seatingtable.children('tbody').children('tr').eq(1).children('td')
            .eq(1)
            .children('strong')
            .text()
            .trim(),
          generalSeatsRemaining: seatingtable.children('tbody').children('tr').eq(2).children('td')
            .eq(1)
            .children('strong')
            .text()
            .trim(),
          restrictedSeatsRemaining: seatingtable.children('tbody').children('tr').eq(3).children('td')
            .eq(1)
            .children('strong')
            .text()
            .trim(),
        };
        resolve(SectionPage);
      } else {
        resolve();
      }
    } else {
      console.log(`error getting page: ${error}`);
      reject();
    }
  });
});

module.exports.getFullSectionData = (url, code, callback) => {
  readSectionPage(url, code).then((section) => {
    if (section) {
      dbClient.updatedSectionInsert(section).finally(() => {
        callback();
      });
    } else {
      callback();
    }
  });
};

const printLine = (line) => {
  process.stdout.write(`${line}\r`);
};

function getSectionData(sections, sectionLength) {
  return new Promise((resolve, reject) => {
    const updatedSections = [];
    async.eachSeries(sections, (section, callback) => {
      readSectionPage(section.URL, section.Code).then((updatedSection) => {
        updatedSections.push(updatedSection);
        fullSectionCounter++;
        printLine(`FullUpdate: ${fullSectionCounter}/${sectionLength}|${Math.trunc((fullSectionCounter / sectionLength) * 100)}%`);
        callback();
      }).catch(() => callback());
    }, () => resolve(updatedSections));
  });
}


async function updateSections(sections) {
  console.log();
  let split = 500;
  if (split >= sections.length) split = sections.length / 5;
  const len = sections.length / split;
  const promises = [];
  promises.push(getSectionData(sections.slice(0, len), sections.length));
  for (let i = 1; i < split - 1; i++) {
    promises.push(getSectionData(sections.slice(1 + (len * i), len * (i + 1)), sections.length));
  }
  promises.push(getSectionData(sections.slice(1 + len * split, -1), sections.length));
  const sectionList = await Promise.all(promises);
  let updatedSections = [];
  updatedSections = [].concat.apply(updatedSections, sectionList);
  console.log();
  return updatedSections.filter(e => e !== undefined);
}


module.exports.updateAllSectionData = (callback) => {
  const dbPromises = [];
  console.time('sectionScrape');
  console.log('Beginning full section update...');
  dbClient.getAllSections((sections) => {
    console.log(`Found ${sections.length} sections...`);
    fullSectionCounter = 0;
    updateSections(sections).then((updatedSections) => {
      console.log('Full section scrape done.');
      console.timeEnd('sectionScrape');
      console.log('deduplicating sections..');
      const cleanSections = deleteDuplicates(updatedSections);
      console.log('Beginning full section db insert..');
      console.time('fullDbInsert');
      cleanSections.forEach((updatedSection) => {
        dbPromises.push(dbClient.updatedSectionInsert(updatedSection));
      });
      Promise.all(dbPromises.map(p => p.catch(e => e))).then((results) => {
        if (results.find(e => e !== undefined) !== undefined) {
          console.log('Full section db insert failure.');
          console.timeEnd('fullDbInsert');
          console.log(results);
          callback();
        } else {
          console.log('Full section db insert done.');
          console.timeEnd('fullDbInsert');
          callback();
        }
      });
    });
  });
};
