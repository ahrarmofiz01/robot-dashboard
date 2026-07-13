const socket = io();

let map;
let marker;
let chart;
let robot = {
  connected: false,
  lat: 17.982863,
  lng: 79.533242,
  battery: 100,
  eta: '--',
  status: 'Offline'
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: robot.lat, lng: robot.lng },
    zoom: 15
  });

  marker = new google.maps.Marker({
    position: { lat: robot.lat, lng: robot.lng },
    map:map,
        icon:{
        url:"data:image/png;base64,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",
        scaledSize:new google.maps.Size(50,50)
    },
    title: 'Robot'
  });
}

function initChart() {
  const ctx = document.getElementById('batteryChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Battery %',
        data: [],
        borderColor: '#092d7c',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0, max: 100 } }
    }
  });
}

function updateUI(data) {
  document.getElementById('statusText').textContent = data.status;
  document.getElementById('etaText').textContent = data.eta;
  document.getElementById('batteryText').textContent = data.battery + '%';
  document.getElementById('connStatus').textContent = data.connected ? 'Online' : 'Offline';
  document.getElementById('connStatus').className = data.connected ? 'badge online' : 'badge offline';

  const pos = { lat: data.lat, lng: data.lng };
  marker.setPosition(pos);
  map.panTo(pos);

  const time = new Date().toLocaleTimeString();
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(data.battery);
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();

  if (data.battery <= 20) addNotification('Battery low');
  if (data.status === 'Returning home') addNotification('Robot is returning home');
}

function addNotification(text) {
  const box = document.getElementById('notifications');
  const div = document.createElement('div');
  div.textContent = text;
  box.prepend(div);
}

function sendControl(cmd) {
  socket.emit('control', cmd);
}

socket.on('robotUpdate', (data) => {
  robot = data;
  if (marker && map) updateUI(data);
});

window.addEventListener('load', async () => {
  initMap();
  initChart();

  const res = await fetch('/api/robot');
  const data = await res.json();
  robot = data;
  updateUI(data);

  socket.emit('robotConnect');
});
