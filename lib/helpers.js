/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const config = require('./config');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (string) => {
	if (typeof(string) === 'string' && string.length > 0) {
		const hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// Parse a JSON string to an object without throwing
helpers.parseJsonToObject = (string) => {
	try {
		const object = JSON.parse(string);
		return object;
	} catch (e) {
		return {};
	}
}

// Create a string of random alfa-numaric characters of a given length
helpers.createRandomString = (strLength) => {
	strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
	if (strLength) {
		// Define all the possible characters that could go into a string
		const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let string = '';
		for (let i=1; i<=strLength; i++) {
			string += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
		}
		return string;
	} else {
		return false;
	}
}

// Send an SMS via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
	// Validate the parameters
	phone = typeof(phone) === 'string' && phone.trim().length === 10 ? phone : false;
	msg = typeof(msg) === 'string' && msg.length > 0 && msg.length <= 1600 ? msg : false;
	if (phone && msg) {
		// Configure the request payload
		const payload = {
			From: config.twilio.fromPhone,
			To: '+91' + phone,
			Body: msg
		};
		const stringPayload = querystring.stringify(payload);

		// Configure the request details
		const requestDetails = {
			protocol: 'https:',
			hostname: 'api.twilio.com',
			method: 'POST',
			path: '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
			auth: config.twilio.accountSid + ':' + config.twilio.authToken,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(stringPayload)
			}
		};

		// Instentiate the request object
		const req = https.request(requestDetails, (res) => {
			// Grab the status of the status request
			const status = res.statusCode;
			// Callback successfully if the request went through
			if (status === 200 || status === 201) {
				callback(false);
			} else {
				callback(`Status code returned was ${status}`);
			}
		})
		// Bind to the error event so it does not get thrown
		req.on('error', (err) => {
			callback(e);
		});
		// Add the payload
		req.write(stringPayload);
		// End the request
		req.end();
	} else {
		callback('Given parameters were missing or invalid');
	}
}

// Export the module
module.exports = helpers;
