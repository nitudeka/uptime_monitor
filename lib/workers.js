/*
 * These are worker related tasks
 *
 */

// Dependencies
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');
const helpers = require('./helpers');
const _data = require('./data');

// Instentiate the worker object
const workers = {};

// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = () => {
	// Get all the checks
	_data.list('checks', (err, checks) => {
		if (!err && checks && checks.length > 0) {
			checks.forEach((check) => {
				// Read in the check data
				_data.read('checks', check, (err, originalCheckData) => {
					if(!err && originalCheckData) {
						// Pass the data to check validator, and let that function continue of log errors as needed
						workers.validateCheckData(originalCheckData);
					} else {
						console.log('Error: Reading one of the check\'s data');
					}
				});
			});
		} else {
			console.log('Error: Could not find any checks to process');
		}
	})
};

// Sanity-checking the check data
workers.validateCheckData = (originalCheckData) => {
	originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {};
	originalCheckData.id = typeof(originalCheckData.id) === 'string' && originalCheckData.id.length == 20 ? originalCheckData.id : false;
	originalCheckData.userPhone = typeof(originalCheckData.userPhone) === 'string' && originalCheckData.userPhone.length == 10 ? originalCheckData.userPhone : false;
};

// Timer to execute the worker-process once per minute
workers.loop = () => {
	setInterval(() => {
		workers.gatherAllChecks();
	}, 1000 * 60);
};

// Init script
workers.init = () => {
	// Execute all the checks
	workers.gatherAllChecks();

	// Call a loop
	workers.loop();
};

// Export the module
module.exports = workers;
