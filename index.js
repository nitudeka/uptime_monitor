/*
 * Primary file for the API
 *
 */

// dependencies
const http = require('http');

// create a http server
const server = http.createServer((req, res) => {
	res.end('Hello world\n');
});

// listen on a port for requests
server.listen(3000, () => {
	console.log('server is listening');
});
