/*
* Primary file for the api
*
*/

// Dependencies
const http = require('http');

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
  res.end('Hello world\n');
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
})
