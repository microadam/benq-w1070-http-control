var Primus = require('primus')
var Emitter = require('primus-emitter')
var http = require('http')
var mqtt = require('mqtt')
var executeSerialCommand = require('./serial-connector')()
var executeAction = require('./action-executer')(executeSerialCommand)

var mqttClient = null
if (process.env.MQTT) {
  mqttClient = mqtt.connect(process.env.MQTT)
  mqttClient.on('connect', function() {
    mqttClient.subscribe('benqProjectorControl/#')
  })
  mqttClient.on('message', function(topic, message) {
    if (topic === 'benqProjectorControl/power/set') {
      var state = message.toString() === 'true' ? 'on' : 'off'
      console.log('Changing state based on MQTT:', state)
      executeAction(state)
    }
  })
}

var server = http.createServer(function (req, res) {
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
})
var primus = new Primus(server, {
  transformer: 'websockets',
  iknowhttpsisbetter: true,
  parser: 'JSON'
})

server.listen(7638)

primus.use('emitter', Emitter)

primus.on('connection', function (spark) {
  spark.on('on', function (data) {
    executeAction('on')
  })

  spark.on('off', function (data) {
    executeAction('off')
  })
})

var currentState = null
setInterval(function () {
  executeAction('status', function (error, status) {
    if (error) return console.error(error)
    if (currentState && status !== currentState) {
      if (status === '*POW=OFF#') {
        console.log('PROJECTOR OFF')
        primus.send('off')
        if (mqttClient) {
          mqttClient.publish('benqProjectorControl/power', 'false')
        }
      } else if (status === '*POW=ON#') {
        console.log('PROJECTOR ON')
        primus.send('on')
        if (mqttClient) {
          mqttClient.publish('benqProjectorControl/power', 'true')
        }
      }
    }
    currentState = status
  })
}, 3000)
