// Main script file for raspistream web client.

function updateStatus(status) {
  document.querySelector('#status > span').textContent = status;
}

var ws = null;

function connect() {
  ws = new WebSocket('ws://' + location.host);

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
      document.querySelector('#stream').src = window.URL.createObjectURL(e.data);
    }
  };
}

function disconnect() {
  if (!ws)
    return;

  ws.close();
  updateStatus('disconnected');
  ws = null;
}

document.getElementById('start').addEventListener('click', connect);
document.getElementById('stop').addEventListener('click', disconnect);
