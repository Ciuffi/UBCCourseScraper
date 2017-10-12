var pg = require('pg');
var client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

module.exports.connectDB = function() {
    client.connect(function (error) {
        if (error){
            console.log("Failed to connect to Database, trying again in 5 seconds..");
            setTimeout(connectDB, 5000);
        }else{
            console.log("Database connected!")
        }
    });
};

module.exports.timeInsert = function (startTime, endTime) {
    var queryText = 'INSERT INTO "scrapeTimes"("startDate", "endDate") VALUES($1, $2)';
    var values = [startTime, endTime];
    client.query(queryText, values, function (err, res) {
        if (err){
            console.log(err)
        }
    })
};
module.exports.getLastTime = function (callback) {
    var queryText = 'SELECT * from "scrapeTimes"' +
        'order by "ID" desc limit 1';
    client.query(queryText, function (err, res) {
        if (err){
            console.log(err)
        }else{
            callback(res.rows[0]);
        }
    })
};
module.exports.departmentInsert = function (department) {
    var queryText = 'UPDATE "Departments" ' +
        'SET "Name"=$1, "Code"=$2, "URL"=$3, "Faculty"=$4' +
        'WHERE "Code"=$2';
    var values = [department.name, department.code, department.url, department.faculty];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err);
        }else if (res.rowCount === 0){
            var queryText = 'INSERT INTO "Departments"("Name", "Code", "URL", "Faculty") VALUES($1, $2, $3, $4)';
            client.query(queryText, values, function (err, res) {
                if (err){
                    console.log(err.stack);
                }
            })
        }
    })
};
module.exports.getDepartmentByCode = function (code, callback) {
    var queryText = 'SELECT * FROM "Departments" WHERE "Code"=$1';
    var values = [code];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err);
        }else if (res.rowCount >= 1){
            callback(JSON.stringify(res.rows[0], null, 4));
        }else{
            callback("Not found :(");
        }
    })
};
module.exports.getDepartments = function (callback) {
    var queryText = 'SELECT * FROM "Departments"';
    client.query(queryText, function (err, res) {
        if (err) {
            console.log(err);
        }else if (res.rowCount >= 1){
            callback(JSON.stringify(res.rows, null, 4));
        }
    })
};
module.exports.courseInsert = function (course) {
    var queryText = 'UPDATE "Courses" ' +
        'SET "Name"=$1, "Code"=$2, "URL"=$3 ' +
        'WHERE "Code"=$2';
    var values = [course.name, course.code, course.url];
    client.query(queryText, values, function (err, res) {
        if (err){
            console.log(err);
        }else if(res.rowCount === 0){
            var queryText = 'INSERT INTO "Courses"("Name", "Code", "URL") VALUES($1, $2, $3)';
            client.query(queryText, values, function (err, res) {
                if (err){
                    console.log(err.stack);
                }
            })
        }
    })
};
module.exports.sectionInsert = function (section) {
    var queryText = 'UPDATE "Sections" ' +
        'SET "Code"=$1, "URL"=$2, "Term"=$3, "Days"=$4, "Start Time"=$5, "End Time"=$6, "Type"=$7, "Length"=$8' +
        'WHERE "Code"=$1';
    var values = [section.code, section.url, section.term, section.days, section.startTime, section.endTime, section.type, section.length];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err)
        } else if (res.rowCount === 0){
            var queryText = 'INSERT INTO "Sections"("Code", "URL", "Term", "Days", "Start Time", "End Time", "Type", "Length") VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
            client.query(queryText, values, function (err, res) {
                if (err){
                    console.log(err.stack);
                }
            })
        }
    })
};

module.exports.updatedSectionInsert = function (section) {
    var queryText = 'UPDATE "Sections" ' +
        'SET "Teacher"=$2, "Building"=$3, "Room"=$4, "TotalSeatsRemaining"=$5, "CurrentlyRegistered"=$6, "GeneralSeatsRemaining"=$7, "RestrictedSeatsRemaining"=$8 ' +
        'WHERE "Code"=$1';
    var values = [section.code, section.teacher, section.building, section.room, section.totalSeatsRemaining, section.currentlyRegistered, section.generalSeatsRemaining, section.restrictedSeatsRemaining];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err)
        }
    })
};

module.exports.getCoursesByCode = function (code, callback) {
    var queryText = 'SELECT * FROM "Courses" WHERE "Code" LIKE  $1';
    var values = ['%' + code + '%'];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err);
        }else if (res.rowCount >= 1){
            callback(JSON.stringify(res.rows, null, 4));
        }else{
            callback("Not found :(");
        }
    })
};

module.exports.getSectionsByCode = function (code, callback) {
    var queryText = 'SELECT * FROM "Sections" WHERE "Code" LIKE  $1';
    var values = ['%' + code + '%'];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err);
        }else if (res.rowCount >= 1){
            callback(JSON.stringify(res.rows, null, 4));
        }else{
            callback("Not found :(");
        }
    })
};

module.exports.getAllSections = function (callback) {
    var queryText = 'SELECT * FROM "Sections"';
    client.query(queryText, function (err, res) {
        if (err) {
            console.log(err);
        }else if (res.rowCount >= 1){
            callback(res.rows);
        }else{
            callback("Not found :(");
        }
    })
};