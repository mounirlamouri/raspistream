var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var WebSocketServer = require('websocket').server;

var resources = {
  '/index.html': { mime: 'text/html' },
  '/script.js': { mime: 'application/javascript' },
};

var server = new http.createServer(function(request, response) {
  if (request.url == '/')
    request.url = '/index.html';

  var resource = resources[request.url];
  if (!resource) {
    console.log((new Date()) + ' Invalid request for ' + request.url);

    response.writeHead(404);
    response.end();
    return;
  }

  console.log((new Date()) + ' Serving ' + request.url);

  var uri = url.parse(request.url).pathname;
  response.writeHead(200, resource.mime);
  fs.createReadStream(path.join(process.cwd(), uri)).pipe(response);
});

server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

ws = new WebSocketServer({
  httpServer: server,
  // TODO: add origin checks
  autoAcceptConnections: true
});

ws.on('connect', function(connection) {
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' connected.');

  connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
