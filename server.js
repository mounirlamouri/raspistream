var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var server = new http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);

  if (request.url != '/' && request.url != '/index.html') {
    response.writeHead(404);
    response.end();
    return;
  }

  var uri = url.parse(request.url).pathname;
  response.writeHead(200, 'text/html');
  fs.createReadStream(path.join(process.cwd(), uri)).pipe(response);
});

server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});
