var express  = require('express');
var scraper  = require('./scripts/Scraper.js');
var dbClient = require('./scripts/dbClient.js');
var schedule = require('node-schedule');
var app      = express();
blocked = false;

schedule.scheduleJob('* 1 * * *', function(){
    if (!blocked) {
        blocked = true;
        var startTime = new Date().toLocaleString();
        console.log("Starting daily scrape...");
        scraper.mine(undefined, callback);
        function callback() {
            var endTime = new Date().toLocaleString();
            dbClient.timeInsert(startTime, endTime);
            blocked = false;
        }
    }
});
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/HTML/index.html");
});
app.get('/getLastScrapeTime', function (req, res) {
    dbClient.getLastTime(returnResult);
    function returnResult(result) {
        if (result){
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
        blocked = true;
        var startTime = new Date().toLocaleString();
        console.log("Scrape request received from: " + req.get("host") + " for " + req.query.size + " departments.");
        scraper.mine(req.query.size, callback);
        function callback() {
            var endTime = new Date().toLocaleString();
            dbClient.timeInsert(startTime, endTime);
            res.sendStatus(200);
            blocked = false;
        }
    }
});

app.get('/getDepartments', function (req, res) {
    dbClient.getDepartments(returnResult);
    function returnResult(result) {
        res.send(result);
    }
});

app.get('/getDepartmentByCode', function (req, res) {
    if (req.query.code){
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
        dbClient.getSectionsByCode(req.query.code, returnResult);
    }else{
        res.send("No code!")
    }
    function returnResult(result) {
        res.send(result);
    }
});
var port = process.env.PORT || 8080;
app.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;