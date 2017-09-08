var express = require('express');
var scraper = require('./scripts/Scraper.js');
var app     = express();
blocked = false;
app.get('/scrape', function(req, res){
    if (!blocked) {
        blocked = true;
        console.log("Scrape request received from: " + req.get("host") + " for " + req.query.size + " departments.");
        scraper.mine(req.query.size, sendJson);

        function sendJson(departments) {
            res.json(JSON.stringify(departments, null, 4));
            blocked = false;
        }
    }

});
var port = process.env.PORT || 8080;
app.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;