var express = require("express");
var app = express();
var server = require("http").createServer(app);
var port = 8080;

server.listen(port, function() {
    console.log("server started on port " + port);
});

app.use(express.static(__dirname + "/public"));