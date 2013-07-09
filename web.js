var express = require('express');
var fs = require('fs');
var buffer = require('buffer');


var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var content = fs.readFileSync('index.html','utf-8');
  buffer = new Buffer(content);
  response.send(buffer.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
