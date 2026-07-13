const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

let robot = {
  connected: false,
  lat: 17.982863,
  lng: 79.533242,
  battery: 100,
  eta: '--',
  status: 'Offline'
};

app.get('/api/robot', (req, res) => {
  res.json(robot);
});

io.on('connection', (socket) => {
  socket.emit('robotUpdate', robot);

  socket.on('robotConnect', () => {
    robot.connected = true;
    robot.status = 'Online';
    io.emit('robotUpdate', robot);
  });

  socket.on('control', (cmd) => {
    if (!robot.connected) return;

    if (cmd === 'forward') {
      robot.lat += 0.0008;
      robot.status = 'Moving forward';
      robot.eta = '5 min';
    }

    if (cmd === 'backward') {
      robot.lat -= 0.0008;
      robot.status = 'Moving backward';
      robot.eta = '6 min';
    }

    if (cmd === 'left') {
      robot.lng -= 0.0008;
      robot.status = 'Turning left';
    }

    if (cmd === 'right') {
      robot.lng += 0.0008;
      robot.status = 'Turning right';
    }

    if (cmd === 'stop') {
      robot.status = 'Stopped';
    }

    if (cmd === 'home') {
      robot.lat = 17.982863;
      robot.lng = 79.533242;
      robot.status = 'Returning home';
      robot.eta = '3 min';
    }

    robot.battery = Math.max(0, robot.battery - 1);
    io.emit('robotUpdate', robot);
  });

  socket.on('disconnect', () => {
    robot.connected = false;
    robot.status = 'Offline';
    io.emit('robotUpdate', robot);
  });
});

setInterval(() => {
  if (robot.connected && robot.battery > 0) {
    robot.battery -= 0.2;
    if (robot.battery <= 20) robot.status = 'Battery low';
    io.emit('robotUpdate', robot);
  }
}, 3000);

server.listen(3000, () => console.log('Server running on http://localhost:3000'));