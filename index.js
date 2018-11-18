/*
 * Primary file for the api
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const helpers = require('./lib/helpers');
const config = require('./lib/config');
const handlers = require('./lib/handlers');

// All the server logic for both HTTP and HTTPS
const unifiedServer = (req, res) => {
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
const router = {
	ping: handlers.ping,
	users: handlers.users
};

// Create the HTTP server
const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

// Create the HTTPS server
const httpsServerOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

// Start the http server
httpServer.listen(config.httpPort, () => {
  console.log(`Server is listening on port ${config.httpPort}`);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
	console.log(`Server is listening on port ${config.httpsPort}`);
})
