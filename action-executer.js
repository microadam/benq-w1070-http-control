module.exports = actionExecuter

function actionExecuter(executeSerialCommand) {
  function executeAction(action, cb) {
    var commandMapping = {
      on: 'pow=on',
      off: 'pow=off',
      status: 'pow=?',
      hdmi1: 'sour=hdmi',
      hdmi2: 'sour=hdmi2'
    }

    if (commandMapping[action]) {
      var command = '\r*' + commandMapping[action] + '#\r'
      executeSerialCommand(command, cb)
    } else {
      console.error('unrecognised command')
      if (cb) cb()
    }
  }

  return executeAction
}


