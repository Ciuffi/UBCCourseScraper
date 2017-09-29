var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var dbClient = require('./dbClient.js');
var moment = require('moment');
var base_uri = 'https://courses.students.ubc.ca';
module.exports.mine = function(size, callback) {
    console.time("scrape");
    var departments = [];
    async.series([getDepartments, getCourses, getSection], function () {
        console.log("Done");
        console.timeEnd("scrape");
        departments = null;
        callback();
    });

    function getDepartments(callback) {
        var url = 'https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=0';
        request(url, function (error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);
                console.log("Beginning department collection...");
                if (size){
                    console.log("getting " + size + " departments..");
                    table = $('#mainTable tr').slice(0, size);
                }else{
                    console.log("getting all departments..");
                    table = $('#mainTable tr')
                }

                table.each(function () {
                    if ($(this).children('td').eq(0).children('a').attr("href") != undefined) {
                        var department = {
                            code: $(this).children('td').eq(0).text().trim(),
                            url: $(this).children('td').eq(0).children('a').attr("href"),
                            name: $(this).children('td').eq(1).text().trim(),
                            faculty: $(this).children('td').eq(2).text().trim(),
                            courses: null
                        };
                        console.log("Mined department: " + department.code +":"+ department.name);
                        departments.push(department);
                        dbClient.departmentInsert(department);
                    }
                });
                callback();
            }
        })
    }

    function getCourses(callback) {
        console.log("Beginning course collection...");
        async.forEach(departments, function (dep, callback) {
            request(base_uri + dep.url, function (error, response, html) {
                if (!error) {
                    var $ = cheerio.load(html);
                    var courses = [];
                    table = $('#mainTable tr');
                    table.each(function () {
                        if ($(this).children('td').eq(0).children('a').attr("href")) {
                            var course = {
                                code: $(this).children('td').eq(0).text().trim(),
                                url: $(this).children('td').eq(0).children('a').attr("href"),
                                name: $(this).children('td').eq(1).text().trim(),
                            };
                            dbClient.courseInsert(course);
                            courses.push(course)
                        }
                    });
                    dep.courses = courses;
                    callback();
                }
            })
        }, function () {
            console.log("found all courses");
            callback()
        })
    }

    function getSection(callback) {
        console.log("beginning section search..");
        async.forEach(departments, function (dep, callback) {
            async.eachSeries(dep.courses, function (course, callback) {
                request(base_uri + course.url, function (error, response, html) {
                    if (!error) {
                        var $ = cheerio.load(html);
                        table = $('.section-summary tr');
                        table.each(function () {
                            if ($(this).children('td').eq(1).children('a').attr("href")) {
                                var section = {
                                    status: $(this).children('td').eq(0).text().trim(),
                                    code: $(this).children('td').eq(1).text().trim(),
                                    url: $(this).children('td').eq(1).children('a').attr("href"),
                                    type: $(this).children('td').eq(2).text().trim(),
                                    term: $(this).children('td').eq(3).text().trim(),
                                    days: $(this).children('td').eq(5).text().trim(),
                                    startTime: $(this).children('td').eq(6).text().trim(),
                                    endTime: $(this).children('td').eq(7).text().trim(),
                                    courseCode: course.code
                                };
                                if (section.startTime && section.endTime){
                                    end = moment(section.endTime, "HH:mm");
                                    start = moment(section.startTime, "HH:mm");
                                    length = moment.duration(end.diff(start)).asMinutes();
                                    section.length = length +" minutes";
                                    dbClient.sectionInsert(section);
                                }else{
                                    dbClient.sectionInsert(section);
                                }
                            }
                        });
                        callback();
                    }else{
                        console.log("error: " + error);
                        console.log("Possible connection reset. waiting 5 seconds.");
                        setTimeout(function () {
                            console.log("restarting...");
                            callback();
                        }, 5000);
                    }
                })
            }, function () {
                dep = null;
                callback()
            })
        }, function () {
            console.log("Found all sections");
            callback()
        })
    }
};
// module.exports.readSectionPage = function (url) {
//     request(url, function (error, response, html) {
//         if (!error){
//             var $ = cheerio.load(html);
//
//
//         }
//     })
//
// };
