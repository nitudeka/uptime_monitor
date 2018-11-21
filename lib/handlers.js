/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

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
handlers._users.get = (data, callback) => {
	// Check that the phone number provided is valid
	const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 10 ? data.queryStringObject.phone : false;
	if (phone) {
		// Get the token from the headers
		const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
		// Verify that the given token if valid for tht phone number
		handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
			if (tokenIsValid) {
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
				callback(403, { Error: 'Missing required token in header or token is invalid' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
};

// Users - put
// Required data - phone
// Optional data - firstName, lastName, password (at least one must be specefied)
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
			// Get the token from the headers
			const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

			handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
				if (tokenIsValid) {
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
					callback(403, { Error: 'Missing required token in header or token is invalid' });
				}
			});
		} else {
			callback(400, { Error: 'Missing fields to update' });
		}
	} else {
		callback(400, { Error: 'Missing required field' });
	}
};

// Users - delete
// Required field - phone
// @TODO clean up any other data files associated with this user
handlers._users.delete = (data, callback) => {
	// Check that the phone number is valid
	const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 10 ? data.queryStringObject.phone : false;
	if (phone) {
		// Get the token from the headers
		const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

		handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
			if (tokenIsValid) {
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
				callback(403, { Error: 'Missing required token in header or token is invalid' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
};

// Tokens
handlers.tokens = (data, callback) => {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	};
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
	const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
	if (phone && password) {
		// Lookup the user who matches that phone number
		_data.read('users', phone, (err, userData) => {
			if (!err && userData) {
				// Hash the sent password and compare it to the password stored in the user object
				const hashedPassword = helpers.hash(password);
				if (hashedPassword === userData.hashedPassword) {
					// If valid create a new token with a random name, set expiration date 1 hour in the future
					const tokenId = helpers.createRandomString(20);
					const expires = Date.now() + (1000 * 60 * 60);
					const tokenObject = { phone, expires, id: tokenId };
					// Store the token
					_data.create('tokens', tokenId, tokenObject, (err) => {
						if (!err) {
							callback(200, tokenObject)
						} else {
							callback(500, { Error: 'Could not create the new token' });
						}
					});
				} else {
					callback(400, { Error: 'Password did not match the specefied user\'s stored password' });
				}
			} else {
				callback(400, { Error: 'Could not fiend the specefied user' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required field(s)'});
	}
}

// Tokens - GET
// Required data - ID
// Optional data - none
handlers._tokens.get = (data, callback) => {
	// Check that the id id valid
	const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id : false;
	if (id) {
		// Lookup the token
		_data.read('tokens', id, (err, tokenData) => {
			if (!err && tokenData) {
				callback(200, tokenData);
			} else {
				callback(404);
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
}

// Tokens - PUT
// Requied fields - ID, extend
// Optional data - none
handlers._tokens.put = (data, callback) => {
	const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
	const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend == true ? data.payload.extend : false;
	if (id && extend) {
		// Lookup the token
		_data.read('tokens', id, (err, tokenData) => {
			if (!err && tokenData) {
				// Check to make sure that the token is not already expired
				if (tokenData.expires > Date.now()) {
					// Set the expiration an hour from now
					tokenData.expires = Date.now() + (1000 * 60 * 60);
					// Store the new updates
					_data.update('tokens', id, tokenData, (err) => {
						if (!err) {
							callback(200);
						} else {
							callback(500, { Error: 'Could not update the token expiration' });
						}
					})
				} else {
					callback(400, { Error: 'The token has already expired and can not be extended' });
				}
			} else {
				callback(400, { Error: 'Specefied token does not exist' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required field(s) or field(s) are invalid' });
	}
}

// Tokens - DELETE
// Required data - ID
// Optional data - none
handlers._tokens.delete = (data, callback) => {
	// Check that the id is valid
	const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id : false;
	if (id) {
		// Lookup the token
		_data.read('tokens', id, (err, data) => {
			if (!err && data) {
				_data.delete('tokens', id, (err) => {
					if (!err) {
						callback(200);
					} else {
						callback(500, { Error: 'Could not delete the specefied token' });
					}
				})
			} else {
				callback(400, { Error: 'Could not find the specefied token' });
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
}

// Verify if a given ID is valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
	// Lookup the token
	_data.read('tokens', id, (err, tokenData) => {
		if (!err && tokenData) {
			// Check that the token is for the given user and has not expired
			if (tokenData.phone === phone && tokenData.expires > Date.now()) {
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	})
}

// Checks
handlers.checks = (data, callback) => {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._checks[data.method](data, callback);
	} else {
		callback(405);
	};
};

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data - protocol, URL, method, successCodes, timeoutSeconds
// Optional data - none
handlers._checks.post = (data, callback) => {
	// Validate all the inputs
	const protocol = typeof(data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
	const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
	const method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
	const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
	const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

	if (protocol, url, method, successCodes, timeoutSeconds) {
		// Get the token from the headers
		const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

		// Lookup the user by reading the token
		_data.read('tokens', token, (err, tokenData) => {
			if (!err && tokenData) {
				const userPhone = tokenData.phone;
				// Lookup the user data
				_data.read('users', userPhone, (err, userData) => {
					if (!err && userData) {
						const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
						// Verify that the user has less that the number of max checks per user
						if (userChecks.length < config.maxChecks) {
							// Create a random ID for the check
							const checkId = helpers.createRandomString(20);
							// Create the check object and include the user's phone
							const checkObject = {
								id: checkId,
								userPhone: userPhone,
								protocol: protocol,
								url: url,
								method: method,
								successCodes: successCodes,
								timeoutSeconds: timeoutSeconds
							};
							// Save the object
							_data.create('checks', checkId, checkObject, (err) => {
								if (!err) {
									// Add the checkId to the users object
									userData.checks = userChecks;
									userData.checks.push(checkId);
									// Save the new user data
									_data.update('users', userPhone, userData, (err) => {
										if (!err) {
											// Return the data about the new check
											callback(200, checkObject);
										} else {
											callback(500, { Error: 'Could not update the user with the new check' })
										}
									})
								} else {
									callback(500, { Error: 'Could not create the new check' });
								}
							})
						} else {
							callback(400, { Error: `The user already has the maximum number of checks (${config.maxChecks})` })
						}
					} else {
						callback(403);
					}
				})
			} else {
				callback(403);
			}
		})
	} else {
		callback(400, { Error: 'Missing required input(s) of input(s) are invalid' })
	}
};

// Checks - get
// Required data - id
// Optional data - none
handlers._checks.get = (data, callback) => {
	// Check that the phone number provided is valid
	const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id : false;
	if (id) {
		// Lookup the check
		_data.read('checks', id, (err, checkData) => {
			if (!err && checkData) {
				// Get the token from the headers
				const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
				// Verify that the given token if it belongs to the user who created the check
				handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
					if (tokenIsValid) {
						// Return the check data
						callback(200, checkData);
					} else {
						callback(403);
					}
				})
			} else {
				callback(404);
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' });
	}
}

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
