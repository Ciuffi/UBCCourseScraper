var express  = require('express');
var scraper  = require('./scripts/Scraper.js');
var dbClient = require('./scripts/dbClient.js');
var app      = express();
var blocked = false;
var lastTime;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/HTML/index.html");
});
app.get('/getLastScrapeTime', function (req, res) {
    if (!blocked){
        dbClient.getLastTime(returnResult);
    }else{
        console.log("Last Time: " + lastTime);
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
        console.log("Scrape request received from: " + req.get("host") + " for " + req.query.size + " departments.");
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