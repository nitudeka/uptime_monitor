/*
 * Primary file for the API
 *
 */

// dependencies
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

// create a http server
const server = http.createServer((req, res) => {
	// get the URL and parase it
	const parsedUrl = url.parse(req.url, true);

	// trim the slashes from the pathname
	parsedUrl.pathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

	const decoder = new StringDecoder;
	let data = '';

	// get the payload, if any
	req.on('data', (chunk) => {
		data += decoder.write(chunk);
	});
	req.on('end', () => {
		data += decoder.end();

		// send the response
		res.end('Hello world\n');
	});

});

// listen on a port for requests
server.listen(3000, () => {
	console.log('server is listening');
});
