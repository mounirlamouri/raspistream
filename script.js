// Main script file for raspistream web client.

function connectWebSocket() {
  var ws = new WebSocket('ws://' + location.host);

  ws.onopen = function() {
    console.log('opened');
  };
  ws.onerror = function() {
    console.log('error');
  };
  ws.onmessage = function(e) {
    console.log('received message: ' + e);
  };
}

document.getElementById('start').addEventListener('click', connectWebSocket);
