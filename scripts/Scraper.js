const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const moment = require('moment');
const dbClient = require('./dbClient.js');

const base_uri = 'https://courses.students.ubc.ca';
module.exports.mine = (size, callback) => {
  console.time('scrape');
  let departments = [];
  async.series([getDepartments, getCourses, getSection], () => {
    console.log('Done');
    console.timeEnd('scrape');
    departments = null;
    callback();
  });

  function getDepartments(callback) {
    const url = 'https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=0';
    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        console.log('Beginning department collection...');
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
            dbClient.departmentInsert(department);
          }
        });
        callback();
      }
    });
  }

  function getCourses(callback) {
    console.log('Beginning course collection...');
    async.forEach(departments, (dep, callback) => {
      request(base_uri + dep.url, (error, response, html) => {
        if (!error) {
          const $ = cheerio.load(html);
          const courses = [];
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
              dbClient.courseInsert(course);
              courses.push(course);
            }
          });
          dep.courses = courses;
          callback();
        }
      });
    }, () => {
      console.log('found all courses');
      callback();
    });
  }

  function getSection(callback) {
    console.log('beginning section search..');
    async.forEach(departments, (dep, callback) => {
      async.eachSeries(dep.courses, (course, callback) => {
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
                  dbClient.sectionInsert(section);
                } else {
                  dbClient.sectionInsert(section);
                }
              }
            });
            callback();
          } else {
            console.log(`error: ${error}`);
            console.log('Possible connection reset. waiting 5 seconds.');
            setTimeout(() => {
              console.log('restarting...');
              callback();
            }, 5000);
          }
        });
      }, () => {
        dep = null;
        callback();
      });
    }, () => {
      console.log('Found all sections');
      callback();
    });
  }
};
module.exports.readSectionPage = (url, code, callback) => {
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
        dbClient.updatedSectionInsert(SectionPage);
        callback(SectionPage);
      } else {
        callback();
      }
    } else {
      console.log('An error occurred, probably a connection reset. Waiting for  5 seconds');
      setTimeout(() => {
        module.exports.readSectionPage(url, code, callback);
      }, 5000);
    }
  });
};

module.exports.updateAllSectionData = (callback) => {
  console.time('sectionScrape');
  console.log('Beginning full section update...');
  dbClient.getAllSections((sections) => {
    console.log(`Found ${sections.length} sections...`);
    async.forEachSeries(sections, (section, callback) => {
      module.exports.readSectionPage(section.URL, section.Code, () => {
        callback();
      });
    }, () => {
      console.log('Full section update complete.');
      console.timeEnd('sectionScrape');
      callback();
    });
  });
};
