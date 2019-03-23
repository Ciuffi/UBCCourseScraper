import * as request from 'request';
import * as cheerio from 'cheerio';
const async = require('async');
const moment = require('moment');
import dbClient from './dbClien-firestore';
import { Department, Course, Section} from './objectInterfaces'
const base_uri = 'https://courses.students.ubc.ca';

export default class Scraper {
  
  public static async mine(size?: number) {
    console.log('Beginning scrape...');
    console.time('scrape');
    console.log('Beginning department collection...');
    let departments: Department[] = await this.getDepartments(size);
    console.log(`Found ${departments.length} departments. Inserting into db..`);
    let promises: Promise<any>[] = [];
    departments.forEach((dep) => {
      promises.push(dbClient.departmentInsert(dep));
    });
    await Promise.all(promises);
    promises = [];
    console.log('Departments inserted.');
    console.log('Beginning course collection...');
    let courses: Course[] = await this.getCourses(departments);
    departments = [];
    console.log(`found ${courses.length} courses. Inserting into db..`);
    courses.forEach((course) => {
      promises.push(dbClient.courseInsert(course));
    });
    await Promise.all(promises);
    promises = [];
    console.log('Courses inserted.');
    console.log('Beginning section collection...');
    let sections: Section[] = await this.getSections(courses);
    courses = [];
    console.log(`found ${sections.length} sections.`);
    console.log('deduplicating sections..');
    let cleanSections: Section[] = this.deleteDuplicates(sections);
    sections = [];
    console.log('Starting Section inserts...');
    cleanSections.forEach((section) => {
      promises.push(dbClient.sectionInsert(section));
    });
    await Promise.all(promises);
    cleanSections = [];
    promises = [];
    console.log('Done scrape.');
    console.timeEnd('scrape');
    return "done";
  }
    private static getDepartments(size?: number): Promise<Department[]> {
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
                  .attr('href') !== undefined
              ) {
                const department: Department = {
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

    private static getCourses(departments: Department[]): Promise<Course[]> {
      const courses: Course[] = [];
      return new Promise((resolve, reject) => {
        async.forEach(
          departments,
          (dep: Department, callback: Function) => {
            request(base_uri + dep.url, (error, response, html) => {
              if (!error) {
                const $ = cheerio.load(html);
                const table = $('#mainTable tr');
                table.each(function (i, elem) {
                  if (
                    $(elem)
                      .children('td')
                      .eq(0)
                      .children('a')
                      .attr('href')
                  ) {
                    const course: Course = {
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
                      departmentCode: dep.code,
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
          },
          () => {
            resolve(courses);
          },
        );
      });
    }

      

  private static getSectionsSubset(courses: Course[]): Promise<Section[]> {
    const sections: Section[] = [];
    return new Promise((resolve, reject) => {
      async.eachSeries(
        courses,
        (course: Course, callback: Function) => {
          request(base_uri + course.url, (error, response, html) => {
            if (!error) {
              const $ = cheerio.load(html);
              const table = $('.section-summary tr');
              table.each(function (i, elem) {
                if (
                  $(elem)
                    .children('td')
                    .eq(1)
                    .children('a')
                    .attr('href')
                ) {
                  const section: Section = {
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
                    departmentCode: course.departmentCode,
                  };
                  if (section.startTime && section.endTime) {
                    const end = moment(section.endTime, 'HH:mm');
                    const start = moment(section.startTime, 'HH:mm');
                    const length = moment.duration(end.diff(start)).asMinutes();
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

  private static async getSections(courses: Course[]): Promise<Section[]> {
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
