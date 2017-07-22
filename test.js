var Primus = require('primus')
var PrimusEmitter = require('primus-emitter')
var Socket = Primus.createSocket({
  transformer: 'websockets',
  parser: 'JSON',
  plugin: { emitter: PrimusEmitter }
})

var socket = new Socket('http://localhost:7638')

socket.on('open', function () {
  console.log(222)
})

socket.on('off', function () {
  console.log('OFF')
})

socket.on('on', function () {
  console.log('ON')
})