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

// Export the module
module.exports = helpers;
