var http = require('http');
var SerialPort = require('serialport').SerialPort;
var commandMapping =
  { on: 'pow=on',
    off: 'pow=off',
    status: 'pow=?',
    hdmi1: 'sour=hdmi',
    hdmi2: 'sour=hdmi2'
  };

http.createServer(function (req, res) {
  console.log(req.url);
  var urlParts = req.url.split('/');
  var action = urlParts[1];

  executeAction(action, function (error, response) {
    var status = 200;
    if (error) {
      console.error(error);
      status = 500;
    }
    res.writeHead(status, {'Content-Type': 'text/plain'});
    res.end(response);
  });

}).listen(7638, '0.0.0.0');

function executeAction(action, callback) {
  if (commandMapping[action]) {
    var serialPort = new SerialPort('/dev/ttyUSB0', {
      baudrate: 57600
    });
    serialPort.on('open', function () {
      var buffer = '';
      serialPort.on('data', function(data) {
        buffer += data.toString();
        console.log(222, data);
        console.log(111, buffer);
        var lastChars = buffer.substring(buffer.length - 3, buffer.length);
        if (lastChars === '#\r\n' || lastChars === '\r\n\u0000') {
          var dataParts = buffer.split('\r\n');
          serialPort.close();
          callback(null, dataParts[1]);
        }
      });
      var command = '\r*' + commandMapping[action] + '#\r';
      serialPort.write(command, function(error, results) {
        if (error) return callback(error);
      });
    });
  } else {
    console.error('unrecognised command');
    callback();
  }
}
