var pg = require('pg');
var client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
client.connect(function (error) {
    if (error){
        client.end();
        client = new pg.Client({
            connectionString: process.env.DATABASE_URL,
            ssl: false
        });
        client.connect(function (error) {
        });
    }
});

module.exports.timeInsert = function (startTime, endTime) {
    var queryText = 'INSERT INTO "scrapeTimes"("startDate", "endDate") VALUES($1, $2)';
    var values = [startTime, endTime];
    client.query(queryText, values, function (err, res) {
        if (err){
            console.log(err)
        }else{
            console.log("Inserted timeData: StartTime: " + startTime + " endTime: " + endTime);
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
                }else{
                    console.log("inserted: " + department.code);
                }
            })
        }else{
            console.log("updated: " + department.code);
        }
    })
};
module.exports.getDepartmentByCode = function (code, callback) {
    var queryText = 'SELECT * FROM "Departments" WHERE "Code"=$1';
    var values = [code];
    console.log("searching for.." + code);
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
                }else{
                    console.log("inserted: " + course.code);
                }
            })
        }else{
            console.log("updated: " + course.code);
        }
    })
};
module.exports.sectionInsert = function (section) {
    var queryText = 'UPDATE "Sections" ' +
        'SET "Code"=$1, "URL"=$2 ' +
        'WHERE "Code"=$1';
    var values = [section.code, section.url];
    client.query(queryText, values, function (err, res) {
        if (err) {
            console.log(err)
        } else if (res.rowCount === 0){
            var queryText = 'INSERT INTO "Sections"("Code", "URL") VALUES($1, $2)';
            client.query(queryText, values, function (err, res) {
                if (err){
                    console.log(err.stack);
                }else{
                    console.log("inserted: " + section.code);
                }
            })
        }else{
            console.log("updated: " + section.code);
        }
    })
};

module.exports.getCoursesByCode = function (code, callback) {
    var queryText = 'SELECT * FROM "Courses" WHERE "Code" LIKE  $1';
    var values = ['%' + code + '%'];
    console.log("searching for.." + code);
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
    var queryText = 'SELECT * FROM "Courses" WHERE "Code" LIKE  $1';
    var values = ['%' + code + '%'];
    console.log("searching for.." + code);
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