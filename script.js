// Main script file for raspistream web client.

function updateStatus(status) {
  document.querySelector('#status > span').textContent = status;
}

function connectWebSocket() {
  var ws = new WebSocket('ws://' + location.host);

  ws.onopen = function() {
    console.log('opened');
    updateStatus('connecting');
  };
  ws.onerror = function() {
    console.log('error');
  };
  ws.onmessage = function(e) {
    if (e.data == 'connected') {
      updateStatus('connected');
    } else if (e.data == 'disconnected') {
      updateStatus('disconnected');
    } else if (e.data == 'request_password') {
      updateStatus('password request');
      var dialog = document.getElementById('password-dialog');
      dialogPolyfill.registerDialog(dialog);
      dialog.showModal();

      document.querySelector('#password-dialog > form').onsubmit = function(e) {
        dialog.close();
        ws.send(this.password.value);
        e.preventDefault();
      };
    } else {
      console.log('received unknown message: ' + e.data);
    }
  };
}

document.getElementById('start').addEventListener('click', connectWebSocket);
