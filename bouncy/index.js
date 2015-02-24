var express = require("express");
var app = express();
var server = require("http").createServer(app);

server.listen(7777, function() {
    console.log("server started on port 7777");
});

app.use(express.static(__dirname + "/public"));