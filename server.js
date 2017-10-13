var express  = require('express');
var scraper  = require('./scripts/Scraper.js');
var dbClient = require('./scripts/dbClient.js');
var moment = require("moment");
var app      = express();
var blocked = false;
var lastTime;


app.get("/fullSectionUpdate", function (req, res) {
    if (!blocked){
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for full section scrape from: " + req.ip);
        blocked = true;
        scraper.updateAllSectionData(function () {
            blocked = false;
        });
        res.sendStatus(202);
    }else{
        res.sendStatus(503);
    }

});


app.get("/sectionData", function (req, res) {
    console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for updated section info by code: " + req.query.code +" from: " + req.ip);
    dbClient.getSectionsByCode(req.query.code, function (sections) {
        sections = JSON.parse(sections);
        if (sections.length === 1){
            scraper.readSectionPage(sections[0].URL, sections[0].Code, function () {
                dbClient.getSectionsByCode(req.query.code, function (section) {
                    res.send(section);
                })
                });
        }else{
            res.send("Improper code! must be a full section code.");
        }
    })
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/HTML/index.html");
    console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Site access from: " + req.ip);
});
app.get('/getLastScrapeTime', function (req, res) {
    if (!blocked){
        dbClient.getLastTime(returnResult);
    }else{
        returnResult(lastTime);
    }
    function returnResult(result) {
        if (result){
            lastTime = result;
            res.send(result.endDate);
        }else{
            res.send("No previous scrapes.")
        }
    }
});
app.get('/scrapeStatus', function (req, res) {
    res.send(blocked);
});
app.get('/scrape', function(req, res){
    if (!blocked) {
        dbClient.getLastTime(function (result) {
            lastTime = result;
        });
        blocked = true;
        res.sendStatus(202);
        var startTime = new Date().toLocaleString();
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Scrape request received from: " + req.ip + " for " + (req.query.size || "all") + " departments.");
        scraper.mine(req.query.size, callback);
        function callback() {
            var endTime = new Date().toLocaleString();
            dbClient.timeInsert(startTime, endTime);
            blocked = false;
        }
    }else{
        res.sendStatus(503);
    }
});

app.get('/getDepartments', function (req, res) {
    dbClient.getDepartments(returnResult);
    function returnResult(result) {
        res.send(result);
    }
    console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; All Department Request from: " + req.ip);
});

app.get('/getDepartmentByCode', function (req, res) {
    if (req.query.code){
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for Department by code: " + req.query.code +" from: " + req.ip);
        dbClient.getDepartmentByCode(req.query.code, returnResult);
    }else{
        res.send("No code!");
    }

    function returnResult(result) {
        res.send(result);
    }
});

app.get('/getCoursesByCode', function (req, res) {
    if (req.query.code){
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for Courses by code: " + req.query.code +" from: " + req.ip);
        dbClient.getCoursesByCode(req.query.code, returnResult);
    }else{
        res.send("No code!")
    }

    function returnResult(result) {
        res.send(result);
    }
});

app.get('/getSectionsByCode', function (req, res) {
    if (req.query.code){
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for Sections by code: " + req.query.code +" from: " + req.ip);
        dbClient.getSectionsByCode(req.query.code, returnResult);
    }else{
        res.send("No code!")
    }
    function returnResult(result) {
        res.send(result);
    }
});
dbClient.connectDB();
var port =  8080;
app.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;