var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var base_uri = 'https://courses.students.ubc.ca';
module.exports.mine = function(size) {
    console.time("scrape");
    var departments = [];
    async.series([getDepartments, getCourses, getSection], function () {
        console.log("Done");
        console.timeEnd("scrape");
        content = JSON.stringify(departments, null, 4);
        fs.writeFile("dbInfo.json", content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        })
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
                    console.log("Getinng all departments..");
                    table = $('#mainTable tr')
                }

                table.each(function () {
                    if ($(this).children('td').eq(0).children('a').attr("href") != undefined) {
                        var department = {
                            code: $(this).children('td').eq(0).text().trim(),
                            url: $(this).children('td').eq(0).children('a').attr("href"),
                            name: $(this).children('td').eq(1).text().trim(),
                            courses: null
                        };
                        departments.push(department);
                        console.log("Found department: " + department.name);
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
                    console.log("   Searching for courses in: " + dep.name);
                    table = $('#mainTable tr');
                    table.each(function () {
                        if ($(this).children('td').eq(0).children('a').attr("href")) {
                            var course = {
                                code: $(this).children('td').eq(0).text().trim(),
                                url: $(this).children('td').eq(0).children('a').attr("href"),
                                name: $(this).children('td').eq(1).text().trim(),
                                sections: null
                            };
                            console.log("      Found course: " + course.name)
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
            async.forEach(dep.courses, function (course, callback) {
                request(base_uri + course.url, function (error, response, html) {
                    console.log("   Searching sections for: " + course.name)
                    var sections = [];
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
                                };
                                console.log("      Found section: " + section.code);
                                sections.push(section)
                            }
                        });
                        course.sections = sections;
                        callback();
                    }else{
                        console.error(error);
                    }
                })
            }, function () {
                callback()
            })
        }, function () {
            console.log("Found all sections");
            callback()
        })
    }
}