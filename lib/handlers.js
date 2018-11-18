/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Defind the handlers
const handlers = {};

// Users
handlers.users = (data, callback) => {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	};
};

// Container for the user sub methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
	// Check that all required fields are filled out
	const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
	const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
	const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
	const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement == true ? true : false;

	if (firstName && lastName && phone && password && tosAgreement) {
		// Make sure that the user does not already exist
		_data.read('users', phone, (err, data) => {
			if (err) {
				// Hash the password
				const hashedPassword = helpers.hash(password);
				if (hashedPassword) {
					// Create the user object
					const userObject = { firstName, lastName, phone, hashedPassword, tosAgreement };
					// Store the user
					_data.create('users', phone, userObject, (err) => {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, { Error: 'Could not create the new user' });
						}
					})
				} else {
					callback(500, { Error: 'Could not hash user\'s password'});
				}
			} else {
				// User already exists
				callback(400, { Error: 'An user with the phone number already exists' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required fields' });
	}
};

// Users - get
// Required data - phone
// Optional data - none
// @TODO only let an authenticated user access their object don't let them access anyone elses
handlers._users.get = (data, callback) => {
	// Check that the phone number provided is valid
	const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 10 ? data.queryStringObject.phone : false;
	if (phone) {
		// Lookup the user
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				delete data.hashedPassword;
				callback(200, data);
			} else {
				callback(404);
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
};

// Users - put
// Required data - phone
// Optional data - firstName, lastName, password (at least one must be specefied)
// @TODO only let an authenticated user update their update their own object, don't let them update anyone elses
handlers._users.put = (data, callback) => {
	// Check for the required field
	const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.length === 10 ? data.payload.phone : false;

	// Check for the optional fields
	const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
	const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
	const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

	// Error if the phone is invalid
	if (phone) {
		// Error if nothing is sent to update
		if (firstName || lastName || password) {
			// Lookup the user
			_data.read('users', phone, (err, userData) => {
				if (!err && userData) {
					// Update the fields that are necessery
					if (firstName) {
						userData.firstName = firstName;
					}
					if (lastName) {
						userData.lastName = lastName;
					}
					if (password) {
						userData.hashedPassword = helpers.hash(password);
					}

					// Store the new updates
					_data.update('users', phone, userData, (err) => {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, { Error: 'Could not update the user' });
						}
					})
				} else {
					callback(400, { Error: 'The specefied user does not exist' });
				}
			})
		} else {
			callback(400, { Error: 'Missing fields to update' });
		}
	} else {
		callback(400, { Error: 'Missing required field' });
	}
};

// Users - delete
// Required field - phone
// @TODO only let an authenticated user delete their object, don't let them delete anyone elses
// @TODO clean up any other data files associated with this user
handlers._users.delete = (data, callback) => {
	// Check that the phone number is valid
	const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 10 ? data.queryStringObject.phone : false;
	if (phone) {
		// Lookup the user
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				_data.delete('users', phone, (err) => {
					if (!err) {
						callback(200);
					} else {
						callback(500, { Error: 'Could not delete the specefied user' });
					}
				})
			} else {
				callback(400, { Error: 'Could not find the specefied user' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
};

// Not-found handler
handlers.notFound = (data, callback) => {
	callback(404);
};

// Ping handler
handlers.ping = (data, callback) => {
	callback(200);
}

// Export the module
module.exports = handlers;
