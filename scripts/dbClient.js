var Knex = require('knex');

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS ? process.env.DB_PASS : '',
    database: process.env.DB_NAME
}

const knex = Knex({ 
    client: 'pg', 
    connection: config,
    pool: {min: 2, max: 100} 
});

module.exports.timeInsert = function (startTime, endTime) {
    knex('scrapeTimes').insert({
        startDate: startTime,
        endDate: endTime
    })
};
module.exports.getLastTime = function (callback) {
    knex.select("*").from('scrapeTimes').then((results) => {
        callback(results[0])
    })
};
module.exports.departmentInsert = function (department) {
    knex('Departments').where('Code', '=', department.code)
        .update({
            Name: department.name,
            Code: department.code,
            URL: department.url,
            Faculty: department.faculty,
        }).then((res) => {
            if (res.length === 0){
                knex('Departments').insert({
                    Name: department.name,
                    Code: department.code,
                    URL: department.url,
                    Faculty: department.faculty,
                })
            }
    });
};
module.exports.getDepartmentByCode = function (code, callback) {
    knex("Departments").select("*").where("Code", "like", '%' + code + '%').then((res) => {
        if (res.length >= 1){
            callback(res);
        }else{
            callback("Not found :(");
        }
    });
};
module.exports.getDepartments = function (callback) {
    knex('Departments').select("*").then((res) => {
        callback(res);
    });
};
module.exports.courseInsert = function (course) {
    knex('Courses').where('Code', '=', course.code)
        .update({
            Name: course.name,
            Code: course.code,
            URL: course.url,
        }).then((res) => {
        if (res.length === 0){
            knex('Courses').insert({
                Name: course.name,
                Code: course.code,
                URL: course.url,
            })
        }
    });
};
module.exports.sectionInsert = function (section) {
    knex('Sections').where('Code', '=', section.code)
        .update({
            Name: section.name,
            Code: section.code,
            URL: section.url,
            Term: section.term,
            Days: section.days,
            'Start Time': section.startTime,
            'End Time': section.endTime,
            Type: section.type,
            Length: section.length
        }).then((res) => {
        if (res.length === 0){
            knex('Sections').insert({
                Name: section.name,
                Code: section.code,
                URL: section.url,
                Term: section.term,
                Days: section.days,
                'Start Time': section.startTime,
                'End Time': section.endTime,
                Type: section.type,
                Length: section.length
            })
        }
    });
};

module.exports.updatedSectionInsert = function (section) {
    knex('Sections').where('Code', '=', section.code)
        .update({
            Teacher: section.teacher,
            Building: section.building,
            Room: section.room,
            TotalSeatsRemaining: section.totalSeatsRemaining,
            CurrentlyRegistered: section.CurrentlyRegistered,
            GeneralSeatsRemaining: section.generalSeatsRemaining,
            RestrictedSeatsRemaining: section.restrictedSeatsRemaining
        });
};

module.exports.getCoursesByCode = function (code, callback) {
    knex("Courses").select("*").where("Code", "like", '%' + code + '%').then((res) => {
        if (res.length >= 1){
            callback(res);
        }else{
            callback("Not found :(");
        }
    });
};

module.exports.getSectionsByCode = function (code, callback) {
    knex("Sections").select("*").where("Code", "like", '%' + code + '%').then((res) => {
        if (res.length >= 1){
            callback(res);
        }else{
            callback("Not found :(");
        }
    });
};

module.exports.getAllSections = function (callback) {
    knex('Sections').select("*").then((res) => {
        callback(res);
    });
};
