var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var scraper = require('./scripts/Scraper.js');
var app     = express();

app.get('/scrape', function(req, res){
    scraper.mine(req.query.size);
    res.sendStatus(202);

});
app.listen('8081');

console.log('Magic happens on port 8081');

exports = module.exports = app;