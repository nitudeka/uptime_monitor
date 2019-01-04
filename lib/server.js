/*
 * These are server related tasks
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./helpers');
const config = require('./config');
const handlers = require('./handlers');

// Instentiate the server module object
const server = {};

// All the server logic for both HTTP and HTTPS
server.unifiedServer = (req, res) => {
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
		const choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		const data = {
			trimmedPath: trimmedPath,
			queryStringObject: queryStringObject,
			method: method,
			headers: headers,
			payload: helpers.parseJsonToObject(buffer)
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
}

// Define a request router
server.router = {
	ping: handlers.ping,
	users: handlers.users,
	tokens: handlers.tokens,
	checks: handlers.checks
};

// Create the HTTP server
server.httpServer = http.createServer((req, res) => {
	server.unifiedServer(req, res);
});

// Create the HTTPS server
server.httpsServerOptions = {
	key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
	cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
	server.unifiedServer(req, res);
});

// Init script
server.init = () => {
	// Start the http server
	server.httpServer.listen(config.httpPort, () => {
	  console.log(`Server is listening on port ${config.httpPort}`);
	});

	// Start the HTTPS server
	server.httpsServer.listen(config.httpsPort, () => {
		console.log(`Server is listening on port ${config.httpsPort}`);
	})
}

// Export the server
module.exports = server;