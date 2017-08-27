var express = require('express');
var Scraper = require('./scripts/Scraper.js');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

blocked = false;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/index.html')
});
app.get('/populateList', function (req, res) {
    Scraper.getFullList(req.query.size, function (deps) {
        console.log("Done.");
        io.emit('done', JSON.stringify(deps, null, 4));
        res.sendStatus(200);
    })
});
var port = process.env.PORT || 8082;
server.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;