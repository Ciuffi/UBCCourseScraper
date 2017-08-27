var request = require('request');
var cheerio = require('cheerio');

var base_uri = 'https://courses.students.ubc.ca';
module.exports.getDepartments = function(size, callback) {
    departments = [];
    var ext = '/cs/main?pname=subjarea&tname=subjareas&req=0';
    request(base_uri+ext, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            console.log("Beginning department collection...");
            if (size) {
                console.log("getting " + size + " departments..");
                table = $('#mainTable').find('tr').slice(0, parseInt(size)+1);
            } else {
                console.log("Getinng all departments..");
                table = $('#mainTable').find('tr')
            }

            table.each(function (i) {
                if ($(this).children('td').eq(0).children('a').attr("href")) {
                    var department = {
                        code: $(this).children('td').eq(0).text().trim(),
                        url: $(this).children('td').eq(0).children('a').attr("href"),
                        name: $(this).children('td').eq(1).text().trim()
                    };
                    departments.push(department);
                    console.log("Found department: " + department.name);
                }
                if (i === table.length - 1){
                    callback(departments);
                }
            })
        }
    })
};

module.exports.getCourses = function(size, department, callback){
    var courses = [];
    request(base_uri + department.url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            console.log("Searching for courses in: " + department.name);
            if (size) {
                console.log("getting " + size + " courses..");
                table').find('tr'('#mainTable tr').slice(0, size);
            } else {
                console.log("Getinng all courses..");
                table').find('tr'('#mainTable tr')
            }
            table.each(function (i) {
                if ($(this).children('td').eq(0).children('a').attr("href")) {
                    var course = {
                        code: $(this).children('td').eq(0).text().trim(),
                        url: $(this).children('td').eq(0).children('a').attr("href"),
                        name: $(this).children('td').eq(1).text().trim()
                    };
                    console.log("   Found course: " + course.name);
                    courses.push(course)
                }
                if (i === table.length - 1){
                    callback(courses);
                }
            });
        }
    })
};

module.exports.getSections = function (size, course, callback) {
    request(base_uri + course.url, function (error, response, html) {
        console.log("Searching sections for: " + course.name);
        var sections = [];
        if (!error) {
            var $ = cheerio.load(html);
            if (size) {
                console.log("getting " + size + " sections..");
                table = $('.section-summary tr').slice(0, size);
            } else {
                console.log("Getinng all sections..");
                table = $('.section-summary tr');
            }
            table.each(function (i) {
                if ($(this).children('td').eq(1).children('a').attr("href")) {
                    var section = {
                        status: $(this).children('td').eq(0).text().trim(),
                        code: $(this).children('td').eq(1).text().trim(),
                        url: $(this).children('td').eq(1).children('a').attr("href"),
                        type: $(this).children('td').eq(2).text().trim(),
                        term: $(this).children('td').eq(3).text().trim()
                    };
                    console.log("   Found section: " + section.code);
                    sections.push(section)
                }
                if (i === table.length - 1){
                    callback(sections);
                }
            });
        }
    })
};




module.exports.getFullList = function (size, callback) {
    module.exports.getDepartments(size, function (deps) {
        var depCounter = 0;
        deps.forEach(function (dep) {
            module.exports.getCourses(null, dep, function (courses) {
                var courseCounter = 0;
                courses.forEach(function (course) {
                    module.exports.getSections(null, course, function (sections) {
                       course.sections = sections;
                       if (courseCounter ===courses.length - 1){
                           dep.courses = courses;
                           if (depCounter === deps.length - 1){
                               callback(deps);
                           }else{
                               depCounter++;
                           }
                       }else{
                           courseCounter++;
                       }
                   })
                });
            });

        })
    })
};
