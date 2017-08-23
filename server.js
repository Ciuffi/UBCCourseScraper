var express = require('express');
var scraper = require('./scripts/Scraper.js');
var app     = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

blocked = false;
var maxReplies = 50;
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/index.html')
});
app.get('/scrape', function(req, res){
    if (!blocked) {
        blocked = true;
        console.log("Scrape request received from: " + req.get("host") + " for " + req.query.size + " departments.")
        scraper.mine(req.query.size, sendJson, req.query.search);

        function sendJson(content) {
            io.emit('done', content);
            blocked = false;
        }
        res.sendStatus("202");
    }

});
var port = process.env.PORT || 8082;
server.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;