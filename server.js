const http = require('http');
const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('Hello World');
});

server.listen(PORT, () => console.log(`Server running in port: ${PORT}`));
