
var epicdocVersion = require('../package.json').version;

var optimist = require('optimist')
	.usage('\nEpicDoc v' + epicdocVersion + '\n\n'
		+ 'Usage:         epicdoc COMMAND COMMAND_PARAMETERS\n'
		+ 'Command help:  epicdoc COMMAND -h\n\n'
		+ 'Commands:\n\n'
		+ '  --server  if you want to start the epicdoc http server')
	.boolean('h', 'server')
	.alias('h', 'help');

var args = optimist.argv;

if (args.server) {
	optimist = require('optimist')
		.usage('\nEpicDoc v' + epicdocVersion + ' | server\n\n'
			+ 'This command is used to start the epicdoc http server.\n'
			+ 'The server will provide functionality for the epicdoc HTML documentation.\n'
			+ 'E.g. it enables the HTML application to perform live documentation updates.\n\n'
			+ 'Start server with default settings:  epicdoc --server')
		.boolean('h', 'v', 'b', 's')
		.default({
			p: 54321,
			s: false,
			v: false
		})
		.alias('h', 'help')
		.alias('p', 'port')
		.alias('s', 'silent')
		.alias('v', 'verbose')
		.describe('p', 'http server port')
		.describe('s', 'print errors only') 
		.describe('v', 'print verbose messages (overrides -s)');
		
	args = optimist.argv;
	
	if (args.help) {
		optimist.showHelp(console.log);
	} else {
		require('./server')(args);
	}
} else {
	optimist.showHelp(console.log);
}
