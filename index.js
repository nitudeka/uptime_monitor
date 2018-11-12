/*
 * Primary file for the api
 *
 */

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// Get the path from
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get the query string as an object
	const queryStringObject = parsedUrl.query;
	console.log(queryStringObject);

	// Get the HTTP method
	const method = req.method.toLowerCase();

	// Send the response
  res.end('Hello world\n');

  // Log the request path
  console.log('Request recieved on path ' + trimmedPath + ' with method ' + method);
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
})
