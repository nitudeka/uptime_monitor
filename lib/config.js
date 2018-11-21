/*
 * Create and export configuration variables
 *
 */

// Container for all the environments
const environments = {};

// Staging { default } environment
environments.staging = {
	httpPort: 3000,
	httpsPort: 3001,
	envName: 'staging',
	hashingSecret: 'thisIsASecret',
	maxChecks: 5,
	twilio: {
		accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
		authToken: '9455e3eb3109edc12e3d8c92768f7a67',
		fromPhone: '+15005550006',
	}
}

// Production environment
environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	envName: 'production',
	hashingSecret: 'thisIsAlsoASecret',
	maxChecks: 5,
	twilio: {
		accountSid: 'ACf0f0a990ad5052e9dc70ac14eff6abbc',
		authToken: '3f60595c31789a5ed87fd9bf8ffb0b5a',
		fromPhone: '+15673200418',
	}
}

// Determine which one was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
