var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var WebSocketServer = require('websocket').server;
var child_process = require('child_process');

// Loading config file.
var config = null;
try {
  config = JSON.parse(fs.readFileSync('./config.json'));
} catch (error) {
  console.log('Failed to load config.json: ' + error);
}

var resources = {
  '/index.html': { mime: 'text/html' },
  '/script.js': { mime: 'application/javascript' },
  '/dialog-polyfill/dialog-polyfill.js': { mime: 'application/javascript' },
  '/dialog-polyfill/dialog-polyfill.css': { mime: 'text/css' },
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

var connections = {};

ws = new WebSocketServer({
  httpServer: server,
  // TODO: add origin checks
  autoAcceptConnections: true
});

ws.on('connect', function(connection) {
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' connected.');

  var onconnected = function() {
    connections[connection] = true;
    connection.sendUTF('connected');
    startStreaming(connection);
  };

  if (config && config.password) {
    connections[connection] = false;
    connection.sendUTF('request_password');
  } else {
    onconnected();
  }

  connection.on('message', function(msg) {
    console.log(msg);
    if (!(connection in connections)) {
      console.log((new Date()) + ' Error: unexpected connection.');
      return;
    }

    // Need to be authenticated.
    if (!connections[connection]) {
      if (msg.utf8Data === config.password) {
        onconnected();
      } else {
        connection.sendUTF('disconnected');
        connection.close();
        delete connections[connection];
      }
    }
  });

  connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

function startStreaming(connection) {
  setInterval(function() {
    var options = [ '-w', '640', '-h', '480' ];
    if (config && config.raspistill_options)
      options.push.apply(options, config.raspistill_options);
    options.push.apply(options, [ '-o', './image.jpeg' ])

    var process = child_process.spawn('raspistill', options);
    process.on('exit', function() {
      fs.readFile('image.jpeg', function(err, data) {
        if (err) throw err;
        connection.sendBytes(data);
      });
    });
  }, 1000);
}
