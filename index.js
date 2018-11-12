/*
 * Primary file for the api
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// Get the path from
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get the query string as an object
	const queryStringObject = parsedUrl.query;

	// Get the HTTP method
	const method = req.method.toLowerCase();

	// Get the headers as an object
	const headers = req.headers;

	// Get the payload, if any
	const decoder = new StringDecoder('utf8');
	let buffer = '';
	req.on('data', (data) => {
		buffer += decoder.write(data);
	});
	req.on('end', () => {
		buffer += decoder.end();

		// Choose the handler this request should go to, if one is not found, use the not found handler
		const choosenHandler = typeof(handlers[trimmedPath]) !== 'undefined' ? handlers[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		const data = {
			trimmedPath: trimmedPath,
			queryStringObject: queryStringObject,
			method: method,
			headers: headers,
			payload: buffer
		};

		// Route the request to the handler specefied in the router
		choosenHandler(data, (statusCode, payload) => {
			// Use the status code called back by the handler or default to 200
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

			// Use the payload defined the handler or default to an empty object
			payload = typeof(payload) === 'object' ? payload : {};

			// Convert the payload to a string
			const payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('content-type', 'application/json');
			res.writeHead(statusCode);
		  res.end(payloadString);
		});
	});
});

// Define the handlers
handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
	// Callback a http status code and a payload object
	callback(406, { name: 'sample handler' });
};

// Not-found handler
handlers.notFound = (data, callback) => {
	callback(404);
};

// Define a request router
const router = {
	sample: handlers.sample
};

// Start the http server
server.listen(config.port, () => {
  console.log(`Server is listening on port ${config.port}`);
});
