# benq-w1070-http-control

This assumes you are using docker and have plugged the projector into your machine using an RS232 to USB converter

```
docker run -d --privileged -v /dev/bus/usb:/dev/bus/usb -p 7638:7638 --name projector-control --restart=always projector-control
```

Projector can be controlled using HTTP requests:

```
curl http://127.0.0.1:7638/on
curl http://127.0.0.1:7638/off
curl http://127.0.0.1:7638/status
curl http://127.0.0.1:7638/hdmi1
curl http://127.0.0.1:7638/hdmi2
```

Also exposes a websocket server for listening for events of when the projector turns on or off. This is done using [Primus](https://github.com/primus/primus). See `test.js` for an example of how to use.

Disclaimer: this was hacked together in a few hours, it works for my use case, but your mileage may vary. Please open an issue if you have any questions and I will do by best to respond
