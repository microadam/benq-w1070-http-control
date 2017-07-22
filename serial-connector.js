module.exports = serialConnector

var SerialPort = require('serialport').SerialPort
var EventEmitter = require('events').EventEmitter

function serialConnector() {
  var emitter = null
  var serialPort = null

  function connect () {
    emitter = new EventEmitter()
    serialPort = new SerialPort('/dev/cu.usbserial', {
      baudrate: 57600
    })
    serialPort.on('open', function () {
      var buffer = ''
      serialPort.on('data', function (data) {
        buffer += data.toString()
        var lastChars = buffer.substring(buffer.length - 3, buffer.length)
        if (lastChars === '#\r\n' || lastChars === '\r\n\u0000') {
          var dataParts = buffer.split('\r\n')
          buffer = ''
          emitter.emit('data', dataParts[1])
        }
      })
    })

    serialPort.on('error', function(error) {
      console.log('Serial Port Error:', error.message)
    })
  }

  connect()

  function executeAction (command, cb) {
    emitter.once('data', function (response) {
      if (cb) return cb(null, response)
    })
    serialPort.write(command, function (error) {
      if (error) {
        if (error.message === 'Serialport not open.') {
          connect()
        }
        if (cb) cb(error)
      }
    })
  }

  return executeAction
}