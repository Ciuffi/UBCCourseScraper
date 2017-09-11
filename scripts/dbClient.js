var pg = require('pg');
var connectionURL='postgresql://postgres@localhost:5432/newDB';
var client = new pg.Client({
    connectionString: connectionURL
});
client.connect();
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