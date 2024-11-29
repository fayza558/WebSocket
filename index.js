const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Initialize the app and server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store client data
let clientsData = [];

// Serve the index.html file directly
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// To parse POST data (form submissions)
app.use(express.urlencoded({ extended: true }));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('A user connected');

  // Send the current list of clients' data to the new client
  ws.send(JSON.stringify({ type: 'updateData', data: clientsData }));

  // Listen for form submissions from clients
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'formSubmit') {
      clientsData.push(data.entry);  // Add new data entry to the list
      console.log('New Data Submitted:', data.entry);  // Debugging line

      // Broadcast updated data to all clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'updateData', data: clientsData }));
        }
      });
    }
  });

  // When a client disconnects
  ws.on('close', () => {
    console.log('A user disconnected');
  });
});

// Listen for requests
const port = 3123;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

