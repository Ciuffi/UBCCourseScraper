var express  = require('express');
var scraper  = require('./scripts/Scraper.js');
var dbClient = require('./scripts/dbClient.js');
var moment = require("moment");
var app      = express();
var blocked = false;
var lastTime;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/HTML/index.html");
    console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Site access from: " + req.get("host"));
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
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Scrape request received from: " + req.get("host") + " for " + (req.query.size || "all") + " departments.");
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
    console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; All Department Request from: " + req.get("host"));
});

app.get('/getDepartmentByCode', function (req, res) {
    if (req.query.code){
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for Department by code: " + req.query.code +" from: " + req.get("host"));
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
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for Courses by code: " + req.query.code +" from: " + req.get("host"));
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
        console.log(moment().format("YYYY:MM:DD:hh:mm:ss A") + "; Request for Sections by code: " + req.query.code +" from: " + req.get("host"));
        dbClient.getSectionsByCode(req.query.code, returnResult);
    }else{
        res.send("No code!")
    }
    function returnResult(result) {
        res.send(result);
    }
});
var port =  8080;
app.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;