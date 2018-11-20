/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
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

// Export the module
module.exports = helpers;
