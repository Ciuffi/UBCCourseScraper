var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var scraper = require('./scripts/Scraper.js');
var app     = express();

var maxReplies = 50;
app.get('/scrape', function(req, res){
    console.log("Scrape request received from: " + req.get("host") + " for " + req.query.size + " departments.")
    scraper.mine(req.query.size, sendJson);
    function sendJson(content) {
        if (req.query.size <= maxReplies){
            res.json(content);
        }
    }
    if (req.query.size > maxReplies){
        res.sendStatus("202");
    }

});
app.listen(process.env.PORT || 8080);

console.log('Magic happens on port 8081');

exports = module.exports = app;