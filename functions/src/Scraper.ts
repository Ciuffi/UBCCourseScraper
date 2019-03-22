import * as request from 'request';
import * as cheerio from 'cheerio';
const async = require('async');
const moment = require('moment');
import dbClient from './dbClien-firestore';

const base_uri = 'https://courses.students.ubc.ca';
export default class Scraper {
  
  public static async mine(size?: number) {
    let departments: object[] = [];
    let courses: Object[] = [];
    let sections: object[] = [];
    console.log('Beginning scrape...');
    console.time('scrape');
    console.log('Beginning department collection...');
    this.getDepartments(size)
      .then((deps: Object[]) => {
        departments = deps;
        console.log(`Found ${deps.length} departments.`);
        console.log('Beginning course collection...');
        return deps;
      })
      .then(this.getCourses)
      .then((crs: object[]) => {
        console.log(`found ${crs.length} courses.`);
        console.log('Beginning section collection...');
        courses = crs;
        return crs;
      })
      .then(this.getSections)
      .then((sects) => {
        sections = sects;
        console.log(`found ${sects.length} sections.`);
        console.log('Done scrape.');
        console.timeEnd('scrape');
        return sects;
      })
      .then(() => {
        console.log('deduplicating sections..');
        const cleanSections = this.deleteDuplicates(sections);
        console.log('Starting DB inserts...');
        console.time('dbInsert');
        this.fullDBInsert(departments, courses, cleanSections)
          .then(() => {
            console.log('Done db inserts.');
            console.timeEnd('dbInsert');
            return;
          })
          .catch((errors) => {
            console.log('db insert failure.');
            console.timeEnd('dbInsert');
            console.log(errors);
            return;
          });
      }).catch((error) =>{
        console.log('Scrape error');
        console.log(error);
        return;
      });
    }
    private static async fullDBInsert (departments: any[], courses: any[], sections: any[]) {
      const P1: Promise<any>[] = [];
      const P2: Promise<any>[] = [];
      const P3: Promise<any>[] = [];
      departments.forEach((dep) => {
        P1.push(dbClient.departmentInsert(dep));
      });
      await Promise.all(P1);
      courses.forEach((course) => {
        P2.push(dbClient.courseInsert(course));
      });
      await Promise.all(P2);
      sections.forEach((section) => {
        P3.push(dbClient.sectionInsert(section));
      });
      Promise.all(P3)
        .then((promises) => {
          return;
        })
        .catch((e) => {
          console.log("ERROR");
          console.log(e);
          return;
        });
    }
    private static getDepartments(size?: number): Promise<any> {
      const departments: any[] = [];
      return new Promise((resolve, reject) => {
        const url = 'https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=0';
        request(url, (error, response, html) => {
          if (!error) {
            const $ = cheerio.load(html);
            let table: Cheerio;
            if (size) {
              console.log(`getting ${size} departments..`);
              table = $('#mainTable tr').slice(0, size);
            } else {
              console.log('getting all departments..');
              table = $('#mainTable tr');
            }
  
            table.each(function (i, elem) {
              if (
                $(elem)
                  .children('td')
                  .eq(0)
                  .children('a')
                  .attr('href') != undefined
              ) {
                const department = {
                  code: $(elem)
                    .children('td')
                    .eq(0)
                    .text()
                    .trim(),
                  url: $(elem)
                    .children('td')
                    .eq(0)
                    .children('a')
                    .attr('href'),
                  name: $(elem)
                    .children('td')
                    .eq(1)
                    .text()
                    .trim(),
                  faculty: $(elem)
                    .children('td')
                    .eq(2)
                    .text()
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

    private static getCourses(departments: any[]): Promise<any> {
      const courses: any[] = [];
      return new Promise((resolve, reject) => {
        async.forEach(
          departments,
          (dep: any, callback: Function) => {
            request(base_uri + dep.url, (error, response, html) => {
              if (!error) {
                const $ = cheerio.load(html);
                let table = $('#mainTable tr');
                table.each(function (i, elem) {
                  if (
                    $(elem)
                      .children('td')
                      .eq(0)
                      .children('a')
                      .attr('href')
                  ) {
                    const course: any = {
                      code: $(elem)
                        .children('td')
                        .eq(0)
                        .text()
                        .trim(),
                      url: $(elem)
                        .children('td')
                        .eq(0)
                        .children('a')
                        .attr('href'),
                      name: $(elem)
                        .children('td')
                        .eq(1)
                        .text()
                        .trim(),
                    };
                    course.department_code = dep.code
                    courses.push(course);
                  }
                });
                callback();
              } else {
                console.log(`error getting page: ${error}`);
                callback();
              }
            });
          },
          () => {
            resolve(courses);
          },
        );
      });
    }

      

  private static getSectionsSubset(courses: any[]): Promise<any> {
    const sections: any[] = [];
    return new Promise((resolve, reject) => {
      async.eachSeries(
        courses,
        (course: any, callback: Function) => {
          request(base_uri + course.url, (error, response, html) => {
            if (!error) {
              const $ = cheerio.load(html);
              let table = $('.section-summary tr');
              table.each(function (i, elem) {
                if (
                  $(elem)
                    .children('td')
                    .eq(1)
                    .children('a')
                    .attr('href')
                ) {
                  const section: any = {
                    status: $(elem)
                      .children('td')
                      .eq(0)
                      .text()
                      .trim(),
                    code: $(elem)
                      .children('td')
                      .eq(1)
                      .text()
                      .trim(),
                    url: $(elem)
                      .children('td')
                      .eq(1)
                      .children('a')
                      .attr('href'),
                    type: $(elem)
                      .children('td')
                      .eq(2)
                      .text()
                      .trim(),
                    term: $(elem)
                      .children('td')
                      .eq(3)
                      .text()
                      .trim(),
                    days: $(elem)
                      .children('td')
                      .eq(5)
                      .text()
                      .trim(),
                    startTime: $(elem)
                      .children('td')
                      .eq(6)
                      .text()
                      .trim(),
                    endTime: $(elem)
                      .children('td')
                      .eq(7)
                      .text()
                      .trim(),
                    courseCode: course.code,
                  };
                  section.course_code = course.code;
                  section.department_code = course.department_code;
                  if (section.startTime && section.endTime) {
                    let end = moment(section.endTime, 'HH:mm');
                    let start = moment(section.startTime, 'HH:mm');
                    let length = moment.duration(end.diff(start)).asMinutes();
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
        },
        () => {
          resolve(sections);
        },
      );
    });
  };

  private static async getSections(courses: any[]) {
    const split = 100;
    const len = courses.length / split;
    const promises: Promise<any>[] = [];
    const coursesSplits = [];
    coursesSplits.push(courses.slice(0, len));
    for (let i = 1; i < split - 1; i++) {
      coursesSplits.push(courses.slice(len * i, len * (i + 1)));
    }
    coursesSplits.push(courses.slice(len * (split - 1), courses.length));
    coursesSplits.forEach((courseSplit) => {
      promises.push(Scraper.getSectionsSubset(courseSplit));
    });
    const sectionList = await Promise.all(promises);
    let sections: any[] = [];
    sections = [].concat.apply(sections, sectionList);
    return sections;
  }

  private static deleteDuplicates(sections: any[]) {
    const deletedSects = sections.filter((sect) => {
      const dups = sections.filter(sect1 => sect1.code === sect.code);
      let index;
      if (dups.length > 1) {
        const indices: any[] = [];
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
};

// let fullSectionCounter = 0;
// const readSectionPage = (url, code) => new Promise((resolve, reject) => {
//   request(base_uri + url, (error, response, html) => {
//     if (!error) {
//       const $ = cheerio.load(html);
//       title = $('.table-striped')
//         .children('thead')
//         .children('tr')
//         .children('th')
//         .eq(0);
//       seatingtable = $('table').eq(3);
//       if (title.text() === 'Term') {
//         const SectionPage = {
//           code,
//           building: $('.table-striped')
//             .children('tbody')
//             .children('tr')
//             .children('td')
//             .eq(4)
//             .text(),
//           room: $('.table-striped')
//             .children('tbody')
//             .children('tr')
//             .children('td')
//             .eq(5)
//             .text()
//             .trim(),
//           teacher: $('.table-striped')
//             .next()
//             .children('tbody')
//             .children('tr')
//             .children('td')
//             .eq(1)
//             .text()
//             .trim(),
//           totalSeatsRemaining: seatingtable
//             .children('tbody')
//             .children('tr')
//             .eq(0)
//             .children('td')
//             .eq(1)
//             .children('strong')
//             .text()
//             .trim(),
//           currentlyRegistered: seatingtable
//             .children('tbody')
//             .children('tr')
//             .eq(1)
//             .children('td')
//             .eq(1)
//             .children('strong')
//             .text()
//             .trim(),
//           generalSeatsRemaining: seatingtable
//             .children('tbody')
//             .children('tr')
//             .eq(2)
//             .children('td')
//             .eq(1)
//             .children('strong')
//             .text()
//             .trim(),
//           restrictedSeatsRemaining: seatingtable
//             .children('tbody')
//             .children('tr')
//             .eq(3)
//             .children('td')
//             .eq(1)
//             .children('strong')
//             .text()
//             .trim(),
//         };
//         resolve(SectionPage);
//       } else {
//         resolve();
//       }
//     } else {
//       console.log(`error getting page: ${error}`);
//       reject();
//     }
//   });
// });

// module.exports.getFullSectionData = (url, code, callback) => {
//   readSectionPage(url, code).then((section) => {
//     if (section) {
//       dbClient.updatedSectionInsert(section).finally(() => {
//         callback();
//       });
//     } else {
//       callback();
//     }
//   });
// };

// const printLine = (line) => {
//   process.stdout.write(`${line}\r`);
// };

// function getSectionData(sections, sectionLength) {
//   return new Promise((resolve, reject) => {
//     const updatedSections = [];
//     async.eachSeries(
//       sections,
//       (section, callback) => {
//         readSectionPage(section.URL, section.Code)
//           .then((updatedSection) => {
//             updatedSections.push(updatedSection);
//             fullSectionCounter++;
//             printLine(
//               `FullUpdate: ${fullSectionCounter}/${sectionLength}|${Math.trunc(
//                 (fullSectionCounter / sectionLength) * 100,
//               )}%`,
//             );
//             callback();
//           })
//           .catch(() => callback());
//       },
//       () => resolve(updatedSections),
//     );
//   });
// }

// async function updateSections(sections) {
//   console.log();
//   let split = 500;
//   if (split >= sections.length) split = sections.length / 5;
//   const len = sections.length / split;
//   const promises = [];
//   promises.push(getSectionData(sections.slice(0, len), sections.length));
//   for (let i = 1; i < split - 1; i++) {
//     promises.push(
//       getSectionData(
//         sections.slice(1 + len * i, len * (i + 1)),
//         sections.length,
//       ),
//     );
//   }
//   promises.push(
//     getSectionData(sections.slice(1 + len * split, -1), sections.length),
//   );
//   const sectionList = await Promise.all(promises);
//   let updatedSections = [];
//   updatedSections = [].concat.apply(updatedSections, sectionList);
//   console.log();
//   return updatedSections.filter(e => e !== undefined);
// }

// module.exports.updateAllSectionData = (callback) => {
//   const dbPromises = [];
//   console.time('sectionScrape');
//   console.log('Beginning full section update...');
//   dbClient.getAllSections().then((sections) => {
//     console.log(`Found ${sections.length} sections...`);
//     fullSectionCounter = 0;
//     updateSections(sections).then((updatedSections) => {
//       console.log('Full section scrape done.');
//       console.timeEnd('sectionScrape');
//       console.log('deduplicating sections..');
//       const cleanSections = deleteDuplicates(updatedSections);
//       console.log('Beginning full section db insert..');
//       console.time('fullDbInsert');
//       cleanSections.forEach((updatedSection) => {
//         dbPromises.push(dbClient.updatedSectionInsert(updatedSection));
//       });
//       Promise.all(dbPromises.map(p => p.catch(e => e))).then((results) => {
//         if (results.find(e => e !== undefined) !== undefined) {
//           console.log('Full section db insert failure.');
//           console.timeEnd('fullDbInsert');
//           console.log(results);
//           callback();
//         } else {
//           console.log('Full section db insert done.');
//           console.timeEnd('fullDbInsert');
//           callback();
//         }
//       });
//     });
//   });
// };
